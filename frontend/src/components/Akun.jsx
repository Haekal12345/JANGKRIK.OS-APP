import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  User,
  Mail,
  Lock,
  CheckCircle2,
  Headphones,
  XCircle,
} from "lucide-react";

export default function Akun({ userData, setUserData }) {
  const [formAkun, setFormAkun] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isUpdatingAkun, setIsUpdatingAkun] = useState(false);

  // STATE UNTUK MODAL NOTIFIKASI
  const [notifModal, setNotifModal] = useState({
    show: false,
    type: "",
    message: "",
  });

  useEffect(() => {
    if (userData) {
      setFormAkun({
        name: userData.name || "",
        email: userData.email || "",
        password: "",
      });
    }
  }, [userData]);

  const handleUpdateAkun = async (e) => {
    e.preventDefault();
    setIsUpdatingAkun(true);

    try {
      const response = await fetch(
        `https://be-jos.vercel.app/api/auth/update/${userData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formAkun),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // TAMPILKAN MODAL SUKSES (Bukan alert lagi)
        setNotifModal({ show: true, type: "success", message: data.message });

        const updatedUser = {
          ...userData,
          name: formAkun.name,
          email: formAkun.email,
        };
        setUserData(updatedUser);
        localStorage.setItem("user_jangkrik_os", JSON.stringify(updatedUser));
        setFormAkun({ ...formAkun, password: "" });
      } else {
        // TAMPILKAN MODAL ERROR
        setNotifModal({ show: true, type: "error", message: data.error });
      }
    } catch (error) {
      setNotifModal({
        show: true,
        type: "error",
        message: "Gagal terhubung ke server!",
      });
    } finally {
      setIsUpdatingAkun(false);
      // Hilangkan modal otomatis setelah 3 detik
      setTimeout(() => {
        setNotifModal({ show: false, type: "", message: "" });
      }, 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-10 relative">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Pengaturan Akun
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
            Kelola informasi profil dan keamanan akun Jangkrik.OS Anda.
          </p>
        </div>
      </div>

      {/* CARD PROFIL */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 relative">
        <div className="relative h-36 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 dark:from-green-900 dark:to-emerald-950 rounded-t-3xl overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          </div>
        </div>

        <div className="px-8 sm:px-10 pb-10">
          <div className="-mt-14 mb-6 relative z-10">
            <div className="w-28 h-28 rounded-full bg-white dark:bg-gray-800 p-1.5 shadow-xl border border-gray-100 dark:border-gray-700 inline-block">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/60 dark:to-emerald-800/60 flex items-center justify-center text-green-700 dark:text-green-400 font-extrabold text-5xl uppercase shadow-inner">
                {userData?.name ? userData.name.charAt(0) : "U"}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {userData?.name}
            </h2>
            <p className="text-green-600 dark:text-green-400 font-bold text-sm flex items-center gap-1.5 mt-1">
              {userData?.email === "haekalma01@gmail.com" ? (
                <>
                  <ShieldAlert className="w-4 h-4" /> Administrator Jangkrik.OS
                </>
              ) : (
                <>
                  <User className="w-4 h-4" /> Pengguna Jangkrik.OS
                </>
              )}
            </p>
          </div>

          <form onSubmit={handleUpdateAkun} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    required
                    type="text"
                    value={formAkun.name}
                    onChange={(e) =>
                      setFormAkun({ ...formAkun, name: e.target.value })
                    }
                    /* KUNCI PERBAIKAN: Menambahkan dark:focus:bg-gray-800 */
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 hover:bg-white focus:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-800 dark:focus:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    required
                    type="email"
                    value={formAkun.email}
                    onChange={(e) =>
                      setFormAkun({ ...formAkun, email: e.target.value })
                    }
                    /* KUNCI PERBAIKAN: Menambahkan dark:focus:bg-gray-800 */
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 hover:bg-white focus:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-800 dark:focus:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-6 border-t border-gray-100 dark:border-gray-700/50">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">
                Ubah Kata Sandi
              </label>
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="password"
                  value={formAkun.password}
                  onChange={(e) =>
                    setFormAkun({ ...formAkun, password: e.target.value })
                  }
                  placeholder="Kosongkan jika tidak ingin diubah..."
                  /* KUNCI PERBAIKAN: Menambahkan dark:focus:bg-gray-800 */
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 hover:bg-white focus:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-800 dark:focus:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder-gray-400"
                />
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-2 mt-2">
                *Minimal 8 karakter. Sistem menggunakan enkripsi hash untuk
                keamanan.
              </p>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingAkun}
                className="w-full md:w-auto px-8 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-green-500/30 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUpdatingAkun ? (
                  <span className="animate-pulse">⏳ Menyimpan...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CARD PUSAT BANTUAN & CS */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg border border-slate-700 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-10">
          <Headphones className="w-48 h-48 text-white" />
        </div>

        <div className="relative z-10 text-center sm:text-left">
          <h3 className="text-xl font-extrabold text-white tracking-tight mb-2">
            Butuh Bantuan Teknis?
          </h3>
          <p className="text-slate-400 text-sm font-medium max-w-md">
            Menemukan bug, error, atau punya saran untuk Jangkrik.OS? Tim
            Customer Service kami siap membantu Anda.
          </p>
        </div>

        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=haekalma01@gmail.com&su=Laporan%20Bug%20/%20Bantuan%20Jangkrik.OS"
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 flex items-center gap-2 bg-green-500 hover:bg-green-400 text-slate-900 px-6 py-3 rounded-xl font-bold transition-colors active:scale-95 whitespace-nowrap shadow-lg shadow-green-500/20"
        >
          <Mail className="w-5 h-5" />
          Hubungi CS (Gmail)
        </a>
      </div>

      {/* CUSTOM NOTIFICATION MODAL */}
      <AnimatePresence>
        {notifModal.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 right-10 z-[100]"
          >
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
                notifModal.type === "success"
                  ? "bg-green-50 dark:bg-green-900/80 border-green-200 dark:border-green-700 text-green-800 dark:text-green-100"
                  : "bg-red-50 dark:bg-red-900/80 border-red-200 dark:border-red-700 text-red-800 dark:text-red-100"
              }`}
            >
              {notifModal.type === "success" ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
              <p className="font-bold">{notifModal.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
