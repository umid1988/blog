---
title: "Advanced Active Directory Attacks: red va purple team qoʻllanmasi"
description: "Zamonaviy domen muhitida AD hujumlari — har bir texnikaning mexanizmi, u loglarda qanday iz qoldirishi (detection) va unga qarshi himoya. 2026 holatiga moslangan."
date: 2026-10-25
tags: [active-directory, red-team, purple-team, kerberos, ad-cs, uzbek]
lang: uz
---

Professional red team ishini script-kiddie copy-pasteʼdan ajratadigan narsa buyruqlar emas, balki **metodologiya, OPSEC va natijani blue team tilida tushuntira olish**. Ushbu qoʻllanma AD hujumlarini aynan shu uch oʻlchovda beradi: har bir texnikaning **ishlash mexanizmi**, u **loglarda qanday iz qoldirishi** (detection) va unga qarshi **himoya choralari**.

<div class="callout callout--danger"><span class="callout__h">Huquqiy chegara</span>
Bu material faqat <strong>yozma ruxsat (authorization)</strong> boʻlgan tizimlarda — oʻz laboratoriyangizda yoki kelishilgan scope ichida qoʻllaniladi. Ruxsatsiz tarmoqqa kirish koʻpchilik yurisdiksiyalarda jinoiy javobgarlikka tortiladi (masalan, Oʻzbekiston JK 278-modda, Kanada Criminal Code s.342.1, AQSh CFAA). Har bir engagement RoE, scope va deconfliction kontakti bilan boshlanadi.</div>

## Metodologiya: engagement hayotiy sikli

Har qanday avtorizatsiyalangan hujum quyidagi bosqichlardan oʻtadi. Razvedka (enumeration) — bu bir martalik emas, balki har bir yangi kirish huquqidan keyin qaytariladigan uzluksiz jarayon.

<figure class="diagram">
<svg viewBox="0 0 760 96" role="img" aria-label="Engagement hayotiy sikli: scope, razvedka, dastlabki kirish, huquq oshirish, ustunlik, hisobot">
<defs><marker id="ah1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="d-arrow"/></marker></defs>
<g font-size="12" font-weight="600" text-anchor="middle">
<rect class="d-box" x="2" y="30" width="104" height="36" rx="3"/><text x="54" y="45">Scope &amp; RoE</text><text class="d-label" x="54" y="58">Yozma ruxsat</text>
<rect class="d-box" x="132" y="30" width="104" height="36" rx="3"/><text x="184" y="45">Razvedka</text><text class="d-label" x="184" y="58">Enumeration</text>
<rect class="d-box" x="262" y="30" width="104" height="36" rx="3"/><text x="314" y="45">Dastlabki kirish</text><text class="d-label" x="314" y="58">Foothold</text>
<rect class="d-box" x="392" y="30" width="118" height="36" rx="3"/><text x="451" y="44">Huquq oshirish &amp;</text><text x="451" y="57">harakatlanish</text>
<rect class="d-box" x="536" y="30" width="104" height="36" rx="3"/><text x="588" y="45">Ustunlik</text><text class="d-label" x="588" y="58">Dominance</text>
<rect class="d-box d-box--ext" x="666" y="30" width="92" height="36" rx="3"/><text x="712" y="45">Hisobot</text><text class="d-label" x="712" y="58">Report</text>
<g class="d-line" marker-end="url(#ah1)">
<line x1="106" y1="48" x2="130" y2="48"/><line x1="236" y1="48" x2="260" y2="48"/><line x1="366" y1="48" x2="390" y2="48"/><line x1="510" y1="48" x2="534" y2="48"/><line x1="640" y1="48" x2="664" y2="48"/>
</g>
<path d="M451,30 C451,10 184,10 184,28" fill="none" stroke-dasharray="4 3" class="d-line" marker-end="url(#ah1)" style="stroke:var(--redline)"/>
<text class="d-alert" x="317" y="13" text-anchor="middle">har kirishdan keyin qayta razvedka</text>
</g>
</svg>
<figcaption>Engagement hayotiy sikli. Razvedka har bir yangi huquqdan keyin takrorlanadi.</figcaption>
</figure>

### OPSEC — nega koʻp "klassik" texnikalar endi tutiladi

Eng koʻp xato — eski qoʻllanmalardagi "shovqinli" usullarni koʻr-koʻrona takrorlash. Zamonaviy EDR, AMSI, ETW va Microsoft Defender for Identity (MDI) quyidagilarni deyarli bir zumda ushlaydi: diskka tushgan Mimikatz, standart Metasploit payloadlari, `DCSync`'ni ishchi stansiyadan ishga tushirish, bitta akkaunt bilan koʻplab SPN soʻrash. Shuning uchun har bir texnika yonida **u qanday aniqlanishi** koʻrsatilgan — bu ham blue team, ham red teamʼning OPSEC rejasi uchun kerak.

