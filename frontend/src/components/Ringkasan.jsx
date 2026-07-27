import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Wallet,
  ShoppingCart,
  TrendingUp,
  Package,
  ClipboardList,
  Bell,
  Calendar,
  CalendarDays,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { fmtRupiah } from "../lib/exportUtils";

export default function Ringkasan() {
  // ==========================================
  // 1. STATE DATA DARI DATABASE
  // ==========================================
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [jadwalPanen, setJadwalPanen] = useState([]);

  // ==========================================
  // 2. STATE FILTER (GLOBAL & BI)
  // ==========================================
  // Filter Global Ringkasan
  const [rentangWaktu, setRentangWaktu] = useState("tahunIni");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const ringkasanFilterRef = useRef(null);

  // Filter Khusus BI (Business Intelligence) - Otomatis 3 Tahun Terakhir
  const currentYear = new Date().getFullYear();
  const last3Years = [
    currentYear.toString(),
    (currentYear - 1).toString(),
    (currentYear - 2).toString(),
  ];
  const [tahunBI, setTahunBI] = useState(currentYear.toString());
  const [isOpenTahunBI, setIsOpenTahunBI] = useState(false);
  const tahunBIRef = useRef(null);

  // Filter Kustom Tahun BI (Input Manual)
  const [showCustomYear, setShowCustomYear] = useState(false);
  const [customYearInput, setCustomYearInput] = useState("");
  const customYearRef = useRef(null);

  // ==========================================
  // 3. FUNGSI & EFEK (FETCH & EVENT LISTENER)
  // ==========================================
  const getUserId = () => {
    const userStr = localStorage.getItem("user_jangkrik_os");
    return userStr ? JSON.parse(userStr).id : null;
  };

  const fetchData = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const [resSales, resPurchases, resJadwal] = await Promise.all([
        fetch(
          `https://be-jos.vercel.app/api/transaksi?user_id=${userId}&jenis=penjualan`,
        ),
        fetch(
          `https://be-jos.vercel.app/api/transaksi?user_id=${userId}&jenis=pembelian`,
        ),
        fetch(`https://be-jos.vercel.app/api/penanggalan?user_id=${userId}`),
      ]);

      const dataSales = await resSales.json();
      const dataPurchases = await resPurchases.json();
      const dataJadwal = await resJadwal.json();

      setSales(Array.isArray(dataSales) ? dataSales : []);
      setPurchases(Array.isArray(dataPurchases) ? dataPurchases : []);
      setJadwalPanen(Array.isArray(dataJadwal) ? dataJadwal : []);
    } catch (error) {
      console.error("Gagal menarik data untuk ringkasan:", error);
      setSales([]);
      setPurchases([]);
      setJadwalPanen([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Menutup dropdown jika klik di luar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        ringkasanFilterRef.current &&
        !ringkasanFilterRef.current.contains(event.target)
      ) {
        setIsFilterOpen(false);
      }
      if (tahunBIRef.current && !tahunBIRef.current.contains(event.target)) {
        setIsOpenTahunBI(false);
      }
      if (
        customYearRef.current &&
        !customYearRef.current.contains(event.target)
      ) {
        setShowCustomYear(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCustomYearSubmit = (e) => {
    e.preventDefault();
    if (customYearInput.trim().length === 4) {
      setTahunBI(customYearInput);
      setShowCustomYear(false);
      setCustomYearInput("");
    }
  };

  // ==========================================
  // 4. MEMOIZATION & KALKULASI DATA
  // ==========================================

  // A. Filter Penjualan
  const filteredSales = useMemo(() => {
    const today = new Date();
    return sales.filter((item) => {
      if (rentangWaktu === "semua") return true;
      if (!item.tanggal) return false;
      const itemDate = new Date(item.tanggal.split("T")[0]);

      if (rentangWaktu === "7hari") {
        const diffDays = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
      }
      if (rentangWaktu === "bulanIni") {
        return (
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );
      }
      if (rentangWaktu === "tahunIni") {
        return itemDate.getFullYear() === today.getFullYear();
      }
      if (rentangWaktu === "kustom") {
        if (!customDateRange.start || !customDateRange.end) return true;
        const startDate = new Date(customDateRange.start);
        const endDate = new Date(customDateRange.end);
        endDate.setHours(23, 59, 59, 999);
        return itemDate >= startDate && itemDate <= endDate;
      }
      return true;
    });
  }, [sales, rentangWaktu, customDateRange]);

  // B. Filter Pembelian
  const filteredPurchases = useMemo(() => {
    const today = new Date();
    return purchases.filter((item) => {
      if (rentangWaktu === "semua") return true;
      if (!item.tanggal) return false;
      const itemDate = new Date(item.tanggal.split("T")[0]);

      if (rentangWaktu === "7hari") {
        const diffDays = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0;
      }
      if (rentangWaktu === "bulanIni") {
        return (
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );
      }
      if (rentangWaktu === "tahunIni") {
        return itemDate.getFullYear() === today.getFullYear();
      }
      if (rentangWaktu === "kustom") {
        if (!customDateRange.start || !customDateRange.end) return true;
        const startDate = new Date(customDateRange.start);
        const endDate = new Date(customDateRange.end);
        endDate.setHours(23, 59, 59, 999);
        return itemDate >= startDate && itemDate <= endDate;
      }
      return true;
    });
  }, [purchases, rentangWaktu, customDateRange]);

  // C. Kalkulasi Total
  const totalPendapatan = useMemo(
    () => filteredSales.reduce((s, r) => s + r.total, 0),
    [filteredSales],
  );
  const totalKg = useMemo(
    () => filteredSales.reduce((s, r) => s + Number(r.jumlah_kg || 0), 0),
    [filteredSales],
  );
  const totalPengeluaran = useMemo(
    () => filteredPurchases.reduce((s, p) => s + p.total, 0),
    [filteredPurchases],
  );
  const labaBersih = totalPendapatan - totalPengeluaran;

  // D. Kalkulasi Grafik Harian
  const trendPendapatan = useMemo(() => {
    const grouped = {};
    filteredSales.forEach((s) => {
      if (!s.tanggal) return;
      const tgl = s.tanggal.split("T")[0];
      if (!grouped[tgl]) grouped[tgl] = 0;
      grouped[tgl] += s.total;
    });
    return Object.keys(grouped)
      .sort()
      .map((tgl) => ({ tanggal: tgl, Pendapatan: grouped[tgl] }));
  }, [filteredSales]);

  const trendPengeluaran = useMemo(() => {
    const grouped = {};
    filteredPurchases.forEach((p) => {
      if (!p.tanggal) return;
      const tgl = p.tanggal.split("T")[0];
      if (!grouped[tgl]) grouped[tgl] = 0;
      grouped[tgl] += p.total;
    });
    return Object.keys(grouped)
      .sort()
      .map((tgl) => ({ tanggal: tgl, Pengeluaran: grouped[tgl] }));
  }, [filteredPurchases]);

  // E. Kalkulasi BI (Bulanan)
  const trendBulanan = useMemo(() => {
    const namaBulan = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Ags",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const dataBulanan = namaBulan.map((bulan) => ({
      bulan: bulan,
      Pendapatan: 0,
      Pengeluaran: 0,
    }));

    sales.forEach((s) => {
      if (!s.tanggal) return;
      const dateObj = new Date(s.tanggal.split("T")[0]);
      if (dateObj.getFullYear().toString() === tahunBI) {
        const monthIdx = dateObj.getMonth();
        dataBulanan[monthIdx].Pendapatan += s.total;
      }
    });

    purchases.forEach((p) => {
      if (!p.tanggal) return;
      const dateObj = new Date(p.tanggal.split("T")[0]);
      if (dateObj.getFullYear().toString() === tahunBI) {
        const monthIdx = dateObj.getMonth();
        dataBulanan[monthIdx].Pengeluaran += p.total;
      }
    });

    return dataBulanan;
  }, [sales, purchases, tahunBI]);

  const hasDataBulanan = useMemo(() => {
    return trendBulanan.some((d) => d.Pendapatan > 0 || d.Pengeluaran > 0);
  }, [trendBulanan]);

  // F. Logika Pengingat Panen
  const panenTerdekat = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return jadwalPanen
      .filter(
        (panen) =>
          new Date(panen.panenSelesai) >= today &&
          panen.status === "Dalam Proses",
      )
      .sort((a, b) => new Date(a.panenMulai) - new Date(b.panenMulai))
      .slice(0, 3);
  }, [jadwalPanen]);

  // ==========================================
  // 5. RENDER UI / JSX
  // ==========================================
  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* HEADER & GLOBAL FILTER */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Ringkasan Peternakan
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
            Pantau performa produksi, pendapatan, dan kesehatan finansial.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {rentangWaktu === "kustom" && (
            <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/30 px-4 py-2.5 border border-green-200 dark:border-green-800/50 rounded-xl shadow-sm animate-fadeIn">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) =>
                  setCustomDateRange({
                    ...customDateRange,
                    start: e.target.value,
                  })
                }
                className="bg-transparent text-sm font-bold text-green-800 dark:text-green-300 outline-none cursor-pointer dark:[color-scheme:dark]"
              />
              <span className="text-green-600 dark:text-green-400 font-bold opacity-50">
                -
              </span>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) =>
                  setCustomDateRange({
                    ...customDateRange,
                    end: e.target.value,
                  })
                }
                className="bg-transparent text-sm font-bold text-green-800 dark:text-green-300 outline-none cursor-pointer dark:[color-scheme:dark]"
              />
            </div>
          )}

          <div className="relative" ref={ringkasanFilterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-between w-48 px-5 py-2.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded-xl text-sm font-bold text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/60 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {rentangWaktu === "semua"
                  ? "Semua Waktu"
                  : rentangWaktu === "7hari"
                    ? "7 Hari Terakhir"
                    : rentangWaktu === "bulanIni"
                      ? "Bulan Ini"
                      : rentangWaktu === "tahunIni"
                        ? "Tahun Ini"
                        : "Pilih Kustom"}
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 z-50 w-48 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1 animate-fadeIn">
                {[
                  { id: "7hari", label: "7 Hari Terakhir" },
                  { id: "bulanIni", label: "Bulan Ini" },
                  { id: "tahunIni", label: "Tahun Ini" },
                  { id: "semua", label: "Semua Waktu" },
                  { id: "kustom", label: "Pilih Kustom..." },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setRentangWaktu(opt.id);
                      setIsFilterOpen(false);
                      if (opt.id !== "kustom")
                        setCustomDateRange({ start: "", end: "" });
                    }}
                    className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors ${rentangWaktu === opt.id ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GRID KARTU METRIK UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="inline-flex rounded-2xl bg-gradient-to-br from-green-400 to-green-600 text-white p-3 mb-4 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
            <Wallet className="h-6 w-6" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">
            Total Penjualan
          </p>
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {fmtRupiah(totalPendapatan)}
          </h3>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div className="inline-flex rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white p-3 mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">
            Total Pengeluaran
          </p>
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {fmtRupiah(totalPengeluaran)}
          </h3>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <div
            className={`inline-flex rounded-2xl text-white p-3 mb-4 shadow-lg transition-transform group-hover:scale-110 ${labaBersih >= 0 ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30" : "bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/30"}`}
          >
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">
            Laba Bersih
          </p>
          <h3
            className={`text-2xl font-extrabold ${labaBersih >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
          >
            {fmtRupiah(labaBersih)}
          </h3>
        </div>

        <div className="lg:row-span-2 bg-gradient-to-br from-orange-400 to-orange-600 p-8 rounded-3xl shadow-xl shadow-orange-500/20 text-white flex flex-col justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 border border-orange-300/50">
          <div className="inline-flex rounded-2xl bg-white/20 backdrop-blur-md text-white p-3 mb-4 w-fit z-10 border border-white/20 shadow-inner">
            <Package className="h-7 w-7" />
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-100 z-10 mb-2">
            Total Volume Terjual
          </p>
          <div className="z-10 flex items-baseline gap-2">
            <h3 className="text-5xl font-black tracking-tight drop-shadow-md">
              {totalKg}
            </h3>
            <span className="text-2xl font-bold text-orange-200">kg</span>
          </div>
          <Package className="absolute -bottom-8 -right-8 w-48 h-48 text-white opacity-20 z-0 transform rotate-12 group-hover:rotate-45 group-hover:scale-110 transition-all duration-700" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-100 transition-colors">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Frekuensi Penjualan
              </p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-baseline gap-2">
                {filteredSales.length}
                <span className="text-sm font-semibold text-gray-500 normal-case tracking-normal">
                  transaksi sukses
                </span>
              </h3>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800/50">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Live Data
            </span>
          </div>
        </div>
      </div>

      {/* PENGINGAT PANEN TERDEKAT */}
      {panenTerdekat.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-3xl p-6 transition-all shadow-sm flex flex-col md:flex-row gap-5 items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 opacity-5 rounded-full blur-2xl"></div>
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-4 rounded-2xl shrink-0 shadow-lg shadow-amber-500/30">
            <Bell className="w-7 h-7 animate-pulse" />
          </div>
          <div className="flex-1 w-full z-10">
            <h3 className="text-xl font-extrabold text-amber-900 dark:text-amber-400 mb-4">
              Pengingat Jadwal Panen Terdekat
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {panenTerdekat.map((panen) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tglMulai = new Date(panen.panenMulai);
                const tglSelesai = new Date(panen.panenSelesai);
                const diffDays = Math.ceil(
                  (tglMulai - today) / (1000 * 60 * 60 * 24),
                );

                let badgeText = "",
                  badgeColor = "";
                if (diffDays > 0) {
                  badgeText = `H - ${diffDays}`;
                  badgeColor =
                    "text-blue-700 bg-blue-100 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800";
                } else if (diffDays <= 0 && tglSelesai >= today) {
                  badgeText = "Masa Panen!";
                  badgeColor =
                    "text-green-800 bg-green-100 border-green-300 dark:bg-green-900/60 dark:text-green-300 dark:border-green-700 animate-pulse";
                }

                return (
                  <div
                    key={panen.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-amber-100 dark:border-amber-700/30 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
                    <div className="flex justify-between items-start ml-2 mb-3">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate pr-2">
                        {panen.lokasi}
                      </p>
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${badgeColor} shrink-0 uppercase tracking-widest`}
                      >
                        {badgeText}
                      </span>
                    </div>
                    <div className="ml-2 flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="text-center w-full border-r border-gray-200 dark:border-gray-700">
                        <span className="block text-[9px] uppercase mb-0.5 opacity-70">
                          Mulai
                        </span>
                        <span className="text-gray-800 dark:text-gray-200">
                          {panen.panenMulai
                            ? panen.panenMulai.split("T")[0]
                            : "-"}
                        </span>
                      </div>
                      <div className="text-center w-full">
                        <span className="block text-[9px] uppercase mb-0.5 opacity-70">
                          Selesai
                        </span>
                        <span className="text-gray-800 dark:text-gray-200">
                          {panen.panenSelesai
                            ? panen.panenSelesai.split("T")[0]
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GRAFIK TREN HARIAN (PENJUALAN & PENGELUARAN) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        {/* Grafik Pendapatan Harian */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md flex flex-col h-[350px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Tren Pendapatan Harian
            </h3>
          </div>
          {!trendPendapatan || trendPendapatan.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/20">
              <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium text-sm">
                Belum ada data penjualan
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendPendapatan}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorPendapatan"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="tanggal"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    dy={10}
                    tickFormatter={(str) => (str ? str.split("T")[0] : "")}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    tickFormatter={(v) => {
                      if (v === 0) return "Rp 0";
                      if (v >= 1000) return `Rp ${v / 1000}k`;
                      return `Rp ${v}`;
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                    }}
                    formatter={(v) => [fmtRupiah(v), "Pendapatan"]}
                    labelFormatter={(label) =>
                      label ? label.split("T")[0] : ""
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="Pendapatan"
                    stroke="#10b981"
                    fill="url(#colorPendapatan)"
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Grafik Pengeluaran Harian */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md flex flex-col h-[350px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Tren Pengeluaran Harian
            </h3>
          </div>
          {!trendPengeluaran || trendPengeluaran.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/20">
              <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium text-sm">
                Belum ada data pengeluaran
              </p>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendPengeluaran}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorPembelian"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="tanggal"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    dy={10}
                    tickFormatter={(str) => (str ? str.split("T")[0] : "")}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    tickFormatter={(v) => {
                      if (v === 0) return "Rp 0";
                      if (v >= 1000) return `Rp ${v / 1000}k`;
                      return `Rp ${v}`;
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                    }}
                    formatter={(v) => [fmtRupiah(v), "Pengeluaran"]}
                    labelFormatter={(label) =>
                      label ? label.split("T")[0] : ""
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="Pengeluaran"
                    stroke="#3b82f6"
                    fill="url(#colorPembelian)"
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* AREA GRAFIK BI: VISUALISASI TREN BULANAN                              */}
      {/* ===================================================================== */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm mt-8 relative overflow-hidden">
        <div className="absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-gradient-to-b from-green-400 to-green-600 rounded-r-lg opacity-80"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="pl-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Visualisasi Tren Pendapatan Bulanan
              </h3>
            </div>
            <p className="text-sm font-medium text-gray-500 italic max-w-2xl mt-3">
              "Visualisasi ini akan di update mengikuti data yang ada, memetakan
              tren pendapatan untuk mengidentifikasi pola musiman dan
              fluktuasi."
            </p>
          </div>

          {/* TOMBOL KALENDER & DROPDOWN BI */}
          <div className="flex items-center gap-2 relative z-10 px-4 sm:px-0">
            <div className="relative" ref={customYearRef}>
              <button
                onClick={() => setShowCustomYear(!showCustomYear)}
                className="flex items-center justify-between p-2.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded-xl text-sm font-bold text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/60 transition-colors shadow-sm"
                title="Pilih Tahun Lainnya"
              >
                <Calendar className="w-5 h-5" />
              </button>

              {showCustomYear && (
                <div className="absolute right-0 sm:right-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl w-48 animate-fadeIn z-30">
                  <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">
                    Masukkan Tahun
                  </label>
                  <form
                    onSubmit={handleCustomYearSubmit}
                    className="flex gap-2"
                  >
                    <input
                      type="number"
                      required
                      min="2000"
                      max="2100"
                      value={customYearInput}
                      onChange={(e) => setCustomYearInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:border-green-500 dark:bg-gray-900 dark:text-white font-medium"
                      placeholder="Cth: 2022"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 active:scale-95 transition-transform"
                    >
                      OK
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="relative" ref={tahunBIRef}>
              <button
                onClick={() => setIsOpenTahunBI(!isOpenTahunBI)}
                className="flex items-center justify-between w-36 px-4 py-2.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded-xl text-sm font-bold text-green-800 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/60 transition-colors shadow-sm"
              >
                Tahun {tahunBI}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isOpenTahunBI ? "rotate-180" : ""}`}
                />
              </button>

              {isOpenTahunBI && (
                <div className="absolute right-0 z-20 w-36 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1 animate-fadeIn">
                  {last3Years.map((thn) => (
                    <div
                      key={thn}
                      onClick={() => {
                        setTahunBI(thn);
                        setIsOpenTahunBI(false);
                      }}
                      className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors ${tahunBI === thn ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                    >
                      Tahun {thn}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          {!hasDataBulanan ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/20 h-full">
              <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium text-sm">
                Belum ada data bulanan pada rentang waktu ini
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendBulanan}
                margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient
                    id="colorPendapatanBulanan"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient
                    id="colorPengeluaranBulanan"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                  strokeOpacity={0.5}
                />

                <XAxis
                  dataKey="bulan"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 13, fontWeight: 600 }}
                  dy={15}
                />
                <YAxis
                  axisLine={{ stroke: "#e5e7eb", strokeWidth: 2 }}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(v) => {
                    if (v === 0) return "Rp 0";
                    if (v >= 1000000)
                      return `Rp ${parseFloat((v / 1000000).toFixed(1))} Jt`;
                    if (v >= 1000)
                      return `Rp ${parseFloat((v / 1000).toFixed(1))}k`;
                    return `Rp ${v}`;
                  }}
                  width={80}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    padding: "12px 20px",
                  }}
                  formatter={(v, name) => [fmtRupiah(v), name]}
                  labelStyle={{
                    fontWeight: "bold",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                />

                <Area
                  type="monotone"
                  name="Total Pengeluaran"
                  dataKey="Pengeluaran"
                  stroke="#3b82f6"
                  fill="url(#colorPengeluaranBulanan)"
                  strokeWidth={3}
                  activeDot={{
                    r: 6,
                    fill: "#fff",
                    stroke: "#3b82f6",
                    strokeWidth: 3,
                  }}
                />
                <Area
                  type="monotone"
                  name="Total Pendapatan"
                  dataKey="Pendapatan"
                  stroke="#10b981"
                  fill="url(#colorPendapatanBulanan)"
                  strokeWidth={4}
                  activeDot={{
                    r: 8,
                    fill: "#fff",
                    stroke: "#10b981",
                    strokeWidth: 3,
                  }}
                  dot={{
                    r: 5,
                    fill: "#fff",
                    stroke: "#10b981",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
