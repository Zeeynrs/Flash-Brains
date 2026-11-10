import {Chess} from './chess-engine.js';

// Original small positions: uppercase pieces are white, lowercase pieces black.
const P=(pieces,turn='w',rights='-',ep='-')=> {
  const squares=Object.fromEntries(pieces.split(' ').map(piece=>[piece.slice(1),piece[0]]));
  const rows=[];
  for(let rank=8;rank>=1;rank--) {
    let row='',empty=0;
    for(const file of 'abcdefgh') {const piece=squares[file+rank];if(piece){if(empty)row+=empty;empty=0;row+=piece;}else empty++;}
    if(empty) row+=empty;rows.push(row);
  }
  return rows.join('/')+` ${turn} ${rights} ${ep} 0 1`;
};
const START=new Chess().fen();
const sequence=moves=>{const game=new Chess();moves.forEach(move=>game.move(move));return game.fen();};
const choice=(prompt,texts,answer,explanation,position)=>({type:'choice',prompt,options:texts.map((text,i)=>({id:'abcd'[i],text})),answer,explanation,...(position?{position}:{})});
const square=(prompt,answer,explanation,position=START,hint='Lihat huruf kolom di bawah papan dan angka baris di sebelah kiri.')=>({type:'chess',mode:'square',position,prompt,answer,explanation,hint});
const move=(prompt,position,answer,explanation,hint='Pilih bidakmu untuk melihat tujuan yang sah.',extra={})=>({type:'chess',mode:'move',position,prompt,answer,explanation,hint,...extra});
const unit=(id,items)=>items.map((item,i)=>({...item,id:`${id}-${String(i+1).padStart(2,'0')}`,...(i===9?{challenge:true}:{})}));
const EP=sequence(['e4','a6','e5','d5']);
const EP_EXPIRED=sequence(['e4','a6','e5','d5','Nf3','Nf6']);
const MATE=P('Kg6 kh8 Qf7');

