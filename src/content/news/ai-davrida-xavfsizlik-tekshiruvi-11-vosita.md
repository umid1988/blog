---
title: "Bir noutbuk, 6,3 milliard dollar: kod tezlashdi, xavfsizlik tekshiruvi esa yoʻq"
description: "Binance, Linux yadrosi va Polymarket voqealari nima koʻrsatdi, hamda kodingiz bilan production oʻrtasiga qoʻyish mumkin boʻlgan 11 ta ochiq manbali xavfsizlik vositasi."
date: 2026-11-05
tags: [news, ai-security, supply-chain, devsecops, tools]
lang: uz
source: https://www.linkedin.com/in/saedf/
---

*Maqola Saed'ning LinkedIn'dagi postiga asoslangan. Voqealar va vositalarni oʻzim alohida manbalardan tekshirib, tafsilotlar bilan toʻldirdim.*

## Qisqacha

2026-yil oktyabr oxirida uchta alohida voqea bir xulosaga olib keldi: **hujumchilar tezlashdi, xavfsizlik tekshiruvi esa kod yozish tezligiga yetib olmadi.** Quyida avval voqealarni, keyin esa kodingiz bilan production oʻrtasiga qoʻyishga arziydigan 11 ta ochiq manbali vositani koʻrib chiqamiz.

## 1. Binance: bitta DevOps noutbugi

**Nima boʻldi.** 2026-yil 29-oktyabr kuni, taxminan 20:05 UTC da, Binance hamyonlaridan pul chiqarila boshladi. Mablagʻning asosiy qismi taxminan 20 daqiqada koʻchirildi. Umumiy summa taxminan **6,3 milliard dollar** (blokcheyn tahlil kompaniyasi TRM taxminan 6,36 mlrd deydi), **oʻnta blokcheynda**. TRM buni kripto tarixidagi eng katta oʻgʻirlik deb baholaydi: 2025-yil fevraldagi Bybit hujumidan (1,5 mlrd dollar) taxminan toʻrt baravar katta.

**Qanday kirishgan.** Binance buni DevOps muhandisining buzilgan noutbugi bilan bogʻladi. Hujumchilar shu orqali xizmat konteyneriga yetib bordi va ruxsatsiz pul yechish soʻrovlarini yubordi. Binance oʻz xabarida hamyon maxfiy kalitining sizib chiqqani haqida dalil topmaganini aytdi. Noutbuk qanday buzilgani (zararli dastur yoki ijtimoiy muhandislik) hozircha maʼlum emas.

**Kim aybdor.** Binance hech kimni nomlamadi. TRM hujumni Shimoliy Koreyaning davlat homiyligidagi **TraderTraitor** guruhiga (Lazarus Group / APT38 nomlari bilan ham tanilgan) bogʻladi, Chainalysis ham xuddi shu xulosaga "yuqori ishonch bilan" keldi. Bu — tashqi tahlilchilarning xulosasi, Binance'ning rasmiy tasdigʻi emas.

**Oqibatlar.** Binance depozit va yechishni toʻxtatdi, taʼsirlangan manzilning ruxsatlarini bekor qildi va barcha yoʻqotishni SAFU fondi hamda kompaniya mablagʻlari hisobidan qoplashini aytdi. Tether, Circle, Ripple va World Liberty Financial taxminan **2,67 mlrd dollarlik** stablkoinni muzlatdi, Arbitrum Xavfsizlik Kengashi esa yana ETH va ARB tokenlarini muzlatdi (jami taxminan 2,7 mlrd dollar). Hujumchilar qoʻlida esa muzlatib boʻlmaydigan taxminan 2,4 mlrd dollarlik ETH va BTC qolgan. Binance qoʻshimcha buzilish nuqtalari topilganini ham maʼlum qildi.

**Saboq.** Hujum "yaratuvchi" zaiflikdan emas, bitta ishonchli qurilmadan boshlandi. Shuning uchun ishlab chiquvchi va DevOps noutbuklari ham production tizimlari qatori himoyalanishi kerak: kuchli endpoint himoyasi, minimal ruxsatlar, pul yechish uchun mustaqil tasdiqlash va nostandart yechishlarni darhol aniqlash.

