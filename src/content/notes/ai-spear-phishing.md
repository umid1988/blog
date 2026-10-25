---
title: "AI va gipershaxsiylashtirilgan spear-phishing: zamonaviy tuzoq qanday ishlaydi"
description: "Sunʼiy intellekt OSINTʼni avtomatlashtirib, har bir xodimga moslashtirilgan phishing tuzogʻini yaratadi. Hujum mexanizmi, nega u ishlaydi (haqiqiy raqamlar) va qanday toʻxtatiladi."
date: 2026-10-25
tags: [phishing, ai-security, red-team, osint, social-engineering, uzbek]
lang: uz
---

**Avtomatlashtirilgan OSINT va gipershaxsiylashtirilgan spear-phishing** — bu sunʼiy intellekt (AI) agentlari yordamida nishon haqidagi ochiq maʼlumotlarni soniyalar ichida yigʻish, tahlil qilish va inson psixologiyasiga moslashtirilgan tuzoq xabarini yaratish jarayonidir.

Anʼanaviy spear-phishingda hujumchi bitta nishonni oʻrganish uchun soatlab vaqt sarflasa, AI agentlari buni avtomatik tarzda va yuzlab xodimga bir vaqtda amalga oshiradi. Buni xayoliy "FinTechCorp" kompaniyasiga qarshi **red team simulyatsiyasi** asosida koʻrib chiqamiz.

<div class="callout callout--info"><span class="callout__h">Bu post nima uchun</span>
Bu — tahdidni <strong>tushunish va undan himoyalanish</strong> uchun yozilgan xabardorlik materiali. Senariy va undagi kompaniya/shaxslar butunlay xayoliy. Maqsad — xodimlar va himoya jamoalari bunday hujumni tanib, oldini olishi.</div>

## Hujum oqimi bir qarashda

<figure class="diagram">
<svg viewBox="0 0 760 118" role="img" aria-label="AI spear-phishing oqimi: OSINT yig'ish, AI profiling, gipershaxsiy xabar, AiTM proksi, sessiya tokeni o'g'irlanishi">
<defs><marker id="pf1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="d-arrow"/></marker></defs>
<g font-size="11.5" font-weight="600" text-anchor="middle">
<rect class="d-box" x="2" y="40" width="130" height="42" rx="3"/><text x="67" y="57">OSINT yigʻish</text><text class="d-label" x="67" y="71">LinkedIn · GitHub</text>
<rect class="d-box" x="160" y="40" width="130" height="42" rx="3"/><text x="225" y="57">AI profiling</text><text class="d-label" x="225" y="71">ogʻriq · uslub</text>
<rect class="d-box" x="318" y="40" width="130" height="42" rx="3"/><text x="383" y="57">Gipershaxsiy</text><text class="d-label" x="383" y="71">xabar (rahbar nomidan)</text>
<rect class="d-box d-box--ext" x="476" y="40" width="130" height="42" rx="3"/><text x="541" y="57">AiTM proksi</text><text class="d-label" x="541" y="71">Evilginx-sinf</text>
<rect class="d-box" x="634" y="40" width="124" height="42" rx="3" style="stroke:var(--redline)"/><text x="696" y="57" style="fill:var(--redline)">Sessiya tokeni</text><text class="d-label" x="696" y="71">oʻgʻirlandi</text>
<g class="d-line" marker-end="url(#pf1)">
<line x1="132" y1="61" x2="158" y2="61"/><line x1="290" y1="61" x2="316" y2="61"/><line x1="448" y1="61" x2="474" y2="61"/><line x1="606" y1="61" x2="632" y2="61"/>
</g>
<text class="d-label" x="380" y="18">2–3 daqiqa · toʻliq avtomatik · yuzlab nishonga parallel</text>
<line x1="60" y1="24" x2="700" y2="24" class="d-line" style="stroke-dasharray:3 3;opacity:0.5"/>
</g>
</svg>
<figcaption>Butun zanjir AI tomonidan avtomatlashtiriladi — razvedkadan tokenni oʻgʻirlashgacha.</figcaption>
</figure>

## Real senariy: DevOps muhandisini nishonga olish

Nishon — "FinTechCorp"dagi **Sardor** ismli Senior DevOps muhandisi. Maqsad — uning bulutli (AWS/GitHub) sessiya tokenlarini qoʻlga kiritish.

### 1-bosqich: Avtomatlashtirilgan OSINT

AI agentiga bitta buyruq beriladi: *"FinTechCorp texnik xodimlarini top va oxirgi 30 kundagi faoliyatini tahlil qil"*. Agent 2–3 daqiqada ochiq manbalarni skanerlab, maʼlumotlarni birlashtiradi:

