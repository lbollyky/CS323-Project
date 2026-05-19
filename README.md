# Pepwell

A minimalist, AI-guided storefront for a tight peptide-supplement line —
epitalON, pinealON, Restore BPC, and the Dual-System Stack. Built with
Next.js 16, the Vercel AI SDK (GPT-4o-mini), Tailwind, Zustand, Supabase
auth + Postgres, and real Stripe Checkout.

Customer surfaces:

| Route               | Purpose                                                      |
| ------------------- | ------------------------------------------------------------ |
| `/`                 | AI guide — landing page is the chat itself.                  |
| `/shop`             | Direct catalog: three SKUs + Dual-System Stack.              |
| `/checkout`         | Cart review → Stripe-hosted Checkout.                        |
| `/checkout/success` | Post-payment confirmation (reads the Stripe session).        |
| `/track`            | Daily check-in + last-14-day trend (auth-gated).             |
| `/login` / `/signup`| Supabase Auth — drops users into `/track` after sign-in.     |

---

## Local development

```bash
cp .env.local.example .env.local      # paste your keys
npm install
npm run dev                            # http://localhost:3000
```

### Required environment variables

| Variable                              | Purpose                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`                      | Powers the AI guide on `/`.                                                                 |
| `STRIPE_SECRET_KEY`                   | `sk_test_…` from https://dashboard.stripe.com/test/apikeys — required for `/checkout`.      |
| `NEXT_PUBLIC_SUPABASE_URL`            | Your Supabase project URL.                                                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`       | Supabase anon (public) key — used by the browser client.                                    |
| `SUPABASE_SERVICE_ROLE_KEY`           | Service role key — only used server-side for admin tasks. Treat as a secret.                |

### Optional

| Variable               | Purpose                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_BASE_URL` | Overrides the success/cancel URL origin Stripe redirects to. Leave unset locally.        |

Test card on the Stripe page: `4242 4242 4242 4242`, any future date,
any CVC, any ZIP.

---

## Supabase auth + tracker setup (one-time, ~3 minutes)

1. Go to https://supabase.com → **New project**. Pick any name, generate a
   strong DB password, choose the region closest to you. Wait ~60 seconds
   for the project to provision.
2. **Project Settings → API.** Copy these three values into `.env.local`:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`
3. **Authentication → URL Configuration.** Set **Site URL** to
   `http://localhost:3000` for dev (or your Vercel URL for production).
   Add the same value under **Redirect URLs**. For Vercel preview
   deploys, also add `https://*.vercel.app/auth/callback`.
4. (Optional, recommended for the class demo.) **Authentication →
   Providers → Email.** Toggle **Confirm email** OFF so signups work
   without round-tripping through email.
5. **SQL Editor → New query.** Paste the entire contents of
   `supabase/schema.sql` and run. This creates the `profiles` table, the
   `daily_logs` table with full RLS, and a trigger that auto-creates a
   profile row whenever a Supabase Auth user signs up.
6. Restart `npm run dev`. Hit `/signup`, create an account, and you'll
   land on `/track`.

---

## Deploy on Vercel

1. Push to GitHub (this repo is already wired up).
2. Import the repo at https://vercel.com/new — Vercel auto-detects Next.js;
   leave the Root Directory at the default.
3. Add **every** environment variable from the table above in the Vercel
   project settings (Settings → Environment Variables). The Supabase keys
   are required for `/login`, `/signup`, and `/track` to work.
4. Deploy.

After the first deploy:
- Set `NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app` so Stripe's
  success/cancel URLs land on the deployed origin.
- In Supabase, add `https://your-domain.vercel.app` to **Authentication
  → URL Configuration → Site URL** and **Redirect URLs**.

---

## Disclaimer

These statements have not been evaluated by the Food and Drug
Administration. These products are not intended to diagnose, treat, cure,
or prevent any disease. This is a class-project prototype.
