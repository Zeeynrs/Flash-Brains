# Rancangan awal: Flashcard Dasar C

## Tujuan
Webapp belajar pemrograman C berbahasa Indonesia dari struktur program sampai array. Versi awal kecil, dapat dicoba di HP dan laptop tanpa akun.

## Pendekatan
1. HTML, CSS, dan JavaScript dengan localStorage: sederhana, tidak membutuhkan backend; progres hanya tersedia di browser yang sama. Ini pilihan pengguna.
2. Aplikasi dengan akun dan backend: dapat menyinkronkan progres antarperangkat, tetapi menambah lingkup implementasi. Ditunda.

Pilihan teknis HTML/CSS/JavaScript merupakan usulan implementasi; pengguna telah menyetujui tanpa login dengan penyimpanan progres di browser.

## Materi
Delapan topik, masing-masing lima kartu: struktur program dan printf; variabel dan tipe data; input/output dan scanf; operator; percabangan; perulangan; array satu dimensi; array dua dimensi.

Kartu mencakup konsep, prediksi output, dan identifikasi kesalahan, dengan jawaban serta penjelasan singkat. Contoh kode harus valid atau secara eksplisit merupakan latihan mencari kesalahan. Hindari prediksi hasil kode dengan undefined behavior.

## Alur dan aturan
- Halaman awal menampilkan delapan topik dan progres.
- Hanya topik pertama terbuka pada awal penggunaan.
- Mode belajar menampilkan pertanyaan, tombol Lihat jawaban, lalu Ingat dan Belum ingat.
- Belum ingat memindahkan kartu ke akhir antrean sesi; Ingat menandai kartu telah dipelajari.
- Topik selesai setelah kelima kartunya ditandai Ingat. Topik berikutnya terbuka secara berurutan.
- Ingat adalah penilaian mandiri, bukan bukti penguasaan yang diuji otomatis.
- Topik selesai dapat diulang tanpa mengunci kembali topik berikutnya.
- Progres dan antrean sesi disimpan setelah setiap penilaian agar dapat dilanjutkan setelah memuat ulang halaman.
- Ringkasan sesi memperlihatkan penyelesaian topik dan akses ke topik berikutnya.

## Tampilan dan aksesibilitas
Tampilan responsif berbahasa Indonesia, daftar topik, kartu belajar dengan kode yang mudah dibaca, indikator progres, fokus keyboard terlihat, serta tombol yang nyaman disentuh. Status terkunci dijelaskan melalui teks. Animasi tidak diperlukan.

## Batas lingkup
Tidak mencakup login, sinkronisasi, editor kartu, impor CSV, eksekusi kode C, atau penjadwalan spaced repetition. Keputusan lingkup ini adalah usulan untuk menjaga versi pertama tetap kecil.

## Validasi
Periksa jumlah dan urutan kartu, pembukaan topik, pengulangan kartu, kelanjutan setelah reload, serta perilaku mengulang topik selesai. Periksa antarmuka pada layar HP dan desktop bila browser tersedia. Tinjau ketepatan materi C.

## Status
Disetujui pengguna pada 6 November 2026. Implementasi berjalan sesuai rancangan ini.
