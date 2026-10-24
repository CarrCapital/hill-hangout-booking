# Hill Hangout Direct Booking Site

Direct-booking website for Hill Hangout at 501 M Street NE in NoMa, Washington
DC. Three listings: Lower Level, Main Level, Combined Suite. Guests pick
dates, submit a request, host approves within 24 hours, guest pays by card,
Cash App, Apple/Google Pay or ACH through Stripe.

Deployed on Vercel from the `main` branch of
`CarrCapital/hill-hangout-booking`.

## Local dev

```sh
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000.

## Deploy

Push to `main`. Vercel builds and promotes automatically.

Any push to another branch gets a preview URL.

## Settings to add in Vercel

The site runs without any of these, with "not configured" banners for the
parts that need them. Add each when ready:

- **ADMIN_PASSWORD** (required for `/admin`): any strong string.
- **Postgres**: Storage → Create → Postgres (Neon). Attach to this project.
  Vercel wires `POSTGRES_URL` for you. Schema creates itself on first use.
- **Stripe** (payments): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- **Resend** (email): `RESEND_API_KEY`, `NOTIFICATION_EMAIL` (host inbox).

## Where things live

- `lib/listings.ts`: rates, caps, cleaning fee, tax, cancellation. Edit here.
- `lib/pricing.ts`: how a quote is calculated.
- `lib/db.ts`: Postgres queries and schema.
- `app/page.tsx`: landing page.
- `app/listings/[slug]/page.tsx`: per-listing page.
- `app/book/[slug]/page.tsx`: request form.
- `app/admin/page.tsx`: host dashboard, behind HTTP basic auth.
- `app/api/requests`: public POST, creates a request.
- `app/api/admin/requests/[id]/approve|reject`: host decision.

## What's next

- Stripe Checkout link on approve + webhook that marks `paid`.
- Resend emails: guest confirmation, host alert, approval, rejection,
  reminder when payment link is 1 hour from expiring.
- iCal import (Airbnb, VRBO) on a Vercel Cron, every 15 min.
- iCal export per listing for the other channels to subscribe to.
- Rich calendar picker (react-day-picker) with inline blocked days.
- Automatic expiry: pending requests older than 24h → `expired`.
