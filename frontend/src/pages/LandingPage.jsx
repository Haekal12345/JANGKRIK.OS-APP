import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Droplets,
  Leaf,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  ThermometerSun,
} from "lucide-react";
import { Link } from "react-router-dom";
import HeroImage from "../assets/LOGO.png";
import NavbarCus from "./NavbarCus";
import FooterCus from "./FooterCus";

// --- DATA KONSTAN ---
const knowledge = [
  [
    Leaf,
    "Mengenal Jangkrik Alam",
    "Kenali dasar Jangkrik Alam, kegunaan, dan kebutuhan dasarnya.",
  ],
  [
    Sprout,
    "Siklus Budidaya",
    "Pelajari alur dari telur, penetasan, pertumbuhan, hingga panen.",
  ],
  [
    ThermometerSun,
    "Kondisi Lingkungan",
    "Pahami pentingnya suhu, kelembapan, kebersihan, dan pengamatan.",
  ],
];

const benefits = [
  "Jumlah pesanan tercatat lebih terstruktur.",
  "Harga dan estimasi total terlihat sebelum dikirim.",
  "Data pesanan langsung masuk ke sistem pengelola.",
  "Tidak perlu mengulang detail pesanan melalui chat.",
];

const care = [
  [ThermometerSun, "Suhu"],
  [Droplets, "Kelembapan"],
  [BookOpen, "Pakan"],
  [ShieldCheck, "Pengamatan"],
];

