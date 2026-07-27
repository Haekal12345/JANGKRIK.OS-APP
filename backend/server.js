const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. KONEKSI & BUAT TABEL OTOMATIS DI MYSQL
// ==========================================
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: "avnadmin",
  password: process.env.DB_PASSWORD,
  database: "defaultdb",
  port: 18698,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true, // WAJIB UNTUK VERCEL SERVERLESS
  keepAliveInitialDelay: 10000,
});

// Menggunakan getConnection karena kita memakai Pool
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Gagal terhubung ke MySQL:", err);
    return; // Hentikan eksekusi pembuatan tabel jika gagal
  }
  console.log("✅ Berhasil terhubung ke database MySQL jangkrik_os!");

  // TABEL USERS (Induk)
  connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // TABEL CHAT SESSIONS
  connection.query(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      history LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // TABEL TRANSAKSI
  connection.query(`
    CREATE TABLE IF NOT EXISTS transaksi (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      jenis VARCHAR(50),
      tanggal DATE,
      buyer VARCHAR(255),
      supplier VARCHAR(255),
      jumlah_kg DOUBLE,
      harga_per_kg DOUBLE,
      jumlah DOUBLE,
      harga DOUBLE,
      total DOUBLE,
      catatan TEXT,
      jenis_barang VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // TABEL PRODUKSI
  connection.query(`
    CREATE TABLE IF NOT EXISTS produksi (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      tanggal_tebar DATE,
      jumlah_telur_per_gram INT,
      pengeraman_per_hari INT,
      pakan VARCHAR(255),
      vitamin VARCHAR(255),
      hasil_panen DOUBLE,
      terjual DOUBLE,
      catatan TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // TABEL REFERENSI
  connection.query(`
    CREATE TABLE IF NOT EXISTS referensi (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(50),
      title VARCHAR(255),
      source VARCHAR(255),
      url VARCHAR(255),
      preview TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Wajib kembalikan koneksi ke kolam setelah selesai!
  connection.release();
  console.log("✅ Semua tabel siap digunakan!");
});

// ==========================================
// 2. KONEKSI KE GOOGLE GEMINI AI
// ==========================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// INSTRUKSI KEPRIBADIAN AI BARU (LEBIH SANTAI & TIDAK KAKU)
const AI_SYSTEM_INSTRUCTION = `Kamu adalah Asisten AI "Jangkrik.OS". Posisikan dirimu sebagai rekan bisnis atau konsultan peternakan muda yang asyik, santai, dan seumuran dengan user. Gunakan sapaan akrab seperti "Bro", "Kak", atau "Bos" secara natural.

ATURAN SIKAP & GAYA BAHASA (SANGAT PENTING):
1. JAWAB LANGSUNG KE INTINYA: Jangan pernah memberikan analisis data (seperti membahas sisa stok, utang, atau jadwal panen) JIKA TIDAK DITANYA secara spesifik oleh user. Jawab hanya apa yang ditanyakan.
2. JANGAN KAKU & ROBOTIK: Dilarang keras menggunakan kalimat seperti "Berdasarkan data database Jangkrik.OS yang Anda berikan..." atau "Berikut adalah analisis insight...". Berbicaralah mengalir seperti sedang chatting di WhatsApp.
3. FORMATTING: Berikan jarak 1 baris kosong (Double Enter) antar paragraf agar mudah dibaca di HP. Gunakan list/bullet points jika menjelaskan tahapan. Pakai emoji secukupnya agar terlihat ramah.

BASIS PENGETAHUAN BUDIDAYA JANGKRIK ALAM:
1. Habitat: Pelompat ulung (butuh lakban bening 15cm di atas kandang), suhu ideal 28-32°C (jangan pengap), butuh banyak celah sembunyi (tumpukan egg tray rapat).
2. Pakan: Pur ayam (BR511) diblender halus standby 24 jam. Sumber air JANGAN pakai air cair (mudah tenggelam), gunakan irisan gedebok pisang/daun pepaya/sawi. KETERLAMBATAN PAKAN = KANIBALISME.
3. Siklus: Menetas 11-14 hari. Usia panen ideal 28-30 hari. Panen SEBELUM jangkrik bersayap keras/berbunyi (ngekrik) agar harga jual mahal.
4. Bahaya: Amonia (kotoran basah), Semut/Cicak (cegah dengan wadah oli di kaki rak), Laba-laba.`;

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
  systemInstruction: AI_SYSTEM_INSTRUCTION,
});

// ==========================================
// 3. ENDPOINT API (SERVER ROUTES)
// ==========================================

// --- CHAT AI ---
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, contextData } = req.body;
    if (!message) return res.status(400).json({ error: "Pesan kosong" });

    let validHistory = [];
    let expectedRole = "user";
    const rawHistory = history || [];

    for (const msg of rawHistory) {
      const mappedRole = msg.role === "ai" ? "model" : "user";
      if (mappedRole === expectedRole && msg.text) {
        validHistory.push({ role: mappedRole, parts: [{ text: msg.text }] });
        expectedRole = expectedRole === "user" ? "model" : "user";
      }
    }
    if (
      validHistory.length > 0 &&
      validHistory[validHistory.length - 1].role === "user"
    ) {
      validHistory.pop();
    }

    const chat = model.startChat({ history: validHistory });

    // ================================================================
    // MAGIC TRICK DIREVISI: AGAR AI TIDAK OVER-ANALYSIS
    // ================================================================
    let finalMessage = message;
    if (contextData) {
      finalMessage = `[INFO BACKGROUND SISTEM - JANGAN DIBACAKAN KE USER KECUALI RELEVAN DENGAN PERTANYAANNYA]\nData peternakan user saat ini:\n${contextData}\n\n[PERTANYAAN USER]\n${message}\n\nIngat aturanmu: Jawab pertanyaan user di atas dengan gaya bahasa santai seperti teman. JANGAN menganalisis atau mengomentari data sistem di atas jika user tidak memintanya secara eksplisit.`;
    }

    const result = await chat.sendMessage(finalMessage);
    res.json({ reply: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan di server AI." });
  }
});

app.post("/api/chat/save", (req, res) => {
  const { user_id, title, history } = req.body;
  if (!user_id) return res.status(400).json({ error: "Unauthorized" });

  const historyString = JSON.stringify(history);
  db.query(
    "INSERT INTO chat_sessions (user_id, title, history) VALUES (?, ?, ?)",
    [user_id, title, historyString],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil disimpan!", id: result.insertId });
    },
  );
});

app.get("/api/chat/history", (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "Unauthorized" });

  db.query(
    "SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY created_at DESC",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    },
  );
});

app.post("/api/chat/title", async (req, res) => {
  try {
    const { message } = req.body;
    const prompt = `Buatkan judul singkat (maksimal 4-5 kata) yang menggambarkan inti kalimat ini: "${message}". Dilarang pakai tanda baca di akhir.`;
    const result = await model.generateContent(prompt);
    res.json({ title: result.response.text().trim() });
  } catch (error) {
    res.json({ title: "Obrolan Baru" });
  }
});

app.put("/api/chat/update/:id", (req, res) => {
  const { user_id, history } = req.body;
  if (!user_id) return res.status(400).json({ error: "Unauthorized" });

  const historyString = JSON.stringify(history);
  db.query(
    "UPDATE chat_sessions SET history = ? WHERE id = ? AND user_id = ?",
    [historyString, req.params.id, user_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Auto-save berhasil!" });
    },
  );
});

app.delete("/api/chat/delete/:id", (req, res) => {
  const { user_id } = req.query;
  db.query(
    "DELETE FROM chat_sessions WHERE id = ? AND user_id = ?",
    [req.params.id, user_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil dihapus!" });
    },
  );
});

// --- TRANSAKSI ---
app.post("/api/transaksi", (req, res) => {
  const {
    user_id,
    tanggal,
    buyer,
    supplier,
    jumlah_kg,
    harga_per_kg,
    jumlah,
    harga,
    total,
    catatan,
    jenis,
    jenis_barang,
  } = req.body;
  if (!user_id) return res.status(400).json({ error: "Unauthorized" });

  const query =
    "INSERT INTO transaksi (user_id, tanggal, buyer, supplier, jumlah_kg, harga_per_kg, jumlah, harga, total, catatan, jenis, jenis_barang) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    query,
    [
      user_id,
      tanggal,
      buyer,
      supplier,
      jumlah_kg,
      harga_per_kg,
      jumlah,
      harga,
      total,
      catatan,
      jenis,
      jenis_barang,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Data berhasil disimpan!", id: result.insertId });
    },
  );
});

app.put("/api/transaksi/:id", (req, res) => {
  const {
    user_id,
    tanggal,
    buyer,
    supplier,
    jumlah_kg,
    harga_per_kg,
    jumlah,
    harga,
    total,
    catatan,
    jenis_barang,
  } = req.body;

  const query =
    "UPDATE transaksi SET tanggal=?, buyer=?, supplier=?, jumlah_kg=?, harga_per_kg=?, jumlah=?, harga=?, total=?, catatan=?, jenis_barang=? WHERE id=? AND user_id=?";
  db.query(
    query,
    [
      tanggal,
      buyer,
      supplier,
      jumlah_kg,
      harga_per_kg,
      jumlah,
      harga,
      total,
      catatan,
      jenis_barang,
      req.params.id,
      user_id,
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil diupdate!" });
    },
  );
});

app.get("/api/transaksi", (req, res) => {
  const { user_id, jenis } = req.query;
  if (!user_id) return res.status(400).json({ error: "Unauthorized" });

  const query = jenis
    ? "SELECT * FROM transaksi WHERE user_id = ? AND jenis = ? ORDER BY tanggal DESC"
    : "SELECT * FROM transaksi WHERE user_id = ? ORDER BY tanggal DESC";

  db.query(query, jenis ? [user_id, jenis] : [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.delete("/api/transaksi/:id", (req, res) => {
  const { user_id } = req.query;
  db.query(
    "DELETE FROM transaksi WHERE id = ? AND user_id = ?",
    [req.params.id, user_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil dihapus!" });
    },
  );
});

// --- PENANGGALAN ---
app.get("/api/penanggalan", (req, res) => {
  const { user_id } = req.query;
  db.query(
    "SELECT * FROM penanggalan WHERE user_id = ?",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    },
  );
});

app.post("/api/penanggalan", (req, res) => {
  const { user_id, lokasi, tebar, panenMulai, panenSelesai, status, catatan } =
    req.body;
  db.query(
    "INSERT INTO penanggalan (user_id, lokasi, tebar, panenMulai, panenSelesai, status, catatan) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [user_id, lokasi, tebar, panenMulai, panenSelesai, status, catatan || ""],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Jadwal disimpan!", id: result.insertId });
    },
  );
});

app.put("/api/penanggalan/:id", (req, res) => {
  const { user_id, lokasi, tebar, panenMulai, panenSelesai, status, catatan } =
    req.body;
  db.query(
    "UPDATE penanggalan SET lokasi=?, tebar=?, panenMulai=?, panenSelesai=?, status=?, catatan=? WHERE id=? AND user_id=?",
    [
      lokasi,
      tebar,
      panenMulai,
      panenSelesai,
      status,
      catatan || "",
      req.params.id,
      user_id,
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Jadwal diperbarui!" });
    },
  );
});

app.delete("/api/penanggalan/:id", (req, res) => {
  const { user_id } = req.query;
  db.query(
    "DELETE FROM penanggalan WHERE id = ? AND user_id = ?",
    [req.params.id, user_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Jadwal dihapus!" });
    },
  );
});

// --- PRODUKSI ---
app.get("/api/produksi", (req, res) => {
  const { user_id } = req.query;
  db.query(
    "SELECT * FROM produksi WHERE user_id = ? ORDER BY tanggal_tebar DESC",
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    },
  );
});

app.post("/api/produksi", (req, res) => {
  const {
    user_id,
    tanggal_tebar,
    jumlah_telur_per_gram,
    pengeraman_per_hari,
    pakan,
    vitamin,
    hasil_panen,
    terjual,
    catatan,
  } = req.body;
  const query =
    "INSERT INTO produksi (user_id, tanggal_tebar, jumlah_telur_per_gram, pengeraman_per_hari, pakan, vitamin, hasil_panen, terjual, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    query,
    [
      user_id,
      tanggal_tebar,
      jumlah_telur_per_gram,
      pengeraman_per_hari,
      pakan,
      vitamin,
      hasil_panen,
      terjual || 0,
      catatan,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Data produksi disimpan!", id: result.insertId });
    },
  );
});

app.put("/api/produksi/:id", (req, res) => {
  const {
    user_id,
    tanggal_tebar,
    jumlah_telur_per_gram,
    pengeraman_per_hari,
    pakan,
    vitamin,
    hasil_panen,
    terjual,
    catatan,
  } = req.body;
  const query =
    "UPDATE produksi SET tanggal_tebar=?, jumlah_telur_per_gram=?, pengeraman_per_hari=?, pakan=?, vitamin=?, hasil_panen=?, terjual=?, catatan=? WHERE id=? AND user_id=?";
  db.query(
    query,
    [
      tanggal_tebar,
      jumlah_telur_per_gram,
      pengeraman_per_hari,
      pakan,
      vitamin,
      hasil_panen,
      terjual || 0,
      catatan,
      req.params.id,
      user_id,
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Data produksi diupdate!" });
    },
  );
});

app.delete("/api/produksi/:id", (req, res) => {
  const { user_id } = req.query;
  db.query(
    "DELETE FROM produksi WHERE id = ? AND user_id = ?",
    [req.params.id, user_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Data produksi dihapus!" });
    },
  );
});

// --- REFERENSI (GLOBAL - TANPA USER_ID) ---
app.get("/api/referensi", (req, res) => {
  db.query(
    "SELECT * FROM referensi ORDER BY created_at DESC",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    },
  );
});

app.post("/api/referensi", (req, res) => {
  const { type, title, source, url, preview } = req.body;
  db.query(
    "INSERT INTO referensi (type, title, source, url, preview) VALUES (?, ?, ?, ?, ?)",
    [type, title, source, url, preview],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Berhasil ditambahkan", id: result.insertId });
    },
  );
});

app.put("/api/referensi/:id", (req, res) => {
  const { type, title, source, url, preview } = req.body;
  db.query(
    "UPDATE referensi SET type=?, title=?, source=?, url=?, preview=? WHERE id=?",
    [type, title, source, url, preview, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Referensi berhasil diperbarui!" });
    },
  );
});

app.delete("/api/referensi/:id", (req, res) => {
  db.query("DELETE FROM referensi WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Berhasil dihapus!" });
  });
});

// ==========================================
// ENDPOINT AUTENTIKASI (LOGIN & REGISTER)
// ==========================================
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Semua kolom wajib diisi!" });

  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0)
        return res
          .status(400)
          .json({ error: "Email ini sudah terdaftar! Gunakan email lain." });

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
          [name, email, hashedPassword],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Registrasi berhasil! Silakan masuk." });
          },
        );
      } catch {
        res.status(500).json({ error: "Gagal mengamankan kata sandi." });
      }
    },
  );
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email dan kata sandi wajib diisi!" });

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res
          .status(401)
          .json({ error: "Akun tidak ditemukan! Silakan daftar." });

      const user = results[0];
      const passwordCocok = await bcrypt.compare(password, user.password);
      if (!passwordCocok)
        return res.status(401).json({ error: "Kata sandi salah!" });

      res.json({
        message: "Login berhasil!",
        user: { id: user.id, name: user.name, email: user.email },
      });
    },
  );
});

app.put("/api/auth/update/:id", async (req, res) => {
  const { name, email, password } = req.body;
  const userId = req.params.id;

  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.query(
        "UPDATE users SET name=?, email=?, password=? WHERE id=?",
        [name, email, hashedPassword, userId],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "Profil dan kata sandi berhasil diperbarui!" });
        },
      );
    } else {
      db.query(
        "UPDATE users SET name=?, email=? WHERE id=?",
        [name, email, userId],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "Profil berhasil diperbarui!" });
        },
      );
    }
  } catch {
    res.status(500).json({ error: "Gagal memperbarui profil." });
  }
});

app.post("/api/auth/google", async (req, res) => {
  const { email, name } = req.body;
  if (!email)
    return res.status(400).json({ error: "Data Google tidak valid!" });

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) {
        const user = results[0];
        return res.json({
          message: "Login Google berhasil!",
          user: { id: user.id, name: user.name, email: user.email },
        });
      }
      try {
        const randomPassword = Math.random().toString(36).slice(-10) + "JkOS!";
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        db.query(
          "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
          [name || "User", email, hashedPassword],
          (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({
              message: "Pendaftaran otomatis berhasil!",
              user: { id: result.insertId, name: name || "User", email: email },
            });
          },
        );
      } catch {
        return res.status(500).json({ error: "Gagal pendaftaran otomatis." });
      }
    },
  );
});

// ==========================================
// NYALAKAN SERVER
// ==========================================
app.listen(port, () => {
  console.log(`✅ Server Jangkrik.OS berjalan di http://localhost:${port}`);
});