## 1. Zamonaviy muhit: 2026-yilda nima oʻzgardi

Bu qoʻllanmaning eng qimmatli boʻlimi. 2025–2026-yillarda Microsoft bir qancha standart sozlamalarni oʻzgartirdi va bu klassik AD hujumlarining kataga qismini ishdan chiqaradi. Buni bilmagan tester vaqtini behuda sarflaydi va topilmalarini notoʻgʻri baholaydi.

| Oʻzgarish | Qachon / qayerda | Red team uchun maʼnosi |
| --- | --- | --- |
| **NTLMv1 olib tashlandi** | Windows 11 24H2, Server 2025 | NTLMv1ʼga tayangan eski relay/downgrade stsenariylari yangi tizimlarda ishlamaydi. Net-NTLMv2 esa qoladi. |
| **SMB imzolash majburiy** (chiquvchi) | Win 11 24H2, Server 2025 (default) | SMB relay hujumlari imzolash yoqilgan nishonlarga oʻtmaydi. Avval imzolash *oʻchiq* xostlarni topish kerak. |
| **LDAP imzolash + channel binding** | Server 2025 yangi deployment (default) | LDAP/LDAPS relay yangi domenlarda ancha qiyinlashadi. |
| **Sertifikat mapping — Full Enforcement** | 2025-fev default; 2025-sen compat rejim olib tashlandi | AD CS sertifikati endi SID kengaytmasi yoki kuchli mapping talab qiladi. |
| **RC4 Kerberos oʻchirilmoqda** | 2026-yan audit → apr AES default → iyul enforcement | RC4ʼga tayangan Kerberoasting va Golden/Silver ticket susayadi; AESʼga oʻtish shart. |

<div class="callout callout--info"><span class="callout__h">Amaliy xulosa</span>
Birinchi qadam — nishon muhitning <strong>yoshini aniqlash</strong>. Agar domen Server 2025 va Windows 11 24H2 ustiga yangidan qurilgan boʻlsa, siz "qattiq" muhitdasiz: relay va NTLM yoʻllari torayadi, asosiy eʼtibor Kerberos, AD CS, delegatsiya va ACL suiisteʼmoliga oʻtadi. Eski (Server 2016/2019, Win 10) muhitlar esa hamon klassik texnikalarga ochiq.</div>

Muhit yoshini razvedka bosqichida aniqlang — bu keyingi barcha qarorlarni belgilaydi:

```bash
# OS versiyalarini SMB orqali ko'rish (nmap yoki NetExec):
nxc smb 10.0.0.0/24            # har bir xost OS build raqamini ko'rsatadi
# SMB imzolash O'CHIQ xostlar ro'yxati (relay nishonlari shu yerda tanlanadi):
nxc smb 10.0.0.0/24 --gen-relay-list targets.txt
```

<div class="callout callout--warn"><span class="callout__h">Esda tuting: NTLM atamalari</span>
<strong>NT-xesh</strong> — SAM/NTDSʼda saqlanadigan parol xeshi (Pass-the-Hash shu bilan ishlaydi). <strong>Net-NTLMv2</strong> — tarmoq autentifikatsiyasida yuboriladigan javob (relay yoki offline crack qilinadi, PtH uchun yaramaydi). Eski qoʻllanmalar bularni "NTLMv1/v2 xesh" deb chalkashtiradi — bu jiddiy xato.</div>

## 2. Razvedka va hujum yoʻllari

Maqsad — domen ichidagi **eng qisqa huquq oshirish yoʻlini** grafik koʻrinishda aniqlash. Zamonaviy standart — BloodHound Community Edition (CE), u ACL, sessiyalar, delegatsiya va AD CS maʼlumotlarini bitta grafga jamlaydi.

| Yigʻuvchi vosita | Qayerda ishlaydi | Izoh |
| --- | --- | --- |
| `SharpHound CE` | Windows (domen ichidan) | Rasmiy .NET yigʻuvchi; eng toʻliq maʼlumot. |
| `bloodhound-ce-python` | Linux (masofadan) | Hisob maʼlumoti bilan masofadan yigʻish. |
| `RustHound-CE` | Linux/Windows | Tez, kam iz qoldiradigan muqobil. |

```bash
# Linuxdan masofadan yig'ish (foydalanuvchi hisobi bilan):
bloodhound-python -d corp.local -u analyst -p '***' -ns 10.0.0.10 -c All --zip
# Natijadagi .zip BloodHound CE GUI'ga yuklanadi va grafik tahlil qilinadi.
```

