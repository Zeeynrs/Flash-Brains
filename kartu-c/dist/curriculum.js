const card = (id, kind, question, answer, explanation, code = '') => ({ id, kind, question, answer, explanation, code });

export const topics = [
  { id: 'struktur', title: 'Kenalan dengan C', description: 'Struktur program, main, dan output pertama.', symbol: '{ }', cards: [
    card('s1', 'Konsep', 'Dari fungsi mana sebuah program C mulai dijalankan?', 'Fungsi main().', 'Pada program C biasa yang berjalan di sistem operasi, eksekusi dimulai dari main. Bentuk int main(void) berarti fungsi mengembalikan int dan tidak menerima argumen.'),
    card('s2', 'Konsep', 'Untuk apa #include <stdio.h> ditulis di awal program?', 'Agar deklarasi fungsi input/output standar tersedia.', 'Header stdio.h menyediakan deklarasi seperti printf dan scanf. Baris #include adalah arahan preprosesor, bukan pernyataan yang diakhiri titik koma.'),
    card('s3', 'Tebak output', 'Apa yang ditampilkan potongan kode ini?', 'Halo, C!', 'printf menampilkan teks di dalam tanda kutip. Karakter \\n memindahkan posisi output ke baris berikutnya.', 'printf("Halo, C!\\n");'),
    card('s4', 'Cari kesalahan', 'Apa yang kurang pada pemanggilan printf ini?', 'Titik koma (;) setelah tanda kurung penutup.', 'Pernyataan seperti pemanggilan printf harus diakhiri titik koma: printf("Halo");. Kurung kurawal mengelompokkan pernyataan dalam sebuah blok.', 'printf("Halo")'),
    card('s5', 'Konsep', 'Apa arti return 0; di akhir main?', 'Program selesai dengan status berhasil.', 'Nilai yang dikembalikan main menjadi status keluar program. Nilai 0 menandakan keberhasilan.', '#include <stdio.h>\n\nint main(void) {\n    printf("Halo, C!\\n");\n    return 0;\n}')
  ]},
  { id: 'variabel', title: 'Variabel & tipe data', description: 'Menyimpan angka dan karakter dengan tipe yang tepat.', symbol: 'int', cards: [
    card('v1', 'Konsep', 'Apa yang dilakukan deklarasi int umur = 18;?', 'Membuat variabel umur bertipe int dengan nilai awal 18.', 'int menyimpan bilangan bulat. Inisialisasi memberi nilai awal agar variabel siap digunakan.'),
    card('v2', 'Konsep', 'Tipe apa yang cocok untuk 12, 3.5, dan satu karakter A?', 'int untuk 12, float atau double untuk 3.5, dan char untuk A.', 'Bilangan pecahan memakai float atau double. Satu karakter ditulis dengan petik tunggal, misalnya char huruf = \'A\';.'),
    card('v3', 'Tebak output', 'Berapa nilai x yang dicetak?', '8', 'Penugasan x = x + 3 membaca nilai lama x, menambah 3, lalu menyimpan hasilnya kembali.', 'int x = 5;\nx = x + 3;\nprintf("%d", x);'),
    card('v4', 'Cari kesalahan', 'Mengapa nama variabel ini tidak valid?', 'Nama variabel tidak boleh diawali angka.', 'Gunakan nama seperti nilai2 atau nilai_2. Nama boleh mengandung huruf, angka, dan garis bawah, tetapi tidak boleh berupa kata kunci C.', 'int 2nilai = 90;'),
    card('v5', 'Konsep', 'Apa perbedaan \'A\' dan "A"?', '\'A\' adalah konstanta karakter; "A" adalah string literal.', 'Untuk variabel char huruf, gunakan char huruf = \'A\';. String "A" terdiri dari karakter A dan karakter penutup nol \\0.')
  ]},
  { id: 'io', title: 'Input & output', description: 'Membaca masukan dan menampilkan nilai.', symbol: '%d', cards: [
    card('i1', 'Konsep', 'Format apa yang dipakai printf untuk int, char, dan bilangan pecahan?', '%d untuk int, %c untuk char, dan %f untuk bilangan pecahan.', 'Dalam printf, float dipromosikan menjadi double. Contoh printf("%.2f", 3.5); menampilkan dua digit setelah titik desimal.'),
    card('i2', 'Konsep', 'Mengapa scanf memakai & di depan umur?', 'Agar scanf menerima alamat variabel umur.', 'scanf perlu menulis hasil input ke lokasi penyimpanan umur. Operator & mengambil alamat variabel tersebut.', 'int umur;\nscanf("%d", &umur);'),
    card('i3', 'Tebak output', 'Apa hasil output berikut?', 'Nilai: 85', 'printf mengganti %d dengan nilai argumen int berikutnya. Teks lain ditampilkan apa adanya.', 'int nilai = 85;\nprintf("Nilai: %d", nilai);'),
    card('i4', 'Cari kesalahan', 'Apa yang harus diperbaiki saat membaca nilai float ini?', 'Gunakan %f, bukan %d.', 'Untuk scanf, %f membutuhkan alamat float; %d membutuhkan alamat int. Format dan tipe tujuan harus sesuai. Untuk double, scanf memakai %lf.', 'float suhu;\nscanf("%d", &suhu);'),
    card('i5', 'Konsep', 'Mengapa hasil scanf sebaiknya diperiksa?', 'Untuk memastikan jumlah nilai yang berhasil dibaca sesuai harapan.', 'scanf mengembalikan jumlah penugasan yang berhasil. Jika hasilnya bukan 1 pada contoh ini, jangan memakai umur seolah sudah berisi input valid.', 'int umur;\nif (scanf("%d", &umur) == 1) {\n    printf("Umur: %d", umur);\n}')
  ]},
  { id: 'operator', title: 'Operator', description: 'Hitung, bandingkan, dan gabungkan kondisi.', symbol: '+=', cards: [
    card('o1', 'Tebak output', 'Berapa hasil pembagian ini?', '3', 'Kedua operand bertipe int sehingga pembagian menghasilkan bilangan bulat; bagian pecahannya dibuang menuju nol.', 'printf("%d", 7 / 2);'),
    card('o2', 'Tebak output', 'Apa hasil operasi modulo ini?', '1', 'Operator % menghasilkan sisa pembagian bilangan bulat. Tujuh dibagi tiga menghasilkan dua dengan sisa satu.', 'printf("%d", 7 % 3);'),
    card('o3', 'Konsep', 'Apa perbedaan = dan ==?', '= memberi nilai; == membandingkan kesamaan.', 'x = 5 mengubah x. Ekspresi x == 5 menghasilkan 1 jika sama dan 0 jika berbeda.'),
    card('o4', 'Tebak output', 'Operator mana yang dihitung lebih dulu?', 'Perkalian lebih dulu; hasilnya 14.', 'Perkalian memiliki prioritas lebih tinggi daripada penjumlahan. Gunakan (2 + 3) * 4 untuk mendapatkan 20.', 'printf("%d", 2 + 3 * 4);'),
    card('o5', 'Konsep', 'Apa arti &&, ||, dan ! dalam kondisi?', '&& berarti DAN, || berarti ATAU, dan ! berarti TIDAK.', 'Dalam kondisi C, nol dianggap salah dan nilai selain nol dianggap benar. Misalnya umur >= 17 && punyaKTP mensyaratkan kedua kondisi benar.')
  ]},
  { id: 'percabangan', title: 'Percabangan', description: 'Memilih jalan dengan if, else, dan switch.', symbol: 'if', cards: [
    card('p1', 'Konsep', 'Kapan blok if dijalankan?', 'Saat kondisi bernilai bukan nol (benar).', 'Jika kondisi salah, blok else dijalankan bila tersedia. Kurung kurawal membuat beberapa pernyataan menjadi satu blok.'),
    card('p2', 'Tebak output', 'Cabang mana yang akan dijalankan?', 'Lulus', 'Kondisi 80 >= 75 benar sehingga blok if dijalankan dan blok else dilewati.', 'int nilai = 80;\nif (nilai >= 75) {\n    printf("Lulus");\n} else {\n    printf("Ulangi");\n}'),
    card('p3', 'Cari kesalahan', 'Apa masalah pada kondisi ini?', 'Kondisi memakai penugasan =, bukan pembandingan ==.', 'if (nilai = 100) mengubah nilai menjadi 100. Hasil penugasan tersebut bukan nol sehingga kondisi benar. Untuk membandingkan, tulis if (nilai == 100).', 'if (nilai = 100) {\n    printf("Sempurna");\n}'),
    card('p4', 'Konsep', 'Kapan switch cocok digunakan?', 'Saat memilih di antara beberapa nilai konstan dari ekspresi bertipe bilangan bulat.', 'Contohnya menu bernomor atau karakter pilihan. case memakai nilai konstan; default menangani nilai yang tidak cocok dengan case mana pun.'),
    card('p5', 'Konsep', 'Apa fungsi break pada switch?', 'Keluar dari switch agar eksekusi tidak berlanjut ke case berikutnya.', 'Tanpa break, eksekusi dapat meneruskan pernyataan pada case selanjutnya (fall-through). Kadang disengaja, tetapi mudah menimbulkan kesalahan.')
  ]},
  { id: 'perulangan', title: 'Perulangan', description: 'Mengulang pekerjaan dengan for dan while.', symbol: 'for', cards: [
    card('l1', 'Konsep', 'Apa tiga bagian utama di dalam for?', 'Inisialisasi; kondisi; pembaruan.', 'Pada for (int i = 0; i < 3; i++), inisialisasi berjalan sekali, kondisi diperiksa sebelum setiap putaran, dan i++ berjalan setelah isi putaran.'),
    card('l2', 'Tebak output', 'Urutan angka apa yang dicetak?', '0 1 2', 'Loop berjalan saat i bernilai 0, 1, dan 2. Saat i menjadi 3, kondisi i < 3 salah. Ada satu spasi setelah setiap angka.', 'for (int i = 0; i < 3; i++) {\n    printf("%d ", i);\n}'),
    card('l3', 'Konsep', 'Apa perbedaan while dan do while?', 'while memeriksa kondisi sebelum isi; do while memeriksa setelah isi.', 'Isi do while selalu dijalankan setidaknya sekali. while bisa tidak dijalankan sama sekali jika kondisi awal salah.'),
    card('l4', 'Cari kesalahan', 'Mengapa loop ini tidak selesai?', 'Nilai i tidak pernah diperbarui sehingga kondisi tetap benar.', 'Tambahkan i++; di dalam loop agar i akhirnya mencapai 3. Pastikan perulangan memiliki cara untuk mencapai kondisi berhenti.', 'int i = 0;\nwhile (i < 3) {\n    printf("%d", i);\n}'),
    card('l5', 'Konsep', 'Apa perbedaan break dan continue dalam loop?', 'break menghentikan loop; continue melewati sisa putaran saat ini.', 'Pada for, continue menuju bagian pembaruan sebelum pemeriksaan kondisi berikutnya. Pada while, continue menuju pemeriksaan kondisi berikutnya.')
  ]},
  { id: 'array-1d', title: 'Array satu dimensi', description: 'Menyimpan dan mengolah sekumpulan nilai.', symbol: '[ ]', cards: [
    card('a1', 'Konsep', 'Apa indeks pertama dan terakhir dari int angka[5]?', 'Indeks pertama 0, indeks terakhir 4.', 'Lima elemen memiliki indeks 0 sampai 4. C tidak otomatis memeriksa batas indeks saat elemen diakses.'),
    card('a2', 'Tebak output', 'Nilai mana yang ditampilkan?', '20', 'angka[1] mengakses elemen kedua karena indeks dimulai dari nol.', 'int angka[3] = {10, 20, 30};\nprintf("%d", angka[1]);'),
    card('a3', 'Cari kesalahan', 'Mengapa akses array ini salah?', 'Indeks 3 berada di luar batas array berukuran 3.', 'Indeks valid hanya 0, 1, dan 2. Membaca atau menulis di luar batas menimbulkan undefined behavior; hasilnya tidak boleh ditebak.', 'int angka[3] = {10, 20, 30};\nprintf("%d", angka[3]);'),
    card('a4', 'Tebak output', 'Berapa total seluruh elemen?', '12', 'Loop menjumlahkan 2 + 4 + 6. Kondisi i < 3 menjaga agar akses berada dalam batas array.', 'int angka[3] = {2, 4, 6};\nint total = 0;\nfor (int i = 0; i < 3; i++) {\n    total += angka[i];\n}\nprintf("%d", total);'),
    card('a5', 'Konsep', 'Berapa nilai a[1] dan a[2] setelah inisialisasi ini?', 'Keduanya bernilai 0.', 'Jika array diinisialisasi dengan daftar yang lebih pendek, elemen sisanya diinisialisasi menjadi nol. Ini berbeda dari array lokal tanpa inisialisasi.', 'int a[3] = {7};')
  ]},
  { id: 'array-2d', title: 'Array dua dimensi', description: 'Bekerja dengan baris, kolom, dan loop bersarang.', symbol: '[ ][ ]', cards: [
    card('m1', 'Konsep', 'Berapa elemen pada int matriks[2][3]?', '6 elemen: 2 baris × 3 kolom.', 'Array dua dimensi dapat dipahami sebagai array dari array. Pada contoh ini ada dua baris yang masing-masing berisi tiga int.'),
    card('m2', 'Konsep', 'Bagaimana mengakses baris kedua, kolom ketiga?', 'matriks[1][2]', 'Indeks baris dan indeks kolom sama-sama dimulai dari nol. Karena itu baris kedua memakai 1 dan kolom ketiga memakai 2.'),
    card('m3', 'Tebak output', 'Apa yang dicetak dari matriks ini?', '6', 'm[1] adalah baris kedua, yaitu {4, 5, 6}. Elemen pada indeks kolom 2 bernilai 6.', 'int m[2][3] = {\n    {1, 2, 3},\n    {4, 5, 6}\n};\nprintf("%d", m[1][2]);'),
    card('m4', 'Konsep', 'Mengapa loop bersarang cocok untuk array dua dimensi?', 'Loop luar memilih baris dan loop dalam menelusuri kolom.', 'Untuk m[2][3], gunakan r < 2 dan c < 3. Setiap pasangan (r, c) mengunjungi satu elemen.', 'int m[2][3] = {{1, 2, 3}, {4, 5, 6}};\nfor (int r = 0; r < 2; r++) {\n    for (int c = 0; c < 3; c++) {\n        printf("%d ", m[r][c]);\n    }\n    printf("\\n");\n}'),
    card('m5', 'Cari kesalahan', 'Batas loop mana yang perlu diperbaiki?', 'r <= 2 harus menjadi r < 2.', 'Baris valid untuk m[2][3] hanya 0 dan 1. r == 2 mengakses di luar batas. Batas kolom c < 3 sudah benar.', 'int m[2][3] = {{1, 2, 3}, {4, 5, 6}};\nfor (int r = 0; r <= 2; r++) {\n    for (int c = 0; c < 3; c++) {\n        printf("%d ", m[r][c]);\n    }\n}')
  ]}
];