- **LinkedIn:** Sardorning lavozimi — *Senior DevOps Engineer*. 3 kun oldin "Kubernetes klasterlarini yangi arxitekturaga oʻtkazish" loyihasi haqida post qoldirgan, unga rahbari **Javlon (Team Lead)** izoh yozgan.
- **GitHub:** ochiq repozitoriylar va commit tarixi — kecha `helm-charts` va `terraform-aws-eks` muammosi ustida bahslashgani koʻrinadi.
- **Telegram / X / StackOverflow:** DevOps guruhida `ArgoCD` sinxronizatsiyasi boʻyicha savol bergani, oʻzbek-ingliz aralash texnik slengda yozishishi aniqlanadi.

### 2-bosqich: AI tahlili va profil tuzish

1-bosqichda yigʻilgan narsa hali tarqoq, "xom" maʼlumot: bir nechta post, commit va izoh. Bu bosqichning vazifasi — oʻsha tarqoq maʼlumotni **tuzilgan psixologik profilga** aylantirish. Aynan shu qadam oddiy razvedkani hujumga aylantiradi.

Zamonaviy AI agentlari buni **toolʼlar (masalan, MCP serverlar)** orqali qiladi: har bir manbadan (LinkedIn, GitHub, Telegram) maʼlumot alohida tool bilan tortiladi, bitta kontekstga jamlanadi va tahlil uchun LLMʼga uzatiladi. LLM esa har bir detaldan aniq xulosa chiqaradi.

<figure class="diagram">
<svg viewBox="0 0 740 128" role="img" aria-label="Uchta manbadan (LinkedIn, GitHub, Telegram) kelgan maʼlumot LLM tahlilidan oʻtib, bitta nishon kartasiga aylanadi">
<defs><marker id="pf4" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="d-arrow"/></marker></defs>
<g font-size="11" font-weight="600" text-anchor="middle">
<rect class="d-box" x="8" y="8" width="118" height="28" rx="3"/><text x="67" y="26">LinkedIn</text>
<rect class="d-box" x="8" y="50" width="118" height="28" rx="3"/><text x="67" y="68">GitHub</text>
<rect class="d-box" x="8" y="92" width="118" height="28" rx="3"/><text x="67" y="110">Telegram / forum</text>
<rect class="d-box" x="300" y="46" width="140" height="40" rx="3"/><text x="370" y="63">LLM tahlili</text><text class="d-label" x="370" y="77">xulosa chiqaradi</text>
<rect class="d-box d-box--ext" x="580" y="46" width="152" height="40" rx="3" style="stroke:var(--redline)"/><text x="656" y="63" style="fill:var(--redline)">Nishon kartasi</text><text class="d-label" x="656" y="77">tuzilgan profil</text>
<g class="d-line" marker-end="url(#pf4)">
<line x1="126" y1="22" x2="298" y2="58"/><line x1="126" y1="64" x2="298" y2="66"/><line x1="126" y1="106" x2="298" y2="74"/>
<line x1="440" y1="66" x2="578" y2="66"/>
</g>
<text class="d-label" x="213" y="120">3 tarqoq manba</text>
<text class="d-label" x="510" y="60">bitta profil →</text>
</g>
</svg>
<figcaption>Tarqoq ochiq maʼlumot LLM tahlilidan oʻtib, hujum uchun tayyor "nishon kartasi"ga aylanadi.</figcaption>
</figure>

**Xom maʼlumot qanday xulosaga aylanadi:**

| Agent nimani koʻrdi (kirish) | LLM qanday xulosa chiqardi (chiqish) |
| --- | --- |
| GitHub: kecha `terraform-aws-eks` muammosida crashloop | **Ogʻriqli nuqta** — hoziroq hal qilmoqchi boʻlgan dolzarb masala → shoshilinchlik vositasi |
| LinkedIn: postga **Javlon (Team Lead)** izoh yozgan | **Ishonch nuqtasi** — bevosita rahbar → yuboruvchi sifatida ishonchli ism |
| Telegram: `prod'da podlar crashloop beryapti` | **Til namunasi** — yarim rasmiy, aralash texnik sleng → xabar aynan shu uslubda yoziladi |
| LinkedIn: *Senior DevOps Engineer*, AWS/EKS steki | **Nishon qiymati** — bulut kalitlariga kirish → sessiya tokeni asosiy maqsad |

Natijada LLM strukturalangan **"nishon kartasi"** chiqaradi — 3-bosqichdagi xabar generatsiyasi uchun tayyor "retsept":