## 2. Linux yadrosi: Claude yozgan root-exploit

**Nima boʻldi.** Linux yadrosining tarmoq qatlamida **CVE-2026-98432** raqamli kritik zaiflik topildi (CVSS **9.8**). Bu IPv4 TCP ulanishi oʻrnatilayotganda IP opsiyalarini qayta ishlashdagi *race condition* sabab yuzaga keladigan **use-after-free** xatosi. Zaiflik yadroning sakkizta tarmogʻiga taʼsir qiladi, eng eskisi **4.4** (2016-yil boshida chiqqan).

**AI qanday ishtirok etdi.** Anthropic'ning hali chiqarilmagan tadqiqot modeli bu zaiflik uchun ishlaydigan masofaviy root-exploit yozdi: xotira sizishidan to root darajasida buyruq bajarishgacha taxminan **53 daqiqa**. Bu AI modellarning zaifliklarni topish va ulardan foydalanish qobiliyatini oʻrganuvchi kengroq tadqiqotning bir qismi edi (u Chrome, Safari, Android, Windows va Linux uchun beshta exploit zanjirini qamragan).

**Muhim aniqlik.** Masofaviy exploit **MPTCP** (Multipath TCP) tinglovchisi yoqilgan serverlarni nishonga oladi. MPTCP odatda oʻzi yoqilmaydi, lekin eBPF va boshqa sozlamalar bilan ilovalarni unga majburlash mumkin. Shuning uchun xavf har bir Linux serveriga bir xil emas.

**Patch holati** (30-oktyabr holatiga): tuzatilgan yadro versiyalari — 5.10.272, 5.15.223, 6.1.190, 6.6.159, 6.12.113, 6.18.56, 7.2.10 va 7.3-rc7. Debian, Oracle Linux, SUSE va Amazon Linux baʼzi relizlar uchun tuzatilgan paketlarni chiqargan. **Ubuntu va Red Hat Enterprise Linux hali tuzatilgan yadro chiqarmagan edi.** Hozirgi holatni oʻz tarqatmangiz yangiliklaridan tekshiring.

**Nima qilish kerak:**

- `uname -r` bilan yadro versiyasini tekshiring.
- Serverlaringizda MPTCP tinglovchilari yoqilganmi yoki yoʻqmi, aniqlang.
- Tarqatmangiz patch chiqarishi bilan darhol yangilang.

## 3. Polymarket: uchinchi tomon skripti

2026-yil 29-oktyabr kuni tadqiqotchilar Polymarket sahifalarida yuklanayotgan JavaScript faylida zararli kod topdi. Fayl **DebugBear** (veb-sayt unumdorligini kuzatuvchi xizmat) bilan bogʻlangan edi. Lekin DebugBear'ning oʻzi buzilgani tasdiqlanmagan; Polymarket faqat "uchinchi tomon provayderi buzilgan" deb xabar berdi va nomini aytmadi. Kod foydalanuvchilarning savdo sessiyalariga taʼsir qilish uchun moʻljallangan edi.

Polymarket savdoni vaqtincha toʻxtatib, birjani faqat bekor qilish (cancel-only) rejimiga oʻtkazdi, taʼsirlangan foydalanuvchilarga zararni toʻliq qoplashini aytdi. Umumiy yoʻqotishlar yozilish paytida tasdiqlanmagan.

**Saboq:** brauzerda ishlaydigan har bir tashqi skript — bu sizning kodingizning bir qismi. Uni **SRI** (Subresource Integrity), qatʼiy **Content-Security-Policy** va zarur boʻlmasa umuman ulamaslik bilan cheklash kerak.

## Umumiy xulosa

Uch voqeaning umumiy tomoni: hujum yuzasi endi faqat "bizning kod" emas. U ishlab chiquvchining noutbugi, tashqi skript va yadro kabi quyi qatlamni ham oʻz ichiga oladi. Shu bilan birga AI hujumchi tomonidan ham, himoyachi tomonidan ham foydalanilmoqda. Kod yozish AI yordamida tezlashdi, xavfsizlik tekshiruvi esa koʻp jamoalarda hanuzgacha qoʻlda va oxirgi bosqichda qolmoqda.

