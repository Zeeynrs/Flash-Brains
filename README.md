# Flash-Brains

Versi awal: **Kartu C**.

Webapp flashcard belajar pemrograman C dalam bahasa Indonesia. Delapan topik berurutan, 40 kartu, dari struktur program sampai array dua dimensi.

```sh
cd kartu-c
npm run dev
```

Buka http://localhost:5173. Tidak perlu memasang dependensi.

```sh
cd kartu-c
npm test
```

Lihat [petunjuk aplikasi](kartu-c/README.md) untuk struktur dan perilaku penyimpanan progres.

## Deployment Vercel

Proyek Vercel: `flash-brains`, terhubung ke repo GitHub ini. Push ke `main` memicu deployment production.

Konfigurasi `vercel.json` berada di root repo. Framework: Other; tidak ada perintah instalasi atau build; output statis: `kartu-c/dist`.

Subdomain: `flash-brains.parallel-dungeons.site`. DNS domain dikelola di Cloudflare; subdomain memerlukan record CNAME sesuai konfigurasi domain Vercel.

Progres belajar tersimpan per browser dan origin. Progres pada URL ChatGPT Sites tidak otomatis berpindah ke domain Vercel.

## Lisensi

Proyek ini menggunakan [GNU GPL v3.0](LICENSE).
