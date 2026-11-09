const card = (id, kind, question, answer, explanation, code = '') => ({ id, kind, question, answer, explanation, code });

export const topics = [
  { id: 'py-mulai', title: 'Mulai dengan Python', description: 'Jalankan perintah, cetak teks, dan tulis komentar.', symbol: '>>>', cards: [
    card('py-mulai-c1', 'Konsep', 'Bagaimana Python menjalankan perintah sederhana?', 'Dari atas ke bawah.', 'Python menjalankan pernyataan berurutan. Contoh pada kursus ini memakai Python 3.'),
    card('py-mulai-c2', 'Konsep', 'Apa fungsi print()?', 'Menampilkan nilai ke layar.', 'Secara bawaan print menambahkan satu baris baru setelah nilai.', 'print("Halo")'),
    card('py-mulai-c3', 'Tebak output', 'Apa output dua perintah ini?', 'Pagi lalu Sore pada baris berikutnya.', 'Setiap print menambahkan baris baru.', 'print("Pagi")\nprint("Sore")'),
    card('py-mulai-c4', 'Konsep', 'Untuk apa tanda #?', 'Memulai komentar sampai akhir baris.', 'Komentar membantu pembaca dan tidak dijalankan.', '# Catatan untuk pembaca\nprint("Siap")'),
    card('py-mulai-c5', 'Cari kesalahan', 'Apa yang kurang agar teks ini dapat dicetak?', 'Tanda kutip penutup setelah Halo.', 'Teks harus dibatasi pasangan tanda kutip yang sesuai.', 'print("Halo)')
  ]},
  { id: 'py-variabel', title: 'Variabel & tipe data', description: 'Simpan nilai int, float, str, dan bool.', symbol: 'x =', cards: [
    card('py-variabel-c1', 'Konsep', 'Apa arti umur = 18?', 'Mengikat nama umur ke nilai 18.', 'Python tidak memerlukan deklarasi tipe di depan nama.', 'umur = 18'),
    card('py-variabel-c2', 'Konsep', 'Apa tipe 12, 3.5, "A", dan True?', 'int, float, str, dan bool.', 'int untuk bilangan bulat; float untuk pecahan; str untuk teks; bool untuk benar atau salah.'),
    card('py-variabel-c3', 'Tebak output', 'Apakah salinan ikut berubah?', 'Tidak; yang dicetak adalah 4.', 'Penugasan salinan = asal mengikat salinan ke nilai saat itu. Penugasan ulang asal tidak mengubah salinan.', 'asal = 4\nsalinan = asal\nasal = 9\nprint(salinan)'),
    card('py-variabel-c4', 'Konsep', 'Nama variabel mana yang valid: nilai_2 atau 2nilai?', 'nilai_2.', 'Nama tidak boleh dimulai angka. Python membedakan huruf besar dan kecil.'),
    card('py-variabel-c5', 'Konsep', 'Bagaimana mengetahui tipe nilai?', 'Dengan type().', 'type(3) menunjukkan kelas int. Gunakan tanda kutip jika ingin menyimpan teks angka.', 'print(type(3))')
  ]},
  { id: 'py-input', title: 'Input & konversi', description: 'Baca teks dan ubah menjadi angka.', symbol: 'input', cards: [
    card('py-input-c1', 'Konsep', 'Apa tipe hasil input()?', 'str, meskipun pengguna mengetik angka.', 'input membaca satu baris dan menghapus penanda akhir baris.', 'nama = input()\nprint(nama)'),
    card('py-input-c2', 'Konsep', 'Bagaimana mengubah teks "12" menjadi bilangan bulat?', 'int("12").', 'Konversi menghasilkan int jika teks mewakili bilangan bulat yang valid.', 'jumlah = int("12")'),
    card('py-input-c3', 'Konsep', 'Bagaimana mengubah teks "3.5" menjadi pecahan?', 'float("3.5").', 'Tanda desimal pada teks yang dikonversi Python adalah titik.'),
    card('py-input-c4', 'Konsep', 'Untuk apa str(12)?', 'Mengubah angka 12 menjadi teks "12".', 'str berguna saat nilai perlu diperlakukan sebagai teks.'),
    card('py-input-c5', 'Cari kesalahan', 'Mengapa int("dua") gagal?', 'Teks tersebut tidak mewakili bilangan bulat.', 'Konversi ini memunculkan ValueError. Masukkan teks angka yang valid.', 'int("dua")')
  ]},
  { id: 'py-operator', title: 'Operator', description: 'Hitung nilai dan bandingkan kondisi.', symbol: '//', cards: [
    card('py-operator-c1', 'Tebak output', 'Apa hasil 7 / 2 dan 7 // 2?', '3.5 dan 3.', '/ menghasilkan pembagian biasa; // membulatkan hasil ke bawah.', 'print(7 / 2)\nprint(7 // 2)'),
    card('py-operator-c2', 'Konsep', 'Apa arti % dan **?', '% menghitung sisa; ** menghitung pangkat.', '7 % 3 bernilai 1; 2 ** 3 bernilai 8.'),
    card('py-operator-c3', 'Konsep', 'Apa perbedaan = dan ==?', '= memberi nilai; == membandingkan.', 'Perbandingan menghasilkan bool True atau False.'),
    card('py-operator-c4', 'Tebak output', 'Berapa nilai 2 + 3 * 4?', '14.', 'Perkalian dihitung sebelum penjumlahan. Kurung dapat mengubah urutan.'),
    card('py-operator-c5', 'Konsep', 'Apa arti and, or, dan not?', 'Dan, atau, dan pembalikan kondisi.', 'and mensyaratkan kedua kondisi benar; or cukup salah satu; not membalik nilai kebenaran.')
  ]},
  { id: 'py-kondisi', title: 'Kondisi', description: 'Pilih cabang dengan if, elif, dan else.', symbol: 'if', cards: [
    card('py-kondisi-c1', 'Konsep', 'Kapan isi if dijalankan?', 'Ketika kondisinya benar.', 'Tanda titik dua memulai blok; indentasi menentukan baris yang termasuk blok.'),
    card('py-kondisi-c2', 'Konsep', 'Apa fungsi else?', 'Menangani kondisi ketika cabang sebelumnya tidak terpilih.', 'else tidak memakai kondisi tambahan.'),
    card('py-kondisi-c3', 'Konsep', 'Kapan elif diperiksa?', 'Jika kondisi sebelumnya dalam rantai salah.', 'Dalam satu rantai if/elif/else, hanya cabang pertama yang cocok dijalankan.'),
    card('py-kondisi-c4', 'Tebak output', 'Apa yang dicetak?', 'Lulus.', '80 >= 75 bernilai True sehingga isi if dijalankan.', 'nilai = 80\nif nilai >= 75:\n    print("Lulus")\nelse:\n    print("Ulangi")'),
    card('py-kondisi-c5', 'Cari kesalahan', 'Apa yang kurang pada baris if?', 'Titik dua setelah kondisi.', 'Gunakan if siap: lalu indentasi untuk isi blok.', 'siap = True\nif siap\n    print("Mulai")')
  ]},
  { id: 'py-perulangan', title: 'Perulangan', description: 'Ulangi pekerjaan dengan for, range, dan while.', symbol: 'for', cards: [
    card('py-perulangan-c1', 'Konsep', 'Apa nilai dari range(3) saat ditelusuri?', '0, 1, dan 2.', 'Batas akhir range tidak disertakan.', 'for i in range(3):\n    print(i)'),
    card('py-perulangan-c2', 'Konsep', 'Apa arti range(1, 6, 2)?', 'Mulai 1, berhenti sebelum 6, melangkah 2.', 'Nilai yang dihasilkan adalah 1, 3, dan 5.'),
    card('py-perulangan-c3', 'Konsep', 'Kapan while memeriksa kondisi?', 'Sebelum setiap putaran.', 'Isi tidak dijalankan jika kondisi sejak awal salah. Pastikan ada jalan menuju kondisi berhenti.'),
    card('py-perulangan-c4', 'Konsep', 'Apa bedanya break dan continue?', 'break menghentikan loop; continue melewati sisa putaran.', 'continue melanjutkan ke putaran berikutnya dari loop terdekat.'),
    card('py-perulangan-c5', 'Tebak output', 'Berapa total setelah loop ini?', '6.', 'total bertambah dengan 1, 2, lalu 3.', 'total = 0\nfor i in range(1, 4):\n    total += i\nprint(total)')
  ]},
  { id: 'py-list', title: 'List dasar', description: 'Akses, ubah, dan telusuri kumpulan nilai.', symbol: '[ ]', cards: [
    card('py-list-c1', 'Konsep', 'Apa indeks pertama sebuah list?', '0.', 'Pada tiga elemen, indeks positif valid adalah 0, 1, dan 2.'),
    card('py-list-c2', 'Tebak output', 'Apa arti indeks -1?', 'Mengambil elemen terakhir, yaitu 30.', 'Indeks negatif menghitung dari belakang.', 'angka = [10, 20, 30]\nprint(angka[-1])'),
    card('py-list-c3', 'Konsep', 'Bagaimana menambah satu elemen di akhir?', 'Dengan append().', 'append mengubah list asal.', 'angka = [1, 2]\nangka.append(3)'),
    card('py-list-c4', 'Konsep', 'Apa hasil len([4, 5, 6])?', '3.', 'len menghitung banyak elemen. for dapat langsung menelusuri nilai tiap elemen.'),
    card('py-list-c5', 'Cari kesalahan', 'Mengapa akses angka[3] gagal?', 'List ini hanya memiliki indeks 0 sampai 2.', 'Akses di luar batas menimbulkan IndexError.', 'angka = [10, 20, 30]\nprint(angka[3])')
  ]},
  { id: 'py-list-lanjutan', title: 'Slicing & list bersarang', description: 'Ambil potongan, salin list, dan akses baris-kolom.', symbol: '[:]', cards: [
    card('py-list-lanjutan-c1', 'Konsep', 'Apa arti a[1:3]?', 'Elemen indeks 1 sampai sebelum 3.', 'Batas akhir slice tidak disertakan. Slice di luar batas dipotong dengan aman.'),
    card('py-list-lanjutan-c2', 'Konsep', 'Apa arti a[::2] dan a[::-1]?', 'Ambil setiap dua elemen; ambil dalam urutan terbalik.', 'Bagian ketiga slice adalah langkah. Langkah negatif menelusuri ke belakang.'),
    card('py-list-lanjutan-c3', 'Konsep', 'Apa bedanya b = a dan b = a[:]? ', 'Yang pertama berbagi list; yang kedua membuat salinan dangkal.', 'Salinan dangkal memisahkan list luar, tetapi list dalam yang bersarang masih dapat dipakai bersama.'),
    card('py-list-lanjutan-c4', 'Tebak output', 'Apa hasil akses m[1][0]?', '3.', 'Indeks pertama memilih baris kedua; indeks berikutnya memilih elemen pertama.', 'm = [[1, 2], [3, 4]]\nprint(m[1][0])'),
    card('py-list-lanjutan-c5', 'Konsep', 'Bagaimana menelusuri semua nilai list bersarang?', 'Dengan loop luar untuk baris dan loop dalam untuk elemen.', 'Setiap baris dapat memiliki panjang berbeda; menelusuri elemennya langsung tetap aman.', 'm = [[1, 2], [3]]\nfor baris in m:\n    for nilai in baris:\n        print(nilai)')
  ]}
];
