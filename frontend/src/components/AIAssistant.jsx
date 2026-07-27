import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  Trash2,
  Plus,
  Send,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";

// KUNCI PERBAIKAN: Fungsi untuk mengambil nama depan dari localStorage
const getFirstName = () => {
  const userStr = localStorage.getItem("user_jangkrik_os");
  if (userStr) {
    try {
      const userData = JSON.parse(userStr);
      // Ambil nama, pecah berdasarkan spasi, ambil kata pertama
      return userData.name ? userData.name.split(" ")[0] : "Bos";
    } catch (error) {
      return "Bos";
    }
  }
  return "Bos"; // Panggilan default jika tidak ada nama
};

export default function AIAssistant() {
  // KUNCI PERBAIKAN: Memanggil getFirstName() di state awal
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Halo ${getFirstName()}! Saya asisten Jangkrik.OS. Saya sudah menguasai buku panduan Jangkrik Alam dan membaca SELURUH data Anda (Transaksi, Produksi, dan Penanggalan). Apa yang ingin kita analisis hari ini?`,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedChats, setSavedChats] = useState([]);
  const [farmContext, setFarmContext] = useState("");

  const [currentChatId, setCurrentChatId] = useState(null);
  const [deleteModalId, setDeleteModalId] = useState(null);

  const messagesEndRef = useRef(null);

  const getUserId = () => {
    const userStr = localStorage.getItem("user_jangkrik_os");
    return userStr ? JSON.parse(userStr).id : null;
  };

  const fetchContextData = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const [resSales, resPurchases, resProduksi, resJadwal, resRef] =
        await Promise.all([
          fetch(
            `https://be-jos.vercel.app/api/transaksi?user_id=${userId}&jenis=penjualan`,
          ),
          fetch(
            `https://be-jos.vercel.app/api/transaksi?user_id=${userId}&jenis=pembelian`,
          ),
          fetch(`https://be-jos.vercel.app/api/produksi?user_id=${userId}`),
          fetch(`https://be-jos.vercel.app/api/penanggalan?user_id=${userId}`),
          fetch(`https://be-jos.vercel.app/api/referensi`),
        ]);

      const dataSales = await resSales.json();
      const dataPurchases = await resPurchases.json();
      const dataProduksi = await resProduksi.json();
      const dataJadwal = await resJadwal.json();
      const dataRef = await resRef.json();

      if (Array.isArray(dataSales)) {
        const todayFullDate = new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        let textSales =
          "Tanggal | Pembeli | Volume (Kg) | Harga/Kg | Total Rp | Catatan\n";
        dataSales.slice(0, 50).forEach((s) => {
          textSales += `${s.tanggal ? s.tanggal.split("T")[0] : "-"} | ${s.buyer} | ${s.jumlah_kg} | ${s.harga_per_kg} | ${s.total} | ${s.catatan || "-"}\n`;
        });

        let textPurchases =
          "Tanggal | Supplier | Jenis | Jumlah | Harga Satuan | Total Rp | Catatan\n";
        dataPurchases.slice(0, 50).forEach((p) => {
          textPurchases += `${p.tanggal ? p.tanggal.split("T")[0] : "-"} | ${p.supplier} | ${p.jenis_barang} | ${p.jumlah} | ${p.harga} | ${p.total} | ${p.catatan || "-"}\n`;
        });

        let textProduksi =
          "Tgl Tebar | Telur(g) | Pakan | Vitamin | Panen(Kg) | Terjual(Kg) | Catatan\n";
        if (Array.isArray(dataProduksi)) {
          dataProduksi.slice(0, 30).forEach((p) => {
            textProduksi += `${p.tanggal_tebar ? p.tanggal_tebar.split("T")[0] : "-"} | ${p.jumlah_telur_per_gram} | ${p.pakan} | ${p.vitamin} | ${p.hasil_panen} | ${p.terjual} | ${p.catatan || "-"}\n`;
          });
        }

        let textJadwal =
          "Lokasi/Kotak | Tgl Tebar | Mulai Panen | Selesai Panen | Status | Catatan\n";
        if (Array.isArray(dataJadwal)) {
          dataJadwal.slice(0, 30).forEach((j) => {
            textJadwal += `${j.lokasi} | ${j.tebar ? j.tebar.split("T")[0] : "-"} | ${j.panenMulai ? j.panenMulai.split("T")[0] : "-"} | ${j.panenSelesai ? j.panenSelesai.split("T")[0] : "-"} | ${j.status} | ${j.catatan || "-"}\n`;
          });
        }

        let refList = "";
        if (Array.isArray(dataRef) && dataRef.length > 0) {
          refList = dataRef
            .map((r) => `- [${r.type}] ${r.title}: ${r.preview}`)
            .join("\n");
        }

        const contextString = `
[INFORMASI WAKTU SISTEM SAAT INI]
Tanggal Hari Ini: ${todayFullDate}

[DATA TRANSAKSI PENJUALAN]
${textSales}

[DATA TRANSAKSI PENGELUARAN]
${textPurchases}

[DATA PRODUKSI & PANEN]
${textProduksi}

[DATA JADWAL KALENDER / PENANGGALAN]
${textJadwal}

[REFERENSI PENGETAHUAN BUDIDAYA JANGKRIK ALAM DARI USER]
${refList}
        `;

        setFarmContext(contextString);
      }
    } catch (error) {
      console.error("Gagal memuat konteks AI", error);
    }
  };

  const fetchChatHistory = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await fetch(
        `https://be-jos.vercel.app/api/chat/history?user_id=${userId}`,
      );
      const data = await response.json();
      if (response.ok) {
        setSavedChats(Array.isArray(data) ? data : []);
      } else {
        setSavedChats([]);
      }
    } catch (error) {
      setSavedChats([]);
    }
  };

  useEffect(() => {
    fetchChatHistory();
    fetchContextData();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = { role: "user", text: chatInput };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setChatInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://be-jos.vercel.app/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          history: newMessages,
          contextData: farmContext,
        }),
      });
      const data = await response.json();
      const aiMsg = { role: "ai", text: data.reply };
      const finalMessages = [...newMessages, aiMsg];

      setMessages(finalMessages);

      const userId = getUserId();
      if (userId) {
        if (!currentChatId) {
          const titleRes = await fetch(
            "https://be-jos.vercel.app/api/chat/title",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: userMsg.text }),
            },
          );
          const titleData = await titleRes.json();
          const chatTitle = titleData.title || "Analisis Data Jangkrik";

          const saveRes = await fetch(
            "https://be-jos.vercel.app/api/chat/save",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: userId,
                title: chatTitle,
                history: finalMessages,
              }),
            },
          );

          if (saveRes.ok) {
            const saveData = await saveRes.json();
            setCurrentChatId(saveData.id);
            fetchChatHistory();
          }
        } else {
          await fetch(
            `https://be-jos.vercel.app/api/chat/update/${currentChatId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: userId, history: finalMessages }),
            },
          );
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Maaf, server backend belum nyala nih." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChat = (chatObj) => {
    try {
      setMessages(JSON.parse(chatObj.history));
      setCurrentChatId(chatObj.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Gagal membuka chat:", error);
    }
  };

  const handleNewChat = () => {
    // KUNCI PERBAIKAN: Memanggil getFirstName() saat klik Chat Baru
    setMessages([
      {
        role: "ai",
        text: `Halo ${getFirstName()}! Saya asisten Jangkrik.OS. Saya sudah menguasai buku panduan Jangkrik Alam dan membaca SELURUH data Anda (Transaksi, Produksi, dan Penanggalan). Apa yang ingin kita analisis hari ini?`,
      },
    ]);
    setChatInput("");
    setCurrentChatId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const executeDeleteChat = async () => {
    if (!deleteModalId) return;
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await fetch(
        `https://be-jos.vercel.app/api/chat/delete/${deleteModalId}?user_id=${userId}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        fetchChatHistory();
        if (deleteModalId === currentChatId) {
          handleNewChat();
        }
      }
    } catch (error) {
      console.error("Gagal menghapus chat:", error);
    } finally {
      setDeleteModalId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-6 max-w-7xl mx-auto w-full px-2 sm:px-4 relative flex flex-col min-h-full">
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden relative h-auto">
        {/* Header Asisten */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm z-10 relative sticky top-0">
          <div className="flex items-center gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-md shadow-green-500/20">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                AI Asisten Jangkrik.OS
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></span>
                Terhubung dengan Data Budidaya
              </p>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/50 transition-all font-bold text-sm border border-green-200 dark:border-green-800 shadow-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Chat Baru
          </button>
        </div>

        {/* Daftar Pesan */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-50 pb-28">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role !== "user" && (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2 sm:mr-3 mt-auto mb-1 flex-shrink-0 border border-green-200 dark:border-green-800/50">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 dark:text-green-400" />
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[85%] px-5 sm:px-6 py-3 sm:py-4 shadow-sm text-[14px] sm:text-base leading-relaxed prose dark:prose-invert prose-p:mb-4 prose-li:mb-2 prose-ul:my-4 prose-ol:my-4 max-w-none
                            ${
                              m.role === "user"
                                ? "bg-gradient-to-br from-green-700 to-green-600 text-white rounded-3xl rounded-br-sm"
                                : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-3xl rounded-bl-sm"
                            }`}
              >
                <ReactMarkdown>{m.text}</ReactMarkdown>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-2 sm:mr-3 border border-green-200 dark:border-green-800/50">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 dark:text-green-400 animate-pulse" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-6 py-4 rounded-3xl rounded-bl-sm flex gap-1.5 items-center">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          )}
          {/* Anchor untuk auto-scroll ke bawah */}
          <div ref={messagesEndRef} className="h-4 w-full"></div>
        </div>

        {/* Kotak Input */}
        <div className="sticky bottom-0 flex-shrink-0 p-3 sm:p-5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-20 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] w-full">
          <div className="flex gap-2 items-center">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 min-w-0 px-4 py-3 sm:py-4 bg-gray-100 dark:bg-gray-900 border border-transparent focus:border-green-500 rounded-xl sm:rounded-2xl outline-none dark:text-white transition-all shadow-inner text-[14px] sm:text-base placeholder:text-gray-400 sm:placeholder:text-gray-500"
              placeholder="Tanyakan analisis produksi, jadwal, dll..."
            />
            <button
              onClick={handleSendMessage}
              className="w-12 h-12 sm:w-auto sm:h-auto sm:px-8 sm:py-3.5 bg-green-700 text-white rounded-xl sm:rounded-2xl font-bold hover:bg-green-800 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 flex-shrink-0"
              title="Kirim"
            >
              <Send className="w-5 h-5 flex-shrink-0" />
              <span className="hidden sm:inline text-base">Kirim</span>
            </button>
            <button
              onClick={handleNewChat}
              className="sm:hidden w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all shadow-sm border border-gray-200 dark:border-gray-700/50 flex-shrink-0"
              title="Chat Baru"
            >
              <Plus className="w-6 h-6 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 w-full mt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Riwayat Obrolan Tersimpan
          </h3>
        </div>

        {savedChats.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Belum ada riwayat percakapan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {savedChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleOpenChat(chat)}
                className={`group flex items-center justify-between p-5 rounded-2xl cursor-pointer border transition-all duration-200
                  ${
                    currentChatId === chat.id
                      ? "bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600 shadow-sm"
                      : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md"
                  }
                `}
              >
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${currentChatId === chat.id ? "bg-green-500 animate-pulse" : "bg-gray-300 dark:bg-gray-600"}`}
                  ></div>
                  <h4
                    className={`text-sm font-bold truncate ${currentChatId === chat.id ? "text-green-800 dark:text-green-400" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    {chat.title}
                  </h4>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteModalId(chat.id);
                  }}
                  className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all flex-shrink-0 bg-red-50/50 lg:bg-transparent dark:bg-red-900/10"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteModalId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all animate-slideUp">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Hapus Riwayat?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                Apakah Anda yakin ingin menghapus obrolan ini? Semua konteks
                obrolan akan hilang permanen.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setDeleteModalId(null)}
                  className="flex-1 py-3.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => executeDeleteChat()}
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
