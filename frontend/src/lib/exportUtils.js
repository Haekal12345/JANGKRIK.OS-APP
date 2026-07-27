import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Bantuan untuk format Rupiah
export const fmtRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

// Bantuan untuk merapikan format tanggal (Hilangkan T dan Z)
const formatTanggal = (tanggalRaw) => {
  if (!tanggalRaw) return "-";
  return new Date(tanggalRaw.split("T")[0]).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const exportPDF = (data, tipe = "penjualan") => {
  const doc = new jsPDF();

  const isPenjualan = tipe === "penjualan";
  const isPembelian = tipe === "pembelian";
  const isProduksi = tipe === "produksi";

  // --- 1. KOP SURAT / HEADER LAPORAN ---
  // Penentuan Warna Tema (Hijau: Penjualan, Biru: Pembelian, Violet: Produksi)
  let themeColor = [21, 128, 61]; // Default Hijau
  if (isPembelian) themeColor = [37, 99, 235]; // Biru
  if (isProduksi) themeColor = [109, 40, 217]; // Violet

  // Nama Aplikasi / Perusahaan
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.text("Jangkrik.OS", 14, 22);

  // Sub-Judul
  let title = "Laporan Pendapatan Penjualan";
  if (isPembelian) title = "Laporan Pengeluaran & Pembelian";
  if (isProduksi) title = "Laporan Siklus Produksi";

  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text(title, 14, 30);

  // Tanggal Cetak
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Waktu Cetak: ${new Date().toLocaleString("id-ID")}`, 14, 36);

  // Garis Pembatas Header
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 40, 196, 40);

  // --- 2. PERSIAPAN DATA TABEL ---
  let tableColumn = [];
  if (isPenjualan)
    tableColumn = [
      "Tanggal",
      "Pembeli",
      "Volume",
      "Harga/kg",
      "Total Pendapatan",
    ];
  if (isPembelian)
    tableColumn = [
      "Tanggal",
      "Supplier",
      "Jenis Barang",
      "Jumlah",
      "Total Pengeluaran",
    ];
  if (isProduksi)
    tableColumn = [
      "Tgl Tebar",
      "Telur (g)",
      "Eram (Hari)",
      "Pakan",
      "Vitamin",
      "Panen (Kg)",
      "Catatan",
    ];

  const tableRows = [];
  let grandTotalMoney = 0;
  let grandTotalPanen = 0;

  data.forEach((item) => {
    let rowData = [];

    if (isProduksi) {
      const tanggalRapi = formatTanggal(item.tanggal_tebar);
      grandTotalPanen += Number(item.hasil_panen || 0);

      rowData = [
        tanggalRapi,
        `${item.jumlah_telur_per_gram || 0} g`,
        `${item.pengeraman_per_hari || 0} Hari`,
        item.pakan || "-",
        item.vitamin || "-",
        `${item.hasil_panen || 0} Kg`,
        item.catatan || "-",
      ];
    } else {
      const tanggalRapi = formatTanggal(item.tanggal);
      const nilaiTotalBaris = Number(
        item.total || item.harga * item.jumlah || 0,
      );
      grandTotalMoney += nilaiTotalBaris;

      if (isPenjualan) {
        rowData = [
          tanggalRapi,
          item.buyer || item.pembeli || "-",
          `${item.jumlah_kg || 0} kg`,
          fmtRupiah(item.harga_per_kg || 0),
          fmtRupiah(nilaiTotalBaris),
        ];
      } else if (isPembelian) {
        rowData = [
          tanggalRapi,
          item.supplier || "-",
          item.jenis_barang || "-",
          item.jumlah ? `${item.jumlah}` : "-",
          fmtRupiah(nilaiTotalBaris),
        ];
      }
    }
    tableRows.push(rowData);
  });

  // --- 3. PERSIAPAN FOOTER TABEL ---
  let footConfig = [];
  if (isProduksi) {
    footConfig = [
      [
        {
          content: "TOTAL HASIL PANEN KESELURUHAN",
          colSpan: 5,
          styles: {
            halign: "right",
            fontStyle: "bold",
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
          },
        },
        {
          content: `${grandTotalPanen} Kg`,
          colSpan: 2,
          styles: {
            halign: "left",
            fontStyle: "bold",
            fillColor: [240, 240, 240],
            textColor: themeColor,
          },
        },
      ],
    ];
  } else {
    footConfig = [
      [
        {
          content: isPenjualan
            ? "TOTAL PENDAPATAN KESELURUHAN"
            : "TOTAL PENGELUARAN KESELURUHAN",
          colSpan: 4,
          styles: {
            halign: "right",
            fontStyle: "bold",
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
          },
        },
        {
          content: fmtRupiah(grandTotalMoney),
          styles: {
            halign: "right",
            fontStyle: "bold",
            fillColor: [240, 240, 240],
            textColor: isPenjualan ? [21, 128, 61] : [225, 29, 72],
          },
        },
      ],
    ];
  }

  // --- 4. RENDER TABEL ---
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 46,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 10,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: themeColor,
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 26 }, // Kolom Tanggal (Lebar dikunci agar tidak melebar)
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    foot: footConfig,
  });

  doc.save(
    `Laporan_${tipe}_JangkrikOS_${new Date().toISOString().split("T")[0]}.pdf`,
  );
};

export const exportCSV = (data, tipe = "penjualan") => {
  const isPenjualan = tipe === "penjualan";
  const isPembelian = tipe === "pembelian";
  const isProduksi = tipe === "produksi";

  let headers = [];
  if (isPenjualan)
    headers = ["Tanggal", "Pembeli", "Jumlah (kg)", "Harga per kg", "Total"];
  if (isPembelian)
    headers = ["Tanggal", "Supplier", "Jenis Barang", "Jumlah", "Total"];
  if (isProduksi)
    headers = [
      "Tanggal Tebar",
      "Jumlah Telur (g)",
      "Masa Eram (Hari)",
      "Pakan Utama",
      "Vitamin",
      "Hasil Panen (Kg)",
      "Catatan",
    ];

  // Helper agar koma di dalam kalimat (seperti di catatan/pakan) tidak merusak format CSV
  const wrapCsv = (text) => `"${text}"`;

  const rows = data.map((item) => {
    if (isProduksi) {
      const tanggalRapi = formatTanggal(item.tanggal_tebar);
      return [
        tanggalRapi,
        item.jumlah_telur_per_gram || 0,
        item.pengeraman_per_hari || 0,
        wrapCsv(item.pakan || "-"),
        wrapCsv(item.vitamin || "-"),
        item.hasil_panen || 0,
        wrapCsv(item.catatan || "-"),
      ];
    } else {
      const tanggalRapi = formatTanggal(item.tanggal);
      if (isPenjualan) {
        return [
          tanggalRapi,
          wrapCsv(item.buyer || item.pembeli || "-"),
          item.jumlah_kg || 0,
          item.harga_per_kg || 0,
          item.total || 0,
        ];
      } else {
        return [
          tanggalRapi,
          wrapCsv(item.supplier || "-"),
          wrapCsv(item.jenis_barang || "-"),
          item.jumlah || "-",
          item.total || item.harga * item.jumlah || 0,
        ];
      }
    }
  });

  let csvContent =
    "data:text/csv;charset=utf-8," +
    headers.join(",") +
    "\n" +
    rows.map((e) => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `Laporan_${tipe}_JangkrikOS_${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
