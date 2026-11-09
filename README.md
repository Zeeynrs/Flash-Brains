# Flash-Brains

Webapp belajar berbahasa Indonesia dengan beranda katalog pelajaran. Pelajaran yang tersedia saat ini adalah **Pemrograman C**, berisi 80 latihan interaktif di delapan topik, dari struktur program sampai array dua dimensi. Dilengkapi 40 kartu referensi, XP, target harian, dan streak.

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

UI berwarna dengan jalur level berkelok, tombol dengan efek tekan, dan karakter kartun orisinal **Byte** yang menemani latihan. Responsif untuk HP, tablet dan desktop; animasi dapat dijeda dan mengikuti preferensi kurangi gerakan perangkat.

## Beranda dan navigasi

- `#/`: katalog dan pencarian pelajaran, serta melanjutkan sesi yang belum selesai.
- `#/pelajaran/c`: peta pelajaran Pemrograman C.
- `#/pelajaran/c/topik/struktur`: contoh tautan langsung ke topik C.

Sidebar kiri bisa dibuka/ditutup lewat tombol Menu. Pilihan desktop diingat di browser. Di HP, menu menjadi drawer dengan backdrop, tombol tutup, Escape dan dukungan keyboard. Back/Forward dan reload mempertahankan sesi belajar.

Metadata katalog dikelola di `kartu-c/dist/courses.js`. Pelajaran baru membutuhkan materi dan integrasi provider/state di aplikasi sebelum ditandai `available`; daftar katalog tidak otomatis membuat isi pelajarannya. Engine C saat ini tetap memakai key progres asli agar data lama aman.

## Deployment Vercel

Proyek Vercel: `flash-brains`, terhubung ke repo GitHub ini. Push ke `main` memicu deployment production.

Konfigurasi `vercel.json` berada di root repo. Framework: Other; tidak ada perintah instalasi atau build; output statis: `kartu-c/dist`.

Subdomain: `flash-brains.parallel-dungeons.site`. DNS domain dikelola di Cloudflare; subdomain memerlukan record CNAME sesuai konfigurasi domain Vercel.

Progres belajar tersimpan per browser dan origin. Progres pada URL ChatGPT Sites tidak otomatis berpindah ke domain Vercel.

## Lisensi

Proyek ini menggunakan [GNU GPL v3.0](LICENSE).
