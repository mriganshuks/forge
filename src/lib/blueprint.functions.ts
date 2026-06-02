import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SECTION_TOOL = {
  type: "function" as const,
  function: {
    name: "deliver_blueprint",
    description: "Deliver the complete startup blueprint as structured data.",
    parameters: {
      type: "object",
      properties: {
        market: {
          type: "object",
          properties: {
            industry_overview: { type: "string" },
            market_size: { type: "string" },
            trends: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } },
            challenges: { type: "array", items: { type: "string" } },
          },
          required: ["industry_overview", "market_size", "trends", "opportunities", "challenges"],
          additionalProperties: false,
        },
        competitors: {
          type: "object",
          properties: {
            top_competitors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  strengths: { type: "array", items: { type: "string" } },
                  weaknesses: { type: "array", items: { type: "string" } },
                },
                required: ["name", "description", "strengths", "weaknesses"],
                additionalProperties: false,
              },
            },
            differentiation: { type: "array", items: { type: "string" } },
          },
          required: ["top_competitors", "differentiation"],
          additionalProperties: false,
        },
        mvp: {
          type: "object",
          properties: {
            core_features: { type: "array", items: { type: "string" } },
            nice_to_have: { type: "array", items: { type: "string" } },
            future_features: { type: "array", items: { type: "string" } },
            recommended_scope: { type: "string" },
          },
          required: ["core_features", "nice_to_have", "future_features", "recommended_scope"],
          additionalProperties: false,
        },
        gtm: {
          type: "object",
          properties: {
            launch_strategy: { type: "string" },
            acquisition_channels: { type: "array", items: { type: "string" } },
            content_strategy: { type: "string" },
            thirty_day_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  week: { type: "string" },
                  focus: { type: "string" },
                  actions: { type: "array", items: { type: "string" } },
                },
                required: ["week", "focus", "actions"],
                additionalProperties: false,
              },
            },
          },
          required: ["launch_strategy", "acquisition_channels", "content_strategy", "thirty_day_plan"],
          additionalProperties: false,
        },
        risks: {
          type: "object",
          properties: {
            key_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  obstacle: { type: "string" },
                  mitigation: { type: "string" },
                },
                required: ["risk", "obstacle", "mitigation"],
                additionalProperties: false,
              },
            },
          },
          required: ["key_risks"],
          additionalProperties: false,
        },
        summary: {
          type: "object",
          properties: {
            headline: { type: "string" },
            thesis: { type: "string" },
            verdict: {
              type: "string",
              enum: ["strong", "promising", "challenging", "risky"],
            },
            key_insights: { type: "array", items: { type: "string" } },
          },
          required: ["headline", "thesis", "verdict", "key_insights"],
          additionalProperties: false,
        },
      },
      required: ["market", "competitors", "mvp", "gtm", "risks", "summary"],
      additionalProperties: false,
    },
  },
};

