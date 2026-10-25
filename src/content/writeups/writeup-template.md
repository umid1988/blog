---
# Copy this file to start a new writeup, rename it (the file name becomes
# the URL), fill in the fields and set draft to false.
title: Writeup template
description: One or two sentences that say what the bug was and why it mattered.
date: 2026-10-25
tags: [web, xss]
draft: true

# Writeup fields. Delete any you don't need.
platform: HackerOne
program: Example Corp
target: app.example.com
severity: high # critical, high, medium, low or info
status: Resolved
cwe: CWE-79
reported: 2026-09-01
disclosed: 2026-10-20
---

## Summary

What the vulnerability is, where it lives, and what an attacker could do with it. Keep it to a short paragraph a reader can stop after.

## Scope and setup

The asset, the account roles you used, and anything a reader needs to reproduce the setup.

## Finding the bug

How you got there: what caught your attention, what you tried, and what didn't work.

## Proof of concept

```http
POST /api/profile HTTP/1.1
Host: app.example.com
Content-Type: application/json

{"display_name": "<img src=x onerror=alert(document.domain)>"}
```

1. Step one.
2. Step two.
3. What you observe.

## Impact

Who is affected and what an attacker gains. Be concrete about preconditions.

## Remediation

What the vendor changed, or what you would recommend.

## Timeline

| Date        | Event                  |
| ----------- | ---------------------- |
| 1 Sep 2026  | Reported               |
| 3 Sep 2026  | Triaged                |
| 15 Sep 2026 | Fixed                  |
| 20 Oct 2026 | Disclosure approved    |
