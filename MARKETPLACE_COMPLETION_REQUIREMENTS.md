# ProGallery marketplace completion requirements

This document separates storefront work that can be completed in the React repository from features that require the Laravel API and database. Do not expose controls as functional until the corresponding API behaviour is implemented and tested.

## Storefront capabilities already present in the React app

- Public homepage, gallery, photo details, about, services and contact pages.
- Search, category, price and sort controls in the gallery.
- Account registration, login and password reset screens.
- Favorites, cart, checkout, order history and customer downloads.
- Reviews, related photographs and admin workspace pages.
- Recently viewed photos are stored locally in the visitor's browser.
- Photo detail pages now provide a native share / copy-link action.

## Public experience still requiring backend support

### Photographer profiles
- Photographer public profile, biography, avatar, social links and verification status.
- Published portfolio, photographer search and profile visibility controls.
- Follow/unfollow relationships and follower counts, if this feature is approved.

Suggested API:
- GET /photographers
- GET /photographers/{id}
- GET /photographers/{id}/photos
- POST /photographers/{id}/follow
- DELETE /photographers/{id}/follow

### Curated collections
- Public collections with title, description, cover image and ordered photos.
- Collection discovery and detail pages.
- Admin create, edit, publish, unpublish and delete controls.

Suggested API:
- GET /collections
- GET /collections/{slug}
- POST /admin/collections
- PUT /admin/collections/{id}
- DELETE /admin/collections/{id}

### Newsletter and content reporting
- Newsletter subscription with consent, unsubscribe token and duplicate handling.
- Photo copyright/inappropriate-content reports with moderation status and admin workflow.
- Never show a success state until the API confirms that the request was saved.

Suggested API:
- POST /newsletter/subscriptions
- POST /newsletter/unsubscribe
- POST /photo-reports
- GET /admin/photo-reports
- PATCH /admin/photo-reports/{id}

## Data quality required for every published photograph

Store and return these fields where applicable:
- Stable photo ID, title, description, photographer ID and category ID.
- Tags, publication status, created/published timestamps.
- Preview image URL and protected original/download asset reference.
- Width, height, file format, file size and resolution.
- Currency, base price and explicit license options/terms.
- Moderation status, copyright ownership/permission confirmation.
- Accurate view, favorite and paid-download counts.

Do not invent resolution, photographer identity, verification badges, reviews, sales, download counts or popularity. If a value is not known, omit it or label it unavailable.

## Licensing and checkout rules

- The Laravel API must be the source of truth for license prices and license terms.
- Do not rely on frontend price multipliers as the final price.
- Return available license options and calculated totals from the server.
- Persist the selected license and the exact license terms/version with each order item.
- Show currency, taxes/fees (if applicable), refund/cancellation rules and permitted usage before payment.
- Grant original-file downloads only after a verified successful payment and an eligible order state.
- Use expiring, authorized download links; never expose original storage paths publicly.

## Payments, orders and email release gates

- Configure a real payment provider and verify webhook signatures server-side.
- Make webhook processing idempotent and record provider event IDs.
- Keep payment status separate from order fulfilment status.
- Cover success, cancellation, expiry, failure, duplicate callbacks and refunds in tests.
- Configure production email for password resets, receipts, order updates and support messages.
- Queue/retry email delivery and record failures without exposing secrets.
- Test the full paid customer journey in provider test mode before enabling live payments.

## Admin capabilities required

- Manage homepage content and featured photos.
- Manage photographers, verification, suspension and profile content.
- Manage collections, categories, tags and photo moderation.
- Manage license options, prices, currency and customer policies.
- Manage orders, payment status, refunds and download eligibility.
- Manage reviews, reports, newsletter subscribers and contact messages.
- Manage SEO metadata and social preview images for public pages.
- Show analytics derived from real database records, with clear date ranges.
- Enforce permissions in Laravel policies/middleware; hiding admin links is not authorization.

## Quality and launch checks

- Run frontend lint and production build.
- Run Laravel automated tests and database migrations in staging.
- Test all public and customer pages at mobile, tablet and desktop sizes.
- Test empty, loading, API failure, offline and expired-session states.
- Verify search, filters, sorting and pagination against real records.
- Verify no broken images, placeholder content, fake statistics or dead links.
- Verify route refresh/deep links and SEO metadata.
- Complete an end-to-end browse, register, favorite, cart, checkout, payment, email, order and download test.
- Smoke-test the deployed frontend and API after release.

## Important integration boundary

The current GitHub repository contains the React/Vite frontend. The Laravel backend source is not present in this repository, so the backend endpoints, migrations, payment webhooks, email transport, server-side licensing, moderation workflows and admin authorization cannot be safely implemented or verified here. Those items must be completed in the Laravel backend repository and then connected to this frontend.
