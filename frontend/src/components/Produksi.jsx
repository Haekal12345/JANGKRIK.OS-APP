import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Settings,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  StickyNote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { exportCSV, exportPDF } from "../lib/exportUtils";

export default function Produksi() {
  const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const getUserId = () => {
    const userStr = localStorage.getItem("user_jangkrik_os");
    return userStr ? JSON.parse(userStr).id : null;
  };

  const [dataProduksi, setDataProduksi] = useState([]);
  const [editingProduksiId, setEditingProduksiId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState(null);

  const [formProduksi, setFormProduksi] = useState({
    tanggal_tebar: getTodayDate(),
    jumlah_telur_per_gram: "",
    pengeraman_per_hari: "",
    pakan: "",
    vitamin: "",
    hasil_panen: "",
    terjual: "",
    catatan: "",
  });

  const limitProduksiRef = useRef(null);
  const waktuProduksiRef = useRef(null);
  const [limitProduksi, setLimitProduksi] = useState("10");
  const [waktuProduksi, setWaktuProduksi] = useState("tahunIni");
  const [cariProduksi, setCariProduksi] = useState("");
  const [currentPageProduksi, setCurrentPageProduksi] = useState(1);
  const [isOpenLimitProduksi, setIsOpenLimitProduksi] = useState(false);
  const [isOpenWaktuProduksi, setIsOpenWaktuProduksi] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        limitProduksiRef.current &&
        !limitProduksiRef.current.contains(event.target)
      )
        setIsOpenLimitProduksi(false);
      if (
        waktuProduksiRef.current &&
        !waktuProduksiRef.current.contains(event.target)
      )
        setIsOpenWaktuProduksi(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProduksi = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await fetch(
        `https://be-jos.vercel.app/api/produksi?user_id=${userId}`,
      );
      const data = await response.json();
      setDataProduksi(Array.isArray(data) ? data : []);
    } catch (error) {
      setDataProduksi([]);
    }
  };

  useEffect(() => {
    fetchProduksi();
  }, []);

  const submitProduksi = async (e) => {
    e.preventDefault();
    const userId = getUserId();
    if (!userId) return alert("Sesi login tidak valid!");

    setSaving(true);
    const payload = {
      user_id: userId,
      ...formProduksi,
      jumlah_telur_per_gram: Number(formProduksi.jumlah_telur_per_gram),
      pengeraman_per_hari: Number(formProduksi.pengeraman_per_hari),
      hasil_panen: Number(formProduksi.hasil_panen),
      terjual: Number(formProduksi.terjual || 0),
    };

    try {
      const url = editingProduksiId
        ? `https://be-jos.vercel.app/api/produksi/${editingProduksiId}`
        : "https://be-jos.vercel.app/api/produksi";
      const method = editingProduksiId ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchProduksi();
        setFormProduksi({
          tanggal_tebar: getTodayDate(),
          jumlah_telur_per_gram: "",
          pengeraman_per_hari: "",
          pakan: "",
          vitamin: "",
          hasil_panen: "",
          terjual: "",
          catatan: "",
        });
        setEditingProduksiId(null);
      }
    } catch (error) {
      console.error("Gagal simpan produksi:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditProduksi = (item) => {
    setFormProduksi({
      tanggal_tebar: item.tanggal_tebar ? item.tanggal_tebar.split("T")[0] : "",
      jumlah_telur_per_gram: item.jumlah_telur_per_gram,
      pengeraman_per_hari: item.pengeraman_per_hari,
      pakan: item.pakan || "",
      vitamin: item.vitamin || "",
      hasil_panen: item.hasil_panen,
      terjual: item.terjual || "",
      catatan: item.catatan || "",
    });
    setEditingProduksiId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProduksi = (id) => {
    setDeleteModalId(id);
  };

  const executeDeleteProduksi = async () => {
    const userId = getUserId();
    if (!userId || !deleteModalId) return;

    try {
      await fetch(
        `https://be-jos.vercel.app/api/produksi/${deleteModalId}?user_id=${userId}`,
        {
          method: "DELETE",
        },
      );
      fetchProduksi();
    } catch (error) {
      console.error("Gagal hapus:", error);
    } finally {
      setDeleteModalId(null);
    }
  };

  const dataProduksiExport = useMemo(() => {
    let hasil = [...dataProduksi];
    const hariIni = new Date();

    if (waktuProduksi !== "semua") {
      hasil = hasil.filter((item) => {
        if (!item.tanggal_tebar) return false;
        const tanggalItem = new Date(item.tanggal_tebar.split("T")[0]);
        if (waktuProduksi === "mingguIni") {
          const bedaHari = Math.floor(
            (hariIni - tanggalItem) / (1000 * 60 * 60 * 24),
          );
          return bedaHari >= 0 && bedaHari <= 7;
        }
        if (waktuProduksi === "bulanIni")
          return (
            tanggalItem.getMonth() === hariIni.getMonth() &&
            tanggalItem.getFullYear() === hariIni.getFullYear()
          );
        if (waktuProduksi === "tahunIni")
          return tanggalItem.getFullYear() === hariIni.getFullYear();
        return true;
      });
    }

    if (cariProduksi) {
      const keyword = cariProduksi.toLowerCase();
      hasil = hasil.filter((r) => {
        const pakan = (r.pakan || "").toLowerCase();
        const catatan = (r.catatan || "").toLowerCase();
        let tgl = "";
        if (r.tanggal_tebar) {
          const d = new Date(r.tanggal_tebar.split("T")[0]);
          tgl = d
            .toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
            .toLowerCase();
        }
        return (
          pakan.includes(keyword) ||
          catatan.includes(keyword) ||
          tgl.includes(keyword)
        );
      });
    }
    return hasil;
  }, [dataProduksi, cariProduksi, waktuProduksi]);

  const tabelProduksiTersaring = dataProduksiExport;

  // Data Khusus untuk Card Catatan
  const dataCatatan = tabelProduksiTersaring.filter(
    (p) => p.catatan && p.catatan.trim() !== "",
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Pencatatan Produksi
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
            Pantau konversi telur, hasil panen, hingga stok terjual.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={() => exportCSV(dataProduksiExport, "produksi")}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-all shadow-sm active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" /> CSV / Excel
          </button>
          <button
            onClick={() => exportPDF(dataProduksiExport, "produksi")}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-sm font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-100 transition-all shadow-sm active:scale-95"
          >
            <FileText className="w-4 h-4" /> PDF Report
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 dark:bg-violet-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {editingProduksiId
              ? "Edit Data Produksi"
              : "Input Siklus Produksi Baru"}
          </h2>
        </div>

        <form
          onSubmit={submitProduksi}
          className="flex flex-col gap-6 relative z-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                Tanggal Tebar Telur
              </label>
              <input
                required
                type="date"
                value={formProduksi.tanggal_tebar}
                onChange={(e) =>
                  setFormProduksi({
                    ...formProduksi,
                    tanggal_tebar: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 text-gray-900 dark:text-white outline-none dark:[color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                Jumlah Telur (Gram)
              </label>
              <input
                required
                type="number"
                placeholder="Cth: 500"
                value={formProduksi.jumlah_telur_per_gram}
                onChange={(e) =>
                  setFormProduksi({
                    ...formProduksi,
                    jumlah_telur_per_gram: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                Masa Pengeraman (Hari)
              </label>
              <input
                required
                type="number"
                placeholder="Cth: 12"
                value={formProduksi.pengeraman_per_hari}
                onChange={(e) =>
                  setFormProduksi({
                    ...formProduksi,
                    pengeraman_per_hari: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                Pakan Utama
              </label>
              <input
                required
                type="text"
                placeholder="Cth: BR511"
                value={formProduksi.pakan}
                onChange={(e) =>
                  setFormProduksi({ ...formProduksi, pakan: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                Vitamin/Suplemen
              </label>
              <input
                required
                type="text"
                placeholder="Cth: Vitachick"
                value={formProduksi.vitamin}
                onChange={(e) =>
                  setFormProduksi({ ...formProduksi, vitamin: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-violet-600 dark:text-violet-400 ml-1">
                Hasil Panen (Kg)
              </label>
              <input
                required
                type="number"
                placeholder="Cth: 45"
                value={formProduksi.hasil_panen}
                onChange={(e) =>
                  setFormProduksi({
                    ...formProduksi,
                    hasil_panen: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-violet-200 dark:border-violet-800/50 rounded-2xl bg-violet-50/50 focus:bg-white dark:bg-violet-900/10 dark:focus:bg-gray-800 text-gray-900 dark:text-white outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-bold text-blue-600 dark:text-blue-400 ml-1">
                Volume Terjual (Kg)
              </label>
              <input
                type="number"
                placeholder="Berapa kg yang sudah laku?"
                value={formProduksi.terjual}
                onChange={(e) =>
                  setFormProduksi({ ...formProduksi, terjual: e.target.value })
                }
                className="w-full px-4 py-3 border border-blue-200 dark:border-blue-800/50 rounded-2xl bg-blue-50/50 focus:bg-white dark:bg-blue-900/10 dark:focus:bg-gray-800 text-gray-900 dark:text-white outline-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-1">
                Catatan Khusus
              </label>
              <input
                type="text"
                placeholder="Opsional (mis: Dijual ke Kios A)"
                value={formProduksi.catatan}
                onChange={(e) =>
                  setFormProduksi({ ...formProduksi, catatan: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 focus:bg-white dark:bg-gray-900/50 dark:focus:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-violet-700 to-violet-600 hover:from-violet-800 hover:to-violet-700 text-white py-3.5 rounded-2xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70"
            >
              {saving
                ? "⏳ Menyimpan..."
                : editingProduksiId
                  ? "💾 Simpan Perubahan"
                  : "+ Simpan Data Produksi"}
            </button>
            {editingProduksiId && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduksiId(null);
                  setFormProduksi({
                    tanggal_tebar: getTodayDate(),
                    jumlah_telur_per_gram: "",
                    pengeraman_per_hari: "",
                    pakan: "",
                    vitamin: "",
                    hasil_panen: "",
                    terjual: "",
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
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative" ref={limitProduksiRef}>
            <button
              onClick={() => setIsOpenLimitProduksi(!isOpenLimitProduksi)}
              className="flex items-center justify-between w-36 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-white text-sm font-bold shadow-sm"
            >
              {limitProduksi} Baris{" "}
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpenLimitProduksi ? "rotate-180" : ""}`}
              />
            </button>
            {isOpenLimitProduksi && (
              <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-y-auto py-1 animate-fadeIn">
                {["10", "25", "50", "100"].map((val) => (
                  <div
                    key={val}
                    onClick={() => {
                      setLimitProduksi(val);
                      setCurrentPageProduksi(1);
                      setIsOpenLimitProduksi(false);
                    }}
                    className={`px-4 py-2.5 cursor-pointer text-sm font-medium ${limitProduksi == val ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50"}`}
                  >
                    {val} Baris
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={waktuProduksiRef}>
            <button
              onClick={() => setIsOpenWaktuProduksi(!isOpenWaktuProduksi)}
              className="flex items-center justify-between w-40 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-white text-sm font-bold shadow-sm"
            >
              {waktuProduksi === "semua"
                ? "Semua Waktu"
                : waktuProduksi === "mingguIni"
                  ? "Minggu Ini"
                  : waktuProduksi === "bulanIni"
                    ? "Bulan Ini"
                    : "Tahun Ini"}
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpenWaktuProduksi ? "rotate-180" : ""}`}
              />
            </button>
            {isOpenWaktuProduksi && (
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
                      setWaktuProduksi(opt.id);
                      setCurrentPageProduksi(1);
                      setIsOpenWaktuProduksi(false);
                    }}
                    className={`px-4 py-2.5 cursor-pointer text-sm font-medium ${waktuProduksi === opt.id ? "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50"}`}
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
            placeholder="Cari tgl, pakan..."
            value={cariProduksi}
            onChange={(e) => {
              setCariProduksi(e.target.value);
              setCurrentPageProduksi(1);
            }}
            className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-violet-600 text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-300 dark:border-gray-600">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-violet-600 text-white border-b-2 border-violet-700 divide-x divide-violet-500/50">
                <th className="p-4 text-sm font-bold text-center">Tgl Tebar</th>
                <th className="p-4 text-sm font-bold text-center">Telur</th>
                <th className="p-4 text-sm font-bold px-5">Pakan Utama</th>
                <th className="p-4 text-sm font-bold text-center">Panen</th>
                <th className="p-4 text-sm font-bold text-center">Terjual</th>
                <th className="p-4 text-sm font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tabelProduksiTersaring.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-16 text-center border-none"
                  >
                    <Settings className="w-12 h-12 mb-3 opacity-20 mx-auto" />
                    <p className="text-gray-400 font-medium">
                      Belum ada data produksi.
                    </p>
                  </td>
                </tr>
              ) : (
                tabelProduksiTersaring
                  .slice(
                    (currentPageProduksi - 1) * Number(limitProduksi),
                    currentPageProduksi * Number(limitProduksi),
                  )
                  .map((p, idx) => (
                    <tr
                      key={p.id}
                      className={`${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-900/30"} hover:bg-violet-50 dark:hover:bg-violet-900/20 divide-x divide-gray-200 dark:divide-gray-700`}
                    >
                      <td className="p-4 text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
                        {p.tanggal_tebar
                          ? new Date(
                              p.tanggal_tebar.split("T")[0],
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                      <td className="p-4 text-sm font-bold text-center">
                        <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600">
                          {p.jumlah_telur_per_gram} g
                        </span>
                      </td>
                      <td className="p-4 px-5 text-sm font-medium">
                        {p.pakan}
                      </td>
                      <td className="p-4 text-sm font-black text-violet-700 dark:text-violet-400 text-center">
                        {p.hasil_panen} Kg
                      </td>
                      <td className="p-4 text-sm font-black text-blue-600 dark:text-blue-400 text-center">
                        {p.terjual || 0} Kg
                      </td>
                      <td className="p-3 align-middle">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditProduksi(p)}
                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-gray-700 dark:text-blue-400 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduksi(p.id)}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white dark:bg-gray-700 dark:text-red-400 rounded-lg"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PRODUKSI YANG BARU DITAMBAHKAN */}
        {tabelProduksiTersaring.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 gap-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Menampilkan{" "}
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {(currentPageProduksi - 1) * Number(limitProduksi) + 1}
              </span>{" "}
              hingga{" "}
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {Math.min(
                  currentPageProduksi * Number(limitProduksi),
                  tabelProduksiTersaring.length,
                )}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {tabelProduksiTersaring.length}
              </span>{" "}
              data
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setCurrentPageProduksi((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPageProduksi === 1}
                className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                {/* class 'hidden sm:inline' ini yang menyembunyikan teks di HP */}
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>
              <span className="px-4 py-2 text-sm font-bold text-violet-700 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 rounded-xl border border-violet-200 dark:border-violet-800">
                {currentPageProduksi} /{" "}
                {Math.max(
                  1,
                  Math.ceil(
                    tabelProduksiTersaring.length / Number(limitProduksi),
                  ),
                )}
              </span>
              <button
                onClick={() =>
                  setCurrentPageProduksi((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(
                        tabelProduksiTersaring.length / Number(limitProduksi),
                      ),
                    ),
                  )
                }
                disabled={
                  currentPageProduksi >=
                  Math.ceil(
                    tabelProduksiTersaring.length / Number(limitProduksi),
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

      {/* CARD CATATAN KHUSUS PRODUKSI */}
      {dataCatatan.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-6 sm:p-8 rounded-3xl border border-amber-200 dark:border-amber-800/40 shadow-sm mt-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <StickyNote className="w-48 h-48 text-amber-500" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl">
              <StickyNote className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Kumpulan Catatan Produksi
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {dataCatatan.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-amber-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wide">
                  Tebar:{" "}
                  {new Date(c.tanggal_tebar.split("T")[0]).toLocaleDateString(
                    "id-ID",
                    { day: "numeric", month: "long", year: "numeric" },
                  )}
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
                  "{c.catatan}"
                </p>
                <div className="flex gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg inline-flex">
                  <span>Panen: {c.hasil_panen} Kg</span>
                  <span>|</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    Terjual: {c.terjual || 0} Kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL HAPUS PRODUKSI */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all animate-slideUp">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Hapus Data Produksi?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Data siklus produksi ini akan dihapus permanen dari sistem. Anda
                yakin melanjutkan?
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setDeleteModalId(null)}
                  className="flex-1 py-3.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={executeDeleteProduksi}
                  className="flex-1 py-3.5 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
