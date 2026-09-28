import { BookOpen, Heart, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import LogoJOS from "../assets/LOGO.png";

export default function FooterCus() {
  const location = useLocation();

  // Fungsi khusus untuk menangani klik navigasi & scroll ke atas
  const handleNavClick = (e, path) => {
    if (location.pathname === path) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_.8fr_.8fr]">
          {/* BAGIAN KIRI (LOGO & DESKRIPSI) */}
          <div>
            <Link
              to="/"
              onClick={(e) => handleNavClick(e, "/")}
              className="inline-flex items-center gap-3 transition hover:opacity-80"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <img
                  src={LogoJOS}
                  alt="Logo Jangkrik.OS"
                  className="h-9 w-9 object-contain"
                />
              </span>
              <div>
                <p className="text-lg font-black">Jangkrik.OS</p>
                <p className="text-xs font-semibold text-slate-400">
                  Informasi & Pemesanan Jangkrik Alam
                </p>
              </div>
            </Link>
            <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-slate-400">
              Platform digital yang menghubungkan informasi Jangkrik Alam,
              pemesanan pelanggan, dan pengelolaan peternakan secara lebih
              teratur.
            </p>
          </div>

          {/* MENU JELAJAHI */}
          <div>
            <p className="text-sm font-black">Jelajahi</p>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-400">
              <Link
                to="/"
                onClick={(e) => handleNavClick(e, "/")}
                className="w-fit transition hover:text-emerald-300"
              >
                Beranda
              </Link>
              <Link
                to="/pengetahuan"
                onClick={(e) => handleNavClick(e, "/pengetahuan")}
                className="w-fit transition hover:text-emerald-300"
              >
                Pengetahuan
              </Link>
              <Link
                to="/pesan"
                onClick={(e) => handleNavClick(e, "/pesan")}
                className="w-fit transition hover:text-emerald-300"
              >
                Pesan Jangkrik
              </Link>
            </div>
          </div>

          {/* MENU PENGELOLA */}
          <div>
            <p className="text-sm font-black">Untuk pengelola</p>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-400">
              <Link
                to="/admin/login"
                onClick={(e) => handleNavClick(e, "/admin/login")}
                className="w-fit transition hover:text-emerald-300"
              >
                Masuk sebagai Pengelola
              </Link>
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Data pesanan tercatat
              </span>
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                Pengetahuan budidaya
              </span>
            </div>
          </div>
        </div>

        {/* COPYRIGHT AREA */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Jangkrik.OS. Dibuat untuk pengelolaan
            peternakan jangkrik yang lebih teratur.
          </p>
          <p className="flex items-center gap-1.5">
            Dibuat dengan{" "}
            <Heart className="h-3.5 w-3.5 fill-current text-emerald-400" />{" "}
            untuk Jangkrik Alam.
          </p>
        </div>
      </div>
    </footer>
  );
}
