# Flash Brains — latihan C

Webapp belajar C berbahasa Indonesia, dari struktur program sampai array dua dimensi. Delapan topik, masing-masing sepuluh latihan dan lima kartu referensi. Tidak membutuhkan instalasi dependensi atau backend.

## Menjalankan

```sh
cd kartu-c
npm run dev
```

Buka http://localhost:5173. Gunakan HTTP, bukan membuka index.html langsung, karena aplikasi menggunakan ES modules.

## Pengujian

```sh
cd kartu-c
npm test
```

## Perilaku

- Tujuh interaksi: pilihan ganda, tebak output, lengkapi kode, susun kode, cari bug, pasangkan konsep, dan teka-teki logika.
- Tekan Periksa jawaban untuk mendapat penilaian otomatis dan penjelasan, lalu Lanjutkan.
- Sembilan soal latihan utama dikerjakan lebih dulu. Jawaban salah dikumpulkan untuk putaran ulang setelah soal lain selesai; ulangi tanpa batas sampai benar.
- Tantangan akhir terbuka setelah sembilan latihan benar. Menyelesaikan tantangan membuka topik berikutnya.
- Jawaban yang belum diperiksa, feedback, urutan soal, dan sesi setiap topik tersimpan di localStorage; reload dan pergantian topik tidak menghapusnya.
- Topik yang sudah selesai dapat dimainkan kembali tanpa mengunci progres.
- Setiap soal memberikan 10 XP saat pertama kali dijawab benar. Mengulang soal tidak menggandakan XP.
- Target harian: lima soal berbeda dijawab benar. Review ikut dihitung sekali per soal per hari. Streak menghitung hari berturut-turut saat target terpenuhi, berdasarkan tanggal lokal perangkat. Streak kemarin tetap ditampilkan selama hari ini masih berlangsung.
- Catatan materi tetap menyediakan 40 kartu asli. Penyelesaian kartu lama dan akses topik dimigrasikan ke skema versi 2, tanpa memberikan XP atau mastery kuis yang belum dikerjakan.

Penyimpanan terbatas pada browser dan origin yang sama. Menghapus data situs menghapus progres; tidak ada sinkronisasi antarperangkat. Jika localStorage tidak tersedia, aplikasi tetap berjalan dengan pemberitahuan bahwa progres tidak tersimpan.

Materi ditujukan untuk C99 atau lebih baru. Jawaban diperiksa terhadap kunci soal, bukan dengan menjalankan kode pengguna. Aplikasi tidak mengeksekusi kode di browser. Soal kode rusak merupakan latihan mencari kesalahan; hasil undefined behavior tidak diminta untuk ditebak.

Pengujian memakai Node built-in test runner. Jika GCC tersedia, suite juga mengompilasi dan menjalankan 40 contoh output (12 referensi dan 28 kuis), serta memeriksa sintaks seluruh kunci susun kode dan lengkapi kode. Pengujian compiler dilewati jika GCC tidak tersedia.

## Struktur

- `dist/curriculum.js`: 40 kartu dan penjelasan.
- `dist/quizzes.js`: 80 latihan dengan kunci dan penjelasan.
- `dist/quiz-engine.js`: penilaian jawaban dan pengacakan yang konsisten selama sesi.
- `dist/state.js`: transisi sesi, putaran ulang, migrasi progres, XP, target dan streak.
- `dist/quiz-view.js`: kontrol jawaban, feedback dan catatan referensi.
- `dist/app.js`: antarmuka dan penyimpanan browser.
- `dist/styles.css` dan `dist/quiz.css`: tampilan responsif.
- `tests/`: pengujian penilaian, alur belajar, migrasi, reward dan ketepatan contoh C.

Font Instrument Sans dan Instrument Serif dimuat dari Google Fonts; tersedia fallback font sistem bila offline.
