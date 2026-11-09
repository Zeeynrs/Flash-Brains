// Python 3. Kode hanya ditampilkan di browser; pengujian menjalankannya dengan Python.
const multiple = (type, prompt, options, answer, explanation, code = '') => ({
  type, prompt, code, options: options.map((text, i) => ({ id: 'abcd'[i], text })), answer, explanation,
});
const choice = (prompt, options, answer, explanation) => multiple('choice', prompt, options, answer, explanation);
const bug = (prompt, code, options, answer, explanation) => multiple('bug', prompt, options, answer, explanation, code);
const output = (prompt, code, options, answer, explanation, expectedOutput) => ({ ...multiple('output', prompt, options, answer, explanation, code), expectedOutput });
const logic = (prompt, code, options, answer, explanation, expectedOutput) => ({ ...multiple('logic', prompt, options, answer, explanation, code), ...(expectedOutput === undefined ? {} : { expectedOutput }) });
const fill = (prompt, code, accepted, explanation) => ({ type: 'fill', prompt, code, accepted, explanation });
const order = (prompt, lines, explanation) => ({ type: 'order', prompt, tokens: lines.map((text, i) => ({ id: `line-${i + 1}`, text })), answer: lines.map((_, i) => `line-${i + 1}`), explanation });
const match = (prompt, pairs, explanation) => ({ type: 'match', prompt, pairs: pairs.map(([left, right], i) => ({ id: `pair-${i + 1}`, left, right })), explanation });
const topic = (id, exercises) => exercises.map((e, i) => ({ ...e, id: `${id}-${String(i + 1).padStart(2, '0')}`, ...(i === 9 ? { challenge: true } : {}) }));

