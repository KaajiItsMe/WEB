# 🔍 LokaLens AI

**LokaLens** adalah platform eksplorasi lokal pintar yang menggabungkan kekuatan **Google Gemini AI** dengan data komunitas untuk memberikan panduan jujur tentang tempat-tempat di sekitar Anda. 

LokaLens dirancang khusus untuk warga kota yang butuh info lebih dari sekadar rating bintang 5—seperti info "Kang Parkir", vibes asli tempat, hingga menu tersembunyi.

---

## 🏆 #JuaraVibeCoding 2026

Proyek ini adalah submission untuk kompetisi **#JuaraVibeCoding** — ajang pertama dari Google for Developers Indonesia. 
Dibangun dengan **Google AI Studio**, **Antigravity**, dan di-deploy ke **Google Cloud Run**.

---

## ✨ Fitur Utama

### 🧠 AI Place Insight (Gemini Powered)
LokaLens merangkum ribuan ulasan Google Maps menjadi ringkasan singkat dalam hitungan detik. 
- **Vibe Detection:** Mengetahui apakah tempat itu cocok untuk laptopan, kencan, atau sekadar makan cepat.
- **Red Flag Warning:** Menghindari tempat yang pelayanannya buruk atau harga tidak masuk akal berdasarkan keluhan user.
- **Budget Estimation:** Perkiraan biaya per orang yang lebih akurat daripada indikator `$$` standar.

### 🅿️ Smart Parking Intelligence
Fitur andalan LokaLens untuk menaklukkan drama parkir perkotaan:
- **Kang Parkir Detection:** Info real-time apakah ada juru parkir liar/informal.
- **Parking Sentiment:** Apakah parkirannya sempit, luas, atau resmi.
- **Community Verified:** Data dikonsolidasikan dari laporan jujur pengguna lain.
- **Kategori Parkir Lengkap:**
  - 🔴 Ada Kang Parkir ⚠️
  - 🟣 Parkir Resmi ✅
  - 🟠 Parkir Berbayar
  - 🟢 Parkir Gratis
  - 🔵 Ada Parkir (Umum)
  - ⚪ Belum Ada Info

### 🔒 Private Honest Reviews
Berbeda dengan Google Maps yang bersifat publik, LokaLens menyediakan wadah untuk memberikan **Review Private**.
- Ulasan Anda digunakan secara anonim oleh AI untuk melatih data.
- Tempat untuk curhat jujur tanpa takut drama dengan pemilik tempat.
- Membantu sesama pengguna mendapatkan "kebenaran" di balik rating bintang 5.

### 🏪 Mart Tracker
- Pantau Indomaret, Indomaret Fresh, Indomaret Point, Alfamart, Alfamidi, Alfamidi Super terdekat.
- Info parkir spesifik untuk setiap mart.
- Filter khusus "🛒 Mart" di halaman utama.

### 💎 Hidden Gems
- Temukan tempat-tempat dengan rating tinggi namun sedikit ulasan.
- Deteksi otomatis oleh AI Gemini.

### 👑 Badge & Gamifikasi
- 7 badge apresiasi untuk kontributor setia.
- Badge Newcomer, Reviewer, Foodie Photographer, Hidden Gem Hunter, Trend Setter, Local Guide, Verified Expert.
- Progress tracking untuk setiap badge.

### 🛡️ Admin Panel
- Dashboard statistik review.
- Moderasi review (Approve/Reject).
- Data quality control.
- User management (Ban/Suspend).
- AI performance monitoring.

### 🌐 Multi-Language
- Bahasa Indonesia (default).
- English (toggle switch).

### 🌙 Dark Mode
- Support prefers-color-scheme otomatis.
- Toggle manual di halaman Profile.

### 📱 Mobile Responsive
- Mobile-first design (320px+).
- Bottom Navigation Bar.
- Swipe gestures.
- Pull-to-refresh.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Vue 3 (Vite), Pinia, Tailwind CSS, Lucide Icons, Vue Router, Vue i18n |
| **Backend** | Node.js, Express |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Auth (Google Sign-In) |
| **AI Engine** | Google Gemini 2.5 Flash (AI Studio) |
| **Maps Engine** | Google Places API (Details, Search, Nearby, Geocode) |
| **Hosting** | Google Cloud Run |
| **Storage** | Firebase Cloud Storage |
| **CI/CD** | Cloud Build (GitHub → Cloud Run) |