```json
{
  "nishon": "Sardor — Senior DevOps Engineer",
  "hozirgi_muammo": "ArgoCD + EKS crashloop",
  "ishonchli_yuboruvchi": "Javlon (Team Lead)",
  "uslub": "yarim rasmiy, texnik sleng",
  "tanlangan_tuzoq": "hotfix loglari havolasi",
  "bahona_deadline": "16:00 sprint-review"
}
```

Diqqat qiling: hujumchi bu yerda hech narsa **oʻylab topmaydi** — kartadagi har bir maydon nishonning oʻz ochiq maʼlumotlaridan olingan. Aynan shuning uchun keyingi bosqichdagi xabar shunchalik ishonarli chiqadi.

### 3-bosqich: Gipershaxsiy xabarni generatsiya qilish

Oddiy phishing *"Hurmatli foydalanuvchi, parolingizni yangilang"* desa, AI agenti yuboruvchini `Javlon (Team Lead)`ga oʻxshatib, quyidagicha xabar yaratadi:

<div class="callout callout--warn"><span class="callout__h">Illyustrativ namuna (xayoliy)</span>
<b>Mavzu:</b> EKS klaster va ArgoCD sync muammosi boʻyicha<br><br>
"Salom Sardor. Kecha GitHub’da koʻtarilgan Terraform EKS moduli boʻyicha Security jamoasi bilan gaplashdim. ArgoCD’da podlar crashloop berayotganining sababi IAM rollaridagi yangi cheklov ekan. Men test-envʼda hotfix qildim va loglarni ichki GitLab sahifamizga yuklab qoʻydim: <code>gitlab-internal.fintechcorp-dev.com/devops/eks-hotfix-logs</code>. Bugun 16:00 dagi sprint-reviewʼgacha shuni koʻrib, staging klasteringda tekshirib yubor, prodʼga chiqarishimiz kerak."</div>

### 4-bosqich: AiTM tuzogʻi

Xatdagi havola (`fintechcorp-dev.com`) aslida **Evilginx** kabi Adversary-in-the-Middle (AiTM) proksi-serveriga ulangan. Bu — hujumning eng muhim texnik qismi va u 2FAʼni ham chetlab oʻtadi.

<figure class="diagram">
<svg viewBox="0 0 740 150" role="img" aria-label="AiTM relay: qurbon, AiTM proksi va haqiqiy SSO o'rtasida login, 2FA va sessiya kukisi oqimi">
<defs><marker id="pf2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="d-arrow"/></marker></defs>
<g font-size="11.5" font-weight="600">
<rect class="d-box" x="10" y="54" width="120" height="42" rx="3"/><text x="70" y="71" text-anchor="middle">Qurbon</text><text class="d-label" x="70" y="85" text-anchor="middle">Sardor</text>
<rect class="d-box d-box--ext" x="300" y="54" width="140" height="42" rx="3" style="stroke:var(--redline)"/><text x="370" y="71" text-anchor="middle">AiTM proksi</text><text x="370" y="85" text-anchor="middle" font-size="9.5" style="fill:var(--redline)">Evilginx</text>
<rect class="d-box" x="610" y="54" width="120" height="42" rx="3"/><text x="670" y="71" text-anchor="middle">Haqiqiy SSO</text><text class="d-label" x="670" y="85" text-anchor="middle">Microsoft 365</text>
<g class="d-line" marker-end="url(#pf2)">
<line x1="130" y1="64" x2="298" y2="64"/><line x1="440" y1="64" x2="608" y2="64"/>
<line x1="608" y1="86" x2="442" y2="86"/><line x1="298" y1="86" x2="132" y2="86"/>
</g>
<text class="d-label" x="150" y="52">1. login + parol + 2FA →</text>
<text class="d-label" x="455" y="52">2. aynan uzatiladi (relay) →</text>
<text class="d-alert" x="455" y="104">3. ← sessiya kukisi</text>
<text class="d-alert" x="150" y="104">4. ← kuki ushlab qolindi</text>
<text class="d-label" x="370" y="126" text-anchor="middle">MFA muvaffaqiyatli oʻtadi — lekin token hujumchida</text>
</g>
</svg>
<figcaption>AiTM proksi haqiqiy SSO bilan qurbon oʻrtasida turadi: 2FA toʻgʻri kiritiladi, lekin tayyor sessiya kukisi hujumchiga oʻtadi.</figcaption>
</figure>

## Nega bu hujum shunchalik ishlaydi?

