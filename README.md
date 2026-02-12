# Aplikasi Agregator Berita Berbasis AI untuk Analisis Bias Media di Indonesia

Project ini adalah sebuah **Web-based News Aggregator** yang memanfaatkan **Artificial Intelligence (AI)** untuk mengumpulkan, mengelompokkan, dan menganalisis bias media berita di Indonesia. Aplikasi ini bertujuan membantu pembaca berita memahami isu politik dan kebijakan publik dari berbagai sudut pandang secara objektif dan efisien.

---

## 👥 Anggota Kelompok
| Ricky Junianto Wijaya 223400002 |
| Petrus Maxmiliano 223400003 |
| Claudio Erlisto Juniarto 223400012 |

---

## 📖 Latar Belakang Masalah
Di era digital, jumlah berita yang beredar sangat masif, namun seringkali memiliki **bias** baik eksplisit maupun implisit (framing, pemilihan kata, penekanan sudut pandang).
*   **Masalah Utama**: Pembaca sulit mendeteksi bias media dan harus membandingkan berita secara manual dari berbagai sumber, yang memakan waktu dan tidak efisien.
*   **Dampak**: Risiko pembentukan opini yang tidak berimbang dan miskonsepsi terhadap isu publik.
*   **Solusi**: Platform agregator yang secara otomatis mengelompokkan berita berdasarkan topik (isu) dan memberikan label kecenderungan (Oposisi, Netral, Pro Pemerintah) serta ringkasan perbandingan.

## 🎯 Fitur Utama
1.  **Pengelompokan Isu Otomatis (Clustering)**: Menggunakan AI untuk mengelompokkan artikel berita yang membahas topik yang sama dari berbagai media.
2.  **Analisis Bias (Bias Detection)**: Mengklasifikasikan setiap artikel ke dalam kategori:
    *   🔴 **Oposisi**
    *   ⚪ **Netral**
    *   🟢 **Pro Pemerintah**
3.  **AI Summary & Comparison**: Menyajikan ringkasan poin-poin utama dari setiap kubu dan narasi perbandingan sudut pandang ("Bias Comparison") yang dihasilkan oleh Generative AI.
4.  **Transparansi Sumber**: Selalu menyertakan link ke artikel asli.
5.  **Personalisasi**: Fitur bookmark dan riwayat baca (dengan login opsional).

---

## 🛠️ Technology Stack

### Backend (Python & FastAPI)
Backend dibangun menggunakan **FastAPI** untuk performa tinggi dan kemudahan pengembangan API.
*   **Framework**: FastAPI
*   **Database**: Supabase (PostgreSQL + pgvector untuk vector similarity search).
*   **Libraries**:
    *   `newspaper3k` & `beautifulsoup4`: Web scraping artikel berita.
    *   `uvicorn`: ASGI server.
    *   `pydantic`: Data validation.

### Artificial Intelligence (AI) & Machine Learning (ML)
Inti kecerdasan aplikasi ini menggunakan kombinasi model NLP modern:

1.  **Bias Classification (Analisis Sentimen Politik)**
    *   **Model**: `IndoBERT` (Fine-tuned).
    *   **Repo**: `Ricky131/indobert-bias-news-augmented` (Hugging Face).
    *   **Fungsi**: Mengklasifikasikan teks berita menjadi Oposisi, Netral, atau Pro Pemerintah.

2.  **Topic Clustering (Pengelompokan Berita)**
    *   **Model**: `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`.
    *   **Metode**: Menghasilkan *vector embeddings* dari judul & konten berita, lalu menggunakan *Cosine Similarity* untuk mengelompokkan berita ke dalam "Issue" yang sama secara real-time.

3.  **Summarization & Generative Comparison**
    *   **Model**: `Llama-3.3-70b-versatile`.
    *   **Platform**: Groq API (untuk inferensi super cepat).
    *   **Fungsi**: Membuat judul isu yang netral, meringkas poin-poin berita per label, dan menyusun narasi perbandingan antar sudut pandang media.

### Frontend
*   **Framework**: Next.js 16 (React 19).
*   **Language**: TypeScript.
*   **Styling**: Vanilla CSS / Custom Styles.

---

## 🚀 Cara Menjalankan (Installation)

### Prasyarat
*   Python 3.10+
*   Node.js 18+
*   Akun **Supabase** (untuk Database & Vector Store).
*   Akun **Groq** (untuk API Key Llama-3).

### 1. Backend Setup
Masuk ke folder backend:
```bash
cd backend
```

Buat virtual environment dan install dependencies:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Buat file `.env` di dalam folder `backend/` dan isi konfigurasi berikut:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_secret_key_for_jwt
ALGORITHM=HS256
```

Jalankan server:
```bash
python main.py
# Server akan berjalan di http://localhost:8000
```

### 2. Frontend Setup
Masuk ke folder frontend:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Jalankan mode development:
```bash
npm run dev
# Buka browser di http://localhost:3000
```

---

## 🌐 Deployment
Project ini sudah berhasil dideploy menggunakan layanan **Railway**. Jika server masih hidup.

*   **Link Deploy**: https://reasonable-exploration-production-51b5.up.railway.app 

---


## 📂 Struktur Project
```
project-root/
├── backend/            # FastAPI App
│   ├── services/       # AI Logic (classification.py, clustering.py, summarization.py)
│   ├── routers/        # API Endpoints
│   ├── models/         # Pydantic Models
│   └── main.py         # Entry point
│
└── frontend/           # Next.js App
    ├── src/
    │   ├── app/        # App Router pages
    │   └── components/ # UI Components
    └── package.json
```

---

## 🔗 Validasi Masalah
Project ini didasarkan pada riset dan validasi masalah melalui wawancara pengguna (Mahasiswa, Akademisi, Pembaca Umum). Bukti validasi dan transkrip wawancara tersimpan dalam dokumentasi internal tim.




