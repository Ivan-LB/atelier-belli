# Scan&Tap — portfolio brief

> Written for an agent maintaining a portfolio site. Every number here is
> verified against the repo, not recalled. Last verified **2026-07-27** at tag
> `v1.1.3`. Re-verify with the commands in "How to re-check" before publishing.

## One line

A multi-tenant Apple Wallet + Google Wallet loyalty-card platform that replaces
paper stamp cards for small independent businesses.

## What it does

A customer scans a QR and the loyalty card lands in Apple Wallet or Google
Wallet — no app to install, no account to create. Counter staff stamp visits
from a PIN-protected panel on their phone. Rewards unlock automatically and the
pass updates itself on the lock screen. The business owner gets their own panel
with metrics and push campaigns; the platform operator gets an admin panel to
onboard tenants, set branding, and manage Apple certificates.

## Status — be accurate about this

**Pre-revenue.** Two tenants in production, both demo/personal:
`gymfit-testing` and `cortadito-demo`. **Zero paying clients.** Built solo, in
public, as production-grade infrastructure ahead of go-to-market rather than a
prototype chasing one.

Do not describe it as "used by N cafés" or imply live commercial deployment.

## Stack

| | |
|---|---|
| Runtime | Node.js 22, Express, wrapped with `serverless-http` |
| Compute | One AWS Lambda behind API Gateway |
| Infra as code | AWS SAM (`template.yaml`), 18 parameters, deployed via GitHub Actions |
| Data | DynamoDB (6 tables, all with Point-in-Time Recovery) |
| Storage | S3 — per-tenant assets and Apple signing certificates |
| Wallet | `passkit-generator` (Apple), Google Wallet REST API + signed JWTs |
| Push | APNs over HTTP/2 with TLS client certs; Google Wallet AddMessage RPC |
| Images | Jimp — stamp strips, QR print assets, logo/sprite validation, all at runtime |
| Frontend | Server-rendered HTML, no framework, no build step |
| Tests | Node's built-in `node --test`. Zero test dependencies |

15 production dependencies total.

## Scale and history

| | |
|---|---|
| Source | 103 files, ~28,800 lines in `src/` |
| Tests | 768 cases across 93 files |
| History | 497 commits, 264 merged PRs, 5 tagged releases |
| Started | 2026-04-10 |
| Surfaces | 8 route groups |

## Architecture in a paragraph

Every route is tenant-scoped (`/<group>/:clientId/:passType/...`) and resolves
through a DB-backed registry with a 60-second container cache. Pass templates
live in S3 and are materialized into a per-request `/tmp` scratch directory —
the shared template dir is read-only on Lambda and would race across concurrent
requests. Stamp strip images are generated per pass at request time rather than
pre-rendered, so branding changes take effect immediately. The Google Wallet
path is entirely fail-open: a Google failure never blocks a signup or a stamp.
Four panels (admin, cashier, owner, and a session-less invite-token onboarding
flow) each have their own PIN authentication with independent session secrets,
distinct CSRF key spaces, and cross-tenant replay protection.

## Engineering worth pointing at

- **Security release (v1.1.1).** A multi-agent audit over 63 mapped endpoints
  found an unauthenticated pass-mutation endpoint — any pass holder could PATCH
  their own serial and self-grant unlimited rewards. Closed before any real
  tenant existed, alongside a global API Gateway throttle, a PNG
  decompression-bomb guard, and transport timeouts on both push paths.
- **Local testing harness (v1.1.2–v1.1.3).** `npm run dev` starts a Docker stack
  (DynamoDB Local + MinIO), bootstraps tables and buckets, runs stand-in servers
  for APNs and Google Wallet that print every call, and can open a TLS tunnel and
  sign with the real Apple certificate so a pass installs on a real iPhone —
  one command, with a documented fallback at every step.
- **Invariants as code.** `.claude/knowledge/gotchas.yaml` is a machine-readable
  catalog of 76 hard-won invariants, each written because something actually
  broke. Several are enforced by tests that scan the source rather than the
  behaviour, to catch a call site that does not exist yet.
- **Cost discipline.** A metering mechanism was built and then deliberately
  removed after a cost analysis: AWS spend is effectively zero at target scale,
  and a loyalty program should never stop mid-shift because of a quota.

## Good framings

- Infrastructure built to production standards *before* the first customer,
  rather than a prototype hardened afterwards
- Wallet integration depth: certificate lifecycle, silent background push,
  the PassKit Web Service, and the Apple/Google asymmetry handled honestly
- Solo-operated: architecture, security, deploy pipeline, product and design

## Avoid

- Any claim of paying customers, revenue, or usage volume
- Calling it an app — there is no mobile app; the wallet pass *is* the client
- Naming a specific business as a client; `cortadito-demo` is a demo tenant

## Links

Repo: `Ivan-LB/loyalty-cards` (private). Product name **Scan&Tap**; the npm
package name is `pass-platform` and the AWS stack is `pass-platform-stack`.

## How to re-check

```bash
npm test                                    # test count
git tag --sort=-v:refname | head -1         # current release
git rev-list --count HEAD                   # commits
find src -name '*.js' | wc -l               # source files
aws dynamodb scan --table-name pass-platform-tenants \
  --select COUNT --region us-west-1         # tenants in production
```

Deeper context: [README.md](README.md) for the project itself,
[CLAUDE.md](CLAUDE.md) for architecture and invariants, `plans/ROADMAP-v1.1.*.md`
for what shipped in each release.
