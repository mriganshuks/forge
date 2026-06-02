-- Remove privilege escalation: users must not be able to insert or modify their own subscription plans.
-- Subscription rows are provisioned by the SECURITY DEFINER trigger handle_new_user() and
-- should only be mutated by server-side/service-role code thereafter.

DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;