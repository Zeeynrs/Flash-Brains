# Flash-Brains

Webapp belajar berbahasa Indonesia dengan beranda katalog pelajaran. Tersedia **Pemrograman C** (struktur program sampai array dua dimensi), **Pemrograman Python** (print sampai slicing dan list bersarang), dan **Catur** (mengenal papan sampai skakmat satu langkah). Masing-masing memiliki delapan topik, 80 latihan interaktif, dan 40 kartu referensi, dilengkapi XP, target harian, dan streak.

Variasi latihan: pilihan ganda, tebak output, lengkapi kode, susun kode, cari bug, pasangkan konsep, dan teka-teki logika. Catur menambah papan interaktif: pilih petak, pindahkan bidak, pilih promosi, dan temukan mat. Klik bidak lalu tujuannya, atau gunakan tombol panah dan Enter. Jawaban diperiksa otomatis; soal yang salah dikumpulkan untuk diulang di akhir putaran. Tuntaskan sembilan latihan lalu tantangan akhir untuk membuka topik berikutnya.

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

Setiap soal memberi 10 XP hanya saat pertama kali dijawab benar. Target harian adalah lima soal berbeda yang dijawab benar dari gabungan semua pelajaran; latihan ulang juga dihitung untuk target. XP dan streak ditampilkan bersama, sedangkan progres topik, jawaban, dan sesi C/Python/Catur disimpan terpisah. Progres versi flashcard sebelumnya dimigrasikan otomatis dengan mempertahankan akses topik yang sudah terbuka.

UI berwarna dengan jalur level berkelok, tombol dengan efek tekan, dan karakter kartun orisinal **Byte** yang menemani latihan. Responsif untuk HP, tablet dan desktop; animasi dapat dijeda dan mengikuti preferensi kurangi gerakan perangkat.

## Beranda dan navigasi

- `#/`: katalog dan pencarian pelajaran, serta melanjutkan sesi yang belum selesai.
- `#/pelajaran/c`: peta pelajaran Pemrograman C.
- `#/pelajaran/c/topik/struktur`: contoh tautan langsung ke topik C.
- `#/pelajaran/python`: peta pelajaran Pemrograman Python.
- `#/pelajaran/chess`: peta kursus Catur, dengan 80 latihan dan puzzle.
- `#/pelajaran/python/topik/py-mulai`: topik pertama Python.

Sidebar kiri bisa dibuka/ditutup lewat tombol Menu. Pilihan desktop diingat di browser. Di HP, menu menjadi drawer dengan backdrop, tombol tutup, Escape dan dukungan keyboard. Back/Forward dan reload mempertahankan sesi belajar.

Metadata katalog dikelola di `kartu-c/dist/courses.js`. Pelajaran baru membutuhkan materi dan integrasi provider/state di aplikasi sebelum ditandai `available`; daftar katalog tidak otomatis membuat isi pelajarannya. Konten dan engine setiap pelajaran didaftarkan di `course-content.js`, menggunakan mesin sesi bersama di `learning-state.js`. C tetap memakai key progres asli `kartu-c-progress-v1` agar data lama aman; Python memakai `flash-brains-python-progress-v1`.

## Deployment Vercel

Proyek Vercel: `flash-brains`, terhubung ke repo GitHub ini. Push ke `main` memicu deployment production.

Konfigurasi `vercel.json` berada di root repo. Framework: Other; tidak ada perintah instalasi atau build; output statis: `kartu-c/dist`.

Domain utama: `flashbrains.site`, dengan DNS di Hostinger. `www.flashbrains.site` diarahkan ke domain utama. Domain lama `flash-brains.parallel-dungeons.site` tetap dapat terdaftar pada proyek Vercel yang sama.

Progres belajar tersimpan per browser dan origin. Progres pada URL ChatGPT Sites tidak otomatis berpindah ke domain Vercel.

## Lisensi

Proyek ini menggunakan [GNU GPL v3.0](LICENSE).
