# ProGallery marketplace setup

## Stripe Checkout

The backend includes a Stripe Checkout-session endpoint and a signed webhook handler. Live processing is disabled until secrets are configured.

1. Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_CURRENCY=usd` in the backend hosting environment.
2. Set `FRONTEND_URL` to the public frontend origin.
3. Configure a Stripe webhook to `POST /api/webhooks/stripe` and subscribe to `checkout.session.completed`.
4. Run migrations, test with Stripe test keys and test cards, and confirm webhook delivery before switching to live keys.
5. Never expose Stripe secret keys in Vite variables or browser code.

The webhook verifies the timestamped signature and only marks a matching order paid when Stripe reports the Checkout Session as paid. Refunds are not automated yet; process refunds through Stripe until refund support is implemented.

## Email delivery

The default `MAIL_MAILER=log` is for development and does not deliver email. Configure a production Laravel mail transport in hosting environment variables, including `MAIL_MAILER`, host/port/credentials as required, and a verified `MAIL_FROM_ADDRESS`. A payment receipt is attempted after a verified payment webhook; failed delivery is logged. Password-reset email delivery uses the same Laravel mail configuration.

## Digital licenses

Cart and order items support `personal`, `commercial`, and `extended` license types. Current server-side starter multipliers are 1×, 2×, and 5×. These are defaults, not legal terms; confirm license rights, price tiers, and usage restrictions before public sale.

## Favorites

Authenticated customers can list, add, and remove favorites:
- `GET /api/favorites`
- `POST /api/favorites` with `photo_id`
- `DELETE /api/favorites/{photoId}`

## Verification checklist

- [ ] Apply migrations in a staging environment.
- [ ] Configure Stripe test keys and webhook secret.
- [ ] Test successful, canceled, and failed payments.
- [ ] Confirm duplicate webhook events do not duplicate payment emails or order completion.
- [ ] Configure production mail and verify password-reset and receipt delivery.
- [ ] Confirm license wording and pricing with the business owner.
- [ ] Test order ownership, downloads, and favorites with multiple customer accounts.
