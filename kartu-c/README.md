# Kartu C

Webapp flashcard pemrograman C berbahasa Indonesia, dari struktur program sampai array dua dimensi. Delapan topik, masing-masing lima kartu. Tidak membutuhkan instalasi dependensi atau backend.

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

- Lihat jawaban, lalu pilih Ingat atau Belum ingat.
- Belum ingat memindahkan kartu ke akhir antrean; Ingat menyelesaikan kartu.
- Lima kartu selesai membuka topik berikutnya.
- Ulangi topik selesai tanpa menghapus progres permanen.
- Progres dan antrean disimpan di localStorage setelah setiap penilaian.
- Kembali ke rencana belajar lalu pilih topik untuk melanjutkan sesi.
- Saat jawaban terlihat, tombol 1 dan 2 memilih Belum ingat dan Ingat.

Penyimpanan terbatas pada browser dan origin yang sama. Menghapus data situs menghapus progres; tidak ada sinkronisasi antarperangkat. Jika localStorage tidak tersedia, aplikasi tetap berjalan dengan pemberitahuan bahwa progres tidak tersimpan.

Materi ditujukan untuk C99 atau lebih baru. Kartu penilaian mandiri membantu mengingat konsep; aplikasi tidak mengeksekusi kode atau menguji penguasaan secara otomatis.

## Struktur

- `dist/curriculum.js`: 40 kartu dan penjelasan.
- `dist/state.js`: transisi sesi, pembukaan topik, validasi progres.
- `dist/app.js`: antarmuka dan penyimpanan browser.
- `dist/styles.css`: tampilan responsif.
- `tests/state.test.js`: pengujian alur belajar.

Font Instrument Sans dan Instrument Serif dimuat dari Google Fonts; tersedia fallback font sistem bila offline.