<div class="callout callout--danger"><span class="callout__h">Raqamni toʻgʻri tushunaylik</span>
Internetda "90% holatda ishlaydi" kabi raqamlar uchraydi, lekin ular dalillanmagan. Odamlar ustida sinalgan ilmiy tadqiqot (arXiv, 2025) quyidagini topdi — asl kuch foizning yuqoriligida emas, balki <b>narx va miqyosda</b>.</div>

| Hujum turi | Click-through rate | Izoh |
| --- | --- | --- |
| Oddiy (generic) phishing | **12%** | Shablon, spam filtri oson ushlaydi |
| AI-avtomatlashtirilgan spear-phishing | **54%** | Inson eksperti darajasi, lekin ~30× arzon |
| Inson eksperti yozgan | **54%** | Qimmat va sekin |
| AI + inson yordami | **56%** | Eng yuqori |

Yaʼni AI spear-phishing **inson eksperti darajasida ishlaydi, ammo 30 barobar arzon va miqyosi cheksiz**. Aynan shu — bitta kampaniyada minglab noyob, individual xat — uni haqiqiy tahdidga aylantiradi. Buning uch sababi bor:

- **Nol shubha:** xatda Sardor aynan bugun shugʻullanayotgan real muammo (`Terraform`, `EKS`, `ArgoCD`, `crashloop`) tilga olinadi. Aniq texnik detallar inson miyasining xavfsizlik filtrini susaytiradi.
- **Uslub mosligi:** matn sunʼiy tarjimaga oʻxshamaydi — AI Sardorning oʻz postlaridagi soʻz boyligidan foydalanadi.
- **Filtrlardan oʻtish:** har bir xat noyob va ishga oid suhbatga oʻxshagani uchun kontent filtrlari (SEG) uni oddiy yozishma deb qabul qiladi.

## Anʼanaviy phishing va AI spear-phishing farqi

| Koʻrsatkich | Anʼanaviy phishing | AI gipershaxsiy spear-phishing |
| --- | --- | --- |
| **Maʼlumot yigʻish** | Faqat email manzillar | LinkedIn, GitHub, ijtimoiy tarmoq postlari avtomatik yigʻiladi |
| **Xabar matni** | Umumiy: "Hisobingiz bloklandi" | Individual: joriy vazifa, hamkasb ismi, ichki loyiha nomi |
| **Masshtab** | 1000 ta bir xil xat | 1000 ta xodimga 1000 xil xat (har biri soniyalarda) |
| **Spam filtr (SEG)** | Shablon tufayli bloklanadi | Noyob va ishga oid boʻlgani uchun oʻtib ketadi |

## Qanday aniqlash va toʻxtatish mumkin

<div class="tech-card">
<div class="tech-card__head"><span class="tech-card__name">1. Raqamli izni cheklash (OPSEC)</span></div>

Xodimlar (ayniqsa dasturchilar va tizim maʼmurlari) ijtimoiy tarmoq va ochiq forumlarda kompaniya ichidagi aniq texnologiyalar stekini, ichki loyiha nomlarini va joriy texnik muammolarni oshkor qilmasligi kerak. AI aynan shu ochiq maʼlumotlardan tuzoq quradi.

<div class="dd">
<div class="dd__det"><b>Aniqlash:</b> xodimlarning ommaviy GitHub/LinkedIn/forum faolligini davriy koʻrib chiqish (oʻz kompaniyangizga qarshi OSINT); ichki loyiha nomlari ommaga chiqib ketganini kuzatish.</div>
<div class="dd__def"><b>Himoya:</b> xabardorlik treningi; ichki texnik muhokamalarni yopiq kanallarda olib borish; commit va postlarda ichki infratuzilma nomlarini oshkor qilmaslik.</div>
</div>
</div>

<div class="tech-card">
<div class="tech-card__head"><span class="tech-card__name">2. Phishingga chidamli autentifikatsiya (FIDO2 / Passkey)</span></div>

Bu — eng kuchli himoya, chunki u foydalanuvchining ehtiyotkorligiga tayanmaydi. Passkey RP ID (domen)ga kriptografik bogʻlangan: imzo faqat ceremony oʻtgan **origin** uchun amal qiladi. Qurbon xabarga 100% ishonib havolani bossa ham, brauzer va autentifikator originʼni tekshiradi — `fintechcorp-dev.com` RP ID `fintechcorp.com`'nikidan farq qilgani uchun passkey imzo bermaydi va AiTM proksi boʻsh qoladi.

