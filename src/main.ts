import '@fontsource-variable/geist';
import './style.css';
import { displayPrice, plans, yearlySavings, type Billing } from './pricing';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) => {
  const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n;
};

// ---------- Pricing
let billing: Billing = 'yearly';
const plansEl = $('plans');
function renderPlans() {
  plansEl.replaceChildren(...plans.map((p) => {
    const card = el('article', `plan${p.featured ? ' featured' : ''}`);
    if (p.featured) card.append(el('p', 'tag', 'Most popular'));
    card.append(el('h3', undefined, p.name), el('p', 'blurb', p.blurb));
    const price = displayPrice(p, billing);
    const priceEl = el('p', 'price');
    if (price === null) priceEl.append(el('strong', undefined, 'Custom'));
    else priceEl.append(el('strong', undefined, `€${price}`), el('span', undefined, price ? ' / engineer / month' : ' forever'));
    card.append(priceEl);
    const save = yearlySavings(p, 10);
    card.append(el('p', 'save', billing === 'yearly' && save ? `Billed yearly · save €${save} per 10 engineers` : billing === 'monthly' && p.monthly ? 'Billed monthly' : ' '));
    const ul = el('ul');
    p.features.forEach((f) => ul.append(el('li', undefined, f)));
    const cta = el('a', `btn ${p.featured ? 'btn-primary' : 'btn-ghost'} btn-block`, p.cta);
    cta.setAttribute('href', '#pricing');
    card.append(cta, ul);
    return card;
  }));
}
const billingBtns = document.querySelectorAll<HTMLButtonElement>('[data-billing]');
const setBilling = (b: Billing) => { billing = b; billingBtns.forEach((x) => { const on = x.dataset.billing === b; x.setAttribute('aria-checked', String(on)); x.tabIndex = on ? 0 : -1; }); renderPlans(); };
billingBtns.forEach((b) => {
  b.addEventListener('click', () => setBilling(b.dataset.billing as Billing));
  b.addEventListener('keydown', (e) => { if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { setBilling(billing === 'yearly' ? 'monthly' : 'yearly'); document.querySelector<HTMLElement>(`[data-billing="${billing}"]`)!.focus(); } });
});
setBilling('yearly');

// ---------- Bento: alert stream collapsing into one incident
const stream = $('stream');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
for (let i = 0; i < 28; i++) {
  const b = el('span', 'blip');
  b.style.setProperty('--d', `${(i * 0.13) % 3.2}s`);
  b.style.setProperty('--y', `${(i * 37) % 100}%`);
  stream.append(b);
}
stream.append(el('span', 'incident', 'INC-2041 · api latency · eu-west-1'));

// ---------- Count-up
const counter = document.querySelector<HTMLElement>('[data-count]')!;
new IntersectionObserver(([e], o) => {
  if (!e.isIntersecting || reduced) return;
  o.disconnect();
  const to = Number(counter.dataset.count), t0 = performance.now();
  const tick = (t: number) => { const k = Math.min((t - t0) / 1400, 1); counter.textContent = String(Math.round(to * (1 - (1 - k) ** 3))); if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}).observe(counter);

// ---------- Reveal
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.card, .steps li, .plan, .quotes figure, .head').forEach((n) => { n.classList.add('reveal'); io.observe(n); });

// ---------- Globe (lazy)
const start = () => import('./globe').then((m) => m.initGlobe($('globe') as HTMLCanvasElement));
'requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1000 }) : setTimeout(start, 150);

// ---------- Cursor-following glow on bento cards
document.querySelectorAll<HTMLElement>('.card').forEach((c) => c.addEventListener('pointermove', (e) => {
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', `${e.clientX - r.left}px`);
  c.style.setProperty('--my', `${e.clientY - r.top}px`);
}));
