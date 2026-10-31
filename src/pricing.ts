export type Billing = 'monthly' | 'yearly';
export interface Plan { id: string; name: string; monthly: number | null; blurb: string; features: string[]; cta: string; featured?: boolean }

export const YEARLY_DISCOUNT = 0.2;

export const plans: Plan[] = [
  { id: 'starter', name: 'Starter', monthly: 0, blurb: 'For side projects and small teams getting started.', features: ['3 services', '7-day retention', 'Slack alerts', 'Community support'], cta: 'Start free' },
  { id: 'team', name: 'Team', monthly: 49, blurb: 'For product teams shipping every day.', features: ['Unlimited services', '30-day retention', 'AI incident summaries', 'On-call schedules', 'SSO (Google, GitHub)'], cta: 'Start 14-day trial', featured: true },
  { id: 'enterprise', name: 'Enterprise', monthly: null, blurb: 'For regulated organisations at scale.', features: ['EU data residency', '13-month retention', 'SAML SSO & SCIM', 'Dedicated success engineer', '99.95% SLA'], cta: 'Talk to sales' },
];

/** Price per seat per month shown for a billing period; yearly is discounted and rounded to whole euros. */
export function displayPrice(plan: Plan, billing: Billing): number | null {
  if (plan.monthly === null) return null;
  return billing === 'yearly' ? Math.round(plan.monthly * (1 - YEARLY_DISCOUNT)) : plan.monthly;
}

export function yearlySavings(plan: Plan, seats = 1): number {
  if (!plan.monthly) return 0;
  return (plan.monthly - (displayPrice(plan, 'yearly') ?? 0)) * 12 * seats;
}
