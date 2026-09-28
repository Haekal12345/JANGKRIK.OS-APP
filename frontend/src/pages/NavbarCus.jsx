import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Home, Menu, ShoppingBag, X } from "lucide-react";
import LogoJOS from "../assets/LOGO.png";

// Struktur data menu yang lebih rapi
const navItems = [
  { label: "Beranda", to: "/", icon: Home },
  { label: "Pengetahuan", to: "/pengetahuan", icon: BookOpen },
  { label: "Pesan Jangkrik", to: "/pesan", icon: ShoppingBag },
];

export default function NavbarCus() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Cek apakah halaman sedang aktif
  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  // Fungsi khusus untuk menangani klik navigasi & scroll
  const handleNavClick = (e, path) => {
    if (location.pathname === path) {
      // Jika klik halaman saat ini, smooth scroll ke atas
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Jika pindah halaman, pastikan mulai dari atas (tanpa animasi agar instan)
      window.scrollTo(0, 0);
    }
    setOpen(false); // Tutup menu mobile jika sedang terbuka
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-emerald-200/80 bg-white/90 shadow-[0_14px_45px_rgba(15,23,42,.10)] backdrop-blur-xl">
        <div className="h-1 bg-emerald-600" />
        <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-2 sm:px-5">
          {/* LOGO SECTION */}
          <Link
            to="/"
            onClick={(e) => handleNavClick(e, "/")}
            className="flex min-w-0 items-center gap-3 transition hover:opacity-80"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
              <img
                src={LogoJOS}
                alt="Logo Jangkrik.OS"
                className="h-8 w-8 object-contain"
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-black tracking-tight text-slate-950 sm:text-base">
                Jangkrik.OS
              </span>
              <span className="hidden text-[10px] font-bold text-slate-500 sm:block">
                Informasi & Pemesanan Jangkrik Alam
              </span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-1 rounded-xl bg-slate-50 p-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={(e) => handleNavClick(e, item.to)}
                className={`rounded-lg px-4 py-2 text-sm font-black transition ${
                  isActive(item.to)
                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-600 hover:bg-white hover:text-emerald-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* DESKTOP CTA BUTTON */}
          <Link
            to="/pesan"
            onClick={(e) => handleNavClick(e, "/pesan")}
            className="hidden items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-600/15 transition hover:-translate-y-0.5 hover:bg-emerald-700 md:inline-flex"
          >
            <ShoppingBag className="h-4 w-4" /> Pesan
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* MOBILE NAVIGATION DROPDOWN */}
        {open && (
          <div className="border-t border-slate-100 px-3 pb-3 pt-2 md:hidden">
            <nav className="grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={(e) => handleNavClick(e, item.to)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black transition-colors ${
                      isActive(item.to)
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
