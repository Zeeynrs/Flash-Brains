# Flash-Brains

Webapp belajar pemrograman C dalam bahasa Indonesia melalui **80 latihan interaktif** di delapan topik, dari struktur program sampai array dua dimensi. Dilengkapi 40 kartu referensi, XP, target harian, dan streak.

Variasi latihan: pilihan ganda, tebak output, lengkapi kode, susun kode, cari bug, pasangkan konsep, dan teka-teki logika. Jawaban diperiksa otomatis; soal yang salah dikumpulkan untuk diulang di akhir putaran. Tuntaskan sembilan latihan lalu tantangan akhir untuk membuka topik berikutnya.

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

Setiap soal memberi 10 XP hanya saat pertama kali dijawab benar. Target harian adalah lima soal berbeda yang dijawab benar; latihan ulang juga dihitung untuk target. Progres versi flashcard sebelumnya dimigrasikan otomatis dengan mempertahankan akses topik yang sudah terbuka.

## Deployment Vercel

Proyek Vercel: `flash-brains`, terhubung ke repo GitHub ini. Push ke `main` memicu deployment production.

Konfigurasi `vercel.json` berada di root repo. Framework: Other; tidak ada perintah instalasi atau build; output statis: `kartu-c/dist`.

Subdomain: `flash-brains.parallel-dungeons.site`. DNS domain dikelola di Cloudflare; subdomain memerlukan record CNAME sesuai konfigurasi domain Vercel.

Progres belajar tersimpan per browser dan origin. Progres pada URL ChatGPT Sites tidak otomatis berpindah ke domain Vercel.

## Lisensi

Proyek ini menggunakan [GNU GPL v3.0](LICENSE).
