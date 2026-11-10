import {parseRoute} from './navigation.js';
export function safeReturnRoute(hash) {
  const route=parseRoute(hash);
  return typeof hash==='string' && hash.startsWith('#/') && ['course','learn'].includes(route.screen)?hash:'#/profil';
}
export function validateAccountForm(mode,{email,password,confirm,name}={}) {
  if(mode==='profile')return !name?.trim()||name.trim().length>60?'Nama harus berisi 1–60 karakter.':null;
  if(mode!=='recovery' && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))return 'Isi alamat email yang valid.';
  if(mode==='forgot')return null;
  if(!password || password.length<8)return 'Gunakan kata sandi minimal 8 karakter.';
  if(['register','recovery'].includes(mode) && password!==confirm)return 'Konfirmasi kata sandi belum sama.';
  if(mode==='register' && (!name?.trim() || name.trim().length>60))return 'Nama harus berisi 1–60 karakter.';
  return null;
}
export function accountError(error) {
  const messages={invalid_credentials:'Email atau kata sandi belum tepat.',email_not_confirmed:'Konfirmasi email dahulu melalui tautan yang kami kirim.',user_already_exists:'Email ini sudah terdaftar. Silakan masuk.',over_email_send_rate_limit:'Email belum bisa dikirim. Tunggu sebentar sebelum mencoba lagi.',over_request_rate_limit:'Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.',weak_password:'Kata sandi terlalu mudah ditebak. Gunakan kata sandi yang lebih kuat.',otp_expired:'Tautan kedaluwarsa. Minta tautan baru.',bad_code_verifier:'Buka tautan di browser tempat kamu meminta email ini.',session_not_found:'Sesi berakhir. Masuk kembali untuk melanjutkan sinkronisasi.',provider_disabled:'Google Login sedang disiapkan. Gunakan email terlebih dahulu.'};
  if(messages[error?.code])return messages[error.code];
  if(error?.name==='AuthRetryableFetchError' || error instanceof TypeError)return 'Koneksi terputus. Periksa internet, lalu coba lagi.';
  return 'Belum berhasil. Coba lagi atau gunakan metode masuk lainnya.';
}
