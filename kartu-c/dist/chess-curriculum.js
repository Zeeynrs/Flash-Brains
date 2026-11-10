const unit=(id,title,description,notes)=>({id,title,description,symbol:'♟',cards:notes.map(([question,answer,explanation],i)=>({id:`${id}-ref-${i+1}`,kind:'Konsep',question,answer,explanation}))});

export const topics=[
  unit('ch-papan','Kenalan dengan papan','Kenali petak, koordinat, dan posisi awal bidak.',[
    ['Bagaimana cara membaca koordinat petak?','Huruf kolom, lalu angka baris: misalnya e4.','Kolom diberi huruf a sampai h. Baris diberi angka 1 sampai 8. Pada papan ini putih selalu berada di bawah.'],
    ['Sudut kanan bawah berwarna apa?','Terang.','Dengan putih di bawah, petak kanan bawah adalah h1 dan warnanya terang.'],
    ['Di mana raja dan menteri putih mulai?','Raja di e1, menteri di d1.','Raja hitam di e8 dan menteri hitam di d8. Menteri memulai di petak yang sesuai warna bidaknya.'],
    ['Berapa bidak awal tiap pemain?','16: delapan pion dan delapan bidak lainnya.','Selain pion ada satu raja, satu menteri, dua benteng, dua gajah, dan dua kuda.'],
    ['Siapa bergerak terlebih dahulu?','Putih, lalu pemain bergantian.','Satu giliran biasanya memindahkan satu bidak. Rokade adalah satu langkah khusus yang memindahkan raja dan benteng.'],
  ]),
  unit('ch-garis','Benteng dan gajah','Ikuti garis lurus, diagonal, dan jalur tangkapan.',[
    ['Bagaimana benteng bergerak?','Lurus pada kolom atau baris.','Benteng dapat menempuh beberapa petak selama tidak ada penghalang. Ia tidak bergerak diagonal.'],
    ['Bagaimana gajah bergerak?','Diagonal sejauh jalur kosong.','Perubahan kolom dan baris pada gerakan gajah harus sama besar. Gajah tidak bisa melompat.'],
    ['Bolehkah melompati bidak di jalur?','Benteng dan gajah tidak boleh melompat.','Bidak sendiri menghentikan jalur. Bidak lawan dapat ditangkap, tetapi tidak boleh dilewati.'],
    ['Bagaimana menangkap bidak?','Mendarat pada petak bidak lawan.','Bidak lawan diangkat dari papan. Kamu tidak boleh mendarat pada petak berisi bidak sendiri.'],
    ['Apakah gajah bisa berganti warna petak?','Tidak selama ia tetap menjadi gajah.','Gerakan diagonal membuat gajah selalu berada pada warna petak yang sama.'],
  ]),
  unit('ch-menteri-kuda','Menteri dan kuda','Gabungkan arah gerak dan kuasai lompatan kuda.',[
    ['Bagaimana menteri bergerak?','Lurus dan diagonal.','Menteri menggabungkan pola benteng dan gajah, tetapi tetap tidak bisa melompati bidak.'],
    ['Bagaimana pola L pada kuda?','Dua petak lurus dan satu petak menyamping.','Dari f3, misalnya, kuda dapat menuju e5 atau g5 jika petak tujuan sah.'],
    ['Bidak mana yang boleh melompati bidak lain?','Kuda.','Jalur antara asal dan tujuan tidak menghalangi kuda, tetapi ia tidak boleh mendarat di bidak sendiri.'],
    ['Bagaimana kuda menangkap?','Dengan pola L yang sama seperti geraknya.','Hanya bidak pada petak tujuan yang ditangkap. Bidak yang dilompati tetap berada di papan.'],
    ['Mengapa tetap harus melihat raja saat bergerak?','Setiap langkah harus menjaga raja sendiri tetap aman.','Gerakan yang sesuai pola bidak tetap tidak sah jika membuat rajamu terkena skak.'],
  ]),
  unit('ch-pion','Langkah pion','Maju, tangkap diagonal, dan pilih promosi.',[
    ['Ke mana pion bergerak?','Putih ke angka lebih besar; hitam ke angka lebih kecil.','Papan ini menempatkan putih di bawah. Pion tidak pernah bergerak mundur.'],
    ['Kapan pion boleh maju dua petak?','Dari baris awalnya, jika jalur kosong.','Putih dari baris 2 dan hitam dari baris 7. Kedua petak yang dilewati harus kosong.'],
    ['Bagaimana pion menangkap?','Satu petak diagonal ke depan.','Pion tidak menangkap lurus ke depan. Ia juga tidak boleh maju ke petak yang sedang terisi.'],
    ['Apa itu promosi?','Pion mencapai ujung papan dan diganti bidak lain.','Pilih menteri, benteng, gajah, atau kuda dengan warna yang sama. Promosi dapat terjadi sekaligus dengan tangkapan.'],
    ['Apakah promosi harus menjadi menteri?','Tidak; empat pilihan semuanya sah.','Promosi menjadi kuda, benteng, atau gajah disebut underpromotion. Kadang pilihan itu menghindari pat atau menciptakan ancaman khusus.'],
  ]),
  unit('ch-raja','Raja dan skak','Lindungi raja dan cari jalan keluar dari skak.',[
    ['Bagaimana raja bergerak?','Satu petak ke segala arah yang aman.','Raja tidak boleh pindah ke petak yang diserang lawan. Ia juga tidak boleh berdampingan dengan raja lawan.'],
    ['Apa itu skak?','Raja sedang diserang.','Pada giliran berikutnya pemain harus membuat raja aman; tidak boleh mengabaikan skak.'],
    ['Bagaimana cara menyelamatkan raja?','Pindah, tangkap penyerang, atau tutup jalurnya jika sah.','Serangan kuda atau pion tidak bisa ditutup dengan meletakkan bidak di tengah. Tidak semua pilihan tersedia di setiap posisi.'],
    ['Bolehkah raja menangkap?','Boleh bila petak akhirnya aman.','Jangan mengambil penyerang yang dilindungi bidak lain. Keamanan petak diuji setelah tangkapan.'],
    ['Bolehkah raja dibiarkan terbuka karena bidak pelindung pindah?','Tidak.','Bidak yang melindungi raja mungkin terikat atau pinned. Langkahnya dibatasi oleh keselamatan raja.'],
  ]),
  unit('ch-khusus','Langkah khusus','Pelajari rokade dan kesempatan en passant.',[
    ['Apa itu rokade?','Satu langkah bersama raja dan benteng.','Raja bergerak dua petak ke arah benteng, lalu benteng ke petak tepat di sisi lain raja. Klik raja dan tujuan rokadenya pada papan.'],
    ['Apa syarat dasar rokade?','Raja dan benteng terkait belum pernah bergerak, jalur kosong, dan raja aman.','Raja tidak boleh sedang skak, melintasi petak yang diserang, atau berakhir di petak yang diserang.'],
    ['Apakah benteng yang pernah bergerak boleh dipakai rokade?','Tidak, meskipun sudah kembali ke petak awal.','Hak rokade dengan benteng itu sudah hilang. Hak juga hilang ketika raja pernah bergerak.'],
    ['Apa itu en passant?','Tangkapan pion terhadap pion lawan yang baru maju dua petak di sebelahnya.','Pion menangkap diagonal ke petak yang dilewati lawan. Pion lawan diangkat dari petak akhirnya, bukan petak tujuan penangkap.'],
    ['Berapa lama kesempatan en passant berlaku?','Hanya langsung pada giliran berikutnya.','Jika pemain memilih langkah lain, kesempatan itu hilang. En passant tetap harus menjaga raja sendiri aman.'],
  ]),
  unit('ch-taktik','Taktik sederhana','Temukan tangkapan dan serangan ganda.',[
    ['Apa yang dimaksud bidak tidak terlindungi?','Bidak yang tidak dijaga bidak lain dari pihaknya.','Bidak seperti ini dapat menjadi sasaran. Tetap periksa jalur dan ancaman lawan sebelum menangkap.'],
    ['Apakah bidak kecil dapat menangkap menteri?','Ya, jika gerakan tangkapannya sah.','Nilai perkiraan bidak tidak membatasi tangkapan: pion dan kuda juga bisa mengambil menteri.'],
    ['Apa itu garpu?','Satu bidak menyerang dua atau lebih sasaran.','Kuda sering membuat garpu dengan pola L. Jika salah satu sasarannya raja, lawan harus mengatasi skak terlebih dahulu.'],
    ['Mengapa skak berguna dalam taktik?','Skak memaksa lawan menyelamatkan rajanya.','Ancaman lain bisa muncul bersamaan, tetapi skak saja belum tentu merupakan langkah terbaik atau menghasilkan mat.'],
    ['Apa urutan pemeriksaan sebelum bergerak?','Keamanan raja, jalur sah, target, lalu balasan lawan.','Puzzle memberi tujuan yang jelas. Di permainan sungguhan, periksa semua ancaman sebelum memutuskan.'],
  ]),
  unit('ch-mat','Skakmat satu langkah','Tutup jalan lari raja dan bedakan mat dari pat.',[
    ['Apa syarat skakmat?','Raja sedang skak dan tidak ada langkah sah untuk keluar.','Permainan berakhir saat mat. Raja tidak ditangkap atau diangkat dari papan.'],
    ['Apa itu pat?','Tidak ada langkah sah, tetapi raja tidak sedang skak.','Pat disebut juga stalemate dan hasilnya seri. Ini berbeda dari skakmat.'],
    ['Bagaimana memastikan suatu langkah benar-benar mat?','Periksa lari raja, tangkapan penyerang, dan penutupan jalur.','Jika masih ada salah satu balasan yang sah, posisi itu belum mat.'],
    ['Mengapa menteri perlu dilindungi saat mendekati raja?','Agar raja lawan tidak dapat menangkapnya dengan aman.','Raja sendiri atau bidak lain dapat melindungi menteri. Tetap hindari meninggalkan petak lari.'],
    ['Apakah satu puzzle boleh mempunyai beberapa jawaban mat?','Ya, semua langkah sah yang menghasilkan mat diterima.','Penjelasan menampilkan satu contoh. Pemeriksa juga menerima mat alternatif yang memenuhi tujuan puzzle.'],
  ]),
];