Grafda nimani qidirish kerak:

- **Kerberoastable** foydalanuvchilar (SPN biriktirilgan hisoblar) va ularning parol yoshi.
- **ACL yoʻllari**: `GenericAll`, `WriteDACL`, `GenericWrite`, `AddKeyCredentialLink` — koʻpincha eng tinch huquq oshirish yoʻli shu.
- **Delegatsiya**: unconstrained/constrained/RBCD bilan sozlangan hisoblar.
- **AD CS**: zaif sertifikat shablonlari (ESC yoʻllari grafda koʻrsatiladi).
- **Sessiyalar**: imtiyozli foydalanuvchi qaysi xostda faol — lateral movement rejasini shu belgilaydi.

<div class="dd">
<div class="dd__det"><b>Aniqlash:</b> SharpHound ommaviy LDAP soʻrovlari qisqa vaqtda koʻp obyektni soʻraydi — MDI "Reconnaissance" ogohlantirishlari va gʻayrioddiy LDAP hajmi. SMB sessiya enumeration (<code>4624</code> turi 3) ham iz qoldiradi.</div>
<div class="dd__def"><b>Himoya:</b> MDI/Defender for Identityʼni yoqing; imtiyozli hisoblar uchun authentication silo va tiering; keraksiz <code>GenericAll</code>/<code>WriteDACL</code> ACLʼlarini muntazam audit qiling (BloodHoundʼni <i>oʻzingizga qarshi</i> ishlating).</div>
</div>

## 3. Kerberosʼga qarshi hujumlar

Kerberos autentifikatsiyasida baʼzi javoblar foydalanuvchi parolidan olingan kalit bilan shifrlanadi. Agar bu shifrlash kuchsiz (RC4) boʻlsa, javobni offline tarzda buzish mumkin.

<figure class="diagram">
<svg viewBox="0 0 740 132" role="img" aria-label="Kerberos autentifikatsiya oqimi: mijoz, KDC va xizmat oʻrtasida TGT va TGS almashinuvi">
<defs><marker id="ah2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="d-arrow"/></marker></defs>
<g font-size="11.5" font-weight="600">
<rect class="d-box" x="10" y="52" width="130" height="40" rx="3"/><text x="75" y="70" text-anchor="middle">Mijoz (Client)</text><text class="d-label" x="75" y="84" text-anchor="middle">Domen foydalanuvchi</text>
<rect class="d-box d-box--ext" x="305" y="8" width="130" height="40" rx="3"/><text x="370" y="26" text-anchor="middle">KDC (DC)</text><text class="d-label" x="370" y="40" text-anchor="middle">AS + TGS</text>
<rect class="d-box" x="600" y="52" width="130" height="40" rx="3"/><text x="665" y="70" text-anchor="middle">Xizmat (SPN)</text><text class="d-label" x="665" y="84" text-anchor="middle">masalan MSSQL</text>
<g class="d-line" marker-end="url(#ah2)">
<line x1="130" y1="58" x2="305" y2="34"/><line x1="305" y1="44" x2="135" y2="66"/><line x1="140" y1="76" x2="305" y2="46"/><line x1="140" y1="86" x2="598" y2="78"/>
</g>
<text class="d-label" x="150" y="38">1. AS-REQ → ← 2. TGT</text>
<text class="d-label" x="150" y="104">3. TGS-REQ (SPN uchun) →</text>
<text class="d-alert" x="150" y="118">4. ← TGS (xizmat kaliti bilan shifrlangan)</text>
</g>
</svg>
<figcaption>Kerberoasting 4-qadamga qaratilgan: istalgan domen foydalanuvchi SPN uchun TGS soʻray oladi, javob esa xizmat hisobining paroli kalitida shifrlangan.</figcaption>
</figure>

<div class="tech-card">
<div class="tech-card__head"><span class="tech-card__name">Kerberoasting</span><span class="tech-card__att">ATT&CK T1558.003</span></div>

**Mexanizm:** SPN biriktirilgan har qanday hisob uchun domen foydalanuvchisi TGS-REP soʻray oladi. Javob xizmat hisobining parol kalitida shifrlangan — agar hisob RC4 (etype 23) qoʻllasa va paroli kuchsiz boʻlsa, offline buziladi. Server hisoblari (SQL, IIS) koʻpincha kuchsiz, eski parollarga ega.

```bash
# SPN'larni so'rash (Impacket). Iloji boricha bittadan, AES'ni afzal ko'rib:
GetUserSPNs.py corp.local/analyst:'***' -dc-ip 10.0.0.10 -request
# Offline buzish o'z mashinangizda (nishonda emas):
hashcat -m 13100 roast.txt wordlist.txt   # 13100 = TGS-REP (RC4)
```