export const exercisesByTopic={
  'ch-papan':unit('ch-papan',[
    square('Selamat datang! Pilih petak a1, sudut kiri bawah papan.', 'a1','Petak a1 berada di pertemuan kolom a dan baris 1. Dari sisi putih, petak ini di sudut kiri bawah.'),
    choice('Berapa jumlah petak pada satu papan catur?', ['32 petak','64 petak','48 petak','100 petak'],'b','Papan terdiri dari 8 kolom dan 8 baris, sehingga jumlah petaknya 8 × 8 = 64.'),
    square('Pilih petak e1, tempat awal raja putih.', 'e1','Raja putih memulai permainan di e1. Pilih kolom e, lalu baris 1.'),
    square('Pilih petak d1, tempat awal menteri putih.', 'd1','Menteri putih mulai di d1. Menteri berada di petak yang warnanya sama dengan bidaknya.'),
    choice('Dari sisi putih, warna petak sudut kanan bawah adalah apa?', ['Gelap','Bisa dipilih pemain','Terang','Selalu merah'],'c','Petak kanan bawah harus terang. Dengan putih di bawah, petak itu adalah h1.'),
    square('Temukan benteng hitam di sudut kanan atas: pilih h8.', 'h8','Benteng hitam berada di a8 dan h8 pada posisi awal. h8 adalah sudut kanan atas dari sisi putih.'),
    choice('Siapa yang mendapat giliran pertama dalam permainan catur?', ['Putih','Hitam','Pemain yang punya menteri','Keduanya bersamaan'],'a','Putih selalu bergerak lebih dahulu, kemudian pemain bergantian satu langkah setiap giliran.'),
    square('Pilih petak d4 di bagian tengah papan.', 'd4','Huruf menunjukkan kolom, angka menunjukkan baris. d4 adalah salah satu dari empat petak pusat.'),
    choice('Berapa banyak bidak yang dimiliki tiap pemain pada awal permainan?', ['8','12','16','20'],'c','Tiap pemain mulai dengan 8 pion dan 8 bidak lain: raja, menteri, 2 benteng, 2 gajah, dan 2 kuda.'),
    square('Tantangan: temukan kuda putih yang mulai di g1.', 'g1','Kuda putih mulai di b1 dan g1. Bentuk kudanya berbeda dari bidak-bidak lain.'),
  ]),
  'ch-garis':unit('ch-garis',[
    move('Pindahkan benteng a1 lurus ke a4.',P('Kh1 kh8 Ra1'),'a1a4','Benteng bergerak lurus pada kolom atau baris selama jalurnya kosong.'),
    choice('Bagaimana arah gerakan gajah?', ['Lurus saja','Diagonal saja','Berbentuk L','Satu petak ke segala arah'],'b','Gajah bergerak diagonal dan selalu berada pada petak dengan warna yang sama.'),
    move('Gerakkan gajah c1 secara diagonal ke f4.',P('Kh1 kh8 Bc1'),'c1f4','Jalur c1–d2–e3–f4 adalah diagonal yang kosong, sehingga gajah boleh menuju f4.'),
    move('Tangkap pion hitam di a5 dengan benteng a1.',P('Kh1 kh8 Ra1 pa5'),'a1a5','Benteng menangkap dengan mendarat di petak lawan. Ia tidak boleh melompati bidak di jalurnya.'),
    choice('Benteng a1 terhalang pion putih a2. Bolehkah langsung ke a4?', ['Boleh karena satu kolom','Boleh asal tidak menangkap','Tidak, jalurnya terhalang','Hanya pada giliran pertama'],'c','Benteng tidak bisa melompati bidak sendiri maupun lawan. Pion a2 menutup jalan benteng di kolom a.',P('Kh1 kh8 Ra1 Pa2')),
    move('Tangkap kuda hitam di g5 dengan gajah c1.',P('Kh1 kh8 Bc1 ng5'),'c1g5','c1 dan g5 berada pada diagonal yang sama. Petak d2, e3, dan f4 kosong.'),
    move('Pindahkan benteng d4 ke kiri, menuju a4.',P('Kh1 kh8 Rd4'),'d4a4','Benteng dapat bergerak ke kiri, kanan, atas, atau bawah. Langkah ini tetap berada pada baris 4.'),
    choice('Gajah yang mulai di petak terang dapat pindah ke petak gelap?', ['Ya, setiap dua langkah','Ya, saat menangkap','Tidak, selalu tetap pada warna yang sama','Ya, dengan melompati pion'],'c','Gerakan diagonal membuat gajah selalu berada pada warna petak yang sama selama permainan.'),
    move('Pindahkan gajah f4 ke petak c7.',P('Kh1 kh8 Bf4'),'f4c7','Dari f4, gajah melewati e5 dan d6 sebelum sampai ke c7, semuanya pada satu diagonal.'),
    move('Tantangan: benteng d1 harus menangkap menteri hitam di d6.',P('Kh1 kh8 Rd1 qd6'),'d1d6','Benteng dapat menangkap menteri di d6 karena jalur kolom d kosong. Nilai bidak tidak mengubah aturan gerak.'),
  ]),
  'ch-menteri-kuda':unit('ch-menteri-kuda',[
    choice('Arah gerakan menteri menggabungkan kemampuan bidak apa?', ['Raja dan pion','Benteng dan gajah','Kuda dan pion','Dua kuda'],'b','Menteri dapat bergerak lurus seperti benteng dan diagonal seperti gajah, tetapi tidak melompati bidak.'),
    move('Gerakkan menteri d1 diagonal menuju h5.',P('Kh1 ka8 Qd1'),'d1h5','Menteri boleh bergerak diagonal melalui e2, f3, dan g4 untuk sampai ke h5.'),
    move('Gerakkan menteri d4 lurus ke d7.',P('Kh1 ka8 Qd4'),'d4d7','Seperti benteng, menteri dapat bergerak beberapa petak lurus selama jalurnya kosong.'),
    choice('Pola gerakan kuda yang benar adalah bagaimana?', ['Dua petak lurus lalu satu menyamping','Tiga petak diagonal','Satu petak ke segala arah','Selalu lurus sampai tepi'],'a','Kuda bergerak membentuk L: dua petak pada satu arah dan satu petak tegak lurus.'),
    move('Lompatkan kuda g1 ke f3 dari posisi awal.',START,'g1f3','Kuda boleh melompati bidak lain, termasuk barisan pion sendiri, untuk mendarat di f3.'),
    move('Kuda b1 dapat melompati pion. Pindahkan ke c3.',START,'b1c3','Kuda dari b1 menuju c3 dengan gerak L. Bidak di antara asal dan tujuan tidak menghalanginya.'),
    choice('Apakah kuda boleh mendarat di petak yang ditempati bidak sendiri?', ['Boleh, karena bisa melompat','Tidak boleh','Hanya di tengah papan','Hanya saat membuka permainan'],'b','Kuda boleh melompati bidak, tetapi tujuan akhirnya tidak boleh ditempati bidak dengan warna yang sama.'),
    move('Tangkap benteng hitam di e5 dengan kuda f3.',P('Kh1 ka8 Nf3 re5'),'f3e5','Dari f3 ke e5 merupakan satu kolom dan dua baris. Kuda menangkap bidak pada petak tujuan.'),
    move('Tangkap gajah hitam di b4 dengan menteri d4.',P('Kh1 kh7 Qd4 bb4'),'d4b4','Menteri dapat menangkap di satu baris seperti benteng. Jalur d4–c4–b4 kosong sebelum target.'),
    move('Tantangan: tangkap menteri hitam di d5 dengan kuda c3.',P('Kh1 kh8 Nc3 qd5'),'c3d5','Kuda c3 menuju d5 dengan pola L dan menangkap menteri. Kuda tidak bergantung pada jalur lurus.'),
  ]),
  'ch-pion':unit('ch-pion',[
    move('Majukan pion putih e2 satu petak ke e3.',START,'e2e3','Pion putih bergerak menuju angka baris yang lebih besar. Dari e2, satu langkah maju adalah e3.'),
    move('Dari posisi awal, majukan pion d2 dua petak ke d4.',START,'d2d4','Pion boleh maju dua petak dari posisi awalnya bila kedua petak di depannya kosong.'),
    choice('Bagaimana pion putih menangkap bidak lawan?', ['Lurus ke depan','Satu petak diagonal ke depan','Ke samping','Diagonal ke belakang'],'b','Pion bergerak lurus tetapi menangkap satu petak secara diagonal ke depan.'),
    move('Tangkap pion hitam d5 dengan pion putih e4.',P('Kh1 kh8 Pe4 pd5'),'e4d5','Pion putih e4 menangkap ke d5 secara diagonal. Ia tidak menangkap lurus ke e5.'),
    move('Tangkap kuda hitam f5 dengan pion e4.',P('Kh1 kh8 Pe4 nf5'),'e4f5','Dari e4, pion putih dapat menangkap bidak lawan di d5 atau f5 bila tersedia.'),
    choice('Pion putih e4 dihalangi pion hitam e5. Bolehkah menangkap lurus?', ['Boleh','Tidak boleh','Boleh jika menuju promosi','Hanya jika pion lawan belum bergerak'],'b','Pion tidak dapat bergerak atau menangkap lurus ke petak yang terisi. Untuk menangkap harus diagonal.',P('Kh1 kh8 Pe4 pe5')),
    move('Pion hitam juga punya arah maju. Gerakkan d7 ke d5.',P('Kh1 kh8 pd7','b'),'d7d5','Pion hitam maju menuju angka yang lebih kecil. Dari d7, langkah awal dua petak menuju d5 sah.','Lihat label giliran: sekarang hitam yang bergerak.'),
    move('Promosikan pion a7 menjadi menteri di a8.',P('Ke1 ke8 Pa7'),'a7a8q','Pion yang mencapai baris terakhir harus segera menjadi menteri, benteng, gajah, atau kuda. Pilih menteri.','Setelah memilih a8, pilih Menteri pada pilihan promosi.'),
    move('Latihan promosi lain: jadikan pion b7 sebagai kuda di b8.',P('Ke1 ke8 Pb7'),'b7b8n','Promosi tidak wajib menjadi menteri. Kuda juga merupakan pilihan sah yang kadang berguna.','Pilih tujuan b8, lalu pilih Kuda.'),
    move('Tantangan: tangkap benteng h8 dan promosikan pion g7 menjadi menteri.',P('Ke1 ka8 Pg7 rh8'),'g7h8q','Pion dapat menangkap diagonal pada langkah promosi. Setelah g7×h8, pilih menteri.'),
  ]),
  'ch-raja':unit('ch-raja',[
    choice('Berapa jauh raja dapat bergerak dalam langkah biasa?', ['Sepanjang satu baris','Dua petak diagonal','Satu petak ke segala arah','Seperti huruf L'],'c','Raja bergerak satu petak ke segala arah, asalkan tujuan tidak diserang lawan.'),
    move('Pindahkan raja putih e1 ke f2 yang aman.',P('Ke1 ke8'),'e1f2','Raja boleh bergerak satu petak diagonal. f2 tidak diserang lawan pada posisi ini.'),
    choice('Apa artinya raja sedang terkena skak?', ['Raja menyerang menteri','Raja sedang diserang bidak lawan','Permainan pasti langsung seri','Pion mencapai ujung papan'],'b','Skak berarti raja sedang diserang. Pemain harus menghilangkan serangan itu pada langkah berikutnya.'),
    move('Raja e1 terkena skak benteng e8. Pindahkan raja ke d1.',P('Ke1 ka8 re8'),'e1d1','Dengan meninggalkan kolom e menuju d1, raja keluar dari serangan benteng e8.'),
    move('Raja e1 sedang skak. Tutup jalurnya dengan benteng a2 ke e2.',P('Ke1 kh8 re8 Ra2'),'a2e2','Menutup jalur serangan merupakan salah satu cara mengatasi skak dari benteng, gajah, atau menteri.'),
    move('Tangkap benteng hitam di e2 dengan raja e1.',P('Ke1 ka8 re2'),'e1e2','Raja boleh menangkap penyerang bila petak akhirnya aman. Benteng e2 tidak dilindungi bidak hitam lain.'),
    choice('Bolehkah dua raja berdiri di petak yang saling bersebelahan?', ['Boleh jika tidak ada menteri','Boleh hanya di tepi','Tidak boleh','Boleh pada akhir permainan'],'c','Kedua raja saling menyerang petak di sekelilingnya, sehingga mereka tidak boleh berdampingan.'),
    move('Raja e1 diserang benteng e8. Pilih petak aman f1.',P('Ke1 ka8 re8'),'e1f1','f1 aman karena benteng e8 menyerang kolom e. Raja tidak boleh tetap berada di jalur skak.'),
    choice('Manakah cara yang bisa mengatasi skak?', ['Mengabaikannya lalu menyerang menteri','Memindahkan raja, menangkap penyerang, atau menutup jalurnya jika sah','Selalu menukar dua pion','Mengambil raja lawan'],'b','Skak harus diatasi dengan langkah sah yang membuat raja aman. Tidak semua posisi memungkinkan semua pilihan ini.'),
    move('Tantangan: benteng e2 melindungi raja. Tangkap penyerang e8 dengan benteng itu.',P('Ke1 ka8 re8 Re2'),'e2e8','Benteng e2 menutup jalur menuju raja putih. Menangkap benteng e8 tetap sah dan menghilangkan ancaman di kolom e.'),
  ]),
  'ch-khusus':unit('ch-khusus',[
    choice('Pada rokade, dua bidak apa yang bergerak?', ['Raja dan benteng','Menteri dan gajah','Dua pion','Kuda dan benteng'],'a','Rokade adalah satu langkah khusus yang memindahkan raja dua petak ke arah benteng dan memindahkan benteng ke sebelahnya.'),
    move('Lakukan rokade pendek putih: pindahkan raja e1 ke g1.',P('Ke1 ke8 Rh1','w','K'),'e1g1','Raja berpindah e1–g1 dan benteng h1–f1. Kedua bidak belum pernah bergerak dan petak yang dilalui raja aman.'),
    choice('Bolehkah rokade dilakukan saat raja sedang terkena skak?', ['Boleh','Tidak boleh','Hanya rokade panjang','Hanya jika benteng menyerang lawan'],'b','Raja tidak boleh rokade ketika sedang skak, melalui petak yang diserang, atau berakhir pada petak yang diserang.'),
    move('Lakukan rokade panjang putih: raja e1 menuju c1.',P('Ke1 ke8 Ra1','w','Q'),'e1c1','Pada rokade panjang, raja menuju c1 dan benteng a1 menuju d1. Jalur harus kosong dan petak raja aman.'),
    choice('Raja sudah pernah bergerak lalu kembali ke e1. Masih boleh rokade?', ['Boleh jika kembali ke e1','Tidak boleh','Boleh jika belum ada tangkapan','Boleh jika menteri sudah ditukar'],'b','Hak rokade hilang setelah raja pernah bergerak. Mengembalikannya ke posisi awal tidak memulihkan hak itu.'),
    move('Pion hitam baru maju d7–d5. Tangkap en passant dengan pion e5.',EP,'e5d6','Pion e5 menangkap ke d6 dan pion hitam d5 diangkat dari papan. Hak ini hanya berlaku langsung setelah langkah dua petak tersebut.','Pilih pion e5, lalu petak kosong d6.'),
    choice('Kapan kesempatan menangkap en passant berlaku?', ['Kapan saja sebelum pion promosi','Hanya langsung sesudah pion lawan maju dua petak di sebelahnya','Setiap pion berada di baris ketiga','Hanya saat raja skak'],'b','En passant harus dilakukan segera pada giliran setelah pion lawan maju dua petak. Jika memilih langkah lain, kesempatan itu hilang.'),
    move('Putih baru maju e2–e4. Hitam menangkap en passant dari d4 ke e3.',sequence(['a3','d5','a4','d4','e4']),'d4e3','Pion hitam d4 menangkap pion putih yang baru maju dua petak. Ia mendarat di e3, sesuai arah maju hitam.'),
    choice('Setelah e4 a6 e5 d5, putih memilih Nf3 dan hitam Nf6. Masih bisa e5×d6 en passant?', ['Bisa, petaknya tetap kosong','Tidak, kesempatan sudah lewat','Bisa jika raja aman','Hanya bisa dengan menteri'],'b','Putih melewatkan giliran en passant dengan memainkan Nf3. Hak menangkap en passant tidak bisa disimpan untuk giliran lain.',EP_EXPIRED),
    move('Tantangan: lakukan rokade pendek hitam, raja e8 ke g8.',P('Ke1 ke8 rh8','b','k'),'e8g8','Aturan rokade sama untuk hitam. Raja menuju g8 dan benteng h8 menuju f8 dalam satu langkah.'),
  ]),
  'ch-taktik':unit('ch-taktik',[
    choice('Apa yang dimaksud bidak yang tidak terlindungi?', ['Bidak yang baru bergerak','Bidak yang tidak dijaga bidak lain dari pihaknya','Raja yang sudah rokade','Semua pion'],'b','Bidak yang tidak dijaga bisa menjadi sasaran tangkapan. Tetap periksa apakah penangkapmu aman sesudahnya.'),
    move('Tangkap menteri hitam yang tidak dijaga di a5 dengan benteng a1.',P('Kh1 kh8 Ra1 qa5'),'a1a5','Benteng menangkap menteri di kolom a. Pada posisi ini jalurnya kosong dan menteri tidak dijaga.'),
    move('Tangkap benteng hitam g5 menggunakan gajah c1.',P('Kh1 kh8 Bc1 rg5'),'c1g5','Lihat jalur diagonal c1–d2–e3–f4–g5. Gajah bisa mengambil benteng di ujung jalur itu.'),
    choice('Apa itu garpu atau serangan ganda?', ['Dua raja bergerak bersamaan','Satu bidak menyerang dua sasaran sekaligus','Menukar dua pion sendiri','Selalu skakmat'],'b','Serangan ganda memberi dua ancaman dalam satu langkah. Kuda sering membuat garpu karena pola geraknya.'),
    move('Buat garpu: kuda c3 ke d5 agar menyerang raja e7 dan benteng f6.',P('Kh1 ke7 Nc3 rf6'),'c3d5','Kuda d5 menyerang e7 dan f6 sekaligus. Raja harus mengatasi skak, sementara benteng ikut menjadi sasaran.','Kuda di d5 dapat menyerang e7 dan f6.'),
    move('Tangkap menteri hitam d5 dengan pion putih e4.',P('Kh1 kh8 Pe4 qd5'),'e4d5','Bidak bernilai kecil juga dapat menangkap menteri. Aturan tangkapan pion tetap satu petak diagonal ke depan.'),
    choice('Sebelum menangkap bidak, apa yang sebaiknya diperiksa?', ['Hanya bentuk bidaknya','Apakah langkah sah dan apakah ada ancaman balasan','Hanya warna petaknya','Jumlah langkah sejak awal'],'b','Periksa keselamatan rajamu, jalur gerak, dan penjagaan target sebelum melakukan tangkapan.'),
    move('Tangkap benteng hitam e5 dengan kuda f3.',P('Kh1 kh8 Nf3 re5'),'f3e5','Kuda menyerang e5 dari f3. Target di e5 dapat ditangkap tanpa membuka serangan kepada raja putih.'),
    move('Tangkap gajah hitam b4 memakai menteri d4.',P('Kh1 kh7 Qd4 bb4'),'d4b4','Menteri dapat menangkap di baris yang sama. Selalu pastikan tidak ada penghalang pada c4.'),
    move('Tantangan: buat garpu kuda e4–f6 pada raja h7 dan benteng d7.',P('Kh1 kh7 Ne4 rd7'),'e4f6','Dari f6, kuda menyerang raja h7 dan benteng d7. Ini adalah garpu yang juga memberi skak.'),
  ]),
  'ch-mat':unit('ch-mat',[
    choice('Apa yang membedakan skakmat dari skak biasa?', ['Raja diserang dan tidak ada langkah sah untuk menyelamatkannya','Menteri sedang diserang','Pemain kehilangan dua benteng','Raja selalu harus ditangkap'],'a','Skakmat terjadi ketika raja sedang skak dan tidak ada langkah sah untuk keluar dari skak. Raja tidak perlu dan tidak boleh ditangkap.'),
    move('Berikan skakmat dalam satu langkah dengan menteri putih.',MATE,'f7g7','Menteri di g7 memberi skak dan menutup petak lari. Raja putih g6 melindungi menteri. Langkah lain yang benar-benar mat juga diterima.','Dekatkan menteri ke raja hitam tanpa meninggalkannya tidak terlindungi.',{goal:'mate'}),
    choice('Raja tidak sedang skak, tetapi pemain tidak punya langkah sah. Apa hasilnya?', ['Skakmat','Pat: permainan seri','Pemain boleh melewatkan giliran','Pemain otomatis menang'],'b','Pat atau stalemate adalah posisi tanpa langkah sah saat raja tidak sedang skak. Hasilnya seri, bukan skakmat.'),
    move('Cari skakmat satu langkah. Menteri ada di g6 dan raja putih di f6.',P('Kf6 kh8 Qg6'),'g6g7','Qg7 menutup g8 dan h7, memberi skak pada h8, dan dilindungi raja f6.', 'Perhatikan petak g7 yang dijaga raja putih.',{goal:'mate'}),
    move('Pola cermin: raja hitam a8. Berikan skakmat satu langkah.',P('Kc6 ka8 Qb6'),'b6b7','Qb7 memberi skak, menguasai a7 dan b8, serta dilindungi raja c6.', 'Menteri dapat mendekat ke b7 dengan dukungan raja.',{goal:'mate'}),
    choice('Jika suatu langkah membuat pat ketika kamu diminta skakmat, apakah puzzle selesai?', ['Ya, keduanya sama','Tidak, pat berarti seri dan raja tidak sedang skak','Ya jika punya menteri','Hanya jika lawan punya pion'],'b','Puzzle skakmat membutuhkan raja lawan berada dalam skak tanpa jalan keluar. Pat tidak memenuhi syarat itu.'),
    move('Berikan mat di baris belakang: benteng a1 menuju a8.',P('Kg1 kg8 Ra1 pf7 pg7 ph7'),'a1a8','Benteng di a8 menyerang raja g8 di sepanjang baris 8. Pion hitam sendiri menutup petak lari pada baris 7.', 'Pion di f7, g7, h7 membatasi raja hitam.',{goal:'mate'}),
    move('Hitam juga bisa mat: pilih langkah menteri untuk mematikan raja putih a1.',P('Ka1 kc3 qb3','b'),'b3b2','Qb2 memberi skak pada a1, menguasai petak lari, dan dilindungi raja hitam c3.', 'Lihat petak b2 yang dilindungi raja hitam.',{goal:'mate'}),
    choice('Saat mencari mat satu langkah, apa yang harus dipastikan?', ['Hanya memberi skak','Langkah sah, raja lawan skak, dan semua balasan sah gagal menyelamatkannya','Menteri selalu bergerak','Semua bidak lawan sudah habis'],'b','Periksa semua jawaban lawan: lari, menangkap penyerang, atau menutup serangan. Jika salah satu sah, posisi belum mat.'),
    move('Tantangan akhir: berikan skakmat satu langkah. Semua langkah mat yang sah diterima.',MATE,'f7h7','Qh7 adalah salah satu jawaban: menteri dilindungi raja g6 dan menutup semua petak lari. Pemeriksaan menerima setiap langkah sah yang benar-benar menghasilkan mat.', 'Raja g6 menjaga petak di sekelilingnya, termasuk h7.',{goal:'mate'}),
  ]),
};

const all=new Map(Object.values(exercisesByTopic).flat().map(ex=>[ex.id,ex]));
export const exercisesForTopic=id=>Object.hasOwn(exercisesByTopic,id)?exercisesByTopic[id]:[];
export const exerciseById=id=>all.get(id);
