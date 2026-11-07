---
title: "Smart kameradan hujjatlargacha: hujum zanjirini oʻzingiz uzib koʻring"
description: "Interaktiv laboratoriya: eski firmware'li Wi-Fi kamera orqali uy noutbukidagi hujjatlarga yetib borish zanjiri, MITRE ATT&CK bosqichlari va qaysi himoya zanjirni qayerda uzishi."
date: 2026-11-08
tags: [news, iot, lateral-movement, purple-team, network-segmentation, uzbek]
lang: uz
---

Uyda bitta Wi-Fi tarmoqqa ulangan arzon smart kamera, router va Windows noutbuk bor deylik. Kamera eski firmware'da ishlaydi va router UPnP orqali uning interfeysini internetga ochib qoʻygan. Shu holatda hujumchi kamerani egallab, undan uydagi soliq hujjatlarigacha yetib borishi mumkin.

Bu jarayonni oltita bosqichli interaktiv simulyatsiyaga aylantirdim. Har bir bosqichda tarmoq diagrammasi, xavfsizlik logi va MITRE ATT&CK texnikasi koʻrsatiladi.

## Nimani sinab koʻrish mumkin

- **Himoya choralarini yoqib-oʻchirish**: UPnP, firmware yangilash, IoT chiquvchi trafigini cheklash, alohida VLAN, SMB'ni qattiqlashtirish va monitoring.
- **Zanjir qayerda uzilishini koʻrish**: har bir himoya bitta boʻgʻinni uzadi, qolgan bosqichlar oʻtkazib yuboriladi.
- **Aniqlash va toʻsish farqi**: “Faqat monitoring” rejimida hujum oxirigacha boradi, lekin har bosqichda signal paydo boʻladi.
- **Blue team dalillari**: har bir bosqich uchun real pentest va SOC'da qidiriladigan izlar.

### 👉 [Interaktiv laboratoriyani ochish](../../news/iot-hujum-zanjiri.html)

> ℹ️ Laboratoriya alohida toʻliq ekranli sahifa sifatida ochiladi. Bu — modellashtirilgan simulyatsiya, hech qanday real tizimga ulanmaydi.

## Asosiy xulosa

Hujum faqat uchta shart birga kelganda ishlaydi: kamera internetdan koʻrinadi, unda zaiflik bor va noutbukdagi ulashilgan papka zaif himoyalangan. Alohida IoT VLAN kamerani qutqarmaydi, lekin VLAN'lar orasidagi firewall qoidasi haqiqatan trafikni rad etsa, kameradan noutbukka oʻtish yoʻlini toʻsadi.

Eng muhimi — bitta himoyaga tayanmaslik. Qatlamli himoyada birinchi qatlam ishlamay qolsa (masalan, 0-day yoki notoʻgʻri sozlama), keyingisi hujumni ushlab qoladi.