<div class="dd">
<div class="dd__det"><b>Aniqlash:</b> Event <code>4769</code> (TGS soʻrovi) — ayniqsa Ticket Encryption Type <code>0x17</code> (RC4) va bitta hisobdan koʻp SPN uchun soʻrov. Honeypot SPN hisobi (hech qachon ishlatilmaydigan) — eng aniq signal.</div>
<div class="dd__def"><b>Himoya:</b> xizmat hisoblari uchun <b>gMSA</b> (avtomatik 120+ belgili parol); RC4ʼni oʻchirish (AES majburiy); muhim SPN’larni audit qilish; honeypot SPN qoʻyish.</div>
</div>
</div>

<div class="tech-card">
<div class="tech-card__head"><span class="tech-card__name">AS-REP Roasting</span><span class="tech-card__att">ATT&CK T1558.004</span></div>

**Mexanizm:** agar hisobda "Do not require Kerberos preauthentication" yoqilgan boʻlsa, hujumchi parolsiz AS-REP oladi va uni offline buzadi. Bu eski ilovalar uchun qoldirilgan notoʻgʻri sozlama.

```bash
GetNPUsers.py corp.local/ -dc-ip 10.0.0.10 -usersfile users.txt -no-pass
hashcat -m 18200 asrep.txt wordlist.txt   # 18200 = AS-REP (RC4)
```

<div class="dd">
<div class="dd__det"><b>Aniqlash:</b> Event <code>4768</code> (TGT soʻrovi) preauth <i>talab qilinmagan</i> hisoblar uchun; <code>DONT_REQ_PREAUTH</code> bayrogʻi bilan hisoblar inventarizatsiyasi.</div>
<div class="dd__def"><b>Himoya:</b> barcha hisoblarda preauthʼni yoqing; <code>DONT_REQ_PREAUTH</code> bayrogʻini muntazam audit qiling; kuchli parol siyosati.</div>
</div>
</div>

<div class="callout callout--warn"><span class="callout__h">2026 taʼsiri</span>
RC4 oʻchirila boshlagach (2026-apr dan AES default), <code>-m 13100</code>/<code>18200</code> RC4 variantlari kamayadi. AES (etype 17/18) javoblarni ham soʻrash mumkin, lekin ularni buzish ancha qiyin — himoya kuchayadi, lekin kuchsiz parollar baribir zaif nuqta boʻlib qoladi.</div>

## 4. AD CS hujumlari (ESC seriyasi)

Active Directory Certificate Services (AD CS) notoʻgʻri sozlanganda, oddiy foydalanuvchi oʻziga istalgan shaxs (jumladan domen admini) nomidan sertifikat chiqarib olishi mumkin. Bu soʻnggi yillarda eng taʼsirli AD huquq oshirish yoʻnalishiga aylandi.

| Belgi | Zaiflik (mohiyati) |
| --- | --- |
| `ESC1` | Shablon enrolleeʼga SAN belgilash huquqini beradi → istalgan foydalanuvchi nomidan sertifikat. |
| `ESC2 / ESC3` | Juda keng maqsadli (Any Purpose) yoki enrollment agent sertifikatlari. |
| `ESC4` | Shablon obyektiga yozish huquqi (ACL) → uni oʻzgartirib ESC1 qilish. |
| `ESC6` | CA `EDITF_ATTRIBUTESUBJECTALTNAME2` bayrogʻi → istalgan SAN. |
| `ESC8 / ESC11` | CA web (HTTP) yoki RPC enrollmentʼga NTLM relay. |
| `ESC9 / ESC10` | Zaif sertifikat mapping (SID yoʻq yoki weak mapping). |
| `ESC13–ESC16` | Issuance policyʼga bogʻlangan guruhlar, CA sozlamalari va boshqa yangi yoʻllar. |

Zamonaviy standart vosita — **Certipy v5**. Zaifliklarni avtomatik xaritalaydi:

```bash
certipy find -u analyst@corp.local -p '***' -dc-ip 10.0.0.10 -vulnerable -stdout
# Natija: har bir shablon va unda topilgan ESC belgisi.
```

Namuna sifatida ESC1 oqimi (konseptual): zaif shablon topilsa, hujumchi SANʼga imtiyozli foydalanuvchi nomini qoʻyib sertifikat soʻraydi, soʻngra u bilan autentifikatsiyadan oʻtadi:

