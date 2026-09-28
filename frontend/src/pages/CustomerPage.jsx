import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Info,
  Leaf,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import NavbarCus from "./NavbarCus";
import FooterCus from "./FooterCus";

const API_BASE = "https://be-jos.vercel.app";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const benefits = [
  {
    icon: PackageCheck,
    title: "Pesanan lebih teratur",
    text: "Jumlah, tanggal kebutuhan, dan catatan dikirim dalam satu data pesanan.",
  },
  {
    icon: Clock3,
    title: "Mudah dipahami",
    text: "Jumlah tersedia dalam pilihan ½ kg dan 1 kg agar lebih mudah dihitung.",
  },
  {
    icon: ShieldCheck,
    title: "Ada konfirmasi pengelola",
    text: "Pesanan diperiksa terlebih dahulu berdasarkan ketersediaan aktual.",
  },
];

const clampQuantity = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.round(numeric * 2) / 2);
};

const formatDisplayDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return "-";

  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

// --- KOMPONEN ANIMASI REVEAL (Sesuai PengetahuanPage) ---
function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function CustomerPage() {
  const [store, setStore] = useState({
    product_name: "Jangkrik Alam",
    price_per_kg: 45000,
    price_per_half_kg: 25000,
    availability: "AVAILABLE",
    availability_label: "Tersedia",
    current_date: "",
    current_date_label: "",
    description:
      "Jangkrik Alam untuk kebutuhan pakan, memancing, atau kebutuhan lain sesuai penggunaan Anda.",
  });

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    quantity_kg: 0,
    requested_date: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingStore, setLoadingStore] = useState(true);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const fetchStore = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/public/store`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data || data.error) {
        throw new Error(data?.error || "Informasi produk belum tersedia.");
      }

      setStore((previous) => ({
        ...previous,
        ...data,
      }));

      setForm((previous) => ({
        ...previous,
        requested_date:
          !previous.requested_date ||
          previous.requested_date < data.current_date
            ? data.current_date || previous.requested_date
            : previous.requested_date,
      }));
    } catch (fetchError) {
      setError(
        (previous) =>
          previous ||
          "Informasi produk belum dapat diperbarui. Silakan coba lagi.",
      );
    } finally {
      setLoadingStore(false);
    }
  };

  useEffect(() => {
    fetchStore();
    const interval = window.setInterval(fetchStore, 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const total = useMemo(() => {
    const quantity = clampQuantity(form.quantity_kg);
    const fullKg = Math.floor(quantity);
    const hasHalfKg = Math.round((quantity - fullKg) * 2) === 1;

    return (
      fullKg * Number(store.price_per_kg || 0) +
      (hasHalfKg ? Number(store.price_per_half_kg || 0) : 0)
    );
  }, [form.quantity_kg, store.price_per_kg, store.price_per_half_kg]);

  const setQuantity = (value) => {
    setForm((previous) => ({
      ...previous,
      quantity_kg: clampQuantity(value),
    }));
  };

  const submitOrder = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(null);

    if (!form.customer_name.trim() || !form.phone.trim()) {
      setError("Silakan isi nama lengkap dan nomor WhatsApp terlebih dahulu.");
      return;
    }

    if (form.quantity_kg <= 0) {
      setError("Silakan pilih jumlah pesanan minimal ½ kg.");
      return;
    }

    if (!form.requested_date) {
      setError("Tanggal kebutuhan wajib dipilih.");
      return;
    }

    if (store.availability !== "AVAILABLE") {
      setError(
        "Jangkrik Alam sedang kosong. Silakan cek kembali ketersediaan.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/public/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          quantity_kg: clampQuantity(form.quantity_kg),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Pesanan belum berhasil dikirim. Silakan coba lagi.",
        );
      }

      setSuccess(data);

      setForm((previous) => ({
        ...previous,
        customer_name: "",
        phone: "",
        quantity_kg: 0,
        notes: "",
        requested_date: data.requested_date || previous.requested_date,
      }));

      await fetchStore();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengirim pesanan.");
    } finally {
      setLoading(false);
    }
  };

  const unavailable = store.availability !== "AVAILABLE";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7faf6] text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
      <NavbarCus />

      <main>
        {/* HERO SECTION DENGAN AMBIENT GLOW */}
        <section className="relative overflow-hidden px-5 pb-12 pt-28 sm:pb-16 sm:pt-32 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,rgba(16,185,129,.14),transparent_30%),radial-gradient(circle_at_15%_70%,rgba(132,204,22,.10),transparent_28%)]" />

          <div className="mx-auto max-w-7xl">
            <div className="max-w-4xl">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3.5 py-2 text-xs font-black text-emerald-800 shadow-sm transition hover:shadow-md hover:border-emerald-300">
                  <Leaf className="h-4 w-4" />
                  Halaman Pemesanan
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                  Pesan Jangkrik Alam{" "}
                  <span className="text-emerald-600">tanpa bingung.</span>
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-5 max-w-3xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
                  Tentukan jumlah, isi data Anda, pilih tanggal kebutuhan, lalu
                  kirim pesanan. Pengelola akan menghubungi Anda untuk
                  konfirmasi melalui WhatsApp.
                </p>
              </Reveal>
            </div>

            {/* BENEFITS CARD - MENGGUNAKAN STYLE InfoCard */}
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {benefits.map((item, i) => (
                <Reveal key={item.title} delay={0.15 + i * 0.05}>
                  <div className="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900">
                          {item.title}
                        </h3>
                        <div className="mt-2 text-sm font-medium leading-7 text-slate-600">
                          {item.text}
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* SECTION FORM & PRODUK */}
        <section className="relative px-5 pb-20 pt-8 sm:px-8 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* PRODUK BANNER (MIRIP PracticalCard STYLE) */}
            <Reveal>
              <div className="group relative overflow-hidden rounded-[2rem] border border-slate-900 bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10 transition-all duration-300 hover:border-emerald-800 hover:shadow-2xl sm:p-8">
                {/* Glow Effect */}
                <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-emerald-500/10 transition-transform duration-500 group-hover:scale-110 pointer-events-none" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 shadow-sm transition-transform duration-300 group-hover:bg-emerald-500/20">
                        <ShoppingBag className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                          Produk yang tersedia
                        </p>
                        <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                          {store.product_name}
                        </h2>
                      </div>
                    </div>

                    <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-400 group-hover:text-slate-300 transition-colors">
                      {store.description ||
                        "Jangkrik Alam untuk kebutuhan pakan, memancing, atau kebutuhan lain sesuai penggunaan Anda."}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition-colors group-hover:border-emerald-500/20 group-hover:bg-emerald-950/40">
                    <div>
                      <p className="text-xs font-bold text-slate-400">Harga</p>
                      <p className="mt-1 text-xl font-black">
                        {rupiah(store.price_per_kg)}
                        <span className="ml-1 text-xs font-bold text-slate-500">
                          / kg
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-slate-500">
                        {rupiah(store.price_per_half_kg)} / ½ kg
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-black ring-1 ${
                        unavailable
                          ? "bg-red-500/10 text-red-300 ring-red-400/20"
                          : "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20"
                      }`}
                    >
                      {loadingStore ? "Memuat..." : store.availability_label}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* FORMULIR (MIRIP ArticleSection CONTENT BOX) */}
            <Reveal delay={0.1}>
              <form
                id="form"
                onSubmit={submitOrder}
                className="mt-8 scroll-mt-28 overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-8 lg:px-10 transition hover:shadow-md"
              >
                {/* Bagian 1 */}
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-7 pt-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
                      Langkah 1 · Data Pelanggan
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                      Siapa yang memesan?
                    </h2>
                    <p className="mt-2 text-sm font-medium leading-7 text-slate-600">
                      Gunakan data yang mudah dihubungi agar pengelola dapat
                      mengonfirmasi pesanan.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Tanpa akun
                  </div>
                </div>

                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-black text-emerald-950">
                            Pesanan berhasil dikirim.
                          </p>
                          <p className="mt-2 text-sm font-medium leading-6 text-emerald-800">
                            Nomor pesanan Anda{" "}
                            <b>
                              {success.order_code || `#${success.order_id}`}
                            </b>
                            . Simpan nomor ini dan tunggu konfirmasi dari
                            pengelola.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-6 text-red-700 shadow-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <Field
                    icon={UserRound}
                    label="Nama lengkap"
                    hint="Nama orang yang akan dihubungi"
                    value={form.customer_name}
                    onChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        customer_name: value,
                      }))
                    }
                    placeholder="Contoh: Budi Santoso"
                  />

                  <Field
                    icon={Phone}
                    label="Nomor WhatsApp"
                    hint="Contoh: 08xxxxxxxxxx"
                    value={form.phone}
                    onChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        phone: value,
                      }))
                    }
                    placeholder="08xxxxxxxxxx"
                    type="tel"
                  />
                </div>

                {/* Bagian 2 */}
                <div className="mt-10 border-t border-slate-100 pt-8">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
                    Langkah 2 · Jumlah pesanan
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-slate-950">
                    Berapa banyak yang Anda perlukan?
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-7 text-slate-600">
                    Gunakan tombol ±1 kg untuk perubahan cepat dan ±½ kg untuk
                    penyesuaian kecil.
                  </p>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-emerald-200">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                      <div className="flex justify-end gap-2">
                        <QuantityButton
                          label="Kurangi 1 kg"
                          text="− 1 kg"
                          onClick={() => setQuantity(form.quantity_kg - 1)}
                          disabled={form.quantity_kg <= 0}
                        />
                        <QuantityButton
                          label="Kurangi ½ kg"
                          text="− ½"
                          onClick={() => setQuantity(form.quantity_kg - 0.5)}
                          disabled={form.quantity_kg <= 0}
                          secondary
                        />
                      </div>

                      <div className="min-w-[110px] text-center sm:min-w-[140px]">
                        <p className="text-4xl font-black tracking-tight text-slate-950 transition-all">
                          {form.quantity_kg}
                        </p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                          kilogram
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <QuantityButton
                          label="Tambah ½ kg"
                          text="+ ½"
                          onClick={() => setQuantity(form.quantity_kg + 0.5)}
                          secondary
                        />
                        <QuantityButton
                          label="Tambah 1 kg"
                          text="+ 1 kg"
                          onClick={() => setQuantity(form.quantity_kg + 1)}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                      <span className="h-px w-8 bg-slate-200" />
                      Mulai dari 0 kg
                      <span className="h-px w-8 bg-slate-200" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block group">
                      <span className="text-sm font-black text-slate-800 transition-colors group-focus-within:text-emerald-700">
                        Tanggal kebutuhan
                      </span>
                      <span className="mt-1 block text-[11px] font-medium leading-5 text-slate-400">
                        Default mengikuti tanggal hari ini (WIB) dan wajib
                        diisi.
                      </span>
                      <input
                        type="date"
                        min={store.current_date || undefined}
                        value={form.requested_date}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            requested_date: event.target.value,
                          }))
                        }
                        required
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition-all hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      />
                    </label>
                    <p className="mt-2 text-xs font-bold text-emerald-700">
                      Tanggal dipilih: {formatDisplayDate(form.requested_date)}
                    </p>
                  </div>

                  <Field
                    label="Catatan (opsional)"
                    hint="Misalnya kebutuhan pengambilan atau pengiriman"
                    value={form.notes}
                    onChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        notes: value,
                      }))
                    }
                    placeholder="Tulis catatan jika ada"
                    textarea
                  />
                </div>

                {/* Ringkasan */}
                <div className="mt-10 overflow-hidden rounded-[1.5rem] bg-slate-950 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20">
                  <div className="relative p-6 sm:p-8">
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-emerald-500/10 pointer-events-none" />

                    <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                          Langkah 3 · Periksa pesanan
                        </p>
                        <p className="mt-3 text-4xl font-black tracking-tight">
                          {rupiah(total)}
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-400">
                          {form.quantity_kg} kg × harga sesuai pembagian kg dan
                          ½ kg
                        </p>
                      </div>

                      <div className="max-w-xs text-left sm:text-right">
                        <p className="text-xs font-bold text-slate-400">
                          Tanggal kebutuhan
                        </p>
                        <p className="mt-1 text-sm font-black text-emerald-300">
                          {formatDisplayDate(form.requested_date)} WIB
                        </p>
                        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                          Total adalah estimasi berdasarkan harga produk yang
                          saat ini tersimpan di database.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || unavailable || form.quantity_kg <= 0}
                  className="group mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-black text-white shadow-xl shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-emerald-600/30 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:transform-none"
                >
                  {unavailable
                    ? "Jangkrik Sedang Kosong"
                    : loading
                      ? "Mengirim pesanan..."
                      : "Kirim Pesanan Sekarang"}

                  {!loading && !unavailable && (
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  )}
                </button>

                <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs font-medium leading-6 text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Setelah dikirim, tunggu konfirmasi pengelola.
                </p>
              </form>
            </Reveal>
          </div>
        </section>

        <SectionDivider />

        <section className="px-5 py-16 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
                  Setelah memesan
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Apa yang terjadi selanjutnya?
                </h2>
              </div>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-3">
              <AfterOrderCard
                number="1"
                title="Simpan nomor pesanan"
                text="Nomor pesanan ditampilkan di layar setelah pengiriman berhasil."
                index={0}
              />
              <AfterOrderCard
                number="2"
                title="Tunggu konfirmasi"
                text="Pengelola memeriksa ketersediaan dan menghubungi Anda via WhatsApp."
                index={1}
              />
              <AfterOrderCard
                number="3"
                title="Ikuti arahan pengelola"
                text="Ikuti informasi mengenai waktu pengambilan atau prosedur pengiriman."
                index={2}
              />
            </div>
          </div>
        </section>
      </main>

      <FooterCus />
    </div>
  );
}

