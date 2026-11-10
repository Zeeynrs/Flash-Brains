# Flash Brains — latihan C dan Python

Webapp belajar berbahasa Indonesia dengan dua pelajaran: C dari struktur program sampai array dua dimensi, dan Python 3 dari print sampai slicing dan list bersarang. Setiap pelajaran memiliki delapan topik, masing-masing sepuluh latihan dan lima kartu referensi. Tidak membutuhkan instalasi dependensi atau backend.

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
- Setiap jawaban punya animasinya sendiri: jawaban benar memunculkan konfeti, centang, XP, dan progres yang bertambah; jawaban salah membuat kartu bergetar lalu menyorot jawaban yang tepat. Menuntaskan topik memicu perayaan dengan hujan konfeti dan angka hasil yang menghitung naik. Animasi hanya muncul pada momennya, tidak terulang saat halaman dimuat ulang.
- Sembilan soal latihan utama dikerjakan lebih dulu. Jawaban salah dikumpulkan untuk putaran ulang setelah soal lain selesai; ulangi tanpa batas sampai benar.
- Tantangan akhir terbuka setelah sembilan latihan benar. Menyelesaikan tantangan membuka topik berikutnya.
- Jawaban yang belum diperiksa, feedback, urutan soal, dan sesi setiap topik tersimpan di localStorage; reload dan pergantian topik tidak menghapusnya.
- Topik yang sudah selesai dapat dimainkan kembali tanpa mengunci progres.
- Setiap soal memberikan 10 XP saat pertama kali dijawab benar. Mengulang soal tidak menggandakan XP.
- Progres, jawaban, dan sesi C/Python disimpan terpisah. Berpindah pelajaran tidak menghapus draft atau feedback.
- XP dan misi harian menggabungkan kedua pelajaran. Target harian: lima soal berbeda dijawab benar. Review ikut dihitung sekali per soal per hari. Streak menghitung hari berturut-turut saat target terpenuhi, berdasarkan tanggal lokal perangkat. Streak kemarin tetap ditampilkan selama hari ini masih berlangsung.
- Setiap pelajaran menyediakan 40 kartu referensi. Catatan materi C tetap menyediakan 40 kartu asli. Penyelesaian kartu lama dan akses topik dimigrasikan ke skema versi 2, tanpa memberikan XP atau mastery kuis yang belum dikerjakan.

Penyimpanan terbatas pada browser dan origin yang sama. Menghapus data situs menghapus progres; tidak ada sinkronisasi antarperangkat. Jika localStorage tidak tersedia, aplikasi tetap berjalan dengan pemberitahuan bahwa progres tidak tersimpan.

Materi C ditujukan untuk C99 atau lebih baru; materi Python memakai Python 3. Jawaban diperiksa terhadap kunci soal, bukan dengan menjalankan kode pengguna. Aplikasi tidak mengeksekusi kode di browser. Soal kode rusak merupakan latihan mencari kesalahan; hasil undefined behavior tidak diminta untuk ditebak.

Pengujian memakai Node built-in test runner. Jika GCC tersedia, suite juga mengompilasi dan menjalankan 40 contoh output (12 referensi dan 28 kuis), serta memeriksa sintaks seluruh kunci susun kode dan lengkapi kode. Pengujian compiler dilewati jika GCC tidak tersedia. Suite Python memeriksa struktur materi dan menjalankan contoh output serta semua kunci lengkapi/susun kode memakai Python 3, dengan batas waktu proses.

## Struktur

- `dist/curriculum.js`: 40 kartu dan penjelasan.
- `dist/quizzes.js`: 80 latihan dengan kunci dan penjelasan.
- `dist/quiz-engine.js`: penilaian jawaban dan pengacakan yang konsisten selama sesi.
- `dist/state.js`: konfigurasi C dengan key asli dan migrasi progres lama.
- `dist/learning-state.js`: mesin sesi bersama, putaran ulang, validasi progres, XP, target dan gabungan streak.
- `dist/python-curriculum.js`, `dist/python-quizzes.js`: 40 kartu referensi dan 80 latihan Python.
- `dist/course-content.js`: pemetaan konten dan mesin progres per pelajaran.
- `dist/quiz-view.js`: kontrol jawaban, feedback dan catatan referensi.
- `dist/mascot.js`: karakter SVG Byte dan logo orisinal.
- `dist/effects.js`, `dist/effects.css`: animasi jawaban benar, salah, soal berikutnya dan topik tuntas.
- `dist/courses.js`: registry metadata pelajaran yang tersedia dan pencarian katalog.
- `dist/navigation.js`: parser dan pembuat hash route katalog/pelajaran/topik.
- `dist/sidebar.js`: preferensi sidebar desktop dan drawer mobile yang mendukung keyboard.
- `dist/catalog-view.js`: beranda umum, kartu pelajaran, pencarian, misi harian dan sesi lanjutan.
- `dist/app.js`: antarmuka dan penyimpanan browser.
- `dist/styles.css` (dasar, kerangka aplikasi, peta belajar), `dist/quiz.css` (latihan dan hasil) dan `dist/catalog.css` (beranda): tampilan responsif satu kolom.
- `tests/`: pengujian penilaian, alur belajar, migrasi, reward dan ketepatan contoh C/Python dan pemisahan progres pelajaran.

Tampilan memakai Nunito dari Google Fonts dengan fallback font sistem. Karakter Byte, jalur level dan ilustrasi dibuat dengan SVG, tanpa dependensi animasi tambahan. Animasi dapat dimatikan atau dinyalakan melalui tombol **Animasi aktif / Animasi mati** di sidebar atau menu pada HP; pilihan diingat di browser. Jika perangkat meminta gerakan dikurangi (misalnya "Show animations in Windows" dimatikan), animasi mati secara bawaan sampai pengguna menyalakannya sendiri lewat tombol itu.

Beranda `#/` menampilkan pelajaran yang benar-benar tersedia. C mempunyai halaman sendiri di `#/pelajaran/c`, dengan topik di `#/pelajaran/c/topik/<id>`. Python tersedia di `#/pelajaran/python` dengan topik `#/pelajaran/python/topik/<id>`. Urutan Python: kenalan, variabel dan tipe data, input/output, operator, percabangan, perulangan, list, lalu slicing dan list bersarang. Pelajaran yang belum dibuka atau belum tersedia tidak dapat diakses melalui deep link. Menutup sidebar desktop memberi lebih banyak ruang baca; preferensinya terpisah dari data kuis. Drawer HP menutup saat navigasi tanpa mengubah preferensi desktop.