export const exercisesByTopic = {
  'py-mulai': topic('py-mulai', [
    choice('Perintah mana yang menampilkan teks Halo di Python 3?', ['echo("Halo")', 'print("Halo")', 'tulis("Halo")', 'output("Halo")'], 'b', 'print adalah fungsi bawaan Python untuk menampilkan nilai.'),
    output('Apa output persisnya, termasuk baris baru terakhir?', 'print("Halo")\nprint("Python")', ['HaloPython\n', 'Python\nHalo\n', 'Halo\nPython\n', 'Halo Python\n'], 'c', 'Setiap print menambahkan baris baru sehingga kedua kata muncul pada baris berbeda.', 'Halo\nPython\n'),
    fill('Isi nama fungsi bawaan untuk mencetak teks.', '___("Siap")', ['print'], 'print menampilkan teks Siap dan menambahkan baris baru.'),
    order('Susun tiga perintah agar mencetak Mulai, lalu Belajar, lalu Selesai pada baris terpisah.', ['print("Mulai")', 'print("Belajar")', 'print("Selesai")'], 'Perintah dijalankan dari atas ke bawah; urutan yang diminta menentukan susunannya.'),
    bug('Apa yang kurang agar baris ini menjadi perintah cetak lengkap?', 'print("Halo"', ['Tanda # di depan', 'Titik koma wajib', 'Titik dua di akhir', 'Kurung tutup )'], 'd', 'Pemanggilan print membutuhkan kurung buka dan kurung tutup yang berpasangan.'),
    match('Pasangkan bagian kode dengan perannya.', [['print', 'Fungsi untuk menampilkan nilai'], ['"Halo"', 'Teks yang dicetak'], ['# catatan', 'Komentar yang diabaikan']], 'Tanda kutip membatasi teks; # menandai komentar; print menampilkan nilai.'),
    logic('Komentar diabaikan. Apa yang dicetak?', 'print("A")\n# print("B")\nprint("C")', ['A\nB\nC\n', 'A\nC\n', 'AC', 'B\n'], 'b', 'Baris komentar tidak dijalankan. print pertama dan terakhir masing-masing menambah baris baru.', 'A\nC\n'),
    output('Apa hasil mencetak teks yang berisi spasi?', 'print("Halo Python")', ['Halo\nPython\n', 'HaloPython\n', 'Halo Python\n', '"Halo Python"\n'], 'c', 'Spasi di dalam teks ikut dicetak, sedangkan tanda kutip pembatas tidak.', 'Halo Python\n'),
    fill('Isi satu karakter agar baris pertama menjadi komentar.', '___ Ini catatan\nprint("Jalan")', ['#'], 'Komentar dimulai # dan berakhir di akhir baris.'),
    logic('Tantangan: komentar di akhir baris tidak membatalkan print sebelumnya. Apa outputnya?', 'print("Satu") # print("Dua")\nprint("Tiga")', ['Satu\nDua\nTiga\n', 'Tiga\n', 'SatuTiga\n', 'Satu\nTiga\n'], 'd', 'Hanya bagian setelah # yang diabaikan. Satu dan Tiga tetap dicetak pada baris berbeda.', 'Satu\nTiga\n'),
  ]),
  'py-variabel': topic('py-variabel', [
    choice('Nama variabel mana yang valid dalam Python?', ['2nilai', 'nilai-akhir', 'nilai_2', 'class'], 'c', 'Nama tidak boleh diawali angka, memakai tanda hubung, atau berupa kata kunci seperti class.'),
    output('Penugasan ulang asal tidak mengubah salinan angka. Apa outputnya?', 'asal = 4\nsalinan = asal\nasal = 9\nprint(asal, salinan)', ['9 4\n', '9 9\n', '4 4\n', '4 9\n'], 'a', 'salinan tetap merujuk angka 4; asal kemudian diikat ke 9. print memisahkan argumen dengan spasi.', '9 4\n'),
    fill('Isi literal boolean benar dengan kapitalisasi Python yang tepat.', 'aktif = ___\nprint(aktif)', ['True'], 'Literal boolean Python adalah True dan False, dengan huruf pertama kapital.'),
    order('Susun agar nama awal ditetapkan, disalin ke sapaan, lalu sapaan dicetak.', ['nama = "Rani"', 'sapaan = nama', 'print(sapaan)'], 'sapaan bergantung pada nama; print bergantung pada sapaan.'),
    bug('Mengapa kode ini gagal sebelum mencetak nilai?', '2nilai = 90\nprint(2nilai)', ['Angka 90 terlalu besar', 'Nama variabel dimulai angka', 'print hanya menerima teks', 'Variabel harus diawali kapital'], 'b', 'Nama variabel tidak boleh diawali angka. Gunakan nilai2 atau nilai_2.'),
    match('Pasangkan literal dengan tipe datanya.', [['18', 'int'], ['3.5', 'float'], ['"belajar"', 'str'], ['False', 'bool']], 'Teks memakai tanda kutip, pecahan memakai titik, dan boolean memakai True atau False.'),
    logic('Nama bersifat peka huruf besar-kecil. Apa output kode berikut?', 'nilai = 3\nNilai = 8\nprint(nilai)', ['8\n', '3 8\n', 'Nilai\n', '3\n'], 'd', 'nilai dan Nilai adalah nama yang berbeda. Yang dicetak adalah nilai dengan huruf kecil.', '3\n'),
    output('Apa yang dicetak ketika tipe nilai dilihat?', 'print(type(3.5))', ["<class 'int'>\n", "<class 'str'>\n", "<class 'float'>\n", "<class 'bool'>\n"], 'c', 'Literal 3.5 adalah bilangan pecahan bertipe float.', "<class 'float'>\n"),
    fill('Isi literal teks Halo, lengkap dengan pasangan tanda kutip.', 'pesan = ___\nprint(pesan)', ['"Halo"', "'Halo'"], 'Teks dapat dibatasi petik tunggal atau petik ganda selama keduanya berpasangan.'),
    logic('Tantangan: ikuti penugasan berurutan. Apa nilai akhir yang dicetak?', 'a = 2\nb = a\na = 5\nb = a\nprint(a, b)', ['5 5\n', '5 2\n', '2 5\n', '2 2\n'], 'a', 'Penugasan terakhir b = a memakai nilai terbaru a, yaitu 5.', '5 5\n'),
  ]),
  'py-input': topic('py-input', [
    choice('Jika pengguna mengetik 42, apa tipe nilai yang dikembalikan input()?', ['int', 'float', 'bool', 'str'], 'd', 'input selalu menghasilkan teks; konversikan dengan int atau float jika memerlukan angka.'),
    output('Apa hasil konversi teks ini?', 'angka = int("12")\nprint(angka)', ['12\n', '"12"\n', '12.0\n', 'int\n'], 'a', 'int mengubah teks bilangan bulat menjadi angka 12; print tidak menampilkan tanda kutip.', '12\n'),
    fill('Isi fungsi konversi ke bilangan bulat.', 'umur = ___("17")\nprint(umur)', ['int'], 'int menerima teks bilangan bulat valid dan menghasilkan angka 17.'),
    order('Susun agar teks angka disiapkan, dikonversi menjadi int, lalu hasilnya dicetak.', ['teks = "25"', 'angka = int(teks)', 'print(angka)'], 'Konversi memerlukan teks terlebih dahulu, lalu print memakai angka hasil konversi.'),
    bug('Mengapa konversi ini memunculkan ValueError?', 'angka = int("dua")', ['int hanya menerima float', 'Kutip harus diganti kurung siku', 'Teks dua bukan representasi bilangan bulat', 'Nama angka tidak valid'], 'c', 'int dapat membaca teks angka seperti "2", tetapi tidak menerjemahkan kata "dua".'),
    match('Pasangkan fungsi dengan hasil atau perannya.', [['input()', 'Membaca satu baris sebagai str'], ['int("8")', 'Menghasilkan bilangan bulat 8'], ['float("2.5")', 'Menghasilkan bilangan pecahan 2.5'], ['str(8)', 'Menghasilkan teks "8"']], 'Pilih konversi sesuai tipe yang dibutuhkan; input sendiri selalu menghasilkan str.'),
    logic('Saat pengguna mengetik 7 lalu Enter, bagaimana menyiapkan nilai bilangan bulat?', 'teks = input()\n# Pilih perintah untuk baris berikutnya.', ['angka = teks', 'angka = int(teks)', 'angka = str(teks)', 'angka = "teks"'], 'b', 'int(teks) mengonversi masukan yang valid menjadi bilangan bulat.'),
    output('Apa hasil konversi pecahan berikut?', 'suhu = float("3.5")\nprint(suhu)', ['3\n', '"3.5"\n', '35\n', '3.5\n'], 'd', 'float membaca titik sebagai pemisah desimal sehingga hasilnya 3.5.', '3.5\n'),
    fill('Isi fungsi yang mengubah angka menjadi teks.', 'teks = ___(12)\nprint(type(teks))', ['str'], 'str(12) menghasilkan teks "12", sehingga tipenya str.'),
    logic('Tantangan: konversi bertingkat ini berakhir pada tipe apa?', 'awal = "9"\nangka = int(awal)\nakhir = str(angka)\nprint(type(akhir))', ["<class 'int'>\n", "<class 'float'>\n", "<class 'str'>\n", "<class 'bool'>\n"], 'c', 'int menghasilkan angka, lalu str mengubah angka tersebut kembali menjadi teks.', "<class 'str'>\n"),
  ]),
  'py-operator': topic('py-operator', [
    choice('Operator mana yang menguji kesamaan dua nilai?', ['=', '==', '!=', '**'], 'b', '== membandingkan kesamaan; = melakukan penugasan.'),
    output('Apa hasil pembagian biasa dan pembagian bulat berikut?', 'print(7 / 2)\nprint(7 // 2)', ['3\n3\n', '3.5\n3.5\n', '3.5\n3\n', '3\n3.5\n'], 'c', '/ menghasilkan 3.5, sedangkan // membulatkan ke bawah menjadi 3.', '3.5\n3\n'),
    fill('Isi operator sisa pembagian agar hasilnya 1.', 'print(7 ___ 3)', ['%'], '7 dibagi 3 memiliki sisa 1; operator % mengambil sisa itu.'),
    order('Susun agar harga ditetapkan, total dihitung dari harga, lalu total dicetak.', ['harga = 4', 'total = harga * 3', 'print(total)'], 'total bergantung pada harga dan print bergantung pada total; hasilnya 12.'),
    bug('Program ingin menghitung dua pangkat tiga, tetapi mendapat 1. Perbaikan apa yang tepat?', 'print(2 ^ 3)', ['Ganti ^ dengan **', 'Ganti ^ dengan //', 'Ganti 3 dengan 0', 'Tambahkan = setelah ^'], 'a', '^ adalah operator bit, bukan pangkat. ** menghitung pangkat sehingga 2 ** 3 bernilai 8.'),
    match('Pasangkan ekspresi dengan nilainya.', [['7 % 3', '1'], ['2 ** 3', '8'], ['2 + 3 * 4', '14'], ['(2 + 3) * 4', '20']], 'Pangkat, sisa, dan prioritas operasi menentukan hasil; tanda kurung didahulukan.'),
    logic('Kedua syarat harus terpenuhi. Apa hasilnya?', 'umur = 18\nprint(umur >= 17 and umur < 25)', ['False\n', '18\n', '17\n', 'True\n'], 'd', '18 memenuhi kedua perbandingan, sehingga and menghasilkan True.', 'True\n'),
    output('Pembagian // membulatkan ke bawah, termasuk angka negatif. Apa outputnya?', 'print(-7 // 2)', ['-3\n', '-4\n', '3\n', '-3.5\n'], 'b', '-7 / 2 adalah -3.5; pembulatan ke bawah menghasilkan -4.', '-4\n'),
    fill('Isi kata kunci logika untuk membalik True menjadi False.', 'print(___ True)', ['not'], 'not membalik nilai kebenaran operandnya.'),
    logic('Tantangan: perkalian dikerjakan sebelum penjumlahan. Apa hasil perbandingannya?', 'hasil = 2 + 3 * 4\nprint(hasil == 14 and hasil != 20)', ['14\n', 'False\n', 'True\n', '20\n'], 'c', 'hasil adalah 14. Kedua perbandingan benar sehingga gabungan and bernilai True.', 'True\n'),
  ]),
  'py-kondisi': topic('py-kondisi', [
    choice('Apa yang menentukan baris mana yang termasuk isi blok if?', ['Titik koma', 'Kurung kurawal', 'Indentasi', 'Nama variabel'], 'c', 'Python menggunakan indentasi yang konsisten untuk mengelompokkan isi blok.'),
    output('Cabang mana yang berjalan?', 'nilai = 80\nif nilai >= 75:\n    print("Lulus")\nelse:\n    print("Ulangi")', ['Lulus\n', 'Ulangi\n', 'Lulus\nUlangi\n', '80\n'], 'a', '80 >= 75 benar sehingga hanya cabang if yang mencetak.', 'Lulus\n'),
    fill('Isi satu tanda baca untuk melengkapi kepala if.', 'siap = True\nif siap___\n    print("Mulai")', [':'], 'Kepala if diakhiri titik dua dan isi blok diberi indentasi.'),
    order('Susun nilai terlebih dahulu, kepala if berikutnya, lalu baris cetak berindentasi sebagai isinya.', ['nilai = 8', 'if nilai > 5:', '    print("Besar")'], 'Kondisi membutuhkan nilai dan baris berindentasi harus berada setelah kepala if.'),
    bug('Apa kesalahan sintaks dalam kondisi ini?', 'nilai = 10\nif nilai = 10:\n    print("Sama")', ['Tidak boleh membandingkan angka 10', 'Gunakan == untuk membandingkan', 'Hapus indentasi print', 'Ganti if dengan print'], 'b', 'Penugasan = tidak dapat dipakai sebagai perbandingan ini. Gunakan nilai == 10.'),
    match('Pasangkan kata kunci dengan peran cabangnya.', [['if', 'Menguji kondisi pertama'], ['elif', 'Menguji kondisi berikutnya jika sebelumnya salah'], ['else', 'Menangani sisa keadaan tanpa kondisi tambahan']], 'Rantai memilih cabang pertama yang kondisinya benar; else menjadi pilihan terakhir.'),
    logic('Dua kondisi benar dalam satu rantai. Apa yang dicetak?', 'nilai = 90\nif nilai >= 75:\n    print("Lulus")\nelif nilai >= 85:\n    print("Hebat")\nelse:\n    print("Ulangi")', ['Hebat\n', 'Lulus\nHebat\n', 'Ulangi\n', 'Lulus\n'], 'd', 'Cabang if pertama sudah cocok. elif berikutnya dilewati meskipun kondisinya juga akan benar.', 'Lulus\n'),
    output('Kondisi salah membuat else berjalan. Apa outputnya?', 'umur = 15\nif umur >= 17:\n    print("Boleh")\nelse:\n    print("Tunggu")', ['Boleh\n', 'Boleh\nTunggu\n', 'Tunggu\n', '15\n'], 'c', '15 tidak memenuhi umur >= 17 sehingga else mencetak Tunggu.', 'Tunggu\n'),
    fill('Isi kata kunci cabang tanpa kondisi untuk menangani nilai selain positif.', 'angka = 0\nif angka > 0:\n    print("Positif")\n___:\n    print("Bukan positif")', ['else'], 'else tidak memakai kondisi dan berjalan ketika if sebelumnya salah.'),
    logic('Tantangan: if terpisah diperiksa masing-masing. Apa outputnya?', 'nilai = 90\nif nilai >= 75:\n    print("Lulus")\nif nilai >= 85:\n    print("Hebat")', ['Lulus\nHebat\n', 'Lulus\n', 'Hebat\n', '90\n'], 'a', 'Kedua if merupakan pernyataan terpisah. Keduanya benar sehingga keduanya mencetak.', 'Lulus\nHebat\n'),
  ]),
  'py-perulangan': topic('py-perulangan', [
    choice('Nilai mana yang dikunjungi for i in range(3)?', ['1, 2, 3', '0, 1, 2, 3', '3 saja', '0, 1, 2'], 'd', 'range(3) mulai dari nol dan berhenti sebelum tiga.'),
    output('Apa urutan angka yang dicetak?', 'for i in range(1, 4):\n    print(i)', ['1\n2\n3\n', '1\n2\n3\n4\n', '0\n1\n2\n', '4\n'], 'a', 'Batas akhir 4 tidak disertakan sehingga loop mencetak 1, 2, dan 3.', '1\n2\n3\n'),
    fill('Isi kata kunci untuk mengulang selama kondisi benar.', 'i = 0\n___ i < 2:\n    print(i)\n    i += 1', ['while'], 'while memeriksa kondisi sebelum setiap putaran; pembaruan i membuat loop berhenti.'),
    order('Susun total awal di luar loop, kepala loop, tambahan berindentasi, lalu cetak total di luar loop.', ['total = 0', 'for i in range(1, 4):', '    total += i', 'print(total)'], 'total harus disiapkan sebelum dipakai. print di luar loop menampilkan hasil akhir 6.'),
    bug('Mengapa loop ini tidak berhenti?', 'i = 0\nwhile i < 3:\n    print(i)', ['print mengurangi i', 'range belum dipanggil', 'i tidak pernah bertambah', 'Angka 3 harus diberi kutip'], 'c', 'Tanpa pembaruan, i tetap 0 dan kondisi selalu benar. Tambahkan i += 1 di dalam loop.'),
    match('Pasangkan bagian loop dengan maknanya.', [['range(2, 5)', 'Nilai 2, 3, dan 4'], ['break', 'Menghentikan loop terdekat'], ['continue', 'Melewati sisa putaran saat ini']], 'Batas akhir range tidak termasuk; break dan continue memiliki fungsi yang berbeda.'),
    logic('while dapat melewati isi sepenuhnya. Apa outputnya?', 'i = 5\nwhile i < 3:\n    print("A")\n    i += 1\nprint("B")', ['A\nB\n', 'B\n', 'A\n', '5\n'], 'b', 'Kondisi awal salah sehingga hanya print setelah loop yang berjalan.', 'B\n'),
    output('continue melewati pencetakan untuk i == 2. Apa outputnya?', 'for i in range(1, 5):\n    if i == 2:\n        continue\n    print(i)', ['1\n2\n3\n4\n', '1\n', '3\n4\n', '1\n3\n4\n'], 'd', 'Putaran untuk 2 melewati print; nilai 1, 3, dan 4 tetap dicetak.', '1\n3\n4\n'),
    fill('Isi kata kunci untuk menghentikan loop saat i mencapai 3.', 'for i in range(1, 6):\n    if i == 3:\n        ___\n    print(i)', ['break'], 'break menghentikan loop sebelum 3 dicetak sehingga hasilnya hanya 1 dan 2.'),
    logic('Tantangan: jumlahkan nilai dengan langkah dua. Apa outputnya?', 'total = 0\nfor i in range(1, 6, 2):\n    total += i\nprint(total)', ['15\n', '6\n', '9\n', '5\n'], 'c', 'range menghasilkan 1, 3, dan 5. Jumlahnya 9.', '9\n'),
  ]),
  'py-list': topic('py-list', [
    choice('Untuk list berisi empat elemen, indeks positif mana yang valid?', ['1 sampai 4', '0 sampai 3', '0 sampai 4', '1 sampai 3'], 'b', 'Indeks dimulai nol sehingga empat elemen memakai indeks 0, 1, 2, dan 3.'),
    output('Satu elemen diubah. Apa outputnya?', 'angka = [4, 7, 9]\nangka[1] = 2\nprint(angka)', ['[2, 7, 9]\n', '[4, 7, 9]\n', '[4, 2, 9]\n', '[4, 7, 2]\n'], 'c', 'Indeks 1 menunjuk elemen kedua. Penugasan mengganti nilai 7 menjadi 2.', '[4, 2, 9]\n'),
    fill('Isi indeks positif untuk mengambil elemen ketiga.', 'angka = [10, 20, 30, 40]\nprint(angka[___])', ['2'], 'Elemen ketiga berada pada indeks 2 karena indeks dimulai dari nol.'),
    order('Susun agar list dibuat, elemen terakhir disalin ke akhir, lalu akhir dicetak.', ['angka = [2, 4, 6]', 'akhir = angka[-1]', 'print(akhir)'], 'List harus ada sebelum diakses dan akhir harus ditetapkan sebelum dicetak.'),
    bug('Mengapa akses ini memunculkan IndexError?', 'angka = [10, 20, 30]\nprint(angka[3])', ['Indeks 3 berada di luar tiga elemen', 'List tidak boleh berisi angka', 'print tidak menerima elemen list', 'List harus dimulai dari 1'], 'a', 'Indeks positif yang valid hanya 0, 1, dan 2. Gunakan 2 untuk elemen terakhir.'),
    match('Pasangkan operasi pada a = [4, 6, 8] dengan hasilnya.', [['a[0]', '4'], ['a[-1]', '8'], ['len(a)', '3']], 'Indeks 0 memilih elemen pertama, -1 memilih terakhir, dan len menghitung elemen.'),
    logic('append menambah satu elemen di akhir. Apa outputnya?', 'angka = [1, 2]\nangka.append(3)\nprint(len(angka))', ['2\n', '6\n', '[1, 2, 3]\n', '3\n'], 'd', 'Setelah penambahan, list memiliki tiga elemen. Yang dicetak adalah panjangnya.', '3\n'),
    output('for dapat menelusuri nilai list secara langsung. Apa totalnya?', 'angka = [2, 4, 6]\ntotal = 0\nfor nilai in angka:\n    total += nilai\nprint(total)', ['6\n', '12\n', '3\n', '246\n'], 'b', 'Ketiga nilai dijumlahkan: 2 + 4 + 6 = 12.', '12\n'),
    fill('Isi nama metode untuk menambah satu nilai ke akhir list.', 'angka = [1, 2]\nangka.___(3)\nprint(angka)', ['append'], 'append menambahkan argumennya sebagai satu elemen terakhir pada list asal.'),
    logic('Tantangan: hitung banyak nilai genap. Apa outputnya?', 'angka = [3, 8, 2, 7, 4]\nbanyak = 0\nfor nilai in angka:\n    if nilai % 2 == 0:\n        banyak += 1\nprint(banyak)', ['5\n', '14\n', '3\n', '2\n'], 'c', 'Nilai genap adalah 8, 2, dan 4. Ada tiga nilai, bukan jumlah ketiganya.', '3\n'),
  ]),
  'py-list-lanjutan': topic('py-list-lanjutan', [
    choice('Elemen mana yang diambil oleh a[1:3]?', ['Indeks 1 dan 2', 'Indeks 1, 2, dan 3', 'Indeks 0 dan 1', 'Hanya indeks 3'], 'a', 'Slice menyertakan batas awal dan mengecualikan batas akhir.'),
    output('Apa hasil slice dengan langkah dua?', 'angka = [0, 1, 2, 3, 4]\nprint(angka[::2])', ['[1, 3]\n', '[0, 1, 2]\n', '[4, 2, 0]\n', '[0, 2, 4]\n'], 'd', 'Mulai dari indeks 0, langkah dua mengunjungi indeks 0, 2, dan 4.', '[0, 2, 4]\n'),
    fill('Isi indeks kolom positif untuk mengambil nilai 6 dari baris pertama.', 'm = [[2, 4, 6], [8, 10, 12]]\nprint(m[0][___])', ['2'], 'Baris pertama berindeks 0 dan kolom ketiga berindeks 2.'),
    order('Susun matriks, salin elemen pojok kanan bawah ke pojok, hitung hasil darinya, lalu cetak hasil.', ['m = [[1, 2], [3, 4]]', 'pojok = m[1][1]', 'hasil = pojok * 2', 'print(hasil)'], 'Setiap baris memakai nilai yang ditetapkan baris sebelumnya. Pojok bernilai 4 sehingga hasilnya 8.'),
    bug('Mengapa akses kolom ini gagal?', 'm = [[1, 2], [3, 4]]\nprint(m[1][2])', ['Baris 1 tidak ada', 'Kolom indeks 2 tidak ada pada baris kedua', 'List bersarang tidak boleh dicetak', 'Indeks harus berupa teks'], 'b', 'm[1] memiliki dua elemen dengan indeks kolom 0 dan 1. Untuk nilai 4 gunakan m[1][1].'),
    match('Pasangkan ekspresi dengan kegunaannya.', [['a[:]', 'Salinan dangkal list'], ['a[::-1]', 'Urutan elemen terbalik'], ['m[1][0]', 'Elemen pertama dari baris kedua']], 'Slicing membuat list luar baru. Dua indeks berturut-turut memilih baris lalu elemen.'),
    logic('Salinan dangkal memisahkan list luar yang berisi angka. Apa outputnya?', 'a = [1, 2, 3]\nb = a[:]\nb[0] = 9\nprint(a[0], b[0])', ['9 9\n', '1 1\n', '1 9\n', '9 1\n'], 'c', 'b adalah list baru. Mengganti satu elemen b tidak mengganti elemen a.', '1 9\n'),
    output('Baris dapat berbeda panjang. Apa total semua elemennya?', 'm = [[1, 2], [3]]\ntotal = 0\nfor baris in m:\n    for nilai in baris:\n        total += nilai\nprint(total)', ['6\n', '3\n', '2\n', '123\n'], 'a', 'Loop luar memilih baris dan loop dalam menelusuri nilai yang ada. Total 1 + 2 + 3 adalah 6.', '6\n'),
    fill('Isi langkah slice untuk membalik seluruh list.', 'angka = [1, 2, 3]\nprint(angka[::___])', ['-1'], 'Langkah -1 bergerak mundur dari akhir list menuju awal.'),
    logic('Tantangan: salinan dangkal masih berbagi list di dalamnya. Apa outputnya?', 'a = [[1, 2], [3, 4]]\nb = a[:]\nb[0][1] = 9\nprint(a[0][1])', ['2\n', '1\n', '4\n', '9\n'], 'd', 'a dan b memiliki list luar berbeda tetapi masih merujuk baris yang sama. Mengubah elemen dalam baris bersama terlihat melalui a.', '9\n'),
  ]),
};

const exercises = new Map(Object.values(exercisesByTopic).flat().map(e => [e.id, e]));
export const exercisesForTopic = id => Object.hasOwn(exercisesByTopic, id) ? exercisesByTopic[id] : [];
export const exerciseById = id => exercises.get(id);