```bash
# 1. Sertifikat so'rash, SAN'da nishon UPN va (2025+ uchun) SID:
certipy req -u analyst@corp.local -p '***' -ca CORP-CA -template VulnTemplate \
      -upn administrator@corp.local -sid <admin-SID> -target ca.corp.local
# 2. Olingan .pfx bilan autentifikatsiya (NT-xesh yoki TGT olinadi):
certipy auth -pfx administrator.pfx -dc-ip 10.0.0.10
```

<div class="callout callout--warn"><span class="callout__h">2026 taʼsiri — bu muhim</span>
Sertifikat mapping <b>Full Enforcement</b> (2025-senʼdan compat rejim yoʻq) tufayli sertifikat endi hisobga <b>kuchli bogʻlangan</b> boʻlishi shart: SANʼda SID kengaytmasi yoki <code>altSecurityIdentities</code> orqali kuchli mapping. Shuning uchun yuqoridagi <code>-sid</code> parametri endi zarur; eski (SIDʼsiz) ESC1 namunalari yangi DC’larda rad etiladi.</div>

<div class="dd">
<div class="dd__det"><b>Aniqlash:</b> Event <code>4886</code>/<code>4887</code> (sertifikat soʻrovi/berilishi) — ayniqsa SAN oddiy foydalanuvchidan farq qilganda; <code>4768</code> sertifikat bilan TGT olinganda (PKINIT).</div>
<div class="dd__def"><b>Himoya:</b> shablonlarda <code>ENROLLEE_SUPPLIES_SUBJECT</code>'ni oʻchirish; enrollment huquqlarini cheklash; CA web enrollmentʼni oʻchirish yoki EPA/HTTPS majburlash; <code>certipy find</code>'ni muntazam oʻzingizga qarshi ishlatish.</div>
</div>

## 5. Delegatsiya suiisteʼmoli

Delegatsiya — xizmatga foydalanuvchi nomidan boshqa xizmatga murojaat qilish imkonini beradi. Notoʻgʻri sozlanganda, bu imtiyozni oʻzlashtirishga olib keladi.

| Turi | Xavf |
| --- | --- |
| **Unconstrained** | Xost barcha kelgan foydalanuvchilarning TGTʼsini xotirada saqlaydi. Imtiyozli hisob (yoki DC) shu xostga autentifikatsiya qilsa (koʻpincha coercion bilan majburlanadi), uning TGTʼsi oʻzlashtiriladi. |
| **Constrained (S4U)** | Hisob maʼlum SPN’larga delegatsiya qila oladi; `S4U2Self`+`S4U2Proxy` orqali baʼzan istalgan foydalanuvchi nomidan ticket olinadi. |
| **RBCD** (resource-based) | Nishon kompyuter obyektiga yozish huquqingiz boʻlsa (`msDS-AllowedToActOnBehalfOfOtherIdentity`), siz boshqaradigan hisobni unga delegatsiya qilib, oʻsha xostda imtiyozli ticket olasiz. |

**RBCD mexanizmi (eng koʻp uchraydigani):** koʻpincha ACL yoʻli orqali kompyuter obyektiga `GenericWrite` topiladi. Hujumchi oʻzi boshqaradigan hisob uchun RBCD atributini sozlaydi va S4U orqali nishon xostda `CIFS`/`HOST` ticket oladi.

<div class="dd">
<div class="dd__det"><b>Aniqlash:</b> <code>5136</code> (obyekt atributi oʻzgardi) — <code>msDS-AllowedToActOnBehalfOfOtherIdentity</code> yozilganda; yangi kompyuter obyekti (<code>4741</code>); S4U ticketʼlarda gʻayrioddiy <code>4769</code> naqshlari.</div>
<div class="dd__def"><b>Himoya:</b> <code>MachineAccountQuota</code>'ni 0 ga tushiring; kompyuter obyektlariga ACLʼni audit qiling; imtiyozli hisoblarni Protected Users guruhiga va "sensitive, cannot be delegated" bayrogʻi bilan belgilang; unconstrained delegatsiyani faqat zarur DC’larda qoldiring.</div>
</div>

<div class="callout callout--info"><span class="callout__h">Nega bu grafda muhim</span>
BloodHound CE delegatsiya va ACL yoʻllarini bitta grafda birlashtiradi: koʻpincha "oddiy foydalanuvchi → kompyuterga GenericWrite → RBCD → xostda SYSTEM" zanjiri eng tinch va ishonchli huquq oshirish yoʻli boʻlib chiqadi, Kerberoasting yoki relayʼdan koʻra.</div>

## 6. Majburlash (coercion) va NTLM relay

Koʻp hujumlar imtiyozli mashinani **hujumchiga autentifikatsiya qilishga majburlashdan** boshlanadi (coercion), soʻngra bu autentifikatsiya boshqa xizmatga uzatiladi (relay). 2026 muhitida bu yoʻl torayadi, lekin butunlay yopilmaydi.

