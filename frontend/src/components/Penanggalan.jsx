import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Plus,
  Calendar,
  Edit,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
  StickyNote,
  Info,
  X,
  History,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

export default function Penanggalan() {
  const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const getUserId = () => {
    const userStr = localStorage.getItem("user_jangkrik_os");
    return userStr ? JSON.parse(userStr).id : null;
  };

  const [jadwalPanen, setJadwalPanen] = useState([]);
  const [inputJadwal, setInputJadwal] = useState({
    tanggalTebar: getTodayDate(),
    lokasi: "",
    catatan: "",
  });
  const [editingJadwalId, setEditingJadwalId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // STATE MODALS
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [deleteAllModal, setDeleteAllModal] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [selectedDateDetail, setSelectedDateDetail] = useState(null);

  // STATE UNTUK FILTER DROPDOWN (Aktif / Selesai)
  const [activeTab, setActiveTab] = useState("aktif");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [isResetting, setIsResetting] = useState(false);

  // Menutup dropdown jika diklik di luar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchJadwal = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await fetch(
        `https://be-jos.vercel.app/api/penanggalan?user_id=${userId}`,
      );
      const data = await response.json();
      setJadwalPanen(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal ambil jadwal panen:", error);
      setJadwalPanen([]);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, []);

  const calculateEstimasi = (tanggalTebar) => {
    const [year, month, day] = tanggalTebar.split("-");
    const tebarDate = new Date(year, month - 1, day);

    const mulai = new Date(tebarDate);
    mulai.setDate(tebarDate.getDate() + 28);

    const selesai = new Date(tebarDate);
    selesai.setDate(tebarDate.getDate() + 30);

    const formatLocal = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    return {
      panenMulai: formatLocal(mulai),
      panenSelesai: formatLocal(selesai),
    };
  };

  const handleAddJadwal = async (e) => {
    e.preventDefault();
    if (!inputJadwal.tanggalTebar || !inputJadwal.lokasi) return;

    const userId = getUserId();
    if (!userId) {
      alert("Sesi login tidak valid!");
      return;
    }

    const { panenMulai, panenSelesai } = calculateEstimasi(
      inputJadwal.tanggalTebar,
    );

    const payload = {
      user_id: userId,
      lokasi: inputJadwal.lokasi,
      tebar: inputJadwal.tanggalTebar,
      panenMulai: panenMulai,
      panenSelesai: panenSelesai,
      status: "Dalam Proses",
      catatan: inputJadwal.catatan,
    };

    try {
      const url = editingJadwalId
        ? `https://be-jos.vercel.app/api/penanggalan/${editingJadwalId}`
        : "https://be-jos.vercel.app/api/penanggalan";
      await fetch(url, {
        method: editingJadwalId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setEditingJadwalId(null);
      setInputJadwal({ tanggalTebar: getTodayDate(), lokasi: "", catatan: "" });
      setActiveTab("aktif"); // Kembali ke tab aktif otomatis
      await fetchJadwal();
    } catch (err) {
      console.error("Error koneksi:", err);
    }
  };

  const handleEditClick = (jadwal) => {
    setEditingJadwalId(jadwal.id);
    setInputJadwal({
      tanggalTebar: jadwal.tebar ? jadwal.tebar.split("T")[0] : "",
      lokasi: jadwal.lokasi,
      catatan: jadwal.catatan || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- LOGIKA HAPUS DATA SATUAN ---
  const handleDeleteJadwal = (id) => {
    setDeleteModalId(id);
  };

  const executeDeleteJadwal = async () => {
    const userId = getUserId();
    if (!userId || !deleteModalId) return;

    try {
      await fetch(
        `https://be-jos.vercel.app/api/penanggalan/${deleteModalId}?user_id=${userId}`,
        {
          method: "DELETE",
        },
      );
      await fetchJadwal();
    } catch (error) {
      console.error("Gagal hapus:", error);
    } finally {
      setDeleteModalId(null);
    }
  };

  // --- LOGIKA HAPUS SEMUA RIWAYAT ---
  const executeDeleteAllRiwayat = async () => {
    const userId = getUserId();
    if (!userId || jadwalSelesai.length === 0) return;
    setIsDeletingAll(true);

    try {
      // Menghapus semua data yang ada di jadwalSelesai secara paralel
      const deletePromises = jadwalSelesai.map((j) =>
        fetch(
          `https://be-jos.vercel.app/api/penanggalan/${j.id}?user_id=${userId}`,
          {
            method: "DELETE",
          },
        ),
      );
      await Promise.all(deletePromises);
      await fetchJadwal();
    } catch (error) {
      console.error("Gagal hapus semua:", error);
    } finally {
      setIsDeletingAll(false);
      setDeleteAllModal(false);
    }
  };

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  const prevYear = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1),
    );
  const nextYear = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1),
    );

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  // PEMISAHAN DATA (AKTIF vs SELESAI) - DENGAN LOGIKA TANGGAL YANG LEBIH KUAT
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  const jadwalAktif = [];
  const jadwalSelesai = [];

  jadwalPanen.forEach((item) => {
    if (item.panenSelesai) {
      // Pecah string tanggal untuk mencegah bug zona waktu (timezone)
      const [year, month, day] = item.panenSelesai.split("T")[0].split("-");
      const tglSelesai = new Date(year, month - 1, day);
      tglSelesai.setHours(0, 0, 0, 0);

      if (tglSelesai < hariIni) {
        jadwalSelesai.push(item);
      } else {
        jadwalAktif.push(item);
      }
    } else {
      jadwalAktif.push(item);
    }
  });

  const getEventForDate = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const dateToCheck = `${year}-${month}-${dayStr}`;

    // Kalender HANYA menampilkan jadwal yang masih aktif
    return jadwalAktif.reduce((acc, j) => {
      if (j.tebar?.split("T")[0] === dateToCheck)
        acc.push({
          ...j,
          type: "tebar",
          text: `Tebar: ${j.lokasi}`,
        });
      if (
        dateToCheck >= j.panenMulai?.split("T")[0] &&
        dateToCheck <= j.panenSelesai?.split("T")[0]
      )
        acc.push({
          ...j,
          type: "panen",
          text: `Panen: ${j.lokasi}`,
        });
      return acc;
    }, []);
  };

  const handleDayDoubleClick = (day) => {
    const events = getEventForDate(day);
    if (events.length > 0) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const dayStr = String(day).padStart(2, "0");
      const fullDate = `${year}-${month}-${dayStr}`;

      setSelectedDateDetail({
        date: fullDate,
        events: events,
      });
    }
  };

  // KUMPULAN CATATAN: 100% HANYA MENGAMBIL DARI JADWAL AKTIF
  const dataCatatan = jadwalAktif.filter(
    (j) => j.catatan && j.catatan.trim() !== "",
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-10">
      {/* HEADER UTAMA */}
      <div className="bg-gradient-to-r from-emerald-900 to-green-800 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">
              Kalender & Jadwal Panen
            </h1>
            <p className="text-green-100 max-w-2xl text-lg">
              Atur siklus tebar telur dan pantau estimasi masa panen dengan
              presisi.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-green-100 uppercase tracking-widest font-semibold mb-0.5">
                Total Siklus Aktif
              </p>
              <p className="text-2xl font-bold">{jadwalAktif.length} Kotak</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM 1: FORM INPUT (Ukuran 1/3) */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-7 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm h-fit hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingJadwalId ? "Edit Siklus Panen" : "Catat Tebar Baru"}
            </h3>
          </div>

          <form onSubmit={handleAddJadwal} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tanggal Tebar Telur
              </label>
              <input
                type="date"
                required
                value={inputJadwal.tanggalTebar}
                onChange={(e) =>
                  setInputJadwal({
                    ...inputJadwal,
                    tanggalTebar: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 dark:focus:bg-gray-800 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all shadow-inner [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Lokasi / Identitas Kotak
              </label>
              <input
                type="text"
                required
                placeholder="Misal: Tempat A, Kotak 2"
                value={inputJadwal.lokasi}
                onChange={(e) =>
                  setInputJadwal({ ...inputJadwal, lokasi: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 dark:focus:bg-gray-800 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Misal: Tebar 300 gram telur"
                value={inputJadwal.catatan}
                onChange={(e) =>
                  setInputJadwal({ ...inputJadwal, catatan: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 dark:focus:bg-gray-800 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all shadow-inner placeholder:text-gray-400"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="submit"
                className="w-full bg-green-700 text-white py-3.5 rounded-xl font-bold hover:bg-green-800 transition-all shadow-md active:scale-95"
              >
                {editingJadwalId
                  ? "💾 Simpan Perubahan"
                  : "+ Simpan & Hitung Estimasi"}
              </button>
              {editingJadwalId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingJadwalId(null);
                    setInputJadwal({
                      tanggalTebar: getTodayDate(),
                      lokasi: "",
                      catatan: "",
                    });
                  }}
                  className="w-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* KOLOM 2: DAFTAR JADWAL (Ukuran 2/3) DIGABUNG DALAM SATU KOTAK */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-7 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[520px]">
          {/* HEADER DENGAN DROPDOWN FILTER */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 border-b border-gray-100 dark:border-gray-700 pb-5 relative z-20">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${activeTab === "aktif" ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}
              >
                {activeTab === "aktif" ? (
                  <Package className="w-6 h-6" />
                ) : (
                  <History className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {activeTab === "aktif" ? "Estimasi Panen" : "Riwayat Selesai"}
                </h3>
                <p
                  className={`text-xs font-semibold mt-0.5 ${activeTab === "aktif" ? "text-orange-500" : "text-gray-500"}`}
                >
                  {activeTab === "aktif"
                    ? "Umur 28-30 Hari"
                    : "Telah melewati masa panen"}
                </p>
              </div>
            </div>

            {/* CUSTOM DROPDOWN SELECTOR */}
            <div className="relative w-full sm:w-auto" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full sm:w-auto flex items-center justify-between gap-3 px-5 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm"
              >
                <span>
                  {activeTab === "aktif"
                    ? "Daftar Estimasi Panen"
                    : "Riwayat Selesai Panen"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-full sm:w-64 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-30"
                  >
                    <button
                      onClick={() => {
                        setActiveTab("aktif");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3.5 text-sm font-semibold flex items-center justify-between transition-colors ${activeTab === "aktif" ? "text-green-700 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4" /> Estimasi Panen
                      </div>
                      <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                        {jadwalAktif.length}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("selesai");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3.5 text-sm font-semibold flex items-center justify-between transition-colors border-t border-gray-100 dark:border-gray-700 ${activeTab === "selesai" ? "text-green-700 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                    >
                      <div className="flex items-center gap-3">
                        <History className="w-4 h-4" /> Riwayat Selesai
                      </div>
                      <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                        {jadwalSelesai.length}
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* AREA KONTEN LIST BERDASARKAN TAB YANG DIPILIH */}
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {/* TAMPILAN JIKA TAB AKTIF */}
            {activeTab === "aktif" &&
              (jadwalAktif.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                  <CalendarDays className="w-16 h-16 mb-4 opacity-20" />
                  <p>Belum ada jadwal panen berjalan.</p>
                </div>
              ) : (
                jadwalAktif.map((j) => (
                  <div
                    key={j.id}
                    className="group p-5 border border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/30 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-green-300 dark:hover:border-green-700 hover:shadow-sm transition-all"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-green-400 to-green-600 rounded-l-2xl"></div>
                    <div className="pl-2 flex-1">
                      <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                        {j.lokasi}
                      </h4>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                        Tebar: {j.tebar ? j.tebar.split("T")[0] : "-"}
                      </p>

                      <div className="inline-block bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg border border-orange-100 dark:border-orange-800/30">
                        <p className="text-[10px] uppercase font-bold text-orange-500 dark:text-orange-400 mb-0.5">
                          Masa Panen
                        </p>
                        <p className="text-sm font-bold text-orange-700 dark:text-orange-300">
                          {j.panenMulai ? j.panenMulai.split("T")[0] : "-"}{" "}
                          <span className="text-orange-400 font-normal">
                            s/d
                          </span>{" "}
                          {j.panenSelesai ? j.panenSelesai.split("T")[0] : "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex md:flex-col justify-end gap-2 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-gray-200 dark:border-gray-700 md:border-t-0">
                      <button
                        onClick={() => handleEditClick(j)}
                        className="flex-1 md:flex-none flex items-center justify-center p-2.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
                        title="Edit Jadwal"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJadwal(j.id)}
                        className="flex-1 md:flex-none flex items-center justify-center p-2.5 text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ))}

            {/* UI BARU UNTUK TAB SELESAI (ARCHIVED/HISTORY LOOK) */}
            {activeTab === "selesai" && (
              <>
                {/* Header Sub-tab Selesai + Tombol Hapus Semua */}
                {jadwalSelesai.length > 0 && (
                  <div className="flex justify-between items-center mb-2 px-2">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Menampilkan {jadwalSelesai.length} riwayat selesai
                    </span>
                    <button
                      onClick={() => setDeleteAllModal(true)}
                      className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-red-100 dark:border-red-800/30"
                    >
                      Hapus Semua
                    </button>
                  </div>
                )}

                {jadwalSelesai.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                    <History className="w-16 h-16 mb-4 opacity-20" />
                    <p>Belum ada riwayat panen yang selesai.</p>
                  </div>
                ) : (
                  jadwalSelesai.map((j) => (
                    <div
                      key={j.id}
                      className="group p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/80 dark:bg-gray-800/40 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
                    >
                      <div className="flex items-start gap-4 flex-1 w-full">
                        <div className="p-2.5 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full mt-1 shrink-0 grayscale group-hover:grayscale-0 transition-all">
                          <CheckCircle2 className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-emerald-500" />
                        </div>
                        <div className="flex-1 w-full">
                          <h4 className="text-base font-bold text-gray-500 dark:text-gray-400 line-through decoration-gray-400/50 mb-1">
                            {j.lokasi}
                          </h4>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
                            <p>
                              Tebar:{" "}
                              <span className="font-semibold">
                                {j.tebar ? j.tebar.split("T")[0] : "-"}
                              </span>
                            </p>
                            <p className="hidden sm:block">•</p>
                            <p>
                              Selesai:{" "}
                              <span className="font-semibold">
                                {j.panenSelesai
                                  ? j.panenSelesai.split("T")[0]
                                  : "-"}
                              </span>
                            </p>
                          </div>

                          {j.catatan && (
                            <div className="mt-3 p-2.5 bg-gray-200/50 dark:bg-gray-700/30 rounded-lg text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2 border border-gray-200 dark:border-gray-700">
                              <StickyNote className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                              <p className="italic leading-relaxed">
                                "{j.catatan}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-full md:w-auto mt-2 md:mt-0 self-stretch flex items-center justify-end">
                        <button
                          onClick={() => handleDeleteJadwal(j.id)}
                          className="p-2 text-gray-400 bg-white dark:bg-gray-800 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 rounded-lg transition-all border border-gray-200 dark:border-gray-600 shadow-sm"
                          title="Hapus Riwayat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* KALENDER */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
              <CalendarDays className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white capitalize tracking-tight">
                {currentDate.toLocaleString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                Visualisasi Jadwal Bulanan{" "}
                <span className="text-indigo-400 ml-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800">
                  (Klik ganda pada tanggal)
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={prevYear}
              className="p-2.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button
              onClick={prevMonth}
              className="p-2.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsResetting(true);
                setCurrentDate(new Date());
                setTimeout(() => setIsResetting(false), 300);
              }}
              className="px-5 py-2.5 mx-1 font-bold text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all shadow-sm active:scale-90"
            >
              Bulan Ini
            </button>
            <button
              onClick={nextMonth}
              className="p-2.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={nextYear}
              className="p-2.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3 text-center mb-3">
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d, index) => (
            <div
              key={d}
              className={`text-xs font-extrabold uppercase tracking-widest pb-3 border-b-2 ${index === 0 ? "text-red-500 border-red-100 dark:border-red-900/30" : "text-gray-400 border-gray-100 dark:border-gray-700"}`}
            >
              {d}
            </div>
          ))}
        </div>

        <div
          className={`grid grid-cols-7 gap-3 transition-all duration-300 ${isResetting ? "opacity-30 scale-95" : "opacity-100 scale-100"}`}
        >
          {[...Array(firstDayOfMonth)].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[120px] rounded-2xl bg-gray-50/50 dark:bg-gray-900/20 border border-dashed border-gray-200 dark:border-gray-800"
            ></div>
          ))}

          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const events = getEventForDate(day);
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();
            const hasTebar = events.some((e) => e.type === "tebar");
            const hasPanen = events.some((e) => e.type === "panen");

            return (
              <div
                key={day}
                onDoubleClick={() => handleDayDoubleClick(day)}
                className={`min-h-[120px] rounded-2xl p-3 border transition-all duration-300 relative group
                  ${events.length > 0 ? "cursor-pointer" : ""}
                  ${isToday ? "border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] bg-blue-50/30 dark:bg-blue-900/10 z-10" : "border-gray-100 dark:border-gray-700 hover:border-gray-300"}
                  ${!isToday && hasTebar && !hasPanen ? "bg-green-50/40 dark:bg-green-900/10" : ""}
                  ${!isToday && hasPanen && !hasTebar ? "bg-orange-50/40 dark:bg-orange-900/10" : ""}
                  ${!isToday && hasPanen && hasTebar ? "bg-gradient-to-br from-green-50/40 to-orange-50/40" : ""}
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${isToday ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300 group-hover:bg-gray-100 dark:group-hover:bg-gray-700"}`}
                  >
                    {day}
                  </span>
                  <div className="flex gap-1 xl:hidden">
                    {hasTebar && (
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    )}
                    {hasPanen && (
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    )}
                  </div>
                </div>
                <div className="hidden xl:flex flex-col gap-1.5 max-h-[70px] overflow-y-auto custom-scrollbar pr-1">
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className={`text-[11px] font-bold px-2 py-1.5 rounded-lg truncate border
                        ${ev.type === "tebar" ? "bg-green-100 border-green-200 text-green-700 dark:bg-green-900/40 dark:border-green-800 dark:text-green-300" : "bg-orange-100 border-orange-200 text-orange-700 dark:bg-orange-900/40 dark:border-orange-800 dark:text-orange-300"}
                      `}
                      title={ev.text}
                    >
                      {ev.text}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-gray-100 dark:border-gray-700 pt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-600 shadow-sm border-2 border-white dark:border-gray-800"></div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Hari Ini
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm border-2 border-white dark:border-gray-800"></div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Tebar Telur
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 shadow-sm border-2 border-white dark:border-gray-800"></div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Estimasi Panen
            </span>
          </div>
        </div>
      </div>

      {/* CARD KUMPULAN CATATAN JADWAL (HANYA AKTIF) */}
      {dataCatatan.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 p-6 sm:p-8 rounded-3xl border border-indigo-200 dark:border-indigo-800/40 shadow-sm mt-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <StickyNote className="w-48 h-48 text-indigo-500" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <StickyNote className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Kumpulan Catatan Penanggalan
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {dataCatatan.map((c) => {
              const tglFormat = c.tebar
                ? new Date(c.tebar.split("T")[0]).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "";
              return (
                <div
                  key={`cat-${c.id}`}
                  className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-indigo-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">
                    Catatan {c.lokasi}, {tglFormat}
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
                    "{c.catatan}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL HAPUS SATUAN */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all animate-slideUp">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Hapus Jadwal Panen?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Jadwal ini akan dihapus dari sistem. Tindakan ini tidak dapat
                dibatalkan.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setDeleteModalId(null)}
                  className="flex-1 py-3.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={executeDeleteJadwal}
                  className="flex-1 py-3.5 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS SEMUA RIWAYAT */}
      {deleteAllModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-red-100 dark:border-red-900/30 transform transition-all animate-slideUp">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Hapus Semua Riwayat?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Kamu akan menghapus <strong>{jadwalSelesai.length}</strong>{" "}
                jadwal yang sudah selesai. Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setDeleteAllModal(false)}
                  disabled={isDeletingAll}
                  className="flex-1 py-3.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={executeDeleteAllRiwayat}
                  disabled={isDeletingAll}
                  className="flex-1 py-3.5 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isDeletingAll ? "Menghapus..." : "Ya, Hapus Semua"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL EVENT */}
      {selectedDateDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Detail Jadwal
                  </h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {new Date(selectedDateDetail.date).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDateDetail(null)}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
              {selectedDateDetail.events.map((ev, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-gray-800 dark:text-white">
                      {ev.lokasi}
                    </h4>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md border 
                      ${ev.type === "tebar" ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"}
                    `}
                    >
                      {ev.type === "tebar" ? "Hari Tebar" : "Masa Panen"}
                    </span>
                  </div>
                  {ev.catatan ? (
                    <div className="mt-3 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-300">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <StickyNote className="w-3 h-3" /> Catatan {ev.lokasi}
                      </p>
                      <p>"{ev.catatan}"</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic mt-2">
                      Tidak ada catatan untuk jadwal ini.
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedDateDetail(null)}
              className="mt-6 w-full py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
