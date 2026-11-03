---
title: "MITRE Caldera: avtomatlashtirilgan adversary emulation va C2"
description: "Caldera nima, ichki arxitekturasi (Agent, Ability, Adversary, Fact-Graph, Planner), o‘rnatish, an’anaviy C2 (Cobalt Strike, Sliver) dan farqi, samaradorligi va OPSEC/stealth texnikalari — interaktiv stealth-agent generatori bilan."
date: 2026-11-04
tags: [red-team, adversary-emulation, mitre-attack, caldera, c2, purple-team, opsec, uzbek]
lang: uz
draft: false
---

Bu qo‘llanma MITRE Caldera — MITRE ATT&CK matritsasi asosida ishlaydigan avtomatlashtirilgan adversary emulation (xakerlar emulyatsiyasi) freymvorki haqida. Red, Blue va Purple Team ishlarida SIEM, EDR va SOC himoyasini tekshirish uchun Caldera qanday avtonom hujum zanjirlarini quradi — qadam-baqadam ko‘rib chiqamiz.

> ⚖️ **FAQAT RUXSAT BILAN**
> Bu yerdagi usullar faqat yozma ruxsat berilgan pentest, red team, bug bounty (dastur qoidalari doirasida), CTF yoki o‘zingizga tegishli laboratoriyada qo‘llanadi. Ruxsatsiz hujum vositalarini ishlatish va himoyani chetlab o‘tish ko‘plab davlatlarda jinoiy javobgarlikka sabab bo‘ladi (masalan, O‘zbekiston JK 278-1 – 278-7-moddalari, Kanada Criminal Code 342.1, AQSH CFAA 18 U.S.C. § 1030).

## Qo‘llanma nimalarni qamrab oladi

- **Ichki arxitektura** — Agent (Sandcat), Ability, Adversary Profile, Facts & Parsers va Planner (mantiqiy "miya") qanday birlashib avtonom zanjir hosil qiladi.
- **O‘rnatish** — Ubuntu/Kali (native), Docker va xavfsiz Production + SSL konfiguratsiyasi uchun qadam-baqadam buyruqlar.
- **Imkoniyatlar** — avtonom APT emulyatsiyasi, lateral movement, privilege escalation, data exfiltration va avtomatik cleanup.
- **An’anaviy C2 dan farqi** — Caldera va Cobalt Strike / Sliver / Havoc / Mythic orasidagi tub farqlar jadvali.
- **Samaradorlik va OPSEC** — nega standart Caldera "shovqinli", va uni stealth rejimga o‘tkazishning 6 ta texnikasi.

Qo‘llanmaning o‘zi — tablar, nusxalanadigan buyruqlar va jonli **stealth-agent generatori / shovqin kalkulyatori** bilan to‘liq interaktiv sahifa:

### 👉 [Interaktiv qo‘llanmani ochish](/blog/notes/mitre-caldera.html)

> ℹ️ Interaktiv sahifa alohida to‘liq ekranli sahifa sifatida ochiladi (`/blog/notes/mitre-caldera.html`).