<figure class="diagram">
<svg viewBox="0 0 740 118" role="img" aria-label="Coercion va relay oqimi: nishon majburlanadi, autentifikatsiya zaif xizmatga uzatiladi">
<defs><marker id="ah3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="d-arrow"/></marker></defs>
<g font-size="11" font-weight="600" text-anchor="middle">
<rect class="d-box" x="10" y="44" width="124" height="40" rx="3"/><text x="72" y="61">Hujumchi</text><text class="d-label" x="72" y="76">relay listener</text>
<rect class="d-box" x="300" y="6" width="140" height="40" rx="3" style="stroke:var(--redline)"/><text x="370" y="23">Nishon (DC/host)</text><text x="370" y="38" style="fill:var(--redline)" font-size="9.5">majburlanadi</text>
<rect class="d-box d-box--ext" x="606" y="44" width="124" height="40" rx="3"/><text x="668" y="61">Zaif xizmat</text><text class="d-label" x="668" y="76">AD CS / LDAP</text>
<g class="d-line" marker-end="url(#ah3)">
<line x1="134" y1="54" x2="300" y2="28"/><line x1="300" y1="38" x2="139" y2="62"/><line x1="139" y1="70" x2="604" y2="64"/>
</g>
<text class="d-label" x="205" y="34">1. coercion soʻrovi →</text>
<text class="d-alert" x="215" y="94">2. ← majburiy auth (Net-NTLMv2)</text>
<text class="d-label" x="380" y="56">3. authʼni zaif xizmatga uzatish →</text>
</g>
</svg>
<figcaption>Coercion + relay: DC majburiy autentifikatsiyasi AD CS web enrollmentʼga uzatiladi va undan DC nomidan sertifikat olinadi.</figcaption>
</figure>

**Coercion** uchun bir qancha maʼlum MS-RPC yoʻllari bor (PetitPotam-sinf, PrinterBug va b.). **Relay** nishoni koʻpincha AD CS web enrollment (ESC8) boʻladi — chunki DC’ning majburiy autentifikatsiyasini sertifikatga almashtirib, undan DC nomidan ticket olinadi.

```bash
# Relay listener (ntlmrelayx) — nishon: AD CS web enrollment (ESC8):
ntlmrelayx.py -t http://ca.corp.local/certsrv/certfnsh.asp -smb2support \
      --adcs --template DomainController
# Alohida terminalda DC coercion vositasi orqali majburlanadi. Natijada DC sertifikati olinadi.
```

<div class="callout callout--warn"><span class="callout__h">2026 taʼsiri</span>
LDAP imzolash + channel binding (Server 2025 default) LDAPʼga relayʼni ancha qiyinlashtiradi. SMB relay esa imzolash majburligi tufayli yangi xostlarga oʻtmaydi. Shuning uchun <b>AD CS (HTTP)</b> hamon eng barqaror relay nishoni boʻlib qoladi — agar CA web enrollment EPA/HTTPS bilan himoyalanmagan boʻlsa.</div>

<div class="dd">
<div class="dd__det"><b>Aniqlash:</b> DC’dan gʻayrioddiy chiquvchi SMB/HTTP autentifikatsiya; <code>4624</code> (NTLM, turi 3) kutilmagan manbadan; AD CSʼda <code>4886</code> DomainController shabloni boʻyicha; MDI "NTLM relay".</div>
<div class="dd__def"><b>Himoya:</b> CA web enrollmentʼni oʻchirish yoki <b>EPA + HTTPS</b> majburlash; SMB/LDAP imzolash va channel bindingʻni enforcementʼga; keraksiz coercion RPC yoʻllarini blokirovka; DC’lardan chiquvchi authʼni cheklash.</div>
</div>

## 7. Domen ustunligi va barqarorlik

Domen admin huquqiga erishgach, red team maqsadi — buni hisobotda isbotlash va blue teamʼning aniqlash qobiliyatini sinash, barqaror backdoor qoldirish emas. Shu sababli bu boʻlimda texnikalar **konseptual darajada** va asosiy eʼtibor aniqlashga qaratilgan.

<div class="tech-card">
<div class="tech-card__head"><span class="tech-card__name">DCSync</span><span class="tech-card__att">ATT&CK T1003.006</span></div>

**Mexanizm:** replikatsiya huquqiga ega hisob (odatda DA yoki `DS-Replication-Get-Changes-All` ACLʼi boʻlgan) DC’dan istalgan hisobning parol materialini (jumladan `krbtgt`) replikatsiya protokoli orqali soʻraydi — DC’ga kirmasdan. Bu "replikatsiya" sifatida koʻrinadi.

