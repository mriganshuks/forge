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
    if (!apiKey) throw new Error("AI gateway is not configured");

    const { data: report, error: reportErr } = await supabase
      .from("reports")
      .select("id, user_id, title, idea, target_market")
      .eq("id", data.reportId)
      .maybeSingle();
    if (reportErr) throw new Error(reportErr.message);
    if (!report || report.user_id !== userId) throw new Error("Report not found");

    await supabase.from("reports").update({ status: "generating" }).eq("id", report.id);

    const systemPrompt = `You are Forge, a senior startup analyst advising founders. Produce a sharp, founder-focused, evidence-aware startup blueprint. Be concrete, specific, and avoid generic platitudes. Use realistic numbers and named examples where possible. Write in clear, confident prose.`;

    const userPrompt = `Generate a complete startup blueprint.

STARTUP IDEA:
${report.idea}

TITLE: ${report.title}
${data.industry ? `INDUSTRY: ${data.industry}` : ""}
${data.audience || report.target_market ? `TARGET AUDIENCE: ${data.audience || report.target_market}` : ""}

Deliver via the deliver_blueprint tool. Be thorough but concise — each list item one tight sentence.`;

    let aiResp: Response;
    try {
      aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
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
      await supabase.from("reports").update({ status: "failed" }).eq("id", report.id);
      throw new Error("Could not reach the AI service. Please try again.");
    }

    if (!aiResp.ok) {
      await supabase.from("reports").update({ status: "failed" }).eq("id", report.id);
      if (aiResp.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
      if (aiResp.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace settings.");
      const txt = await aiResp.text().catch(() => "");
      console.error("AI gateway error", aiResp.status, txt);
      throw new Error("The AI service returned an error.");
    }

    const payload = await aiResp.json();
    const call = payload.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) {
      await supabase.from("reports").update({ status: "failed" }).eq("id", report.id);
      throw new Error("AI did not return a structured blueprint.");
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(call.function.arguments);
    } catch {
      await supabase.from("reports").update({ status: "failed" }).eq("id", report.id);
      throw new Error("AI returned malformed output.");
    }

    // Replace any prior sections for idempotency
    await supabase.from("report_sections").delete().eq("report_id", report.id);

    const sections = [
      { section_type: "summary", title: "Overview", position: 0, content: parsed.summary },
      { section_type: "market", title: "Market Opportunity", position: 1, content: parsed.market },
      { section_type: "competitors", title: "Competitor Breakdown", position: 2, content: parsed.competitors },
      { section_type: "mvp", title: "MVP Blueprint", position: 3, content: parsed.mvp },
      { section_type: "gtm", title: "Go-To-Market Plan", position: 4, content: parsed.gtm },
      { section_type: "risks", title: "Risk Analysis", position: 5, content: parsed.risks },
    ].map((s) => ({ ...s, report_id: report.id }));

    const { error: insertErr } = await supabase.from("report_sections").insert(sections);
    if (insertErr) {
      await supabase.from("reports").update({ status: "failed" }).eq("id", report.id);
      throw new Error(insertErr.message);
    }

    await supabase.from("reports").update({ status: "completed" }).eq("id", report.id);

    return { ok: true as const };
  });
