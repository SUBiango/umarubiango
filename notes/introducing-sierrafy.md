---
title: "Building Sierrafy: An Open Identity Verification SDK for Sierra Leone"
date: 2026-06-21
excerpt: "Sierra Leone has achieved 93% national civial registration and ID issuance coverage. That's a major achievement by NCRA."
tags: [development, open-source, infrastracture, NIN]
slug: "introducing-sierrafy"
featured_image: "/assets/images/notes/laptop-on-a-desk.jpg"
featured_image_alt: "Cover image for Building Sierrafy: An Open Identity Verification SDK for Sierra Leone"
featured_image_width: 700
featured_image_height: 425
send: true
broadcast: false
sent: false
---

# Building Sierrafy: An Open Identity Verification SDK for Sierra Leone

Sierra Leone has achieved 93% NIN registration coverage.

Not a gap in awareness. A gap in infrastructure.

Every bank account. Every SIM card. Every company registration. Every school enrolment. The National Identification Number sits at the centre of all of it — legally required and held by millions of Sierra Leoneans.

The identity infrastructure exists.

The developer infrastructure does not.

For a developer building a Sierra Leonean app today, there is no widely available open-source toolkit for identity verification.

NCRA has built something real. Millions of Sierra Leoneans are registered. But the developer layer — the API, the SDK, the integration point that allows a local startup or government portal to confidently validate identity documents and automate onboarding — remains largely unavailable to the builders who need it most.

As a result, many Sierra Leonean applications make the same compromise: they accept a NIN as plain text, trust the user, and move on.

That is the problem Sierrafy is built to solve.

Sierrafy is an open-source identity verification SDK built specifically for Sierra Leone. It provides a clean REST API and multi-language SDKs that give developers a programmatic way to validate, authenticate, and verify identity documents associated with a user's NIN.

It is self-hostable, offline-capable, MIT licensed, and free to use.

## Phase 1

Phase 1 ships with five verification layers:

* **NIN format validation** — structural validation before a single image is uploaded
* **Document OCR** — extracts and cross-checks data from the National eID Card and Passport
* **Face matching** — confirms the person presenting the document matches the document photo
* **Fraud detection** — flags signs of document tampering, manipulation, and screen recaptures
* **NFC chip authentication** — reads the cryptographic chip embedded in the National eID Card and verifies its authenticity

The final layer is particularly important because it shifts verification from visual inspection to cryptographic proof.

The chip inside the Sierra Leone National eID Card carries a digital signature issued by NCRA. Sierrafy reads that signature and verifies it cryptographically, helping confirm that the card data is authentic and has not been altered.

It represents the highest level of confidence available without a live database lookup and builds directly on the identity infrastructure that already exists today.

## Phase 2

Phase 2 is a formal partnership with NCRA for live NIN database verification and lookup.

That is the long-term destination.

Phase 1 establishes the developer foundation needed before that destination becomes practical. The goal is not to replace Sierra Leone's identity infrastructure, but to make it easier for developers to build on top of it.

## Building in Public

Over the next several weeks, I will be building Sierrafy in public.

I'll be sharing the architecture, technical decisions, implementation details, lessons learned, mistakes made, and milestones achieved as each component ships.

If you are a Sierra Leonean developer, fintech founder, startup operator, government contractor, or anyone building products that need to know who their users are, this project is for you.

## Contributing

Sierrafy is open source, and contributions are welcome.

If you're a developer interested in contributing, check out the repository:

→ [sierrafy repo](https://github.com/SUBiango/sierrafy)

Before opening a pull request, please review the open questions listed in the `CONTRIBUTING.md` document.

Several implementation details are still being researched and verified, including:

* NIN format specifications
* National eID Card zone-map coordinates
* CSCA (Country Signing Certificate Authority) certificates and trust chain information
* Other Sierra Leone-specific identity document standards

If you have authoritative information on any of these topics, that is a valuable contribution in itself.

Building identity infrastructure is not only about writing code. Accurate specifications, documentation, sample data, testing, and validation are equally important.

Every contribution helps move the project forward.


→ [sierrafy.dev](https://sierrafy.dev)