<div class="dd">
<div class="dd__det"><b>Aniqlash:</b> Event <code>4662</code> — replikatsiya GUIDʼlari (<code>DS-Replication-Get-Changes</code>) <i>DC boʻlmagan</i> manbadan soʻralganda. Bu eng ishonchli DCSync signali; MDI buni toʻgʻridan-toʻgʻri ushlaydi.</div>
<div class="dd__def"><b>Himoya:</b> replikatsiya ACLʼlarini faqat DC’larga cheklash va audit qilish; MDI; <code>krbtgt</code> parolini muntazam (ikki marta) aylantirish.</div>
</div>
</div>

<div class="tech-card">
<div class="tech-card__head"><span class="tech-card__name">Golden / Silver Ticket</span><span class="tech-card__att">T1558.001 / T1558.002</span></div>

**Mexanizm:** `krbtgt` kaliti qoʻlga kirsa — soxta TGT (Golden); muayyan xizmat hisobi kaliti qoʻlga kirsa — soxta TGS (Silver). Ikkalasi ham KDCʼni chetlab oʻtadi. Bu *barqarorlik* texnikasi, shuning uchun engagementʼda faqat isbot va aniqlash sinovi uchun, RoE doirasida qoʻllaniladi.

<div class="dd">
<div class="dd__det"><b>Aniqlash:</b> gʻayrioddiy ticket amal qilish muddati; <code>4769</code> oldidan <code>4768</code> boʻlmasligi; etype nomuvofiqligi (RC4 ticket AES muhitida); MDI "Golden Ticket" analitikasi.</div>
<div class="dd__def"><b>Himoya:</b> <code>krbtgt</code> ni muntazam rotatsiya; tiering va Protected Users; MDI; ticket umrini (max lifetime) cheklash.</div>
</div>
</div>

<div class="callout callout--danger"><span class="callout__h">Barqarorlik va tozalash</span>
Persistence (Golden ticket, Skeleton key, DCSync backdoor va b.) real engagementʼda faqat RoE aniq ruxsat bergandagina qoʻyiladi va <strong>test oxirida albatta olib tashlanadi</strong>. Qoldirilgan backdoor boshqa haqiqiy tajovuzkorga eshik ochib qoʻyishi mumkin — bu professional javobgarlik masalasi.</div>

## 8. Aniqlash matritsasi

Purple team qiymati shu jadvalda: har bir texnika blue team tomonidan qaysi signal orqali koʻrinadi. Red team OPSEC rejasini, blue team esa monitoring qoidalarini shundan quradi.

| Texnika | ATT&CK | Asosiy signal(lar) |
| --- | --- | --- |
| Razvedka (BloodHound) | T1087, T1069 | MDI Reconnaissance; ommaviy LDAP; SMB sessiya (`4624` t.3) |
| Kerberoasting | T1558.003 | `4769` — RC4 (0x17), bitta hisobdan koʻp SPN; honeypot SPN |
| AS-REP roasting | T1558.004 | `4768` preauth talab qilinmagan hisoblar uchun |
| AD CS (ESC) | T1649 | `4886`/`4887` gʻayritabiiy SAN; `4768` PKINIT |
| RBCD / delegatsiya | T1134.005 | `5136` (`msDS-AllowedToActOnBehalf...`); `4741` yangi kompyuter |
| Shadow credentials | T1556 | `5136` — `msDS-KeyCredentialLink` yozilishi |
| Coercion + relay | T1557 | DC’dan kutilmagan chiquvchi auth; `4624` NTLM t.3; MDI relay |
| DCSync | T1003.006 | `4662` — replikatsiya GUIDʼi DC boʻlmagan manbadan |
| Golden/Silver ticket | T1558.001/.002 | Ticket umri/etype anomaliyasi; `4769` oldidan `4768` yoʻq |
| Pass-the-Hash | T1550.002 | `4624` LogonType 9 / NTLM; imtiyozli hisob gʻayrioddiy xostda |

<div class="callout callout--info"><span class="callout__h">Monitoring uchun minimal poydevor</span>
Koʻp tashkilotlar bu hodisalarni yigʻmaydi ham. Eng kam zarur qadamlar: DC’larda audit siyosatini kengaytirish (Kerberos, DS Access, Account Logon), Sysmon oʻrnatish, loglarni markazlashtirish (SIEM), va iloji boʻlsa Microsoft Defender for Identity. Keyin yuqoridagi jadval asosida detektsiya qoidalari tuziladi.</div>

## 9. Himoya checklist (hardening)

Red team topilmalarining qiymati — ularni tuzatib boʻlishida. Quyida taʼsir boʻyicha tartiblangan himoya choralari.

