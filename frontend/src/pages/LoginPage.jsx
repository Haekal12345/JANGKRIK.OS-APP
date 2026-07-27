import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import LogoJOS from "../assets/LOGO.png";

// ===============================================
// KOMPONEN ISI FORMULIR (BAGIAN KANAN)
// ===============================================
function LoginFormContent() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isEmailValid, setIsEmailValid] = useState(null);

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setForm({ ...form, email: val });

    if (mode === "signup") {
      if (val.trim() === "") {
        setIsEmailValid(null);
      } else if (val.toLowerCase().endsWith("@gmail.com")) {
        setIsEmailValid(true);
      } else {
        setIsEmailValid(false);
      }
    }
  };

  // STATE CUSTOM MODAL NOTIFIKASI
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success", // 'success' atau 'error'
    title: "",
    message: "",
  });

  // FUNGSI HELPER UNTUK MEMANGGIL MODAL (Pengganti alert)
  const showModal = (type, title, message) => {
    setModalConfig({ isOpen: true, type, title, message });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (mode === "signup" && isEmailValid === false) {
      setErrorMessage(
        "Harap gunakan akun @gmail.com yang valid untuk mendaftar.",
      );
      return;
    }
    setLoading(true);
    setErrorMessage("");

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan sistem.");
      }

      if (mode === "login") {
        localStorage.setItem("user_jangkrik_os", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        showModal(
          "success",
          "Berhasil!",
          "Registrasi berhasil! Silakan masuk.",
        );
        setMode("login");
        setForm({ email: "", password: "", name: "" });
        setIsEmailValid(null);
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setErrorMessage("");
      try {
        const userInfo = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        ).then((res) => res.json());

        const response = await fetch(
          "https://be-jos.vercel.app/api/auth/google",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: userInfo.email,
              name: userInfo.name,
              action: mode,
            }),
          },
        );

        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Gagal autentikasi Google.");

        localStorage.setItem("user_jangkrik_os", JSON.stringify(data.user));
        window.location.href = "/dashboard";
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setErrorMessage("Pop-up Google ditutup atau terjadi kesalahan.");
    },
  });

  const GoogleIcon = () => (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative min-h-screen">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-100/40 via-transparent to-transparent -z-10"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[440px] my-auto"
      >
        <div className="lg:hidden flex flex-col items-center justify-center gap-3 mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
            <div className="bg-white p-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 relative">
              <img
                src={LogoJOS}
                alt="Logo Jangkrik.OS"
                className="h-16 w-16 object-contain drop-shadow-sm"
              />
            </div>
          </div>
          <h1 className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-900 to-emerald-700">
            Jangkrik.OS
          </h1>
        </div>

        <div className="bg-white p-10 sm:p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500 to-emerald-500"></div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              {mode === "login" ? "Selamat Datang" : "Buat Akun Baru"}
            </h2>
            <p className="text-gray-500 font-medium text-sm">
              {mode === "login"
                ? "Silakan masuk ke dashboard Jangkrik.OS Anda."
                : "Mulai langkah cerdas mengelola peternakan."}
            </p>
          </div>

          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 font-bold text-sm"
              >
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-red-100 rounded-full text-red-500 mt-0.5">
                  !
                </span>
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={submit} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3.5 focus:bg-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-gray-900 font-medium"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={handleEmailChange}
                  className={`w-full rounded-2xl border bg-gray-50/50 pl-11 pr-10 py-3.5 focus:bg-white focus:ring-4 outline-none transition-all text-gray-900 font-medium ${mode === "signup" && isEmailValid === false ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-gray-200 focus:ring-green-500/20 focus:border-green-500"}`}
                  placeholder="admin@gmail.com"
                />
                {mode === "signup" && isEmailValid !== null && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    {isEmailValid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {mode === "signup" && isEmailValid === false && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-500 font-bold ml-2 pt-1"
                >
                  *Sistem Jangkrik.OS mewajibkan penggunaan akun @gmail.com
                </motion.p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3.5 focus:bg-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all text-gray-900 font-medium"
                  placeholder="Minimal 8 karakter"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-800 hover:to-emerald-700 text-white font-bold py-4 shadow-lg shadow-green-500/30 hover:shadow-green-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 cursor-pointer flex justify-center items-center gap-2"
              >
                {loading ? (
                  <span className="animate-pulse">Memproses...</span>
                ) : mode === "login" ? (
                  <>
                    Masuk Sekarang <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  "Daftar Akun"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-full border-t border-gray-200"></span>
              <span className="relative bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Atau masuk dengan
              </span>
            </div>

            <button
              type="button"
              onClick={() => loginWithGoogle()}
              disabled={loading}
              className="mt-6 flex items-center justify-center gap-3 w-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold py-3.5 rounded-2xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <GoogleIcon /> Google
            </button>

            {/* TAMBAHAN PERINGATAN ORANYE (OAUTH 2.0) */}
            <div className="mt-4 p-3.5 bg-orange-50/80 border border-orange-100 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-semibold text-orange-700 leading-relaxed text-justify">
                <span className="font-bold uppercase tracking-wider text-orange-600 block mb-0.5">
                  Penting:
                </span>
                Jika akun didaftarkan menggunakan Google, maka seterusnya Anda
                wajib masuk menggunakan tombol Google ini.
              </p>
            </div>
          </div>
        </div>

        {/* BAGIAN ANIMASI SMOOTH TEKS DAFTAR/MASUK */}
        <div className="mt-8 text-center overflow-hidden">
          <div className="text-sm font-medium text-gray-500 flex items-center justify-center gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={mode}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="inline-block"
              >
                {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}
              </motion.span>
            </AnimatePresence>{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setErrorMessage("");
                setForm({ email: "", password: "", name: "" });
                setIsEmailValid(null);
              }}
              className="text-green-700 font-extrabold relative group flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={mode}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="block group-hover:text-green-800 transition-colors"
                >
                  {mode === "login" ? "Daftar di sini" : "Masuk di sini"}
                </motion.span>
              </AnimatePresence>
              {/* Garis bawah animasi (muncul saat di-hover) */}
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* FOOTER & CREDIT HALAMAN LOGIN (BAWAH KANAN/MOBILE) */}
      <div className="mt-auto pt-10 pb-4 text-center w-full flex flex-col items-center gap-2 lg:hidden">
        <p className="text-xs text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} Jangkrik.OS. Dikembangkan oleh
          Haekal Maulana Aji
        </p>
        <a
          href="mailto:haekalma01@gmail.com"
          className="text-xs font-bold text-green-600 flex items-center gap-1.5 hover:underline"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Butuh Bantuan? (CS)
        </a>
      </div>

      {/* CUSTOM MODAL NOTIFIKASI BERHASIL/ERROR */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 transform transition-all animate-bounceIn text-center flex flex-col items-center">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${modalConfig.type === "success" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}
            >
              {modalConfig.type === "success" ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <XCircle className="w-10 h-10" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {modalConfig.title}
            </h3>
            <p className="text-gray-500 font-medium mb-8">
              {modalConfig.message}
            </p>
            <button
              onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
              className={`w-full py-3.5 px-4 text-white font-bold rounded-xl transition-colors shadow-lg
                ${modalConfig.type === "success" ? "bg-green-600 hover:bg-green-700 shadow-green-500/30" : "bg-red-600 hover:bg-red-700 shadow-red-500/30"}
              `}
            >
              OK, Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===============================================
// WRAPPER UTAMA (Provider Google & BAGIAN KIRI)
// ===============================================
export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId="603715151841-ov8pqnu7a2kpfm91hg6eghgtlosmg5ev.apps.googleusercontent.com">
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans selection:bg-green-200 selection:text-green-900">
        {/* HERO / BANNER KIRI */}
        <div className="relative hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-green-950 via-green-800 to-emerald-900 text-white p-12 overflow-hidden">
          <div className="absolute top-[-10%] -left-10 w-96 h-96 bg-green-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse"></div>
          <div className="absolute bottom-[-10%] -right-10 w-96 h-96 bg-emerald-400 rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="relative z-10 w-fit"
          >
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full"></div>
            <div className="relative flex items-center gap-3.5 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50">
              <div className="flex items-center justify-center bg-green-50 rounded-full p-1.5 shadow-inner">
                <img
                  src={LogoJOS}
                  alt="Logo Jangkrik.OS"
                  className="h-8 w-8 object-contain drop-shadow-sm"
                />
              </div>
              <span className="font-black text-2xl tracking-tight pr-2 bg-clip-text text-transparent bg-gradient-to-r from-green-800 to-emerald-600">
                Jangkrik.OS
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative z-10 my-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-sm font-medium text-green-100 mb-6 shadow-lg">
              <Leaf className="h-4 w-4 text-green-300" />
              <span className="tracking-wide uppercase text-xs">
                Peternakan Digital 2.0
              </span>
            </div>
            <h1 className="text-4xl xl:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight drop-shadow-md">
              Kelola peternakan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-100">
                jangkrik Anda
              </span>{" "}
              secara digital.
            </h1>
            <p className="text-green-100/90 max-w-lg text-lg leading-relaxed font-medium">
              Catat penjualan, pantau tren pertumbuhan, ekspor laporan keuangan,
              dan kelola operasional — semua dalam satu ekosistem cerdas.
            </p>
          </motion.div>

          <div className="relative z-10 flex items-center justify-between text-green-200/70 text-sm font-medium border-t border-green-700/50 pt-6 mt-4">
            <div className="flex items-center gap-4">
              <span>&copy; {new Date().getFullYear()} Jangkrik.OS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/50"></span>
              <span>Dev by Haekal</span>
            </div>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=haekalma01@gmail.com&su=Bantuan%20Login%20Jangkrik.OS"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-green-300 hover:text-white transition-colors hover:underline"
            >
              <HelpCircle className="w-4 h-4" /> Bantuan CS
            </a>
          </div>
        </div>

        <LoginFormContent />
      </div>
    </GoogleOAuthProvider>
  );
}
