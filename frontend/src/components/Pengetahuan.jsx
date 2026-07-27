import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Thermometer,
  Droplets,
  ShieldAlert,
  Calendar,
  Plus,
  X,
  Trash2,
  Edit2, // <-- ICON EDIT BARU
  Link as LinkIcon,
  FileText,
  ExternalLink,
  Library,
  Mail,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  UploadCloud,
  Building,
  Type,
} from "lucide-react";

export default function Pengetahuan() {
  const [referensi, setReferensi] = useState([]);
  const [showRefForm, setShowRefForm] = useState(false);
  const [editId, setEditId] = useState(null); // <-- STATE EDIT BARU

  const [newRef, setNewRef] = useState({
    type: "link",
    title: "",
    source: "",
    tahun: "",
    url: "",
    preview: "",
  });

  const [deleteModalId, setDeleteModalId] = useState(null);
  const [confirmSaveModal, setConfirmSaveModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [isOpenJenis, setIsOpenJenis] = useState(false);
  const dropdownRef = useRef(null);

  const getUserData = () => {
    const userStr = localStorage.getItem("user_jangkrik_os");
    return userStr ? JSON.parse(userStr) : null;
  };

  const userData = getUserData();
  const ADMIN_EMAIL = "haekalma01@gmail.com";
  const isAdmin = userData?.email === ADMIN_EMAIL;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenJenis(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchReferensi = async () => {
    try {
      const response = await fetch("https://be-jos.vercel.app/api/referensi");
      const data = await response.json();
      setReferensi(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal ambil referensi:", error);
    }
  };

  useEffect(() => {
    fetchReferensi();
  }, []);

  const handleAddClick = (e) => {
    e.preventDefault();
    setConfirmSaveModal(true);
  };

  // FUNGSI BARU UNTUK MENGISI FORM SAAT TOMBOL EDIT DIKLIK
  const handleEditClick = (ref) => {
    let sourcePart = ref.source;
    let tahunPart = "";

    // Pecah kembali string "Sumber • Tahun"
    if (ref.source.includes(" • ")) {
      const parts = ref.source.split(" • ");
      sourcePart = parts[0];
      tahunPart = parts[1];
    }

    setNewRef({
      type: ref.type,
      title: ref.title,
      source: sourcePart,
      tahun: tahunPart,
      url: ref.url,
      preview: ref.preview,
    });
    setEditId(ref.id);
    setShowRefForm(true);
    window.scrollTo({ top: 400, behavior: "smooth" }); // Scroll ke form
  };

  const executeSaveReference = async () => {
    setConfirmSaveModal(false);
    const combinedSource = newRef.tahun
      ? `${newRef.source} • ${newRef.tahun}`
      : newRef.source;

    const payload = {
      type: newRef.type,
      title: newRef.title,
      source: combinedSource,
      url: newRef.url,
      preview: newRef.preview,
    };

    try {
      // LOGIKA BERCABANG: JIKA ADA editId, LAKUKAN PUT. JIKA TIDAK, POST.
      const method = editId ? "PUT" : "POST";
      const url = editId
        ? `https://be-jos.vercel.app/api/referensi/${editId}`
        : "https://be-jos.vercel.app/api/referensi";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchReferensi();
        setNewRef({
          type: "link",
          title: "",
          source: "",
          tahun: "",
          url: "",
          preview: "",
        });
        setShowRefForm(false);
        setEditId(null); // Reset mode edit

        setSuccessModal(true);
        setTimeout(() => setSuccessModal(false), 2500);
      }
    } catch (error) {
      console.error("Gagal menyimpan referensi:", error);
    }
  };

  const handleDeleteClick = (id, e) => {
    e.preventDefault();
    setDeleteModalId(id);
  };

  const executeDeleteReference = async () => {
    if (!deleteModalId) return;
    try {
      await fetch(`https://be-jos.vercel.app/api/referensi/${deleteModalId}`, {
        method: "DELETE",
      });
      fetchReferensi();
    } catch (error) {
      console.error("Gagal menghapus:", error);
    } finally {
      setDeleteModalId(null);
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-10 max-w-6xl mx-auto">
      {/* HEADER DAN EDUKASI TETAP SAMA */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 p-8 md:p-10 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-block px-4 py-1.5 bg-green-800/50 rounded-lg backdrop-blur-sm border border-green-600 mb-4">
            <span className="text-sm font-bold tracking-widest text-green-200 uppercase">
              Spesifik: Jangkrik Alam
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
            Buku Panduan Peternak
          </h2>
          <p className="text-green-100 max-w-2xl text-lg font-medium leading-relaxed">
            Kuasai rahasia merawat Jangkrik Alam agar panen melimpah, gesit, dan
            terhindar dari kanibalisme massal.
          </p>
        </div>
        <BookOpen className="absolute -bottom-6 -right-6 w-56 h-56 text-white opacity-10 transform -rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3.5 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl shadow-lg shadow-blue-500/30">
              <Thermometer className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Habitat Jangkrik Alam
            </h3>
          </div>
          <ul className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
            <li className="flex gap-3 items-start">
              <span className="text-blue-500 font-bold text-lg mt-0.5">•</span>
              <span>
                <strong className="text-gray-800 dark:text-gray-200">
                  Pelompat Ulung:
                </strong>{" "}
                Jangkrik alam sangat gesit. Pastikan untuk memasang lakban
                bening di bibir atas kandang lebih lebar (minimal 10-15 cm) agar
                mereka tidak bisa memanjat keluar.
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-blue-500 font-bold text-lg mt-0.5">•</span>
              <span>
                <strong className="text-gray-800 dark:text-gray-200">
                  Suhu & Kelembapan:
                </strong>{" "}
                Ideal suhunya harus stabil di 28-32°C. Mereka menyukai
                kehangatan tapi tidak boleh pengap, selain itu sirkulasi
                udaranya (kasa atas) juga harus sangat baik.
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-blue-500 font-bold text-lg mt-0.5">•</span>
              <span>
                <strong className="text-gray-800 dark:text-gray-200">
                  Ruang Sembunyi Ekstra:
                </strong>{" "}
                Tumpuk egg tray sekokoh dan serapat mungkin. Semakin banyak
                celah sembunyi, semakin kecil risiko kanibal. Dalam penyusunan
                tray utamakan memiliki pondasi yang kuat, agar tray tidak mudah
                roboh/jatuh.
              </span>
            </li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3.5 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl shadow-lg shadow-green-500/30">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Pakan (Diet Tinggi Protein)
            </h3>
          </div>
          <ul className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
            <li className="flex gap-3 items-start">
              <span className="text-green-500 font-bold text-lg mt-0.5">•</span>
              <span>
                <strong className="text-gray-800 dark:text-gray-200">
                  Pakan Utama:
                </strong>{" "}
                Pur ayam (seperti BR511, BR11) diblender halus, terutama untuk
                jangkrik yang belum dewasa, dan stokya juga sangat wajib
                *standby* tanpa putus. Harus Diingat, ketika Jangkrik alam sudah
                dewasa, mereka akan jadi sangat rakus dan butuh protein tinggi,
                selain itu pemberian purnya tidak perlu diblender lagi, purnya
                cukup diberi air sampai lumayan basah.
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-green-500 font-bold text-lg mt-0.5">•</span>
              <span>
                <strong className="text-gray-800 dark:text-gray-200">
                  Sumber Air:
                </strong>{" "}
                Berikan irisan gedebok pisang, daun pepaya, atau sawi secukupnya
                dan pastikan ditempatkan secara merata. Jangan pernah memberi
                air secara langsung ke dalam wadah/box karena mereka mudah mati
                tenggelam.
              </span>
            </li>
          </ul>
          <div className="mt-5 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-400 font-medium">
              <strong>RAWAN KANIBAL:</strong> Jangkrik alam dikenal sangat
              kanibal! Terlambat memberi pakan beberapa jam saja bisa membuat
              mereka saling mangsa, pastikan untuk terus mengontrol pakannya.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3.5 bg-gradient-to-br from-orange-400 to-amber-600 text-white rounded-2xl shadow-lg shadow-orange-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Siklus & Waktu Panen
            </h3>
          </div>
          <ul className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
            <li className="flex gap-3 items-start">
              <span className="text-orange-500 font-bold text-lg mt-0.5">
                •
              </span>
              <span>
                <strong className="text-gray-800 dark:text-gray-200">
                  Penetasan:
                </strong>{" "}
                Telur jangkrik alam biasanya menetas merata dalam 11-14 hari di
                media pasir/kain yang lembap. Ketika dalam masa ini Jangkrik
                benar-benar lemah terhadap air.
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-orange-500 font-bold text-lg mt-0.5">
                •
              </span>
              <span>
                <strong className="text-gray-800 dark:text-gray-200">
                  Usia Panen Ideal:
                </strong>{" "}
                Umur 28-30 hari adalah puncak bobot panen Jangkrik Alam, jadi
                disarankan untuk memanen pada rentang waktu tersebut.
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-orange-500 font-bold text-lg mt-0.5">
                •
              </span>
              <span>
                <strong className="text-gray-800 dark:text-gray-200">
                  Kunci Harga Mahal:
                </strong>{" "}
                Segera panen SEBELUM mereka mulai bersayap keras
                (ngekrik/berbunyi). Jangkrik yang sudah bersayap tidak disukai
                pasar burung/pancing karena hampir tidak bisa digunakan karena
                teksturnya keras.
              </span>
            </li>
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 dark:bg-rose-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3.5 bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-2xl shadow-lg shadow-rose-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Waspada Amonia & Predator
            </h3>
          </div>
          <ul className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
            <li className="flex gap-3 items-start">
              <span className="text-rose-500 font-bold text-lg mt-0.5">•</span>
              <span>
                <strong className="text-gray-800 dark:text-gray-200">
                  Racun Amonia:
                </strong>{" "}
                Pembunuh no.1 jangkrik alam adalah gas amonia dari kotoran
                basah/gedebok pisang yang membusuk. Rutin buang sisa pakan basah
                yang sudah layu atau pakan yang sudah kering!
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-rose-500 font-bold text-lg mt-0.5">•</span>
              <span>
                <strong className="text-gray-800 dark:text-gray-200">
                  Serangan Semut & Cicak:
                </strong>{" "}
                Bau pur ayam akan mengundang semut. Gunakan wadah minyak/oli
                bekas pada kaki rak kandang/box, dan pastikan untuk jauhkan
                kandang dari dinding tembok untuk menghindari cicak, jika perlu,
                tambahkan jebakan pengerat seperti lem atau doubletip di bagian
                dinding sekitar kandang.
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-rose-500 font-bold text-lg mt-0.5">•</span>
              <span>
                <strong className="text-gray-800 dark:text-gray-200">
                  Laba-laba & Tikus:
                </strong>{" "}
                Sering bersihkan tempat sekitar kandang dan sarang laba-laba di
                sekitar atas kotak kandang untuk menghindari invasi laba-laba
                dan tikus.
              </span>
            </li>
          </ul>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-700 my-12" />

      {/* HEADER PERPUSTAKAAN */}
      <div className="bg-gradient-to-br from-green-800 to-emerald-900 p-8 md:p-10 rounded-3xl text-white shadow-xl relative overflow-hidden mb-8">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 rounded-lg backdrop-blur-sm border border-emerald-400/30 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span className="text-sm font-bold tracking-widest text-emerald-200 uppercase">
                Terintegrasi AI
              </span>
            </div>
            <h2 className="text-3xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
              Puset Jurnal Akademik
            </h2>
            <p className="text-emerald-100 max-w-xl text-base font-medium leading-relaxed">
              Kumpulan referensi riset dan artikel kredibel seputar budidaya
              yang dikurasi khusus oleh tim Jangkrik.OS.
            </p>
          </div>

          {isAdmin ? (
            <button
              onClick={() => {
                setShowRefForm(!showRefForm);
                if (showRefForm) setEditId(null); // Batalkan mode edit jika ditutup
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-md active:scale-95 whitespace-nowrap border z-20 relative
                ${
                  showRefForm
                    ? "bg-white/10 text-white border-white/20 hover:bg-white/20"
                    : "bg-emerald-500 text-white border-transparent hover:bg-emerald-600"
                }`}
            >
              <motion.div
                initial={false}
                animate={{ rotate: showRefForm ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {showRefForm ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </motion.div>
              {showRefForm ? "Tutup Form" : "Tambah Referensi (Admin)"}
            </button>
          ) : (
            <div className="hidden md:flex p-6 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
              <Library className="w-12 h-12 text-emerald-300" />
            </div>
          )}
        </div>

        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      </div>

      {/* FORM TAMBAH/EDIT REFERENSI */}
      <AnimatePresence>
        {isAdmin && showRefForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden mb-10"
          >
            <form
              onSubmit={handleAddClick}
              className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl relative z-10"
            >
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md font-bold text-xs mb-4 uppercase tracking-widest border border-blue-200 dark:border-blue-800">
                {editId ? "Mode Edit Referensi" : "Mode Tambah Referensi"}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 mb-2">
                    Jenis Referensi
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsOpenJenis(!isOpenJenis)}
                    className="w-full flex items-center justify-between px-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      {newRef.type === "link" ? (
                        <LinkIcon className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-rose-500" />
                      )}
                      {newRef.type === "link"
                        ? "Website / Link Jurnal"
                        : "File Jurnal / Dokumen PDF"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${isOpenJenis ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpenJenis && (
                    <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1 animate-fadeIn">
                      <div
                        onClick={() => {
                          setNewRef({ ...newRef, type: "link" });
                          setIsOpenJenis(false);
                        }}
                        className={`px-4 py-3 cursor-pointer text-sm font-medium flex items-center gap-2 ${newRef.type === "link" ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                      >
                        <LinkIcon className="w-4 h-4" /> Website / Link Jurnal
                      </div>
                      <div
                        onClick={() => {
                          setNewRef({ ...newRef, type: "file" });
                          setIsOpenJenis(false);
                        }}
                        className={`px-4 py-3 cursor-pointer text-sm font-medium flex items-center gap-2 ${newRef.type === "file" ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                      >
                        <FileText className="w-4 h-4" /> File Jurnal / Dokumen
                        PDF
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 mb-2">
                    Judul / Nama Jurnal
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Type className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={newRef.title}
                      onChange={(e) =>
                        setNewRef({ ...newRef, title: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-green-500/20 outline-none transition-all font-medium"
                      placeholder="Cth: Strategi Keberhasilan Budidaya..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 mb-2">
                    Sumber Institusi / Penerbit
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={newRef.source}
                      onChange={(e) =>
                        setNewRef({ ...newRef, source: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-green-500/20 outline-none transition-all font-medium"
                      placeholder="Cth: Universitas Brawijaya"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 mb-2">
                    Tahun Terbit{" "}
                    <span className="font-normal text-gray-400 text-xs">
                      (Opsional)
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={newRef.tahun}
                      onChange={(e) =>
                        setNewRef({ ...newRef, tahun: e.target.value })
                      }
                      className="w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-green-500/20 outline-none transition-all font-medium"
                      placeholder="Cth: 2024"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 mb-2">
                    {newRef.type === "link"
                      ? "URL Tujuan / Link Jurnal"
                      : "Tautan Dokumen PDF (Google Drive / OneDrive)"}
                  </label>
                  {newRef.type === "link" ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LinkIcon className="h-4 w-4 text-blue-500" />
                      </div>
                      <input
                        type="text"
                        required
                        value={newRef.url}
                        onChange={(e) =>
                          setNewRef({ ...newRef, url: e.target.value })
                        }
                        className="w-full pl-11 pr-4 py-3.5 border border-blue-200 dark:border-blue-800/50 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-blue-500/20 outline-none transition-all font-medium"
                        placeholder="https://..."
                      />
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UploadCloud className="h-4 w-4 text-rose-500" />
                      </div>
                      <input
                        type="text"
                        required
                        value={newRef.url}
                        onChange={(e) =>
                          setNewRef({ ...newRef, url: e.target.value })
                        }
                        className="w-full pl-11 pr-4 py-3.5 border border-rose-200 dark:border-rose-800/50 rounded-2xl bg-rose-50/50 dark:bg-rose-900/10 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-rose-500/20 outline-none transition-all font-medium"
                        placeholder="Paste link Google Drive file PDF di sini..."
                      />
                      <p className="text-xs text-gray-500 mt-2 ml-1">
                        *Karena alasan keamanan browser, file PDF lokal harus
                        diunggah ke layanan Cloud (seperti Google Drive)
                        terlebih dahulu. Masukkan link yang dapat diakses publik
                        di atas.
                      </p>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 mb-2">
                    Deskripsi Singkat / Abstrak
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={newRef.preview}
                    onChange={(e) =>
                      setNewRef({ ...newRef, preview: e.target.value })
                    }
                    className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-green-500/20 outline-none resize-none transition-all leading-relaxed"
                    placeholder="Ceritakan sedikit tentang apa isi referensi ini, agar AI Asisten bisa memahaminya..."
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white px-10 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-green-500/30 active:scale-95"
                >
                  {editId ? "Update Data Referensi" : "Simpan ke Database"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DAFTAR KARTU REFERENSI */}
      {referensi.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <Library className="w-16 h-16 text-gray-300 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-1">
            Perpustakaan Sedang Kosong
          </h3>
          <p className="text-gray-400 text-sm">
            Tim Jangkrik.OS sedang menyiapkan jurnal-jurnal terbaik untuk Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {referensi.map((ref) => (
            <div
              key={ref.id}
              className="group relative flex flex-col justify-between bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-l-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

              {/* ACTION BUTTONS (EDIT & DELETE) */}
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                  <button
                    onClick={() => handleEditClick(ref)}
                    className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl shadow-sm transition-all"
                    title="Edit Referensi"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(ref.id, e)}
                    className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-600 hover:text-white rounded-xl shadow-sm transition-all"
                    title="Hapus Referensi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex-1 pb-4">
                <div className="flex justify-between items-start mb-5">
                  <div
                    className={`p-3.5 rounded-2xl shadow-inner ${ref.type === "link" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"}`}
                  >
                    {ref.type === "link" ? (
                      <LinkIcon className="w-6 h-6" />
                    ) : (
                      <FileText className="w-6 h-6" />
                    )}
                  </div>
                </div>

                <h4 className="font-extrabold text-lg text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {ref.title}
                </h4>

                <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${ref.type === "link" ? "bg-blue-500" : "bg-rose-500"}`}
                  ></span>
                  {ref.source}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed mb-6">
                  {ref.preview}
                </p>
              </div>

              <a
                href={ref.url.startsWith("http") ? ref.url : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between group/btn cursor-pointer"
              >
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover/btn:text-emerald-600 dark:group-hover/btn:text-emerald-400 transition-colors">
                  Baca Referensi
                </span>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full group-hover/btn:bg-emerald-100 dark:group-hover/btn:bg-emerald-900/50 transition-colors">
                  <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover/btn:text-emerald-600 dark:group-hover/btn:text-emerald-400" />
                </div>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* KOTAK CS UNTUK USER BIASA */}
      {!isAdmin && (
        <div className="mt-12 bg-gradient-to-br from-slate-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-sm border border-slate-200 dark:border-gray-700 p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="relative z-10 text-center md:text-left flex-1">
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-3">
              Punya Referensi atau Jurnal Bagus?
            </h3>
            <p className="text-slate-500 dark:text-gray-400 text-base font-medium max-w-2xl leading-relaxed">
              Pusat Jurnal Akademik ini dikelola langsung oleh tim developer
              Jangkrik.OS. Jika Anda memiliki rekomendasi riset terkait
              budidaya, bantu kami memperkayanya!
            </p>
          </div>
          <a
            href={`mailto:${ADMIN_EMAIL}?subject=Usulan Referensi Jurnal Jangkrik.OS`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-emerald-600/30 flex-shrink-0"
          >
            <Mail className="w-5 h-5" />
            Hubungi Developer
          </a>
        </div>
      )}

      {/* CUSTOM MODALS */}
      {confirmSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all animate-slideUp">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {editId ? "Update Referensi?" : "Simpan Referensi?"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Pastikan judul dan informasi yang Anda masukkan sudah benar agar
                AI dapat mempelajarinya dengan akurat.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setConfirmSaveModal(false)}
                  className="flex-1 py-3.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Periksa Lagi
                </button>
                <button
                  onClick={executeSaveReference}
                  className="flex-1 py-3.5 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors"
                >
                  {editId ? "Ya, Update" : "Ya, Simpan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {successModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-green-100 dark:border-green-900/30 transform transition-all animate-bounceIn text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/50 text-green-500 dark:text-green-400 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Tersimpan!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Data berhasil diperbarui dalam database pengetahuan AI.
            </p>
          </div>
        </div>
      )}

      {deleteModalId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all animate-slideUp">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Hapus Referensi?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Referensi jurnal ini akan dihapus permanen. AI tidak akan bisa
                lagi mengakses informasi dari data ini.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setDeleteModalId(null)}
                  className="flex-1 py-3.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={executeDeleteReference}
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
