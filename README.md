# Kraftshed — where India's makers sell

Multi-vendor craft marketplace for Triagon Ventures.

| Surface | URL | Who |
|---|---|---|
| Storefront | `kraftshed.com/` | Buyers |
| Maker Studio | `kraftshed.com/seller` | Sellers |
| Admin panel | `kraftshed.com/admin` | Kraftshed team |

**Stack:** Next.js 14 (App Router, server actions) · PostgreSQL 16 · Prisma 7 · Tailwind · Razorpay · Docker · Nginx. One codebase, one container.

---

## What's included

**Buyer storefront** — home (hero, category pills, offers, most-loved, maker spotlight, just-in), search with filters & sort, category pages, product page (gallery, buy box, variants, Q&A, reviews with verified-purchase badge, related items), cart & save-for-later, checkout (saved addresses, coupons, Razorpay UPI/cards/net-banking, COD), order tracking timeline, cancel/return/dispute, wishlist, account (profile, addresses, security, notifications), seller store pages, Offers, Most loved, Just in, Help Centre, legal pages.

**Maker Studio** — public "Open a shop" landing, store registration with KYC & bank details, approval workflow, dashboard, add/edit products (image upload, bullets, variants, shipping & return rules), inventory quick-edit, order management (pack → ship with tracking → delivered, packing slips), returns handling, payments ledger & payouts, performance (ratings, late-shipment & cancel rates, reply to reviews, answer questions), deals, coupons, sponsored-product ads, business reports + CSV export, settings, help.

**Admin** — overview KPIs, seller approvals & per-seller commission, listing moderation & featuring, category tree, all orders, returns override, disputes, payout creation & UTR tracking, platform coupons, home banners, user roles, platform settings (commission, auto-approve listings).

**Money flow** — each order item records commission (default 10%, overridable per seller) and seller earning. A ledger (SALE / COMMISSION / REFUND / ADJUSTMENT / PAYOUT) gives every seller a live balance; admin creates weekly payouts and marks them paid with the bank UTR.

## Design & originality notes

Kraftshed has its own visual identity, deliberately distinct from large marketplaces:
- **Palette** — paper `#FDFBF7`, sand `#EDE6DA`, ink `#2B2A28`, forest green `#2F5D50` for actions, logo terracotta `#C2593A` only as a highlight. No dark navigation bar, no orange/yellow buttons.
- **Type** — Fraunces (serif display) for headings, Nunito Sans for UI. Rounded pill buttons and cards.
- **Vocabulary** — "Bag" not cart, "Offers" / "Most loved" / "Just in", "Maker Studio" for the seller hub, "Ask the maker", "Bought on Kraftshed" for verified reviews, "Highlights" / "The story" on product pages, footer sections *Kraftshed / For makers / Support / Legal*.
- **Layouts** — single light header with centred search; product page uses an editorial two-column layout with the purchase panel under the title (no right-hand buy box); savings shown as a green "Save ₹" pill rather than red percentage.
- Generic e-commerce mechanics (cart, checkout, order tracking, reviews, seller dashboards) are industry-standard and not owned by anyone; what we avoid is another company's distinctive wording, colours, logos and page look. Before launch, have an IP lawyer review the final site and your trademark filing for "Kraftshed".

---

## Deploy on Hostinger VPS — fast path (one script)

```bash
ssh root@YOUR_VPS_IP
mkdir -p /opt/kraftshed && cd /opt/kraftshed
# copy kraftshed.zip here (scp from your laptop), then:
apt-get install -y unzip && unzip -q kraftshed.zip && mv kraftshed/* kraftshed/.[!.]* . 2>/dev/null; rmdir kraftshed
bash deploy/bootstrap.sh kraftshed.com you@email.com
```
The script installs Docker/Nginx/SSL, generates secrets, builds, migrates, seeds and prints your admin login. Afterwards add Razorpay keys with `nano .env` and run `docker compose up -d --force-recreate web`.

## Deploy on Hostinger VPS — manual steps (Ubuntu, ~15 minutes)

1. **Point the domain.** In Hostinger DNS, create `A` records for `kraftshed.com` and `www` → your VPS IP.

2. **SSH in and clone / upload the project** to `/opt/kraftshed`:
   ```bash
   ssh root@YOUR_VPS_IP
   mkdir -p /opt && cd /opt
   git clone <your-repo-url> kraftshed   # or: scp -r kraftshed root@IP:/opt/
   cd kraftshed
   ```

3. **One-time server setup** (installs Docker, Nginx, firewall, certbot):
   ```bash
   ./deploy/setup-vps.sh kraftshed.com
   certbot --nginx -d kraftshed.com -d www.kraftshed.com
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env && nano .env
   ```
   - `DATABASE_URL` — keep host `db`, set a strong password (same password is used for Postgres).
   - `AUTH_SECRET` — `openssl rand -base64 32`
   - Razorpay keys from dashboard.razorpay.com → Settings → API Keys. Add a webhook at `https://kraftshed.com/api/razorpay/webhook` for events `payment.captured` and `payment.failed`, and paste its secret into `RAZORPAY_WEBHOOK_SECRET`.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` for the first admin login.

5. **Build, migrate, start, seed:**
   ```bash
   ./deploy/deploy.sh      # builds the image, creates tables, starts the app
   ./deploy/seed.sh        # admin user, categories, demo seller + products
   ```

6. Open `https://kraftshed.com`. Sign in as admin → `/admin`. Demo seller login: `demo-seller@kraftshed.com` / `Demo@12345` (delete from Admin → Sellers before going live).

**Updating later:** `git pull && ./deploy/deploy.sh` (zero data loss — uploads and the database live in Docker volumes).

**Logs:** `docker compose logs -f web` · **DB shell:** `docker compose exec db psql -U kraftshed`

**Backups:** `docker compose exec db pg_dump -U kraftshed kraftshed > backup-$(date +%F).sql` — put it in cron weekly and copy to Hostinger object storage or Google Drive.

---

## Local development

```bash
npm install
cp .env.example .env            # point DATABASE_URL at a local Postgres
npx prisma migrate deploy && npm run db:seed
npm run dev                     # http://localhost:3000
```

Hostinger VPS minimum: KVM 1 (1 vCPU / 4 GB) is fine to launch; move to KVM 2 once you pass ~50 orders/day.

---

## Project layout

```
prisma/schema.prisma      data model (users, sellers, catalog, cart, orders, payments, ledger, payouts…)
prisma/seed.ts            admin + categories + demo data
src/app/(store)/          buyer storefront routes
src/app/seller/           Maker Studio
src/app/admin/            admin panel
src/app/actions/          server actions (auth, cart, checkout, seller, admin, reviews)
src/app/api/              Razorpay webhook, image upload
src/components/           UI (store / seller / admin / ui)
src/lib/                  db, auth (JWT cookie sessions), cart maths, catalog search, razorpay, format
deploy/                   nginx.conf, setup-vps.sh, deploy.sh, seed.sh
```

## Roadmap ideas (not built yet)
- Shiprocket/Delhivery API for label booking & live tracking (today sellers paste tracking numbers)
- Email/WhatsApp notifications (today: in-app notifications)
- Razorpay Route for automatic split payouts (today: admin pays sellers manually with UTR)
- GST invoice PDF generation per order
- Elasticsearch/Meilisearch for typo-tolerant search at scale
