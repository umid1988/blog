# Zerosec blog

Writeup'lar, eslatmalar va yangiliklar uchun shaxsiy blog. [Astro](https://astro.build) asosida qurilgan, GitHub Pages'da ishlaydi.

Hozirgi manzil: https://umid1988.github.io/blog/

## Yangi post qo'shish

Postlar oddiy Markdown fayllar. Har bir bo'limning o'z papkasi bor:

| Bo'lim   | Papka                    | Manzil            |
| -------- | ------------------------ | ----------------- |
| Writeups | `src/content/writeups/`  | `/writeups/nomi/` |
| Notes    | `src/content/notes/`     | `/notes/nomi/`    |
| News     | `src/content/news/`      | `/news/nomi/`     |

Fayl nomi URL bo'ladi: `src/content/writeups/idor-in-orders-api.md` → `/writeups/idor-in-orders-api/`.

Har bir fayl boshida shu maydonlar bo'ladi:

```yaml
---
title: Sarlavha
description: Bir-ikki gaplik qisqa tavsif
date: 2026-10-25
tags: [web, idor]
draft: false   # true bo'lsa, faqat lokal ko'rinadi, saytga chiqmaydi
---
```

Writeup'larda qo'shimcha maydonlar bor: `platform`, `program`, `target`, `severity` (`critical`, `high`, `medium`, `low`, `info`), `cvss`, `cvssVector`, `status`, `report`, `cve`, `cwe`, `reported`, `disclosed`. To'liq namuna: `src/content/writeups/writeup-template.md`. Shu faylni nusxalab, nomini o'zgartirib, to'ldirasiz.

News postlarida ixtiyoriy `source` maydoni bor (asl manbaga havola).

Rasmni post fayli yoniga qo'yib, nisbiy yo'l bilan ulang: `![Tavsif](./rasm.png)`.

### GitHub'ning o'zida yozish

Kompyuterga hech narsa o'rnatmasdan ham bo'ladi: GitHub'da kerakli papkani oching → **Add file → Create new file** → post yozing → **Commit**. Bir-ikki daqiqada sayt o'zi yangilanadi.

## Lokal ishga tushirish

Node.js 22.23 yoki yangisi kerak.

```bash
npm install
npm run dev      # http://localhost:4321/blog/ — draft'lar ham ko'rinadi
npm run build    # tayyor sayt dist/ papkasiga
```

## Sozlamalar

- Sayt nomi, tavsifi va ijtimoiy tarmoq havolalari: `src/site.config.ts`
- Bosh sahifadagi tanishtiruv (sarlavha, yo'nalishlar, platformalar, sertifikatlar): `src/site.config.ts` ichidagi `profile`
- Ulashish uchun preview rasmlar har bir post uchun build vaqtida avtomatik yaratiladi (`src/lib/og.ts`), alohida hech narsa qilish shart emas
- Kod bloklari ranglari: `src/lib/shiki-themes.mjs`
- "About" sahifasi: `src/pages/about.md`
- Ranglar va shriftlar: `src/styles/global.css` (boshidagi `:root` qismi)

## O'z domenini ulash

1. Domen sotib oling.
2. Repo'da **Settings → Pages → Custom domain** ga domenni yozing va saqlang.
3. Domen panelida DNS yozuvlarini qo'shing:
   - Asosiy domen uchun (`example.com`): to'rtta `A` yozuv → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Yoki subdomen uchun (`blog.example.com`): `CNAME` → `umid1988.github.io`
4. DNS tasdiqlangach, **Enforce HTTPS** ni yoqing.
5. **Actions → Deploy to GitHub Pages → Run workflow** bilan saytni qayta yig'ing.

Kodni o'zgartirish shart emas: deploy workflow yangi domenni o'zi aniqlaydi va havolalarni moslaydi.

## Xavfsizlik

Sayt statik: server, baza yoki admin panel yo'q. Har bir sahifada qat'iy Content-Security-Policy bor (`src/layouts/Base.astro`): skriptlar faqat saytning o'zidan yuklanadi, tashqi shrift yoki tracker ishlatilmaydi.