---

## ⚡ Optimized Performance (Anti-Boros API)

LokaLens dilengkapi dengan sistem caching tingkat lanjut untuk meminimalkan biaya API:
- **Grid-Based Caching:** Caching hasil pencarian berdasarkan grid 1km untuk menghindari redundant API calls saat GPS bergeser sedikit.
- **Smart Analysis Cache:** Hasil analisis AI disimpan di Firestore dengan **Smart Validation**. Jika dokumen cache ditemukan tidak lengkap (misalnya Red Flag atau data lokasi hilang), sistem secara otomatis memicu re-analisis untuk menjamin kualitas data.
- **Response Normalization:** Menjamin frontend selalu menerima data yang konsisten (string kosong atau array default) meskipun dokumen cache berasal dari versi database lama.
- **Request Debouncing:** Mencegah spam request saat user mengetik di kolom pencarian.

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js 18+
- Google Cloud Account dengan Places API enabled
- Firebase Project dengan Firestore + Auth enabled
- Gemini API Key dari Google AI Studio

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/lokalens.git
cd lokalens
```

### 2. Backend (Server)

```bash
cd server
npm install
```

Buat file `.env` di folder `server/`:

```env
PORT=3000
GEMINI_API_KEY="AIzaSy..."
GOOGLE_PLACES_API_KEY="AIzaSy..."
FIREBASE_PROJECT_ID="lokalens-web"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@lokalens-web.iam.gserviceaccount.com"
```

```bash
# Untuk menjalankan lokal
npm run dev

# Untuk deploy ke Google Cloud Run
gcloud run deploy lokalens-backend --source . --region asia-southeast2
```

### 3. Frontend (Client)

```bash
# Untuk menjalankan lokal
npm install
npm run dev
```

Buka `http://localhost:5173` di browser.

```bash
# Untuk deploy ke Google Cloud Run (menggunakan Dockerfile & Nginx)
gcloud run deploy lokalens-frontend --source . --region asia-southeast2 --allow-unauthenticated
```

### 4. Setup Admin

```bash
cd server
node setAdmin.js your-email@gmail.com
```

---

## 📂 Struktur Project

```
lokalens/
├── src/                    # Frontend Vue 3
│   ├── views/              # Halaman (Home, Search, PlaceDetail, Profile, Admin)
│   ├── components/         # Komponen (PlaceCard, BottomNav, Sidebar, Onboarding)
│   ├── stores/             # Pinia stores (auth, saved, settings)
│   ├── utils/              # Helpers (api, maps, location, reviews)
│   └── i18n/               # File bahasa (id.json, en.json)
├── server/                 # Backend Express
│   ├── index.js            # Main server
│   ├── gemini.js           # Gemini AI integration
│   ├── places.js           # Google Places API
│   ├── firebase.js         # Firebase Admin SDK
│   └── setAdmin.js         # Script set admin
├── public/                 # Static assets
└── README.md
```

---

## 🔒 Keamanan

- **Firestore Security Rules:** Hanya admin yang bisa baca semua review. User hanya bisa baca miliknya sendiri.
- **Places Analysis Cache:** Read-only untuk publik, write hanya dari Admin SDK.
- **GDPR Compliant:** Fitur "Hapus Data Saya" untuk menghapus semua data user.
- **API Keys:** Semua kunci disimpan di environment variables, tidak di-hardcode.

---

## 📊 Status Proyek

| Fitur | Status |
|-------|--------|
| AI Place Analysis | ✅ Production Ready |
| Smart Parking Detection | ✅ Production Ready |
| Private Reviews | ✅ Production Ready |
| Mart Tracker | ✅ Production Ready |
| Hidden Gems | ✅ Production Ready |
| Admin Panel | ✅ Production Ready |
| Badge System | ✅ Production Ready |
| Multi-Language | ✅ Production Ready |
| Dark Mode | ✅ Production Ready |
| Google Sign-In | ✅ Production Ready |
| Deploy Cloud Run | ✅ Production Ready |
| Places API Integration | ✅ Production Ready |

---

## 📄 Lisensi

Proyek ini dikembangkan untuk **#JuaraVibeCoding 2026** — Google for Developers Indonesia. 
Gunakan dengan bijak! 🚀