**Birinchi darajali (eng katta taʼsir):**

- **Administrativ tiering (Tier 0/1/2):** DA hisoblari faqat DC’larga kirsin; ish stansiyalarida imtiyozli hisob ishlatilmasin.
- **LAPS:** har bir mashinada noyob, aylanadigan mahalliy admin paroli — mahalliy admin xeshi bilan lateral movementʼni toʻxtatadi.
- **gMSA xizmat hisoblari uchun:** 120+ belgili avtomatik parol — Kerberoastingʻni amalda foydasiz qiladi.
- **Protected Users guruhi** va "sensitive, cannot be delegated" bayrogʻi imtiyozli hisoblarga.
- **MachineAccountQuota = 0:** oddiy foydalanuvchi kompyuter obyekti qoʻsha olmasin (RBCD va shadow credentials yoʻllarini yopadi).

**2026 muhitiga mos qattiqlashtirish:**

- **RC4ʼni oʻchirish, AES majburlash** — Microsoft baribir 2026-iyulgacha enforcementʼga oʻtkazadi, oldindan oʻting.
- **SMB va LDAP imzolash + channel binding** enforcementʼga; eski muhitlarda ham qoʻlda yoqing.
- **Sertifikat mapping Full Enforcement**ni tasdiqlang; AD CS shablonlarini `certipy find` bilan audit qiling.
- **NTLMʼni bosqichma-bosqich kamaytirish:** Negotiateʼga oʻtish, NTLM audit, imkon qadar Kerberos-only.

**Doimiy jarayon:**

- BloodHound CEʼni **oʻzingizga qarshi** muntazam ishlating — hujumchidan oldin yoʻllarni toping.
- ACL (`GenericAll`, `WriteDACL`, `AddKeyCredentialLink`) va delegatsiya sozlamalarini davriy audit qiling.
- `krbtgt` parolini jadval asosida (ikki marta) aylantiring.

## 10. Laboratoriya, mashqlar va manbalar

Barcha texnikalar faqat oʻz laboratoriyangizda yoki ruxsat etilgan scopeʼda sinaladi. Minimal professional lab:

- **Hujumchi:** yangi Kali Linux, oʻrnatilgan: NetExec, Impacket, Certipy v5, BloodHound CE + yigʻuvchilar, mitm6/ntlmrelayx.
- **Nishon:** ikki muhit — (1) *eski*: Server 2019 DC + Windows 10, klassik texnikalarni koʻrish uchun; (2) *yangi*: Server 2025 DC + Windows 11 24H2, 2026 himoyalarining taʼsirini koʻrish uchun.
- **Blue team qatlami:** Sysmon + loglarni yigʻish, iloji boʻlsa MDI sinov litsenziyasi — har bir hujumni loglarda koʻrish uchun. Bu purple team mashgʻulotining mohiyati.
- Tayyor zaif labʼlar: GOAD (Game of Active Directory), DetectionLab.

**Mashqlar:**

1. Kerberoastingʻni *eski* muhitda bajaring va `4769` hodisasini loglarda toping. Soʻng gMSA oʻrnatib, hujumni qaytaring — farqni yozib oling.
2. `certipy find -vulnerable` ni ishlating, bitta ESC yoʻlini konseptual tuzating, soʻng Full Enforcement taʼsirini *yangi* muhitda tekshiring.
3. RBCD yoʻlini BloodHound grafida toping va `5136` detektsiya qoidasini yozing.
4. Har bir hujum uchun bitta sahifali "finding" yozing: taʼsir, isbot, tavsiya — xuddi haqiqiy hisobotdagidek.

**Rasmiy manbalar:**

- [MITRE ATT&CK — Enterprise matritsasi](https://attack.mitre.org/)
- [BloodHound Community Edition hujjatlari](https://bloodhound.specterops.io/)
- [Certipy (ly4k) wiki — buyruqlar maʼlumotnomasi](https://github.com/ly4k/Certipy/wiki)
- [The Hacker Recipes — AD texnikalari](https://www.thehacker.recipes/)
- [Microsoft KB5014754 — sertifikat mapping enforcement](https://support.microsoft.com/kb/5014754)
- [Microsoft — SMB/LDAP signing defaults (Server 2025)](https://learn.microsoft.com/en-us/windows-server/storage/file-server/smb-feature-descriptions)

<div class="callout callout--info"><span class="callout__h">Eslatma</span>
Ushbu material mustaqil ravishda yozilgan oʻquv qoʻllanmasidir va hech bir kitobning tarjimasi yoki qayta nashri emas. Faqat avtorizatsiyalangan, qonuniy foydalanish uchun. PDF versiyasi ham mavjud — soʻrang.</div>
