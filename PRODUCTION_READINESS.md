# ProGallery production readiness

This checklist is the release gate for the customer storefront and admin workspace. A feature is not production-ready until its live configuration and end-to-end behaviour have been verified.

## Payment and order lifecycle

- [ ] Configure Stripe test keys and the webhook signing secret in the backend host.
- [ ] Confirm the webhook endpoint is reachable over HTTPS and verifies signatures.
- [ ] Test successful, canceled, expired, and failed checkout sessions.
- [ ] Verify repeated webhook deliveries do not duplicate payment or order side effects.
- [ ] Add and test a provider-backed refund workflow before advertising self-service refunds.
- [ ] Confirm order status and payment status remain distinct and consistent.
- [ ] Verify download access is granted only for eligible, paid orders.

## Email and customer communication

- [ ] Configure a real production mail transport and verified sender address.
- [ ] Test password reset, payment receipt, order status, and contact-form messages.
- [ ] Confirm mail failures are logged and visible to operators without exposing secrets.
- [ ] Add retry/queue handling before relying on email for time-critical workflows.

## Store operations

- [ ] Review photo metadata, categories, prices, license descriptions, and availability.
- [ ] Confirm admin create/edit/delete actions persist after refresh and failures are clearly reported.
- [ ] Confirm deleted records do not reappear due to seeders or stale client state.
- [ ] Verify staff permissions for all admin endpoints, not only hidden navigation links.
- [ ] Agree final licensing terms, currency, tax, delivery, refund, and cancellation policies.
- [ ] Add editable store settings only when backed by persistent server-side configuration.

## Experience and quality

- [ ] Test storefront and admin at mobile, tablet, and desktop widths.
- [ ] Verify keyboard navigation, visible focus, Escape-to-close overlays, and readable error states.
- [ ] Test slow API, empty data, expired sessions, and failed uploads.
- [ ] Run frontend lint/build and backend automated tests in CI.
- [ ] Apply database migrations in staging before production.
- [ ] Check image sizes, loading behaviour, route refreshes, and browser console errors.
- [ ] Perform a complete customer journey: browse, register, add to cart, checkout, receive email, view order, and download.
- [ ] Verify production deployment and smoke-test the deployed URLs after release.

## Known configuration-dependent items

- Stripe live payments require real provider credentials and a verified webhook.
- Email delivery requires a production mail transport; a log mailer does not send messages.
- Refund automation is not implemented yet. Until it is implemented and tested, handle refunds through the payment provider dashboard and communicate the status to the customer.
- Licensing multipliers and terms are starter defaults and must be approved before public sale.

Do not mark any unchecked item complete based only on local UI appearance. Record the test environment, date, and result when each release check is completed.
