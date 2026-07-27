import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ClipboardList,
  Package,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Search,
  Edit,
  Trash2,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  StickyNote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { exportCSV, exportPDF, fmtRupiah } from "../lib/exportUtils";

export default function Transaksi({ section }) {
  const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // FUNGSI UNTUK MENGAMBIL KTP/USER_ID
  const getUserId = () => {
    const userStr = localStorage.getItem("user_jangkrik_os");
    return userStr ? JSON.parse(userStr).id : null;
  };

  // ==========================================
  // STATE PENJUALAN
  // ==========================================
  const [sales, setSales] = useState([]);
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [savingSale, setSavingSale] = useState(false);
  const [formSale, setFormSale] = useState({
    tanggal: getTodayDate(),
    buyer: "",
    jenis: "",
    jumlah_kg: "",
    harga_per_kg: "",
    catatan: "",
  });

  const [cariPenjualan, setCariPenjualan] = useState("");
  const [waktuPenjualan, setWaktuPenjualan] = useState("tahunIni");
  const [limitPenjualan, setLimitPenjualan] = useState(10);
  const [isOpenLimitPenjualan, setIsOpenLimitPenjualan] = useState(false);
  const [isOpenWaktuPenjualan, setIsOpenWaktuPenjualan] = useState(false);
  const [currentPagePenjualan, setCurrentPagePenjualan] = useState(1);

  // ==========================================
  // STATE PEMBELIAN
  // ==========================================
  const [purchases, setPurchases] = useState([]);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);
  const [savingPurchase, setSavingPurchase] = useState(false);
  const [formPurchase, setFormPurchase] = useState({
    tanggal: getTodayDate(),
    supplier: "",
    jenis: "",
    jumlah: "",
    harga: "",
    catatan: "",
  });

  const [cariPembelian, setCariPembelian] = useState("");
  const [waktuPembelian, setWaktuPembelian] = useState("tahunIni");
  const [limitPembelian, setLimitPembelian] = useState(10);
  const [isOpenLimitPembelian, setIsOpenLimitPembelian] = useState(false);
  const [isOpenWaktuPembelian, setIsOpenWaktuPembelian] = useState(false);
  const [currentPagePembelian, setCurrentPagePembelian] = useState(1);
  const [isOpenJenis, setIsOpenJenis] = useState(false);

  // REFS UNTUK KLIK LUAR
  const jenisDropdownRef = useRef(null);
  const limitRef = useRef(null);
  const waktuRef = useRef(null);
  const limitPenjualanRef = useRef(null);
  const waktuPenjualanRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        jenisDropdownRef.current &&
        !jenisDropdownRef.current.contains(event.target)
      )
        setIsOpenJenis(false);
      if (limitRef.current && !limitRef.current.contains(event.target))
        setIsOpenLimitPembelian(false);
      if (waktuRef.current && !waktuRef.current.contains(event.target))
        setIsOpenWaktuPembelian(false);
      if (
        limitPenjualanRef.current &&
        !limitPenjualanRef.current.contains(event.target)
      )
        setIsOpenLimitPenjualan(false);
      if (
        waktuPenjualanRef.current &&
        !waktuPenjualanRef.current.contains(event.target)
      )
        setIsOpenWaktuPenjualan(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==========================================
  // FETCH DATA
  // ==========================================
  const fetchPenjualan = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await fetch(
        `https://be-jos.vercel.app/api/transaksi?user_id=${userId}&jenis=penjualan`,
      );
      const data = await response.json();
      setSales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal ambil data penjualan:", error);
      setSales([]);
    }
  };

  const fetchPembelian = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await fetch(
        `https://be-jos.vercel.app/api/transaksi?user_id=${userId}&jenis=pembelian`,
      );
      const data = await response.json();
      setPurchases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal ambil data pembelian:", error);
      setPurchases([]);
    }
  };

  useEffect(() => {
    fetchPenjualan();
    fetchPembelian();
  }, []);

  // ==========================================
  // CRUD PENJUALAN
  // ==========================================
  const submitSale = async (e) => {
    e.preventDefault();
    const userId = getUserId();
    if (!userId) {
      alert("Sesi login tidak valid!");
      return;
    }

    setSavingSale(true);
    const dataPayload = {
      user_id: userId,
      tanggal: formSale.tanggal,
      buyer: formSale.buyer,
      supplier: null,
      jumlah_kg: Number(formSale.jumlah_kg),
      harga_per_kg: Number(formSale.harga_per_kg),
      jumlah: null,
      harga: null,
      total: Number(formSale.jumlah_kg) * Number(formSale.harga_per_kg),
      catatan: formSale.catatan,
      jenis: "Penjualan",
      jenis_barang: "Jangkrik Alam",
    };

    try {
      const url = editingSaleId
        ? `https://be-jos.vercel.app/api/transaksi/${editingSaleId}`
        : "https://be-jos.vercel.app/api/transaksi";
      const method = editingSaleId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataPayload),
      });
      if (response.ok) {
        fetchPenjualan();
        setFormSale({
          tanggal: getTodayDate(),
          buyer: "",
          jenis: "",
          jumlah_kg: "",
          harga_per_kg: "",
          catatan: "",
        });
        setEditingSaleId(null);
      }
    } catch (error) {
      console.error("Gagal kirim:", error);
    } finally {
      setSavingSale(false);
    }
  };

  const handleEditSale = (item) => {
    setFormSale({
      tanggal: formatDateForInput(item.tanggal),
      buyer: item.buyer || item.pembeli || "",
      jenis: item.jenis || "",
      jumlah_kg: item.jumlah_kg || item.kg || item.jumlah || "",
      harga_per_kg: item.harga_per_kg || item.harga || "",
      catatan: item.catatan || "",
    });
    setEditingSaleId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==========================================
  // CRUD PEMBELIAN
  // ==========================================
  const submitPurchase = async (e) => {
    e.preventDefault();
    const userId = getUserId();
    if (!userId) {
      alert("Sesi login tidak valid!");
      return;
    }

    setSavingPurchase(true);
    const dataPayload = {
      user_id: userId,
      tanggal: formPurchase.tanggal,
      buyer: null,
      supplier: formPurchase.supplier,
      jumlah_kg: null,
      harga_per_kg: null,
      jumlah: Number(formPurchase.jumlah),
      harga: Number(formPurchase.harga),
      total: Number(formPurchase.jumlah) * Number(formPurchase.harga),
      catatan: formPurchase.catatan,
      jenis: "Pembelian",
      jenis_barang: formPurchase.jenis,
    };

    try {
      const url = editingPurchaseId
        ? `https://be-jos.vercel.app/api/transaksi/${editingPurchaseId}`
        : "https://be-jos.vercel.app/api/transaksi";
      const method = editingPurchaseId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataPayload),
      });
      if (response.ok) {
        fetchPembelian();
        setFormPurchase({
          tanggal: getTodayDate(),
          supplier: "",
          jenis: "",
          jumlah: "",
          harga: "",
          catatan: "",
        });
        setEditingPurchaseId(null);
      }
    } catch (error) {
      console.error("Gagal simpan data pembelian:", error);
    } finally {
      setSavingPurchase(false);
    }
  };

  const handleEditPurchase = (item) => {
    setFormPurchase({
      tanggal: formatDateForInput(item.tanggal),
      supplier: item.supplier || "",
      jenis: item.jenis_barang || "",
      jumlah: item.jumlah || "",
      harga: item.harga || "",
      catatan: item.catatan || "",
    });
    setEditingPurchaseId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ==========================================
  // STATE CUSTOM MODAL HAPUS TRANSAKSI
  // ==========================================
  const [deleteConfig, setDeleteConfig] = useState({
    isOpen: false,
    id: null,
    type: null,
  });

  const handleDeleteSale = (id) => {
    setDeleteConfig({ isOpen: true, id: id, type: "sale" });
  };

  const handleDeletePurchase = (id) => {
    setDeleteConfig({ isOpen: true, id: id, type: "purchase" });
  };

  const executeDeleteTransaksi = async () => {
    const { id, type } = deleteConfig;
    const userId = getUserId();
    if (!userId) return;

    try {
      await fetch(
        `https://be-jos.vercel.app/api/transaksi/${id}?user_id=${userId}`,
        {
          method: "DELETE",
        },
      );
      if (type === "sale") fetchPenjualan();
      else fetchPembelian();
    } catch (error) {
      console.error("Gagal hapus:", error);
    } finally {
      setDeleteConfig({ isOpen: false, id: null, type: null }); // Tutup modal
    }
  };

  // ==========================================
  // FILTER PENCARIAN & EXPORT (PENJUALAN)
  // ==========================================
  const dataPenjualanExport = useMemo(() => {
    let hasil = [...sales];
    const hariIni = new Date();
    if (waktuPenjualan !== "semua") {
      hasil = hasil.filter((item) => {
        if (!item.tanggal) return false;
        const tanggalItem = new Date(item.tanggal.split("T")[0]);
        if (waktuPenjualan === "mingguIni") {
          const bedaHari = Math.floor(
            (hariIni - tanggalItem) / (1000 * 60 * 60 * 24),
          );
          return bedaHari >= 0 && bedaHari <= 7;
        }
        if (waktuPenjualan === "bulanIni")
          return (
            tanggalItem.getMonth() === hariIni.getMonth() &&
            tanggalItem.getFullYear() === hariIni.getFullYear()
          );
        if (waktuPenjualan === "tahunIni")
          return tanggalItem.getFullYear() === hariIni.getFullYear();
        return true;
      });
    }
    if (cariPenjualan) {
      const keyword = cariPenjualan.toLowerCase();
      hasil = hasil.filter((r) => {
        const pembeli = (r.buyer || r.pembeli || "").toLowerCase();
        const kg = (r.jumlah_kg || r.kg || "").toString();
        const harga = (r.harga_per_kg || r.harga || "").toString();
        const total = (r.total || "").toString();
        let tanggalPanjang = "",
          tanggalPendek = "";
        if (r.tanggal) {
          const dateObj = new Date(r.tanggal.split("T")[0]);
          tanggalPanjang = dateObj
            .toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
            .toLowerCase();
          tanggalPendek = dateObj
            .toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
            .toLowerCase();
        }
        return (
          pembeli.includes(keyword) ||
          kg.includes(keyword) ||
          harga.includes(keyword) ||
          total.includes(keyword) ||
          tanggalPanjang.includes(keyword) ||
          tanggalPendek.includes(keyword)
        );
      });
    }
    return hasil;
  }, [sales, cariPenjualan, waktuPenjualan]);
  const tabelPenjualanTersaring = dataPenjualanExport;

  // ==========================================
  // FILTER PENCARIAN & EXPORT (PEMBELIAN)
  // ==========================================
  const dataPembelianExport = useMemo(() => {
    let hasil = [...purchases];
    const hariIni = new Date();
    if (waktuPembelian !== "semua") {
      hasil = hasil.filter((item) => {
        if (!item.tanggal) return false;
        const tanggalItem = new Date(item.tanggal.split("T")[0]);
        if (waktuPembelian === "mingguIni") {
          const bedaHari = Math.floor(
            (hariIni - tanggalItem) / (1000 * 60 * 60 * 24),
          );
          return bedaHari >= 0 && bedaHari <= 7;
        }
        if (waktuPembelian === "bulanIni")
          return (
            tanggalItem.getMonth() === hariIni.getMonth() &&
            tanggalItem.getFullYear() === hariIni.getFullYear()
          );
        if (waktuPembelian === "tahunIni")
          return tanggalItem.getFullYear() === hariIni.getFullYear();
        return true;
      });
    }
    if (cariPembelian) {
      const keyword = cariPembelian.toLowerCase();
      hasil = hasil.filter((r) => {
        const supplier = (r.supplier || "").toLowerCase();
        const jenisBrg = (r.jenis_barang || "").toLowerCase();
        const jml = (r.jumlah || "").toString();
        const hrg = (r.harga || "").toString();
        const tot = (r.total || "").toString();
        let tanggalPanjang = "",
          tanggalPendek = "";
        if (r.tanggal) {
          const dateObj = new Date(r.tanggal.split("T")[0]);
          tanggalPanjang = dateObj
            .toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
            .toLowerCase();
          tanggalPendek = dateObj
            .toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
            .toLowerCase();
        }
        return (
          supplier.includes(keyword) ||
          jenisBrg.includes(keyword) ||
          jml.includes(keyword) ||
          hrg.includes(keyword) ||
          tot.includes(keyword) ||
          tanggalPanjang.includes(keyword) ||
          tanggalPendek.includes(keyword)
        );
      });
    }
    return hasil;
  }, [purchases, cariPembelian, waktuPembelian]);
  const tabelPembelianTersaring = dataPembelianExport;

  return (
    <>
      {/* ========================================================================= */}
      {/* RENDER UI PENJUALAN */}
      {/* ========================================================================= */}
      {section === "penjualan" && (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Pencatatan Penjualan Jangkrik
              </h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
                Catat pemasukan harian dan ekspor laporan keuangan Anda.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => exportCSV(dataPenjualanExport, "penjualan")}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all shadow-sm active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" /> CSV / Excel
              </button>
              <button
                onClick={() => exportPDF(dataPenjualanExport, "penjualan")}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-sm font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all shadow-sm active:scale-95"
              >
                <FileText className="w-4 h-4" /> PDF Report
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingSaleId
                  ? "Edit Transaksi Penjualan"
                  : "Input Transaksi Baru"}
              </h2>
            </div>
            <form
              onSubmit={submitSale}
              className="flex flex-col gap-6 relative z-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                    Tanggal Penjualan
                  </label>
                  <input
                    required
                    type="date"
                    value={formSale.tanggal || ""}
                    onChange={(e) =>
                      setFormSale({ ...formSale, tanggal: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 hover:bg-white focus:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-800 dark:focus:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all dark:[color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                    Nama Pembeli
                  </label>
                  <input
                    required
                    placeholder="Cth: Kios Trondol"
                    value={formSale.buyer}
                    onChange={(e) =>
                      setFormSale({ ...formSale, buyer: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:focus:bg-gray-800 dark:border-gray-700 rounded-2xl bg-gray-50 hover:bg-white focus:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                    Volume Terjual (kg)
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="0"
                    value={formSale.jumlah_kg}
                    onChange={(e) =>
                      setFormSale({ ...formSale, jumlah_kg: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:focus:bg-gray-800 dark:border-gray-700 rounded-2xl bg-gray-50 hover:bg-white focus:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                    Harga per kg (Rp)
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="0"
                    value={formSale.harga_per_kg}
                    onChange={(e) =>
                      setFormSale({ ...formSale, harga_per_kg: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:focus:bg-gray-800 dark:border-gray-700 rounded-2xl bg-gray-50 hover:bg-white focus:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                    Catatan Tambahan
                  </label>
                  <input
                    placeholder="Opsional (mis: lunas/kasbon)"
                    value={formSale.catatan}
                    onChange={(e) =>
                      setFormSale({ ...formSale, catatan: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:focus:bg-gray-800 dark:border-gray-700 rounded-2xl bg-gray-50 hover:bg-white focus:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
                <div className="flex flex-col gap-3 justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingSale}
                    className="w-full bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white py-3.5 rounded-2xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {savingSale
                      ? "⏳ Menyimpan..."
                      : editingSaleId
                        ? "💾 Simpan Perubahan"
                        : "+ Tambah Catatan"}
                  </button>
                  {editingSaleId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSaleId(null);
                        setFormSale({
                          tanggal: getTodayDate(),
                          buyer: "",
                          jenis: "",
                          jumlah_kg: "",
                          harga_per_kg: "",
                          catatan: "",
                        });
                      }}
                      className="w-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 py-3 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition shadow-sm"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            {/* DIPERBAIKI: Disesuaikan dengan Produksi.jsx */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative" ref={limitPenjualanRef}>
                <button
                  onClick={() => setIsOpenLimitPenjualan(!isOpenLimitPenjualan)}
                  className="flex items-center justify-between w-36 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-white transition-colors text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-green-500"
                >
                  {limitPenjualan} Baris{" "}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpenLimitPenjualan ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpenLimitPenjualan && (
                  <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-y-auto py-1 animate-fadeIn">
                    {["10", "25", "50", "100"].map((val) => (
                      <div
                        key={val}
                        onClick={() => {
                          setLimitPenjualan(val);
                          setCurrentPagePenjualan(1);
                          setIsOpenLimitPenjualan(false);
                        }}
                        className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors ${limitPenjualan == val ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                      >
                        {val} Baris
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={waktuPenjualanRef}>
                <button
                  onClick={() => setIsOpenWaktuPenjualan(!isOpenWaktuPenjualan)}
                  className="flex items-center justify-between w-40 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-white transition-colors text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-green-500"
                >
                  {waktuPenjualan === "semua"
                    ? "Semua Waktu"
                    : waktuPenjualan === "mingguIni"
                      ? "Minggu Ini"
                      : waktuPenjualan === "bulanIni"
                        ? "Bulan Ini"
                        : "Tahun Ini"}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpenWaktuPenjualan ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpenWaktuPenjualan && (
                  <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-y-auto py-1 animate-fadeIn">
                    {[
                      { id: "semua", label: "Semua Waktu" },
                      { id: "mingguIni", label: "Minggu Ini" },
                      { id: "bulanIni", label: "Bulan Ini" },
                      { id: "tahunIni", label: "Tahun Ini" },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setWaktuPenjualan(opt.id);
                          setCurrentPagePenjualan(1);
                          setIsOpenWaktuPenjualan(false);
                        }}
                        className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors ${waktuPenjualan === opt.id ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari pembeli, tanggal, jumlah..."
                value={cariPenjualan}
                onChange={(e) => {
                  setCariPenjualan(e.target.value);
                  setCurrentPagePenjualan(1);
                }}
                className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-300 dark:border-gray-600">
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-green-600 text-white border-b-2 border-green-700 divide-x divide-green-500/50">
                    <th className="p-4 text-sm font-bold tracking-wide text-center">
                      Tanggal
                    </th>
                    <th className="p-4 text-sm font-bold tracking-wide px-5">
                      Nama Pembeli
                    </th>
                    <th className="p-4 text-sm font-bold tracking-wide text-center">
                      Volume (Kg)
                    </th>
                    <th className="p-4 text-sm font-bold tracking-wide text-right px-5">
                      Harga Satuan
                    </th>
                    <th className="p-4 text-sm font-bold tracking-wide text-right px-5">
                      Total Pendapatan
                    </th>
                    <th className="p-4 text-sm font-bold tracking-wide text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tabelPenjualanTersaring.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-16 text-center border-none"
                      >
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <ClipboardList className="w-12 h-12 mb-3 opacity-20" />
                          <p className="text-base font-medium">
                            Data tidak ditemukan.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tabelPenjualanTersaring
                      .slice(
                        (currentPagePenjualan - 1) * Number(limitPenjualan),
                        currentPagePenjualan * Number(limitPenjualan),
                      )
                      .map((r, idx) => (
                        <tr
                          key={r.id}
                          className={`${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"} hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors divide-x divide-gray-200 dark:divide-gray-700`}
                        >
                          <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
                            {r.tanggal
                              ? new Date(
                                  r.tanggal.split("T")[0],
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>
                          <td className="p-4 px-5 text-sm font-bold text-gray-800 dark:text-gray-100">
                            {r.buyer}
                          </td>
                          <td className="p-4 text-sm font-bold text-gray-800 dark:text-gray-100 text-center">
                            <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm">
                              {r.jumlah_kg}
                            </span>
                          </td>
                          <td className="p-4 px-5 text-sm font-medium text-gray-600 dark:text-gray-300 text-right">
                            {fmtRupiah(r.harga_per_kg)}
                          </td>
                          <td className="p-4 px-5 text-sm font-black text-green-700 dark:text-green-400 text-right">
                            {fmtRupiah(r.total)}
                          </td>
                          <td className="p-3 align-middle">
                            <div className="flex justify-center gap-2 relative z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditSale(r);
                                }}
                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-gray-700 dark:text-blue-400 rounded-lg transition-all"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 pointer-events-none" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSale(r.id);
                                }}
                                className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white dark:bg-gray-700 dark:text-red-400 rounded-lg transition-all"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4 pointer-events-none" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {tabelPenjualanTersaring.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Menampilkan{" "}
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {(currentPagePenjualan - 1) * Number(limitPenjualan) + 1}
                  </span>{" "}
                  hingga{" "}
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {Math.min(
                      currentPagePenjualan * Number(limitPenjualan),
                      tabelPenjualanTersaring.length,
                    )}
                  </span>{" "}
                  dari{" "}
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {tabelPenjualanTersaring.length}
                  </span>{" "}
                  transaksi
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPagePenjualan((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPagePenjualan === 1}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                    {/* class 'hidden sm:inline' ini yang menyembunyikan teks di HP */}
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800">
                    {currentPagePenjualan} /{" "}
                    {Math.max(
                      1,
                      Math.ceil(
                        tabelPenjualanTersaring.length / Number(limitPenjualan),
                      ),
                    )}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPagePenjualan((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(
                            tabelPenjualanTersaring.length /
                              Number(limitPenjualan),
                          ),
                        ),
                      )
                    }
                    disabled={
                      currentPagePenjualan >=
                      Math.ceil(
                        tabelPenjualanTersaring.length / Number(limitPenjualan),
                      )
                    }
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {/* class 'hidden sm:inline' ini yang menyembunyikan teks di HP */}
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="w-5 h-5 flex-shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RENDER UI PEMBELIAN */}
      {/* ========================================================================= */}
      {section === "pembelian" && (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Pembelian Kebutuhan / Biaya Produksi
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                Catat modal keluar untuk operasional.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => exportCSV(dataPembelianExport, "pembelian")}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all shadow-sm active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" /> CSV / Excel
              </button>
              <button
                onClick={() => exportPDF(dataPembelianExport, "pembelian")}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-sm font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all shadow-sm active:scale-95"
              >
                <FileText className="w-4 h-4" /> PDF Report
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-xl">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingPurchaseId
                  ? "Edit Transaksi Pembelian"
                  : "Input Pengeluaran Baru"}
              </h2>
            </div>

            <form
              onSubmit={submitPurchase}
              className="flex flex-col gap-6 relative z-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                    Tanggal Pembelian
                  </label>
                  <input
                    required
                    type="date"
                    value={formPurchase.tanggal || ""}
                    onChange={(e) =>
                      setFormPurchase({
                        ...formPurchase,
                        tanggal: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 hover:bg-white focus:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-800 dark:focus:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:[color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                    Nama Supplier / Nama Barang
                  </label>
                  <input
                    required
                    placeholder="Cth: Toko Pakan Berkah"
                    value={formPurchase.supplier}
                    onChange={(e) =>
                      setFormPurchase({
                        ...formPurchase,
                        supplier: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:focus:bg-gray-800 dark:border-gray-700 rounded-2xl bg-gray-50 hover:bg-white focus:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2 relative" ref={jenisDropdownRef}>
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                    Jenis Barang
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsOpenJenis(!isOpenJenis)}
                    className="flex items-center justify-between w-full px-4 py-3 border border-gray-200 dark:focus:bg-gray-800 dark:border-gray-700 rounded-2xl bg-gray-50 hover:bg-white focus:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm font-medium"
                  >
                    <span
                      className={
                        formPurchase.jenis
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500"
                      }
                    >
                      {formPurchase.jenis || "-- Pilih Jenis --"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpenJenis ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpenJenis && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1 animate-fadeIn max-h-60 overflow-y-auto custom-scrollbar">
                      {[
                        "Telur Jangkrik",
                        "Pakan Jangkrik",
                        "Telur Trey",
                        "Karung beras 25 Kg",
                        "Gedebok Pisang",
                        "Vitamin Jangkrik",
                        "Biaya Operasional",
                      ].map((opsi) => (
                        <div
                          key={opsi}
                          onClick={() => {
                            setFormPurchase({ ...formPurchase, jenis: opsi });
                            setIsOpenJenis(false);
                          }}
                          className={`px-4 py-3 cursor-pointer transition-colors text-sm font-medium border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${formPurchase.jenis === opsi ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                        >
                          {opsi}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                    Volume / Jumlah
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="0"
                    value={formPurchase.jumlah}
                    onChange={(e) =>
                      setFormPurchase({
                        ...formPurchase,
                        jumlah: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:focus:bg-gray-800 dark:border-gray-700 rounded-2xl bg-gray-50 hover:bg-white focus:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                    Harga Satuan (Rp)
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="0"
                    value={formPurchase.harga}
                    onChange={(e) =>
                      setFormPurchase({
                        ...formPurchase,
                        harga: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:focus:bg-gray-800 dark:border-gray-700 rounded-2xl bg-gray-50 hover:bg-white focus:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                    Catatan Tambahan
                  </label>
                  <input
                    placeholder="Opsional (mis: lunas/kasbon)"
                    value={formPurchase.catatan}
                    onChange={(e) =>
                      setFormPurchase({
                        ...formPurchase,
                        catatan: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 dark:focus:bg-gray-800 dark:border-gray-700 rounded-2xl bg-gray-50 hover:bg-white focus:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
                <button
                  type="submit"
                  disabled={savingPurchase}
                  className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white py-3.5 rounded-2xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {savingPurchase
                    ? "⏳ Menyimpan..."
                    : editingPurchaseId
                      ? "💾 Simpan Perubahan"
                      : "+ Tambah Catatan"}
                </button>
                {editingPurchaseId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPurchaseId(null);
                      setFormPurchase({
                        tanggal: getTodayDate(),
                        supplier: "",
                        jenis: "",
                        jumlah: "",
                        harga: "",
                        catatan: "",
                      });
                    }}
                    className="w-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 py-3.5 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition shadow-sm"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
            {/* DIPERBAIKI: Disesuaikan dengan Produksi.jsx */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative" ref={limitRef}>
                <button
                  onClick={() => setIsOpenLimitPembelian(!isOpenLimitPembelian)}
                  className="flex items-center justify-between w-36 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-white transition-colors text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {limitPembelian} Baris{" "}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpenLimitPembelian ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpenLimitPembelian && (
                  <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-y-auto py-1 animate-fadeIn">
                    {["10", "25", "50", "100"].map((val) => (
                      <div
                        key={val}
                        onClick={() => {
                          setLimitPembelian(val);
                          setCurrentPagePembelian(1);
                          setIsOpenLimitPembelian(false);
                        }}
                        className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors ${limitPembelian == val ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                      >
                        {val} Baris
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" ref={waktuRef}>
                <button
                  onClick={() => setIsOpenWaktuPembelian(!isOpenWaktuPembelian)}
                  className="flex items-center justify-between w-40 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-white transition-colors text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {waktuPembelian === "semua"
                    ? "Semua Waktu"
                    : waktuPembelian === "mingguIni"
                      ? "Minggu Ini"
                      : waktuPembelian === "bulanIni"
                        ? "Bulan Ini"
                        : "Tahun Ini"}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpenWaktuPembelian ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpenWaktuPembelian && (
                  <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-y-auto py-1 animate-fadeIn">
                    {[
                      { id: "semua", label: "Semua Waktu" },
                      { id: "mingguIni", label: "Minggu Ini" },
                      { id: "bulanIni", label: "Bulan Ini" },
                      { id: "tahunIni", label: "Tahun Ini" },
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setWaktuPembelian(opt.id);
                          setCurrentPagePembelian(1);
                          setIsOpenWaktuPembelian(false);
                        }}
                        className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors ${waktuPembelian === opt.id ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari supplier, tanggal, jenis..."
                value={cariPembelian}
                onChange={(e) => {
                  setCariPembelian(e.target.value);
                  setCurrentPagePembelian(1);
                }}
                className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-300 dark:border-gray-600">
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-blue-600 text-white border-b-2 border-blue-700 divide-x divide-blue-500/50">
                    <th className="p-4 text-sm font-bold tracking-wide text-center">
                      Tanggal
                    </th>
                    <th className="p-4 text-sm font-bold tracking-wide px-5 text-center">
                      Supplier
                    </th>
                    <th className="p-4 text-sm font-bold tracking-wide text-center">
                      Jenis Barang
                    </th>
                    <th className="p-4 text-sm font-bold tracking-wide text-center">
                      Jumlah
                    </th>
                    <th className="p-4 text-sm font-bold tracking-wide text-center px-5">
                      Harga Satuan
                    </th>
                    <th className="p-4 text-sm font-bold tracking-wide text-center px-5">
                      Total Pengeluaran
                    </th>
                    <th className="p-4 text-sm font-bold tracking-wide text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tabelPembelianTersaring.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-16 text-center border-none"
                      >
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Package className="w-12 h-12 mb-3 opacity-20" />
                          <p className="text-base font-medium">
                            Data tidak ditemukan.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tabelPembelianTersaring
                      .slice(
                        (currentPagePembelian - 1) * Number(limitPembelian),
                        currentPagePembelian * Number(limitPembelian),
                      )
                      .map((p, idx) => (
                        <tr
                          key={p.id}
                          className={`${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors divide-x divide-gray-200 dark:divide-gray-700`}
                        >
                          <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
                            {p.tanggal
                              ? new Date(
                                  p.tanggal.split("T")[0],
                                ).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>
                          <td className="p-4 px-5 text-sm font-bold text-gray-800 dark:text-gray-100 text-center">
                            {p.supplier}
                          </td>
                          <td className="p-4 text-sm font-bold text-gray-800 dark:text-gray-100 text-center">
                            <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm whitespace-nowrap">
                              {p.jenis_barang || "-"}
                            </span>
                          </td>
                          <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
                            {p.jumlah}
                          </td>
                          <td className="p-4 px-5 text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
                            {fmtRupiah(p.harga)}
                          </td>
                          <td className="p-4 px-5 text-sm font-black text-rose-600 dark:text-rose-400 text-center">
                            {fmtRupiah(p.total)}
                          </td>
                          <td className="p-3 align-middle">
                            <div className="flex justify-center gap-2 relative z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPurchase(p);
                                }}
                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-gray-700 dark:text-blue-400 rounded-lg transition-all"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4 pointer-events-none" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePurchase(p.id);
                                }}
                                className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white dark:bg-gray-700 dark:text-red-400 rounded-lg transition-all"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4 pointer-events-none" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {tabelPembelianTersaring.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Menampilkan{" "}
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {(currentPagePembelian - 1) * Number(limitPembelian) + 1}
                  </span>{" "}
                  hingga{" "}
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {Math.min(
                      currentPagePembelian * Number(limitPembelian),
                      tabelPembelianTersaring.length,
                    )}
                  </span>{" "}
                  dari{" "}
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {tabelPembelianTersaring.length}
                  </span>{" "}
                  transaksi
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPagePembelian((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPagePembelian === 1}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                    {/* class 'hidden sm:inline' ini yang menyembunyikan teks di HP */}
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
                    {currentPagePembelian} /{" "}
                    {Math.max(
                      1,
                      Math.ceil(
                        tabelPembelianTersaring.length / Number(limitPembelian),
                      ),
                    )}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPagePembelian((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(
                            tabelPembelianTersaring.length /
                              Number(limitPembelian),
                          ),
                        ),
                      )
                    }
                    disabled={
                      currentPagePembelian >=
                      Math.ceil(
                        tabelPembelianTersaring.length / Number(limitPembelian),
                      )
                    }
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {/* class 'hidden sm:inline' ini yang menyembunyikan teks di HP */}
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="w-5 h-5 flex-shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* CUSTOM MODAL HAPUS TRANSAKSI */}
      {deleteConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all animate-slideUp">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Hapus Transaksi?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Apakah Anda yakin ingin menghapus data{" "}
                {deleteConfig.type === "sale" ? "penjualan" : "pembelian"} ini
                secara permanen dari pembukuan?
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() =>
                    setDeleteConfig({ isOpen: false, id: null, type: null })
                  }
                  className="flex-1 py-3.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={executeDeleteTransaksi}
                  className="flex-1 py-3.5 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* CARD CATATAN KHUSUS TRANSAKSI */}
      {(section === "penjualan"
        ? tabelPenjualanTersaring
        : tabelPembelianTersaring
      ).filter((t) => t.catatan && t.catatan.trim() !== "").length > 0 && (
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 p-6 sm:p-8 rounded-3xl border border-indigo-100 dark:border-indigo-800/40 shadow-sm mt-8 relative overflow-hidden mb-10">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <StickyNote className="w-48 h-48 text-indigo-500" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <StickyNote className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Kumpulan Catatan{" "}
              {section === "penjualan" ? "Penjualan" : "Pembelian"}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {(section === "penjualan"
              ? tabelPenjualanTersaring
              : tabelPembelianTersaring
            )
              .filter((t) => t.catatan && t.catatan.trim() !== "")
              .map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-indigo-50 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">
                    Tgl:{" "}
                    {new Date(c.tanggal.split("T")[0]).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
                    "{c.catatan}"
                  </p>
                  <div className="flex gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg inline-flex">
                    <span>
                      {section === "penjualan"
                        ? `Pembeli: ${c.buyer}`
                        : `Supplier: ${c.supplier}`}
                    </span>
                    <span>|</span>
                    <span className="text-green-600 dark:text-green-400">
                      Total: {fmtRupiah(c.total)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
