import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  LogOut,
  Package,
  CalendarDays,
  Bot,
  ChevronLeft,
  Menu,
  Sun,
  Moon,
  Settings,
} from "lucide-react";

import LogoJOS from "../assets/LOGO.png";

const NAV = [
  { id: "ringkasan", label: "Ringkasan", icon: LayoutDashboard },
  { id: "penjualan", label: "Penjualan", icon: ClipboardList },
  { id: "pembelian", label: "Pembelian", icon: Package },
  { id: "produksi", label: "Produksi", icon: Settings },
  { id: "penanggalan", label: "Penanggalan", icon: CalendarDays },
  { id: "pengetahuan", label: "Pengetahuan Budidaya", icon: BookOpen },
  { id: "AIAssistant", label: "AI Asisten", icon: Bot },
];

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  section,
  setSection,
  darkMode,
  setDarkMode,
  userData,
  doLogout,
}) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme_jangkrik", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme_jangkrik", "light");
    }
  }, [darkMode]);

  return (
    <>
      <div className="flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {/* KUNCI PERBAIKAN SIDEBAR: h-[100dvh] dan overflow-y-auto di parent terluar */}
        <aside
          className={`fixed lg:sticky top-0 z-40 h-[100dvh] transition-all duration-300 border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto custom-scrollbar
          ${isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-20 lg:translate-x-0"}
          `}
        >
          {/* Wrapper yang memastikan konten memenuhi minimal 1 layar penuh */}
          <div className="flex flex-col min-h-full p-4">
            {/* Bagian Atas: Logo dan Tombol Menu */}
            <div className="flex flex-col gap-4 mb-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                {isSidebarOpen && (
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Menu Budidaya
                  </span>
                )}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-800 text-green-700 dark:text-green-400 rounded-lg transition-colors ml-auto shadow-sm border border-green-200 dark:border-green-800"
                >
                  {isSidebarOpen ? (
                    <ChevronLeft className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              </div>

              <button
                onClick={() => {
                  if (section === "ringkasan") window.location.reload();
                  else {
                    setSection("ringkasan");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                  if (window.innerWidth <= 1024) setIsSidebarOpen(false);
                }}
                className={`bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/20 border border-green-200 dark:border-green-800/60 rounded-2xl flex items-center cursor-pointer hover:shadow-md dark:hover:shadow-green-900/20 transition-all flex-shrink-0 ${isSidebarOpen ? "gap-3 p-4" : "justify-center p-3"}`}
              >
                <div className="flex items-center justify-center rounded-xl flex-shrink-0">
                  <img
                    src={LogoJOS}
                    alt="Logo Jangkrik.OS"
                    className="h-10 w-10 object-contain drop-shadow-md"
                  />
                </div>

                {isSidebarOpen && (
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="font-extrabold text-xl text-green-900 dark:text-green-50 tracking-tight leading-none truncate">
                      Jangkrik.OS
                    </span>
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mt-1">
                      Dashboard
                    </span>
                  </div>
                )}
              </button>
            </div>

            {/* Bagian Navigasi Utama */}
            <nav className="flex flex-col gap-1.5 flex-shrink-0 pb-4">
              {NAV.map((n) => {
                const isActive = section === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      if (isActive) window.location.reload();
                      else {
                        setSection(n.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                      if (window.innerWidth <= 1024) setIsSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative overflow-hidden flex-shrink-0
                  ${isActive ? "bg-green-700 text-white shadow-md shadow-green-700/30" : "text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-700 dark:hover:text-white"} ${!isSidebarOpen && "justify-center px-0"}`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    )}
                    <n.icon
                      className={`h-5 w-5 flex-shrink-0 relative z-10 transition-transform duration-200 ${isActive ? "text-white scale-110" : "text-gray-400 group-hover:text-green-600"}`}
                    />
                    {isSidebarOpen && (
                      <span className="whitespace-nowrap relative z-10 truncate flex-1 text-left">
                        {n.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Bagian Bawah: mt-auto akan mendorong blok ini ke bawah di layar PC */}
            <div className="mt-auto flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent ${!isSidebarOpen && "justify-center px-0"}`}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 flex-shrink-0 text-amber-500" />
                ) : (
                  <Moon className="h-5 w-5 flex-shrink-0 text-slate-500" />
                )}
                {isSidebarOpen && (darkMode ? "Light Mode" : "Dark Mode")}
              </button>

              <button
                onClick={() => {
                  if (section === "akun") window.location.reload();
                  else {
                    setSection("akun");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                  if (window.innerWidth <= 1024) setIsSidebarOpen(false);
                }}
                className={`bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800/50 rounded-xl flex items-center cursor-pointer hover:bg-green-100 dark:hover:bg-green-800/60 transition-colors shadow-sm text-left ${isSidebarOpen ? "gap-3 p-3" : "justify-center p-2.5"}`}
              >
                <div className="w-9 h-9 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-green-900 dark:text-green-100 font-bold text-sm flex-shrink-0 uppercase shadow-inner border border-green-300 dark:border-green-700">
                  {userData?.name ? userData.name.charAt(0) : "U"}
                </div>
                {isSidebarOpen && (
                  <div className="flex flex-col overflow-hidden justify-center flex-1 pr-1">
                    <span className="text-sm font-bold text-green-900 dark:text-green-100 truncate leading-none">
                      {userData?.name}
                    </span>
                    <span className="text-xs text-green-700 dark:text-green-400 truncate mt-1 leading-none">
                      {userData?.email === "haekalma01@gmail.com"
                        ? "Administrator"
                        : "Pengguna"}
                    </span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setShowLogoutModal(true)}
                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-800/50 cursor-pointer ${!isSidebarOpen && "justify-center px-0"}`}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {isSidebarOpen && "Keluar"}
              </button>
            </div>
          </div>
        </aside>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-4 left-4 z-20 lg:hidden p-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 active:scale-95 transition-transform"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all animate-slideUp">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4 border border-red-200 dark:border-red-800/50 shadow-inner">
                <LogOut className="w-8 h-8 ml-1" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Konfirmasi Keluar
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Apakah Anda yakin ingin keluar dari Jangkrik.OS? Anda harus
                login kembali untuk masuk.
              </p>
              <div className="flex w-full gap-3 mt-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    doLogout();
                  }}
                  className="flex-1 py-3.5 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
