import { auth } from './firebase.js'

const email = process.argv[2]

if (!email) {
  console.error('Harap masukkan email pengguna. Contoh: node setAdmin.js user@example.com')
  process.exit(1)
}

const setAdmin = async () => {
  try {
    const user = await auth.getUserByEmail(email)
    await auth.setCustomUserClaims(user.uid, { admin: true })
    console.log(`✅ Berhasil memberikan akses admin ke pengguna: ${email} (UID: ${user.uid})`)
    console.log(`Harap minta pengguna untuk logout dan login kembali agar token diperbarui.`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Gagal set admin:', error.message)
    process.exit(1)
  }
}

setAdmin()
