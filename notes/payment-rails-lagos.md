---
title: "Building Payment Rails for Lagos"
date: 2026-02-18
excerpt: "Six months of fintech compliance, PSP failures, and the infrastructure assumptions that will get you killed in West Africa."
tags: [payments, emerging-markets, compliance, fintech]
slug: "payment-rails-lagos"
send: true
broadcast: true
sent: false
---

# Building Payment Rails for Lagos

Six months ago I started building the payments layer for Korporty. I assumed it would take three weeks. It took four months to get to reliable.

Here's what I learned.

## The first assumption that broke

Every payment integration I'd seen before was built for the assumption that the network is mostly up, the PSP is mostly responsive, and failures are edge cases you handle gracefully.

In Lagos, failures are the default state. Success is the edge case you need to engineer for.

The first week, our webhook delivery rate was 34%. Not because our servers were down — because the mobile networks were congested between 6pm and 9pm every day, and asynchronous callbacks were being dropped silently.

## What actually works

**Retry with exponential backoff and jitter.**

Not fixed-interval retries. Not "retry 3 times." Exponential backoff with randomized jitter so you're not hammering a recovering endpoint in synchronized bursts.

```javascript
function getRetryDelay(attempt) {
  const base = 1000; // 1 second
  const cap = 30000; // 30 seconds max
  const jitter = Math.random() * 1000;
  return Math.min(base * Math.pow(2, attempt) + jitter, cap);
}
```

After switching to this, our webhook delivery rate in the first 24 hours went from 34% to 91%.

**Multi-PSP routing.**

You cannot depend on a single PSP in Nigeria. Not because they're bad — because the infrastructure they sit on top of has real constraints. Paystack goes down. Flutterwave has bank-specific issues. Cards issued by Unity Bank fail on one processor but not another.

Build routing that knows this and responds to it in real time.

```javascript
async function routePayment(payload) {
  const psp = await selectByRecentSuccessRate(payload);
  try {
    return await psp.initiate(payload);
  } catch (err) {
    logger.warn(`PSP ${psp.id} failed, falling back`, { err });
    return await fallbackRoute(payload, psp.id);
  }
}
```

**Idempotency everywhere.**

Every payment endpoint takes an idempotency key. Every. Single. One. Because when a client retries a timed-out request, you need to guarantee they're not charged twice. This is not optional.

## The compliance layer nobody warns you about

CBN regulations in Nigeria require:

- BVN verification for accounts above a transaction threshold
- Specific data retention policies for transaction records
- Explicit consent flows for recurring charges

None of this is documented clearly anywhere. You learn it from compliance consultants, from reading CBN circulars, and from having a payment provider tell you your integration is rejected at the last review.

Budget time for this. Budget more than you think.

## What I'd do differently

1. Start with multi-PSP routing on day one, not as a refactor
2. Build the reconciliation system before the payment initiation system
3. Talk to a compliance consultant in week one, not month four
4. Instrument everything — you cannot debug payment failures you can't observe

## The mental model that helps

Think of every payment as having three states: **initiated**, **confirmed**, and **settled**. PSPs conflate these. Banks conflate these. Your system should not.

Initiated means you sent the request. Confirmed means the PSP acknowledged it. Settled means money moved. These can be hours or days apart.

Build your system around that gap.

---

Korporty is in private beta. If you're building payments infrastructure in West Africa and want to compare notes, reach out.