const faq = [
  [
    "Apa itu Jangkrik.OS?",
    "Jangkrik.OS adalah platform digital yang menyediakan informasi mengenai Jangkrik Alam, memudahkan pelanggan melakukan pemesanan, serta membantu pengelola dalam mencatat dan mengelola operasional peternakan jangkrik.",
  ],

  [
    "Jangkrik yang dijual jenis apa?",
    "Jangkrik yang tersedia pada platform ini adalah Jangkrik Alam. Harga dan ketersediaannya mengikuti kondisi serta data terbaru dari pengelola peternakan.",
  ],

  [
    "Bagaimana cara memesan jangkrik?",
    "Buka halaman Pesan Jangkrik, isi nama dan nomor WhatsApp, tentukan jumlah jangkrik yang dibutuhkan dalam kilogram, kemudian kirim pesanan. Setelah itu, pengelola akan memeriksa ketersediaan dan menghubungi Anda untuk konfirmasi.",
  ],

  [
    "Apakah saya harus membuat akun untuk memesan?",
    "Tidak. Pelanggan tidak perlu membuat akun untuk melakukan pemesanan. Anda cukup mengisi nama, nomor WhatsApp, jumlah jangkrik yang dibutuhkan, serta informasi tambahan jika diperlukan.",
  ],

  [
    "Berapa harga jangkrik yang dijual?",
    "Harga jangkrik ditampilkan berdasarkan harga yang sedang ditetapkan oleh pengelola. Harga dapat berubah mengikuti kondisi ketersediaan dan harga jual saat pemesanan.",
  ],

  [
    "Apakah jumlah pesanan bisa disesuaikan?",
    "Ya. Anda dapat menentukan jumlah jangkrik yang dibutuhkan dalam satuan kilogram pada halaman pemesanan. Jumlah tersebut nantinya akan diperiksa kembali oleh pengelola berdasarkan ketersediaan.",
  ],

  [
    "Apakah pesanan langsung diproses setelah dikirim?",
    "Pesanan yang dikirim belum berarti langsung diproses. Pengelola akan memeriksa ketersediaan jangkrik terlebih dahulu, kemudian menghubungi pelanggan untuk memberikan konfirmasi mengenai pesanan.",
  ],

  [
    "Bagaimana saya mengetahui pesanan sudah dikonfirmasi?",
    "Setelah pesanan dikirim, Anda akan mendapatkan nomor pesanan. Simpan nomor tersebut dan tunggu pengelola menghubungi Anda melalui nomor WhatsApp yang diberikan saat melakukan pemesanan.",
  ],

  [
    "Apakah saya bisa menentukan tanggal kebutuhan jangkrik?",
    "Ya. Pada halaman pemesanan tersedia pilihan tanggal kebutuhan. Anda dapat mengisinya apabila memiliki tanggal tertentu, tetapi tanggal tersebut tetap perlu dikonfirmasi oleh pengelola berdasarkan ketersediaan jangkrik.",
  ],

  [
    "Untuk apa Jangkrik Alam biasanya digunakan?",
    "Jangkrik dapat digunakan untuk berbagai kebutuhan, seperti pakan burung, pakan ikan, kebutuhan memancing, serta kebutuhan lain yang sesuai. Penggunaan dapat berbeda tergantung kebutuhan pelanggan.",
  ],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7faf6] text-slate-900">
      <NavbarCus />

      <main className="pt-24">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden px-5 pb-16 pt-10 sm:px-6 sm:pb-20 lg:px-8">
          <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-lime-200/40 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3.5 py-2 text-xs font-black text-emerald-800 shadow-sm">
                  <Leaf className="h-4 w-4" /> Informasi & Pemesanan Jangkrik
                  Alam
                </span>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                  Halo, Selamat Datang di{" "}
                  <span className="text-emerald-600">Jangkrik.OS.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
                  Tempat untuk mengenal Jangkrik Alam, melakukan pemesanan
                  dengan lebih mudah, dan membantu pengelolaan peternakan
                  jangkrik menjadi lebih teratur.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/pesan"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-emerald-700"
                  >
                    Pesan Jangkrik Alam <ArrowRight className="h-5 w-5" />
                  </Link>
                  <a
                    href="#tentang"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
                  >
                    Kenali Jangkrik.OS
                  </a>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <div className="relative mx-auto w-full max-w-lg">
                <div className="absolute inset-8 rounded-[3rem] bg-emerald-300/30 blur-3xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-5 shadow-2xl">
                  <div className="rounded-[1.5rem] bg-gradient-to-br from-emerald-50 to-lime-50 p-6">
                    <img
                      src={HeroImage}
                      alt="Ilustrasi Jangkrik Alam"
                      className="mx-auto h-60 w-full object-contain sm:h-80"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Chip
                      icon={Clock3}
                      title="Panen kontinu"
                      text="Bergilir sesuai siklus"
                    />
                    <Chip
                      icon={ShieldCheck}
                      title="Pemesanan jelas"
                      text="Data tercatat"
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* TENTANG SECTION */}
        <section id="tentang" className="scroll-mt-28 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <Reveal>
              <Heading
                eyebrow="Tentang Jangkrik.OS"
                title="Satu tempat untuk mengenal dan memesan Jangkrik Alam."
                text="Jangkrik.OS membuat informasi dan proses pemesanan lebih mudah dipahami oleh pelanggan, sekaligus membantu pengelola menerima data pesanan secara lebih terstruktur."
              />
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                [
                  Leaf,
                  "Mengenal",
                  "Pelajari dasar Jangkrik Alam dan kebutuhan budidayanya.",
                ],
                [
                  ShoppingBag,
                  "Memesan",
                  "Tentukan jumlah yang diperlukan dan kirim data pesanan.",
                ],
                [
                  MessageCircle,
                  "Terhubung",
                  "Pengelola menerima data pesanan untuk diperiksa dan dikonfirmasi.",
                ],
              ].map(([Icon, title, text], i) => (
                <Reveal key={title} delay={i * 0.1}>
                  <article className="h-full rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-black">{title}</h3>
                    <p className="mt-3 leading-7 text-slate-600">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* JANGKRIK (PENGETAHUAN) SECTION */}
        <section id="jangkrik" className="scroll-mt-28 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <Reveal>
              <Heading
                eyebrow="Mengenal Jangkrik Alam"
                title="Kenali dasarnya sebelum membeli atau memelihara."
                text="Ini adalah ringkasan. Materi lebih lengkap tersedia di Perpustakaan Pengetahuan Jangkrik.OS."
              />
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {knowledge.map(([Icon, title, text], i) => (
                <Reveal key={title} delay={i * 0.1}>
                  <article className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-black">{title}</h3>
                    <p className="mt-3 leading-7 text-slate-600">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 sm:flex-row">
                <div>
                  <p className="font-black text-emerald-950">
                    Ingin belajar lebih lengkap?
                  </p>
                  <p className="mt-1 text-sm text-emerald-800/80">
                    Buka perpustakaan pengetahuan untuk materi yang lebih
                    terstruktur.
                  </p>
                </div>
                <Link
                  to="/pengetahuan"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
                >
                  <BookOpen className="h-4 w-4" /> Buka Pengetahuan
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* PERAWATAN SECTION */}
        <section
          id="perawatan"
          className="scroll-mt-28 bg-slate-950 py-16 text-white sm:py-20"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
            <Reveal>
              <div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">
                  Perawatan dasar
                </p>
                <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                  Budidaya membutuhkan kondisi yang terjaga.
                </h2>
                <p className="mt-5 max-w-xl leading-8 text-slate-300">
                  Perawatan mencakup lingkungan kandang, pakan, kebersihan,
                  kepadatan, dan pengamatan rutin.
                </p>
                <Link
                  to="/pengetahuan"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-black transition hover:bg-white/10"
                >
                  Pelajari perawatan <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {care.map(([Icon, title], i) => (
                <Reveal key={title} delay={i * 0.1}>
                  <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/10">
                    <Icon className="h-6 w-6 text-emerald-300" />
                    <h3 className="mt-4 font-black">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Pantau dan jaga kondisi ini secara rutin sesuai kebutuhan
                      pemeliharaan.
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* CARA PESAN SECTION */}
        <section
          id="cara-pesan"
          className="scroll-mt-28 bg-white py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <Reveal>
              <Heading
                eyebrow="Cara Pesan"
                title="Tidak perlu bingung. Ikuti tiga langkah sederhana."
                text="Halaman pemesanan dibuat dengan bahasa yang sederhana agar mudah digunakan berbagai kalangan."
                center
              />
            </Reveal>
            <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
              {[
                [
                  "1",
                  "Tentukan kebutuhan",
                  "Pilih jumlah Jangkrik Alam yang ingin dipesan.",
                ],
                [
                  "2",
                  "Isi data",
                  "Masukkan nama, WhatsApp, tanggal kebutuhan, dan catatan jika diperlukan.",
                ],
                [
                  "3",
                  "Kirim & tunggu konfirmasi",
                  "Pesanan masuk ke sistem pengelola dan diperiksa berdasarkan ketersediaan.",
                ],
              ].map(([n, t, d], i) => (
                <Reveal key={n} delay={i * 0.1}>
                  <div className="h-full rounded-3xl border border-slate-200 p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
                      {n}
                    </span>
                    <h3 className="mt-5 text-lg font-black">{t}</h3>
                    <p className="mt-2 leading-7 text-slate-600">{d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3}>
              <div className="mt-10 text-center">
                <Link
                  to="/pesan"
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 font-black text-white shadow-xl transition hover:bg-emerald-700 hover:-translate-y-1"
                >
                  Mulai Pesan Jangkrik <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <Divider />

        {/* MANFAAT SECTION */}
        <section id="manfaat" className="scroll-mt-28 py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-6 lg:grid-cols-2 lg:px-8">
            <Reveal>
              <Heading
                eyebrow="Keuntungan memesan melalui website"
                title="Lebih praktis untuk pelanggan, lebih rapi untuk pengelola."
                text="Data pesanan dikirim melalui satu formulir terstruktur sehingga detail tidak mudah tercecer."
              />
            </Reveal>
            <div className="grid gap-3">
              {benefits.map((b, i) => (
                <Reveal key={b} delay={i * 0.08}>
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <p className="font-bold text-slate-700">{b}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* FAQ SECTION */}
        <section id="faq" className="scroll-mt-28 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
            <Reveal>
              <Heading
                eyebrow="Pertanyaan yang biasanya diajukan"
                title="Masih ada yang ingin diketahui?"
                text="Beberapa pertanyaan umum mengenai Jangkrik.OS dan pemesanan."
                center
              />
            </Reveal>
            <div className="mt-10 grid gap-3">
              {faq.map(([q, a], i) => (
                <Reveal key={q} delay={i * 0.08}>
                  <details className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition open:bg-white hover:border-emerald-200">
                    <summary className="cursor-pointer list-none pr-6 font-black text-slate-800">
                      {q}
                    </summary>
                    <p className="mt-3 leading-7 text-slate-600">{a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="px-5 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-7xl rounded-[2rem] bg-emerald-700 px-6 py-10 text-white shadow-2xl sm:px-10">
              <div className="flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
                <div>
                  <p className="text-sm font-black text-emerald-100">
                    Sudah siap?
                  </p>
                  <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                    Pesan Jangkrik Alam dengan lebih mudah.
                  </h2>
                  <p className="mt-3 leading-7 text-emerald-50/85">
                    Tentukan jumlah, isi data, lalu tunggu konfirmasi pengelola.
                  </p>
                </div>
                <Link
                  to="/pesan"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-black text-emerald-700 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  Pesan Sekarang <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <FooterCus />
    </div>
  );
}

// ==========================================
// SUB-KOMPONEN
// ==========================================

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

function Divider() {
  return (
    <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-1 sm:px-6 lg:px-8">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      <span className="h-px w-12 bg-emerald-200" />
    </div>
  );
}

function Heading({ eyebrow, title, text, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function Chip({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-emerald-600" />
      <p className="mt-2 text-sm font-black">{title}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{text}</p>
    </div>
  );
}