## 11 ta ochiq manbali vosita

Quyidagi roʻyxat Saed postidagi tartibda. Har bir vosita uchun nima qilishini va qayerga qoʻyishni qisqa yozdim.

### 1) Cloudflare Security Audit

[github.com/cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) (MIT litsenziyasi). Kodlash agentingizni xavfsizlik auditoriga aylantiradigan *skill*. U **olti bosqichda** ishlaydi: razvedka (arxitektura va ishonch chegaralari), qamrov asosidagi qidiruv, nomzodlarni tekshirish, tuzilgan natija (`findings.json`), mustaqil tekshiruv va hisobot. Asosiy gʻoya: **topilmani topgan agent emas, boshqa, "yangi" agent tekshiradi**, va u topilmani rad etishga urinadi. Faqat toʻliq manba izi va kuzatilgan natijasi boʻlgan topilma `confirmed` boʻladi, hal boʻlmaganlari esa darajasiz `needs_validation` boʻlib qoladi. Oʻrnatish: `npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit`. Maqsadli kodni ishga tushirish uchun OS darajasidagi sandbox kerak, usiz skill kodni bajarmaydi.

### 2) NVIDIA SkillSpector

[github.com/NVIDIA/skillspector](https://github.com/NVIDIA/skillspector). Agent skill'ini **oʻrnatishdan oldin** tekshiradi (papka, zip, `SKILL.md` yoki Git URL). Statik bosqich xavfli chaqiruvlarni (`exec`, `eval`, `subprocess`), maʼlumot oqimini (muhit oʻzgaruvchilaridan tarmoqqacha), YARA qoidalarini va 64 ta shablonni tekshiradi, bogʻliqliklarni OSV.dev bilan solishtiradi. Ixtiyoriy LLM bosqichi soxta ogohlantirishlarni kamaytiradi. Natija: 0–100 xavf bali (50 dan yuqori — "oʻrnatmang") va SARIF/JSON formatlari CI uchun. Prompt injection, kredensial oʻgʻirlash, xotira zaharlash, typosquatting va yashirin yoʻriqnomalarni (nolinchi kenglikdagi belgilar, HTML izohlari) qidiradi.

### 3) Strix

[github.com/usestrix/strix](https://github.com/usestrix/strix). Oʻz ilovangizni pentest qiladigan va topilganlarni tuzatishga yordam beradigan AI agentlar. **Faqat oʻzingiz egalik qiladigan yoki yozma ruxsat olgan tizimlarda ishlating.**

### 4) Claude Code Security Review

[github.com/anthropics/claude-code-security-review](https://github.com/anthropics/claude-code-security-review). Ikki qismi bor: terminaldagi `/security-review` buyrugʻi (commit'dan oldin, SQL injection, XSS, autentifikatsiya/avtorizatsiya xatolari, notoʻgʻri maʼlumot ishlovi va bogʻliqlik zaifliklarini tekshiradi) va har bir pull request'ni avtomatik koʻrib chiqadigan GitHub Action. Action sozlanadigan qoidalar bilan soxta ogohlantirishlarni filtrlaydi va PR'ga inline izoh yozadi.

### 5) Semgrep

[github.com/semgrep/semgrep](https://github.com/semgrep/semgrep). Statik tahlil: qoidani bir marta yozasiz, xuddi shu xatoni barcha fayllarda topadi. Voqeadan olingan saboqni ("bu xato bizda ham bormi?") butun repozitoriy boʻyicha tekshirish uchun juda qulay.

### 6) Gitleaks

[github.com/gitleaks/gitleaks](https://github.com/gitleaks/gitleaks). Sirlarni (API kalitlari, tokenlar, parollar) commit'ga tushishidan oldin, `pre-commit` hook sifatida, shuningdek git tarixidan topadi.

### 7) TruffleHog

[github.com/trufflesecurity/trufflehog](https://github.com/trufflesecurity/trufflehog). Sizib chiqqan kredensiallarni topadi va **ular hali ham ishlayotganini tekshiradi**. Bu "oʻchirdim" va "bekor qildim" oʻrtasidagi farqni koʻrsatadi: sizib chiqqan sir oʻchirilgani bilan emas, **almashtirilgani** bilan xavfsiz boʻladi.

### 8) OSV-Scanner (Google)

[github.com/google/osv-scanner](https://github.com/google/osv-scanner). Bogʻliqliklaringizni OSV maʼlumotlar bazasidagi maʼlum zaifliklar bilan solishtiradi. Kodingizning katta qismi boshqalarniki, shuning uchun bu — eng arzon himoya qatlamlaridan biri.

### 9) zizmor

[github.com/zizmorcore/zizmor](https://github.com/zizmorcore/zizmor) (MIT). GitHub Actions workflow'larining statik tahlili: shablon inyeksiyasi (hujumchi kodini bajarishga olib kelishi mumkin), kredensiallarning tasodifan saqlanib qolishi, haddan tashqari keng ruxsatlar, soxta commit va chalkash git havolalari. Supply-chain hujumlari koʻpincha aynan CI/CD'dan boshlanadi. Hujjatlar: docs.zizmor.sh.

### 10) Nuclei

[github.com/projectdiscovery/nuclei](https://github.com/projectdiscovery/nuclei). Shablonlar asosida production'da haqiqatda ishlayotgan xizmatlarni maʼlum CVE va notoʻgʻri sozlamalar uchun skanerlaydi. Faqat oʻzingizning tizimlaringizga qarshi ishlating.

### 11) garak (NVIDIA)

[github.com/NVIDIA/garak](https://github.com/NVIDIA/garak). LLM ilovangizga haqiqiy foydalanuvchilardan oldin jailbreak va prompt injection hujumlarini yuboradigan skaner.

## Qayerga qoʻyish kerak: oddiy sxema

Bu — mening taklifim, postdagi emas:

| Bosqich | Vositalar |
|---|---|
| Commit'dan oldin | Gitleaks, `/security-review` |
| Pull request'da | Claude Code Security Review, Semgrep, OSV-Scanner, zizmor |
| Agent skill oʻrnatishdan oldin | SkillSpector |
| Davriy chuqur audit | Cloudflare Security Audit, Strix |
| Production | Nuclei, TruffleHog (sizib chiqqan kredensiallar uchun) |
| LLM ilovalari | garak |

## Cheklovlar

- Bu vositalarning hech biri xavfsizlik muhandisining oʻrnini bosmaydi. Ular ochiq-oydin xatolarni ushlaydi, shunda odamlar murakkab muammolarga vaqt ajrata oladi.
- Har bir skaner soxta ogohlantirishlar beradi. Natijalarni triyaj qilmasdan CI'ni bloklashga qoʻymang.
- Binance voqeasi koʻrsatganidek, bu vositalarning koʻpi kodni tekshiradi, **ishlab chiquvchining qurilmasini emas**. Endpoint himoyasi va ruxsatlar nazorati alohida ish.

## Manbalar

- Asl post: [Saed, LinkedIn](https://www.linkedin.com/in/saedf/)
- Binance: [BleepingComputer](https://bleepingcomputer.com/news/security/binance-links-63-billion-crypto-theft-to-compromised-devops-laptop)
- Linux yadrosi: [CSO Online](https://www.csoonline.com/article/4242724/anthropic-ai-model-finds-linux-kernel-bug-that-leads-to-remote-root-access.html)
- Polymarket: [RuntimeWire](https://runtimewire.com/article/polymarket-debugbear-script-incident-october-2026)
- SkillSpector: [Help Net Security](https://www.helpnetsecurity.com/2026/08/03/skillspector-open-source-agent-skill-security-scanner/)
- Claude Code Security Review: [Anthropic maqolasi](https://claude.com/resources/articles/automate-security-reviews-with-claude-code)