export const generateBlueprint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      reportId: z.string().uuid(),
      industry: z.string().max(200).optional(),
      audience: z.string().max(200).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      console.error("[blueprint] LOVABLE_API_KEY missing");
      throw new Error("AI gateway is not configured");
    }

    const { data: report, error: reportErr } = await supabase
      .from("reports")
      .select("id, user_id, title, idea, target_market")
      .eq("id", data.reportId)
      .maybeSingle();
    if (reportErr) {
      console.error("[blueprint] fetch report failed", reportErr);
      throw new Error(reportErr.message);
    }
    if (!report || report.user_id !== userId) throw new Error("Report not found");

    await supabase.from("reports").update({ status: "generating" }).eq("id", report.id);
    console.log(`[blueprint] start report=${report.id}`);

    // Helper to flip the report to a final state. Used in every failure path so
    // the UI never gets stuck on "generating".
    const markFailed = async (reason: string) => {
      console.error(`[blueprint] FAILED report=${report.id} reason=${reason}`);
      await supabase.from("reports").update({ status: "failed" }).eq("id", report.id);
    };

    const systemPrompt = `You are Forge, a senior startup analyst advising founders. Produce a sharp, founder-focused, evidence-aware startup blueprint. Be concrete, specific, and avoid generic platitudes. Use realistic numbers and named examples where possible. Write in clear, confident prose.`;

    const userPrompt = `Generate a complete startup blueprint.

STARTUP IDEA:
${report.idea}

TITLE: ${report.title}
${data.industry ? `INDUSTRY: ${data.industry}` : ""}
${data.audience || report.target_market ? `TARGET AUDIENCE: ${data.audience || report.target_market}` : ""}

Deliver via the deliver_blueprint tool. Be thorough but concise — each list item one tight sentence.`;

    // Cap the AI subrequest so we don't hang the worker indefinitely.
    const aiController = new AbortController();
    const aiTimeout = setTimeout(() => aiController.abort(), 90_000);

    let aiResp: Response;
    try {
      aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: aiController.signal,
        body: JSON.stringify({
          model: "openai/gpt-5-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [SECTION_TOOL],
          tool_choice: { type: "function", function: { name: "deliver_blueprint" } },
        }),
      });
    } catch (e) {
      clearTimeout(aiTimeout);
      console.error("[blueprint] AI fetch threw", e);
      await markFailed("ai_fetch_error");
      throw new Error("Could not reach the AI service. Please try again.");
    }
    clearTimeout(aiTimeout);

    if (!aiResp.ok) {
      const txt = await aiResp.text().catch(() => "");
      console.error(`[blueprint] AI gateway non-2xx status=${aiResp.status} body=${txt.slice(0, 500)}`);
      await markFailed(`ai_${aiResp.status}`);
      if (aiResp.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
      if (aiResp.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
      throw new Error("The AI service returned an error.");
    }

    const payload = await aiResp.json().catch((e) => {
      console.error("[blueprint] AI response not JSON", e);
      return null;
    });
    const call = payload?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) {
      console.error("[blueprint] no tool_call in AI response", JSON.stringify(payload)?.slice(0, 800));
      await markFailed("no_tool_call");
      throw new Error("AI did not return a structured blueprint.");
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(call.function.arguments);
    } catch (e) {
      console.error("[blueprint] tool_call arguments not JSON", e, String(call.function.arguments).slice(0, 800));
      await markFailed("bad_json");
      throw new Error("AI returned malformed output.");
    }

    // Build sections defensively: keep whatever the model returned, so a partially
    // malformed response still saves useful content instead of failing the whole run.
    const sectionSpecs = [
      { key: "summary", section_type: "summary", title: "Overview", position: 0 },
      { key: "market", section_type: "market", title: "Market Opportunity", position: 1 },
      { key: "competitors", section_type: "competitors", title: "Competitor Breakdown", position: 2 },
      { key: "mvp", section_type: "mvp", title: "MVP Blueprint", position: 3 },
      { key: "gtm", section_type: "gtm", title: "Go-To-Market Plan", position: 4 },
      { key: "risks", section_type: "risks", title: "Risk Analysis", position: 5 },
    ] as const;

    const sections = sectionSpecs
      .filter((s) => parsed[s.key] && typeof parsed[s.key] === "object")
      .map((s) => ({
        report_id: report.id,
        section_type: s.section_type,
        title: s.title,
        position: s.position,
        content: parsed[s.key] as never,
      }));

    if (sections.length === 0) {
      console.error("[blueprint] parsed AI output had no recognizable sections", Object.keys(parsed));
      await markFailed("empty_sections");
      throw new Error("AI returned an empty blueprint. Please try again.");
    }

    // Replace any prior sections for idempotency (only now that we know we have new ones).
    const { error: delErr } = await supabase.from("report_sections").delete().eq("report_id", report.id);
    if (delErr) {
      console.error("[blueprint] delete prior sections failed", delErr);
      await markFailed("delete_failed");
      throw new Error(delErr.message);
    }

    const { error: insertErr } = await supabase.from("report_sections").insert(sections);
    if (insertErr) {
      console.error("[blueprint] insert sections failed", insertErr);
      await markFailed("insert_failed");
      throw new Error(insertErr.message);
    }

    const { error: completeErr } = await supabase
      .from("reports")
      .update({ status: "completed" })
      .eq("id", report.id);
    if (completeErr) {
      console.error("[blueprint] mark completed failed", completeErr);
      // Sections are saved; don't mark failed since data is there.
      throw new Error("Generated, but couldn't update status. Refresh to see your blueprint.");
    }

    console.log(`[blueprint] DONE report=${report.id} sections=${sections.length}`);
    return { ok: true as const, sections: sections.length };
  });
