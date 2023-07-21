## WBOT (neoxr-bot v4.0-rc)

> Script ini adalah impelementasi dari module [@neoxr/wb](https://www.npmjs.com/package/@neoxr/wb) sekaligus base terbaru dari neoxr-bot yang sudah di optimasi menjadi lightweigth.

### Requirements

- [x] NodeJS v14
- [x] FFMPEG
- [x] Server vCPU/RAM 1/2GB (Min)

### Konfigurasi

Terdapat 2 file konfigurasi yaitu ```.env``` dan ```config.json```, sesuaikan terlebih dahulu sebelum melakukan instalasi.

```Javascript
{
   "owner": "6285887776722",
   "owner_name": "Wildan Izzudin"
   "database": "data",
   "limit": 25,
   "ram_usage": 900000000, // <-- 900mb in bytes
   "max_upload": 60, // <-- 60mb
   "max_upload_free": 7, // <-- 7mb
   "cooldown": 5, // <-- 5 seconds
   "timer": 1800000, // <-- 30 mins in ms
   "blocks": ["1", "994"],
   "evaluate_chars":  ["=>", "~>", "<", ">", "$"]
}
```

```.env
### ApiKey : https://api.neoxr.my.id
API_KEY = 'your_apikey'

### Database : https://www.mongodb.com/
DATABASE_URL = ''
```

*Note* : 
+ ```API_KEY``` : beberapa fitur pada script ini menggunakan apikey terutama fitur downloader, untuk mendapatkan apiKey kalian bisa mendapatkannya di website [Neoxr Api's](https://api.neoxr.my.id) dengan harga yang bervariasi sesuai kebutuhan.

+ ```DATABASE_URL``` : bisa di isi dengan URL mongo dan postgresql untuk mengunakan localdb cukup biarkan kosong saja dan data akan tersimpan kedalam file .json

### Instalasi & Run

Pastikan konfigurasi dan server sesuai requirements agar tidak terjadi kendala pada saat instalasi ataupun saat bot ini berjalan, ketik ini di konsol :

```
$ yarn
$ node .
```

atau ingin menggunakan pm2

```
$ yarn
$ npm i -g pm2
$ pm2 start index.js && pm2 save && pm2 logs
```

Cek repository ini secara berkala untuk mendapatkan update karena progress base ini belum 100%, jika mendapati error silahkan buat issue. Thanks.