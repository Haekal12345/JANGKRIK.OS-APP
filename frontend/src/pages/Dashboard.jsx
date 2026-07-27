import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // Ditambahkan AnimatePresence

// Import komponen-komponen kamu
import Sidebar from "../components/Sidebar";
import Ringkasan from "../components/Ringkasan";
import Transaksi from "../components/Transaksi";
import Produksi from "../components/Produksi";
import Penanggalan from "../components/Penanggalan";
import Pengetahuan from "../components/Pengetahuan";
import AIAssistant from "../components/AIAssistant";
import Akun from "../components/Akun";

export default function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [section, setSection] = useState(
    () => sessionStorage.getItem("activeSection") || "ringkasan",
  );
  const [darkMode, setDarkMode] = useState(() => {
    // Cek apakah sebelumnya user pernah memilih dark mode
    return localStorage.getItem("theme_jangkrik") === "dark";
  });
  const [userData, setUserData] = useState({ name: "Pengguna" });

  // STATE BARU: Untuk mengontrol munculnya Modal Konfirmasi Logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("activeSection", section);
  }, [section]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user_jangkrik_os");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    } else {
      // Menggunakan hard redirect untuk mencegah blank screen
      window.location.href = "/";
    }
  }, []);

  // =================================================================
  // EFEK BARU: Mencegat Tombol Back di HP agar tidak langsung Logout
  // =================================================================
  useEffect(() => {
    // 1. Dorong 'state' palsu ke history browser saat halaman pertama dimuat
    window.history.pushState(null, null, window.location.pathname);

    const handleBackButton = (e) => {
      // 2. Saat tombol back HP dipencet, cegah browser mundur
      e.preventDefault();
      // 3. Dorong 'state' palsu lagi agar user tetap tertahan di halaman ini
      window.history.pushState(null, null, window.location.pathname);
      // 4. Munculkan modal konfirmasi keluar
      setShowLogoutModal(true);
    };

    // Dengarkan event 'popstate' (ketika user mencoba kembali/mundur)
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  // Fungsi Eksekusi Logout yang sesungguhnya
  const executeLogout = () => {
    localStorage.removeItem("user_jangkrik_os");
    window.location.href = "/"; // Hard redirect mematikan bug blank screen
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* 1. Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        section={section}
        setSection={setSection}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        userData={userData}
        // Ubah: Tombol logout di sidebar sekarang memunculkan modal juga
        doLogout={() => setShowLogoutModal(true)}
      />

      {/* 2. Container Konten Utama */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <motion.div
            key={section}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {section === "ringkasan" && <Ringkasan />}
            {section === "penjualan" && <Transaksi section="penjualan" />}
            {section === "pembelian" && <Transaksi section="pembelian" />}
            {section === "produksi" && <Produksi />}
            {section === "penanggalan" && <Penanggalan />}
            {section === "pengetahuan" && <Pengetahuan />}
            {section === "AIAssistant" && <AIAssistant />}
            {section === "akun" && (
              <Akun userData={userData} setUserData={setUserData} />
            )}
          </motion.div>
        </main>

        {/* Footer Credit */}
        <footer className="mt-auto py-6 text-center border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-bold text-green-600 dark:text-green-500">
              Jangkrik.OS
            </span>
            . Dikembangkan oleh Haekal Maulana Aji.
          </p>
        </footer>
      </div>

      {/* ================================================================= */}
      {/* MODAL KONFIRMASI KELUAR (Terpicu dari Tombol Back HP atau Sidebar) */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-gray-100 dark:border-gray-700"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Ingin Keluar?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                Apakah Anda yakin ingin keluar dari aplikasi Jangkrik.OS?
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={executeLogout}
                  className="flex-1 py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all active:scale-95"
                >
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
