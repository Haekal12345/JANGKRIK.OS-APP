import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  CloudSun,
  Egg,
  Leaf,
  Menu,
  ShieldAlert,
  Droplets,
  Calendar,
  ShieldCheck,
  Sprout,
  ThermometerSun,
  Wheat,
  X,
} from "lucide-react";
import NavbarCus from "../pages/NavbarCus";
import FooterCus from "../pages/FooterCus";

import jangkrikAlamImage from "../assets/knowledge/jangkrik-alam.svg";
import siklusJangkrikImage from "../assets/knowledge/siklus-jangkrik.svg";
import telurJangkrikImage from "../assets/knowledge/telur-jangkrik.svg";
import jangkrikMenetasImage from "../assets/knowledge/jangkrik-menetas.svg";

const sections = [
  { id: "pengantar", label: "Mengenal Jangkrik Alam", icon: Leaf },
  { id: "siklus", label: "Siklus Hidup", icon: Sprout },
  { id: "telur", label: "Telur & Pengeraman", icon: Egg },
  { id: "kandang", label: "Kandang & Lingkungan", icon: ThermometerSun },
  { id: "pakan", label: "Pakan & Perawatan", icon: Wheat },
  { id: "panen", label: "Panen & Pengelolaan", icon: CheckCircle2 },
  { id: "catatan", label: "Catatan Penting", icon: ShieldCheck },
];

const references = [
  {
    title: "Pemanfaatan Jangkrik Alam (Gryllus sp.) sebagai Bahan Pakan",
    note: "Membahas pemanfaatan Jangkrik Alam, budidaya, karakteristik, dan penggunaannya sebagai pakan.",
  },
  {
    title: "Strategi Keberhasilan Budi Daya Jangkrik",
    note: "Studi kasus yang membahas faktor cuaca, kandang, pemeliharaan, dan keberhasilan budidaya.",
  },
  {
    title:
      "Peningkatan Kesejahteraan Masyarakat Melalui Budidaya Jangkrik di Kota Tangerang Selatan",
    note: "Membahas persiapan kandang, penebaran telur, pemberian pakan, perawatan, panen, pemasaran, dan pengelolaan usaha.",
  },
  {
    title:
      "Proses Budidaya Jangkrik dalam Upaya Meningkatkan Pendapatan Masyarakat Kebun Tebeng",
    note: "Membahas proses budidaya dan pengembangan produksi jangkrik pada skala masyarakat.",
  },
  {
    title:
      "Pemanfaatan Platform Digital E-commerce dalam Manajemen Risiko dan Ketahanan UMKM Budidaya Jangkrik",
    note: "Memberikan konteks mengenai digitalisasi, manajemen risiko, dan ketahanan usaha budidaya jangkrik.",
  },
];

// --- KOMPONEN ANIMASI REVEAL (Sesuai LandingPage) ---
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