<figure class="diagram">
<svg viewBox="0 0 740 120" role="img" aria-label="Passkey origin binding: soxta domen RP ID bilan mos kelmaydi, imzo rad etiladi">
<defs><marker id="pf3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="d-arrow"/></marker></defs>
<g font-size="11.5" font-weight="600">
<rect class="d-box" x="10" y="42" width="130" height="42" rx="3"/><text x="75" y="59" text-anchor="middle">Passkey</text><text class="d-label" x="75" y="73" text-anchor="middle">RP ID: fintechcorp.com</text>
<rect class="d-box d-box--ext" x="300" y="8" width="150" height="40" rx="3"/><text x="375" y="25" text-anchor="middle">Soxta: -dev.com</text><text class="d-label" x="375" y="39" text-anchor="middle">AiTM proksi</text>
<rect class="d-box" x="300" y="78" width="150" height="40" rx="3"/><text x="375" y="95" text-anchor="middle">Haqiqiy: .com</text><text class="d-label" x="375" y="109" text-anchor="middle">SSO</text>
<line x1="140" y1="52" x2="298" y2="30" class="d-line" marker-end="url(#pf3)"/>
<line x1="140" y1="74" x2="298" y2="96" class="d-line" marker-end="url(#pf3)"/>
<text x="470" y="32" style="fill:var(--redline)" font-size="11" font-weight="700">✕ origin mos emas → imzo RAD</text>
<text x="470" y="102" style="fill:#1f6b4e" font-size="11" font-weight="700">✓ origin mos → imzo OK</text>
</g>
</svg>
<figcaption>Passkey imzosi domenga bogʻlangan: soxta domenda u ishlamaydi, shuning uchun AiTM proksi tokenni ololmaydi.</figcaption>
</figure>

<div class="dd">
<div class="dd__det"><b>Aniqlash:</b> SSO loglarida bir foydalanuvchi uchun gʻayrioddiy manba IP / qurilma; AiTM proksi orqali kelgan sessiyalar odatda yangi, tanish boʻlmagan IP va User-Agent bilan keladi.</div>
<div class="dd__def"><b>Himoya:</b> imtiyozli va texnik xodimlar uchun passkey/FIDO2ʼni majburiy qilish; OTP/push MFAʼga tayanmaslik (ular AiTMʼga zaif); conditional access bilan qurilma holatini tekshirish.</div>
</div>
</div>

<div class="tech-card">
<div class="tech-card__head"><span class="tech-card__name">3. Tashqi xabar belgisi (External Tag)</span></div>

Korporativ pochta va messenjerlarda tashkilot domenidan tashqaridan kelgan har qanday xabarga — yuboruvchi ismi rahbarning ismi bilan bir xil boʻlsa ham — yorqin `[TASHQI / EXTERNAL]` yorligʻini majburiy qoʻyish. Bu "Javlondan keldi" degan illyuziyani buzadi.

<div class="dd">
<div class="dd__det"><b>Aniqlash:</b> ichki ism bilan tashqaridan kelgan xatlar (display-name spoofing); DMARC/DKIM/SPF nomuvofiqliklari.</div>
<div class="dd__def"><b>Himoya:</b> External tag; DMARCʼni enforcementʼga; ichki muloqot uchun faqat tasdiqlangan kanallar; "havoladan oldin toʻxta" madaniyati.</div>
</div>
</div>

## Xulosa

AI spear-phishing yangi qurol emas — u mavjud texnikalarni (OSINT, Evilginx AiTM) shunchaki avtomatlashtiradi va arzonlashtiradi. Aynan shu — nation-state sifatidagi hujumni ommaviy miqyosda olib kelishi — uni xavfli qiladi. Yaxshi xabar: texnik himoya (passkey) foydalanuvchi xatosiga bogʻliq emas va bu hujum zanjirini aynan eng zaif boʻgʻinida uzadi.

## Manbalar

- [AI spear-phishing samaradorligi tadqiqoti — 54% click rate (Malwarebytes / arXiv)](https://www.malwarebytes.com/blog/news/2025/01/ai-supported-spear-phishing-fools-more-than-50-of-targets)
- [AiTM / Evilginx MFA bypass kampaniyalari (Cyber Security News)](https://cybersecuritynews.com/evilginx-aitm-attack-captures-microsoft-credentials/)
- [Passkey origin binding — phishing protokol darajasida toʻxtaydi](https://nhimg.org/articles/passkey-origin-binding-shows-why-phishing-stops-at-the-protocol-layer/)
- [Cloud Security Alliance — AI-Weaponized Phishing](https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-weaponized-phishing-systemic-risk-20260/)

<div class="callout callout--info"><span class="callout__h">Eslatma</span>
Ushbu material faqat himoya va xabardorlik maqsadida yozilgan. Senariy xayoliy; hech bir haqiqiy shaxs yoki kompaniya nazarda tutilmagan.</div>
