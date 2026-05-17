# Your Protocol

A minimalist, AI-guided storefront for a tight peptide-supplement line —
epitalON, pinealON, Restore BPC, and the Dual-System Stack. Built with
Next.js 16, the Vercel AI SDK (GPT-4o-mini), Tailwind, Zustand, and real
Stripe Checkout.

Four customer-facing pages, by design:

| Route               | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `/`                 | AI guide — landing page is the chat itself.      |
| `/shop`             | Direct catalog: three SKUs + Dual-System Stack.  |
| `/checkout`         | Cart review → Stripe-hosted Checkout.            |
| `/checkout/success` | Post-payment confirmation (Stripe session read). |

Plus `/login` for the small login button (Supabase auth, optional).

---

## Local development

```bash
cp .env.local.example .env.local      # paste your keys
npm install
npm run dev                            # http://localhost:3000
```

### Required environment variables

| Variable                          | Purpose                                              |
| --------------------------------- | ---------------------------------------------------- |
| `OPENAI_API_KEY`                  | Powers the AI guide on `/`.                          |
| `STRIPE_SECRET_KEY`               | `sk_test_…` from https://dashboard.stripe.com/test/apikeys — required for `/checkout`. |

### Optional

| Variable                          | Purpose                                              |
| --------------------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_BASE_URL`            | Overrides the success/cancel URL origin Stripe redirects to. Leave unset locally. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Only used for the legacy `/login` flow. The site works fully without them. |

Test card on the Stripe page: `4242 4242 4242 4242`, any future date,
any CVC, any ZIP.

---

## Deploy on Vercel

1. Push to GitHub (this repo is already wired up).
2. Import the repo at https://vercel.com/new — Vercel auto-detects Next.js;
   leave the Root Directory at the default.
3. Add environment variables in the Vercel project settings — at minimum
   `OPENAI_API_KEY` and `STRIPE_SECRET_KEY`.
4. Deploy.

Once deployed, set `NEXT_PUBLIC_BASE_URL=https://your-domain.com` so
Stripe redirects land on the deployed origin.

---

## Disclaimer

These statements have not been evaluated by the Food and Drug
Administration. These products are not intended to diagnose, treat, cure,
or prevent any disease. This is a class-project prototype.