export default function PengetahuanPage() {
  const [openMenu, setOpenMenu] = useState(false);
  const [activeSection, setActiveSection] = useState("pengantar");

  const scrollToSection = (id) => {
    setActiveSection(id);
    setOpenMenu(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7faf6] text-slate-900">
      <NavbarCus />

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden px-5 pb-12 pt-28 sm:pb-16 sm:pt-32 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,rgba(16,185,129,.14),transparent_30%),radial-gradient(circle_at_15%_70%,rgba(132,204,22,.10),transparent_28%)]" />

          <div className="mx-auto max-w-7xl">
            <div className="max-w-4xl">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3.5 py-2 text-xs font-black text-emerald-800 shadow-sm">
                  <BookOpen className="h-4 w-4" /> Perpustakaan Pengetahuan
                  Jangkrik.OS
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
                  Kenali Jangkrik Alam, dari{" "}
                  <span className="text-emerald-600">telur sampai panen.</span>
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-5 max-w-3xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
                  Halaman ini dibuat sebagai perpustakaan informasi bagi
                  peternak dan pembeli. Materi dirangkum dari referensi yang
                  diberikan untuk Jangkrik.OS dan disusun dengan bahasa yang
                  lebih mudah dipahami.
                </p>
              </Reveal>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              <Reveal delay={0.15}>
                <InfoCard icon={Leaf} title="Kenali komoditasnya">
                  Pahami karakteristik Jangkrik Alam dan alasan jangkrik banyak
                  dimanfaatkan sebagai pakan hidup.
                </InfoCard>
              </Reveal>

              <Reveal delay={0.2}>
                <InfoCard icon={ThermometerSun} title="Pahami lingkungannya">
                  Suhu, kelembapan, kandang, kebersihan, dan kondisi lingkungan
                  perlu diperhatikan selama pemeliharaan.
                </InfoCard>
              </Reveal>

              <Reveal delay={0.25}>
                <InfoCard icon={BookOpen} title="Gunakan sebagai panduan">
                  Materi ini adalah bahan edukasi. Praktik lapangan tetap perlu
                  disesuaikan dengan kondisi kandang dan pengalaman peternak.
                </InfoCard>
              </Reveal>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* MOBILE MENU */}
        <section className="px-5 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <button
              type="button"
              onClick={() => setOpenMenu((value) => !value)}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black shadow-sm lg:hidden"
            >
              <span className="flex items-center gap-2">
                <Menu className="h-5 w-5 text-emerald-600" />
                Daftar Materi
              </span>
              {openMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {openMenu && (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg lg:hidden">
                {sections.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${
                        activeSection === item.id
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="px-5 pb-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* DESKTOP NAVIGATION PILLS */}
            <div className="mb-6 hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-sm lg:block sticky top-24 z-20">
              <div className="flex flex-wrap items-center gap-2">
                <div className="mr-2 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Daftar Materi
                </div>
                {sections.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                        active
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PANDUAN PRAKTIS SECTION */}
            <Reveal>
              <div className="mb-8 rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
                      Panduan praktis Jangkrik.OS
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      Ringkasan perawatan operasional
                    </h2>
                    <p className="mt-3 text-sm font-medium leading-7 text-slate-600 text-justify">
                      Selain materi dari referensi penelitian, Jangkrik.OS juga
                      memiliki pengetahuan budidaya yang digunakan sebagai
                      panduan operasional. Bagian ini mempertahankan materi yang
                      tersedia pada halaman Pengetahuan di Admin Page agar
                      informasi yang diterima pengelola dan pengguna tetap
                      konsisten.
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-xs font-bold text-emerald-800 shadow-sm">
                    Panduan operasional internal
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <Reveal delay={0.1}>
                    <PracticalCard
                      icon={ThermometerSun}
                      title="Habitat Jangkrik Alam"
                      tone="blue"
                      items={[
                        [
                          "Pelompat ulung",
                          "Jangkrik Alam sangat gesit. Materi operasional menyarankan lakban bening pada bibir atas kandang dengan lebar 10–15 cm untuk membantu mencegah jangkrik memanjat keluar.",
                        ],
                        [
                          "Suhu & kelembapan",
                          "Panduan internal menggunakan kisaran suhu 28–32°C sebagai kondisi yang perlu dijaga stabil, disertai sirkulasi udara yang baik agar kandang tidak pengap.",
                        ],
                        [
                          "Ruang sembunyi",
                          "Egg tray disusun kokoh dan rapat untuk menyediakan tempat berlindung serta mengurangi risiko kanibalisme.",
                        ],
                      ]}
                    />
                  </Reveal>

                  <Reveal delay={0.2}>
                    <PracticalCard
                      icon={Droplets}
                      title="Pakan (Diet Tinggi Protein)"
                      tone="green"
                      items={[
                        [
                          "Pakan utama",
                          "Pur ayam seperti BR511 atau BR11 sebagai pakan utama. Untuk jangkrik yang belum dewasa, pur dapat dihaluskan.",
                        ],
                        [
                          "Sumber air",
                          "Irisan gedebok pisang, daun pepaya, atau sawi dapat digunakan sebagai sumber air dan ditempatkan secara merata.",
                        ],
                        [
                          "Waspada kanibalisme",
                          "Ketersediaan pakan dan pengawasan rutin sangat penting karena keterlambatan pakan meningkatkan risiko jangkrik saling memangsa.",
                        ],
                      ]}
                      alert="RAWAN KANIBAL: Pastikan pakan tersedia dan kondisi kandang terus dipantau."
                    />
                  </Reveal>

                  <Reveal delay={0.1}>
                    <PracticalCard
                      icon={Calendar}
                      title="Siklus & Waktu Panen"
                      tone="orange"
                      items={[
                        [
                          "Penetasan",
                          "Telur menetas sekitar 11–14 hari pada media pasir/kain lembap. Pada fase ini jangkrik masih sangat rentan terhadap air.",
                        ],
                        [
                          "Usia panen ideal",
                          "Panduan internal menggunakan umur sekitar 28–30 hari sebagai acuan puncak bobot panen.",
                        ],
                        [
                          "Sebelum bersayap",
                          "Materi internal menyarankan panen sebelum jangkrik mulai bersayap keras atau berbunyi agar diterima pasar.",
                        ],
                      ]}
                    />
                  </Reveal>

                  <Reveal delay={0.2}>
                    <PracticalCard
                      icon={ShieldAlert}
                      title="Waspada Amonia & Predator"
                      tone="rose"
                      items={[
                        [
                          "Amonia",
                          "Sisa pakan basah atau sayuran layu yang membusuk menghasilkan amonia. Periksa dan bersihkan secara rutin.",
                        ],
                        [
                          "Semut & cicak",
                          "Materi internal menyarankan penghalang pada kaki rak dan menjaga jarak kandang dari dinding untuk mencegah akses predator.",
                        ],
                        [
                          "Laba-laba & tikus",
                          "Area sekitar kandang perlu dibersihkan secara rutin untuk meminimalisir hama mendekat.",
                        ],
                      ]}
                    />
                  </Reveal>
                </div>
              </div>
            </Reveal>

            {/* KONTEN ARTIKEL */}
            <article className="min-w-0 rounded-[2rem] border border-slate-200 bg-white px-5 shadow-sm sm:px-8 lg:px-10 py-4">
              <ArticleSection
                id="pengantar"
                eyebrow="01 · Dasar"
                title="Mengenal Jangkrik Alam"
              >
                <p>
                  Jangkrik merupakan serangga yang termasuk kelompok Insekta dan
                  telah lama dimanfaatkan sebagai <strong>pakan hidup</strong>.
                  Referensi yang diberikan untuk Jangkrik.OS mencatat
                  pemanfaatannya antara lain untuk burung kicauan, umpan
                  memancing, dan pakan ikan hias. Budidaya membuat pasokan dapat
                  diperoleh secara lebih teratur dibandingkan hanya mengandalkan
                  penangkapan dari alam.
                </p>
                <p>
                  Dalam salah satu sumber yang membahas <em>Gryllus sp.</em>,
                  Jangkrik Alam digambarkan berukuran lebih kecil dan lebih
                  ramping dibandingkan Jangkrik Kalung. Sumber tersebut juga
                  mencatat bahwa Jangkrik Alam banyak digunakan sebagai pakan
                  burung karena ukurannya sesuai untuk kebutuhan tersebut.
                </p>
                <div className="grid gap-4 pt-2 sm:grid-cols-2">
                  <Reveal delay={0.1}>
                    <InfoCard icon={Leaf} title="Pemanfaatan utama">
                      Pakan burung, umpan memancing, dan pakan untuk ikan hias
                      merupakan pemanfaatan yang disebutkan dalam referensi.
                    </InfoCard>
                  </Reveal>
                  <Reveal delay={0.2}>
                    <InfoCard icon={Sprout} title="Budidaya berkelanjutan">
                      Budidaya memungkinkan peternak menyediakan jangkrik secara
                      rutin dan mengelola produksi berdasarkan kebutuhan pasar.
                    </InfoCard>
                  </Reveal>
                </div>
              </ArticleSection>

              <SectionDivider />

              <ArticleSection
                id="siklus"
                eyebrow="02 · Pertumbuhan"
                title="Siklus Hidup Jangkrik"
              >
                <p>
                  Secara umum, pengelolaan budidaya dimulai dari{" "}
                  <strong>telur</strong>, kemudian masuk ke tahap penetasan dan
                  pertumbuhan nimfa hingga akhirnya mencapai ukuran yang siap
                  dipanen. Karena perkembangan berlangsung melalui beberapa
                  tahap, pencatatan tanggal tebar telur menjadi penting untuk
                  membantu peternak memperkirakan kegiatan pemeliharaan dan
                  waktu panen.
                </p>
                <p>
                  Referensi yang diberikan menunjukkan bahwa waktu panen tidak
                  selalu dituliskan sebagai satu angka yang sama. Salah satu
                  sumber menyebut contoh masa panen sekitar 25–32 hari,
                  sementara sumber kegiatan budidaya lainnya mencantumkan 6–8
                  minggu. Perbedaan ini menunjukkan bahwa{" "}
                  <strong>
                    umur panen perlu disesuaikan dengan jenis jangkrik, kondisi
                    lingkungan, metode pemeliharaan, dan tujuan produksi
                  </strong>
                  .
                </p>

                <Reveal delay={0.1}>
                  <KnowledgeImage
                    src={siklusJangkrikImage}
                    alt="Diagram siklus hidup jangkrik"
                    eyebrow="Visual siklus hidup"
                    caption="Gambaran tahapan telur, penetasan, pertumbuhan nimfa, hingga tahap dewasa."
                  />
                </Reveal>

                <Reveal delay={0.2}>
                  <div className="mt-5 rounded-3xl bg-slate-950 p-6 text-white sm:p-7">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                      Prinsip pencatatan
                    </p>
                    <p className="mt-3 text-sm font-medium leading-7 text-slate-300">
                      Catat tanggal tebar telur → pantau perkembangan → lakukan
                      perawatan rutin → amati kesiapan panen → catat hasil
                      panen. Rangkaian data ini nantinya juga dapat digunakan
                      Jangkrik.OS untuk membaca pola produksi.
                    </p>
                  </div>
                </Reveal>
              </ArticleSection>

              <SectionDivider />

              <ArticleSection
                id="telur"
                eyebrow="03 · Awal Produksi"
                title="Telur dan Pengeraman"
              >
                <p>
                  Tahap telur merupakan bagian penting karena menjadi awal dari
                  satu siklus produksi. Salah satu referensi budidaya yang
                  diberikan menjelaskan penggunaan media pasir dalam pengelolaan
                  telur. Referensi lainnya menyebut wadah bertelur dengan media
                  pasir atau tanah yang lembap serta perlunya menjaga kelembapan
                  substrat selama proses penetasan.
                </p>
                <p>
                  Dalam praktiknya, pengelola perlu memperhatikan kondisi media
                  agar tidak terlalu kering maupun terlalu basah. Pemantauan
                  dilakukan secara rutin karena kondisi lingkungan di sekitar
                  telur berpengaruh terhadap keberhasilan penetasan.
                </p>

                <div className="grid gap-5 pt-2 md:grid-cols-2">
                  <Reveal delay={0.1}>
                    <KnowledgeImage
                      src={telurJangkrikImage}
                      alt="Ilustrasi telur jangkrik"
                      eyebrow="Tahap telur"
                      caption="Ilustrasi telur jangkrik sebelum memasuki tahap penetasan."
                    />
                  </Reveal>
                  <Reveal delay={0.2}>
                    <KnowledgeImage
                      src={jangkrikMenetasImage}
                      alt="Ilustrasi jangkrik yang baru menetas"
                      eyebrow="Tahap awal"
                      caption="Ilustrasi jangkrik pada tahap awal setelah menetas."
                    />
                  </Reveal>
                </div>

                <div className="grid gap-4 pt-4 sm:grid-cols-3">
                  <Reveal delay={0.1}>
                    <InfoCard icon={Egg} title="Media telur">
                      Gunakan media penetasan sesuai metode yang diterapkan dan
                      jaga kondisinya.
                    </InfoCard>
                  </Reveal>
                  <Reveal delay={0.2}>
                    <InfoCard icon={CloudSun} title="Pantau lingkungan">
                      Kondisi suhu dan kelembapan perlu dipantau secara berkala.
                    </InfoCard>
                  </Reveal>
                  <Reveal delay={0.3}>
                    <InfoCard icon={CheckCircle2} title="Catat tanggal">
                      Tanggal tebar menjadi dasar untuk memperkirakan jadwal
                      kegiatan berikutnya.
                    </InfoCard>
                  </Reveal>
                </div>
              </ArticleSection>

              <SectionDivider />

              <ArticleSection
                id="kandang"
                eyebrow="04 · Lingkungan"
                title="Kandang, Suhu, dan Kelembapan"
              >
                <p>
                  Kandang menjadi lingkungan utama tempat jangkrik tumbuh.
                  Sumber yang diberikan menggambarkan kandang budidaya sebagai
                  wadah pertumbuhan dari tahap awal sampai panen dan menekankan
                  pentingnya ventilasi. Bahan kandang dapat beragam, seperti
                  kayu, bambu, atau plastik, selama dapat mendukung kondisi
                  pemeliharaan yang diperlukan.
                </p>
                <p>
                  Kondisi cuaca juga perlu diperhatikan. Sumber menyebut kisaran
                  kondisi hidup sekitar{" "}
                  <strong>20–32°C dengan kelembapan 65–80%</strong>. Angka
                  tersebut sebaiknya diperlakukan sebagai informasi pendukung,
                  bukan aturan mutlak, karena kondisi aktual perlu disesuaikan
                  dengan metode peternakan masing-masing.
                </p>

                <Reveal delay={0.1}>
                  <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                    <div className="flex gap-3">
                      <CloudSun className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
                      <div>
                        <h3 className="font-black text-amber-950">
                          Perubahan cuaca perlu dicatat
                        </h3>
                        <p className="mt-2 text-sm font-medium leading-7 text-amber-900/80">
                          Bagi Jangkrik.OS, catatan kondisi seperti hujan,
                          kemarau, suhu, atau perubahan kelembapan dapat menjadi
                          data pendukung untuk membaca hubungan antara kondisi
                          lingkungan dan hasil produksi.
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </ArticleSection>

              <SectionDivider />

              <ArticleSection
                id="pakan"
                eyebrow="05 · Pemeliharaan"
                title="Pakan, Air, dan Perawatan Harian"
              >
                <p>
                  Pemeliharaan tidak berhenti pada pemberian pakan. Referensi
                  memasukkan{" "}
                  <strong>
                    pemberian pakan rutin, pengaturan lingkungan, kebersihan
                    kandang, dan monitoring perkembangan
                  </strong>{" "}
                  sebagai bagian integral dari proses budidaya. Perawatan yang
                  konsisten membantu peternak mengetahui masalah lebih awal.
                </p>
                <p>
                  Salah satu referensi mencatat bahwa jangkrik dapat mengalami
                  kanibalisme. Karena itu, ketersediaan pakan, kondisi sembunyi,
                  dan kepadatan populasi perlu diawasi. Hama seperti tikus juga
                  disebut sebagai salah satu risiko utama.
                </p>

                <div className="grid gap-4 pt-2 md:grid-cols-2">
                  <Reveal delay={0.1}>
                    <InfoCard icon={Wheat} title="Pakan">
                      Berikan pakan secara rutin. Catat pembelian pakan agar
                      biaya produksi dapat dihitung dengan jelas.
                    </InfoCard>
                  </Reveal>
                  <Reveal delay={0.2}>
                    <InfoCard
                      icon={ShieldCheck}
                      title="Kebersihan & pengawasan"
                    >
                      Periksa kondisi kandang, kelembapan, hama, dan perubahan
                      perilaku jangkrik secara berkala.
                    </InfoCard>
                  </Reveal>
                </div>
              </ArticleSection>

              <SectionDivider />

              <ArticleSection
                id="panen"
                eyebrow="06 · Hasil Produksi"
                title="Panen dan Pengelolaan Hasil"
              >
                <p>
                  Panen merupakan tahap ketika jangkrik telah mencapai kondisi
                  yang sesuai dengan kebutuhan pembeli. Dalam sistem peternakan
                  kontinu, panen tidak harus terjadi pada seluruh kotak secara
                  bersamaan. Setiap kotak dapat memiliki tanggal tebar yang
                  berbeda sehingga jadwal panen bergilir.
                </p>
                <p>
                  Pola tersebut membuat pencatatan produksi menjadi sangat
                  penting. Peternak mencatat tanggal panen, berat, harga jual,
                  dan tujuan penjualan untuk memperoleh gambaran margin
                  keuntungan usaha dari waktu ke waktu.
                </p>

                <Reveal delay={0.1}>
                  <div className="mt-5 rounded-3xl bg-emerald-50 p-6 sm:p-7">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                      Hubungannya dengan Jangkrik.OS
                    </p>
                    <p className="mt-3 text-sm font-medium leading-7 text-emerald-950/80">
                      Semakin konsisten data produksi dan penjualan dicatat,
                      semakin akurat informasi yang ditampilkan pada dashboard
                      analisis tren. Pencatatan adalah dasar pengambilan
                      keputusan berbasis data.
                    </p>
                  </div>
                </Reveal>
              </ArticleSection>

              <SectionDivider />

              <ArticleSection
                id="catatan"
                eyebrow="07 · Pengingat"
                title="Catatan Penting untuk Peternak"
              >
                <p>
                  Tidak ada satu metode pemeliharaan yang otomatis cocok untuk
                  seluruh peternakan. Karena itu, materi di halaman ini
                  sebaiknya digunakan sebagai{" "}
                  <strong>panduan pengetahuan</strong>, bukan pengganti
                  pengamatan langsung terhadap kondisi kandang.
                </p>
                <p>
                  Jika kondisi lingkungan berubah, produksi turun, atau terdapat
                  gejala yang tidak biasa, peternak perlu melakukan pemeriksaan
                  lapangan dan menyesuaikan metode. Catatan harian di aplikasi
                  sangat membantu membandingkan tren produksi saat ini dengan
                  sebelumnya.
                </p>
              </ArticleSection>

              {/* REFERENSI */}
              <section
                id="referensi"
                className="scroll-mt-28 border-t border-slate-200 py-12 sm:py-16"
              >
                <Reveal>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
                      Sumber Materi
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      Referensi yang digunakan
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-500">
                      Daftar berikut berasal dari kumpulan referensi yang
                      diberikan untuk pengembangan Jangkrik.OS. Materi pada
                      halaman ini diringkas dan disederhanakan untuk kebutuhan
                      edukasi pengguna.
                    </p>
                  </div>
                </Reveal>

                <div className="mt-7 space-y-3">
                  {references.map((reference, index) => (
                    <Reveal key={reference.title} delay={index * 0.05}>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm hover:border-emerald-200">
                        <div className="flex gap-4">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-emerald-700 ring-1 ring-slate-200">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="text-sm font-black text-slate-900">
                              {reference.title}
                            </h3>
                            <p className="mt-1 text-xs font-medium leading-6 text-slate-500">
                              {reference.note}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </section>

              {/* BOTTOM CTA */}
              <Reveal>
                <section className="mb-12 rounded-[2rem] bg-slate-950 p-6 text-white sm:mb-16 sm:p-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                        Siap membeli?
                      </p>
                      <h2 className="mt-2 text-2xl font-black">
                        Pesan Jangkrik Alam melalui Jangkrik.OS.
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-400">
                        Setelah mengenal dasar-dasar jangkrik, Anda dapat
                        langsung menuju halaman pemesanan dan mengikuti
                        langkahnya satu per satu.
                      </p>
                    </div>
                    <a
                      href="/pesan"
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-black text-white transition hover:bg-emerald-400 hover:-translate-y-1"
                    >
                      Pesan Jangkrik
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </section>
              </Reveal>
            </article>
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

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-black text-slate-900">{title}</h3>
          <div className="mt-2 text-sm font-medium leading-7 text-slate-600">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleSection({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="scroll-mt-28 py-12 sm:py-16">
      <Reveal>
        <div className="mb-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {title}
          </h2>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="space-y-5 text-justify text-[15px] font-medium leading-8 text-slate-600 [&_strong]:font-black [&_strong]:text-slate-900">
          {children}
        </div>
      </Reveal>
    </section>
  );
}

function KnowledgeImage({ src, alt, eyebrow, caption }) {
  return (
    <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm transition hover:shadow-md">
      <div className="flex min-h-[14rem] items-center justify-center bg-white p-5 sm:min-h-[16rem] sm:p-7">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-auto max-h-72 w-full object-contain"
        />
      </div>
      <figcaption className="border-t border-slate-200 px-5 py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
          {eyebrow}
        </p>
        <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
          {caption}
        </p>
      </figcaption>
    </figure>
  );
}

function PracticalCard({ icon: Icon, title, items, tone = "blue", alert }) {
  const tones = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      bullet: "text-blue-500",
      glow: "bg-blue-50/70",
      border: "border-blue-100",
    },
    green: {
      icon: "bg-green-50 text-green-600",
      bullet: "text-green-500",
      glow: "bg-green-50/70",
      border: "border-green-100",
    },
    orange: {
      icon: "bg-orange-50 text-orange-600",
      bullet: "text-orange-500",
      glow: "bg-orange-50/70",
      border: "border-orange-100",
    },
    rose: {
      icon: "bg-rose-50 text-rose-600",
      bullet: "text-rose-500",
      glow: "bg-rose-50/70",
      border: "border-rose-100",
    },
  };
  const palette = tones[tone] || tones.blue;

  return (
    <div
      className={`group relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-7`}
    >
      <div
        className={`absolute right-0 top-0 h-28 w-28 rounded-bl-full ${palette.glow} transition-transform duration-500 group-hover:scale-110 pointer-events-none`}
      />

      <div className="relative">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${palette.icon} shadow-sm`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">{title}</h3>
        </div>

        <ul className="mt-6 space-y-4 text-sm font-medium leading-7 text-slate-600 text-justify">
          {items.map(([label, text]) => (
            <li key={label} className="flex items-start gap-3">
              <span className={`mt-1 text-lg font-black ${palette.bullet}`}>
                •
              </span>
              <span>
                <strong className="text-slate-800">{label}:</strong> {text}
              </span>
            </li>
          ))}
        </ul>

        {alert && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm font-medium leading-6 text-red-800">
              {alert}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
