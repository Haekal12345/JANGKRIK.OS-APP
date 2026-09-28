import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ClipboardList,
  Package,
  RefreshCw,
  Save,
  ShoppingBag,
  XCircle,
} from "lucide-react";

const API_BASE = "https://be-jos.vercel.app";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const STATUS_LABELS = {
  PENDING: "Menunggu",
  CONFIRMED: "Dikonfirmasi",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const STATUS_CLASSES = {
  PENDING:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  COMPLETED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function TokoAdmin() {
  const [product, setProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const userId = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user_jangkrik_os") || "{}")?.id;
    } catch {
      return null;
    }
  }, []);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(userId ? { "x-user-id": String(userId) } : {}),
    }),
    [userId],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productResponse, ordersResponse] = await Promise.all([
        fetch(`${API_BASE}/api/admin/store`, { headers }),
        fetch(`${API_BASE}/api/admin/orders`, { headers }),
      ]);

      const productData = await productResponse.json();
      const orderData = await ordersResponse.json();

      if (!productResponse.ok)
        throw new Error(productData.error || "Gagal mengambil produk.");
      if (!ordersResponse.ok)
        throw new Error(orderData.error || "Gagal mengambil pesanan.");

      setProduct(productData);
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (err) {
      setError(err.message || "Gagal mengambil data toko.");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateProduct = (key, value) => {
    setProduct((previous) => ({ ...previous, [key]: value }));
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    if (!product) return;

    setSaving(true);
    setMessage(null);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/admin/store`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          price_per_kg: product.price_per_kg,
          price_per_half_kg: product.price_per_half_kg,
          availability: product.availability,
          description: product.description || "",
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Gagal menyimpan pengaturan produk.");

      setProduct(data.product);
      setMessage("Pengaturan produk berhasil disimpan.");
    } catch (err) {
      setError(err.message || "Gagal menyimpan pengaturan produk.");
    } finally {
      setSaving(false);
    }
  };

  const updateOrderStatus = async (id, status) => {
    setUpdatingOrder(id);
    setMessage(null);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/orders/${id}/status`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Gagal memperbarui status pesanan.");

      setOrders((previous) =>
        previous.map((order) =>
          Number(order.id) === Number(id)
            ? { ...order, status: data.status }
            : order,
        ),
      );
      setMessage(
        `Pesanan #${id} sekarang ${STATUS_LABELS[data.status] || data.status}.`,
      );
    } catch (err) {
      setError(err.message || "Gagal memperbarui status pesanan.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const visibleOrders =
    filter === "ALL"
      ? orders
      : orders.filter((order) => order.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600 dark:text-green-400">
          Manajemen toko
        </p>
        <h1 className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
          Produk & Pesanan
        </h1>
        <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-gray-500 dark:text-gray-400">
          Atur harga Jangkrik Alam, status ketersediaan, lalu kelola pesanan
          yang masuk dari Customer Page.
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" /> {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={saveProduct}
        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 dark:text-white">
                Pengaturan Jangkrik Alam
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Perubahan di sini langsung menjadi sumber harga Customer Page.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4" /> Muat ulang
          </button>
        </div>

        {loading && !product ? (
          <div className="py-10 text-center text-sm font-bold text-gray-500">
            Memuat pengaturan toko...
          </div>
        ) : product ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-black text-gray-700 dark:text-gray-200">
                Harga per kilogram
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={product.price_per_kg}
                onChange={(e) => updateProduct("price_per_kg", e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-bold outline-none focus:border-green-500 focus:bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs font-medium text-gray-400">
                Contoh: {rupiah(product.price_per_kg)}
              </p>
            </div>
            <div>
              <label className="text-sm font-black text-gray-700 dark:text-gray-200">
                Harga per ½ kilogram
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={product.price_per_half_kg}
                onChange={(e) =>
                  updateProduct("price_per_half_kg", e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-bold outline-none focus:border-green-500 focus:bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs font-medium text-gray-400">
                Contoh: {rupiah(product.price_per_half_kg)}
              </p>
            </div>
            <div>
              <label className="text-sm font-black text-gray-700 dark:text-gray-200">
                Ketersediaan
              </label>
              <select
                value={product.availability}
                onChange={(e) => updateProduct("availability", e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-bold outline-none focus:border-green-500 focus:bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="AVAILABLE">Tersedia</option>
                <option value="UNAVAILABLE">Sedang kosong</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-black text-gray-700 dark:text-gray-200">
                Deskripsi singkat
              </label>
              <input
                value={product.description || ""}
                onChange={(e) => updateProduct("description", e.target.value)}
                placeholder="Jangkrik Alam untuk kebutuhan pakan..."
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-medium outline-none focus:border-green-500 focus:bg-white dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            disabled={saving || !product}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />{" "}
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </motion.form>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 dark:border-gray-700 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 dark:text-white">
                Pesanan masuk
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Harga pada pesanan adalah snapshot saat pelanggan mengirim.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilter(status)}
                  className={`rounded-xl px-3 py-2 text-xs font-black transition ${filter === status ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}
                >
                  {status === "ALL" ? "Semua" : STATUS_LABELS[status]}
                </button>
              ),
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm font-bold text-gray-500">
            Memuat pesanan...
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 font-black text-gray-600 dark:text-gray-300">
              Belum ada pesanan pada filter ini.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {visibleOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-gray-900 dark:text-white">
                        #{order.id}
                      </span>
                      <span className="font-mono text-xs font-bold text-gray-400">
                        {order.order_code}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-black ${STATUS_CLASSES[order.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                    <p className="mt-2 font-black text-gray-800 dark:text-gray-100">
                      {order.customer_name} · {order.phone}
                    </p>
                    <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {order.quantity_kg} kg · kebutuhan{" "}
                      {order.requested_date
                        ? order.requested_date
                            .split("T")[0]
                            .split("-")
                            .reverse()
                            .join("/")
                        : "-"}
                    </p>
                    {order.notes && (
                      <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                        Catatan: {order.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-bold text-gray-400">Total</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">
                        {rupiah(order.total)}
                      </p>
                    </div>
                    <select
                      value={order.status}
                      disabled={updatingOrder === order.id}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value)
                      }
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {Object.keys(STATUS_LABELS).map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