// ==========================================
// SUB-KOMPONEN
// ==========================================

function SectionDivider() {
  return (
    <div
      className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-2 sm:px-8"
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-slate-200" />
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      <span className="h-px w-10 bg-emerald-200" />
    </div>
  );
}

function QuantityButton({ label, text, onClick, disabled, secondary = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-12 items-center justify-center rounded-xl px-4 text-sm font-black transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:transform-none sm:min-w-[80px] ${
        secondary
          ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 shadow-sm"
          : "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-600/30"
      }`}
    >
      {text}
    </button>
  );
}

function Field({
  icon: Icon,
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
}) {
  const Component = textarea ? "textarea" : "input";

  return (
    <label className="block group">
      <span className="flex items-center gap-2 text-sm font-black text-slate-800 transition-colors group-focus-within:text-emerald-700">
        {Icon && (
          <Icon className="h-4 w-4 text-emerald-600 transition-colors group-focus-within:text-emerald-500" />
        )}
        {label}
      </span>

      {hint && (
        <span className="mt-1 block text-[11px] font-medium leading-5 text-slate-400">
          {hint}
        </span>
      )}

      <Component
        type={textarea ? undefined : type}
        rows={textarea ? 3 : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition-all duration-300 hover:border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400"
      />
    </label>
  );
}

function AfterOrderCard({ number, title, text, index }) {
  return (
    <Reveal delay={0.1 + index * 0.1}>
      <div className="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <span className="text-lg font-black">{number}</span>
          </div>
          <div>
            <h3 className="font-black text-slate-900">{title}</h3>
            <div className="mt-2 text-sm font-medium leading-7 text-slate-600">
              {text}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
