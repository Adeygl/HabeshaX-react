import { useState } from "react";
import axios from "axios";

const API = axios.create({
  baseURL: "https://habeshaxnode-9821a8586656.herokuapp.com/api",
});

export default function SendMessage() {
  const [mode, setMode] = useState<"single" | "broadcast">("single");
  const [telegramId, setTelegramId] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const token = localStorage.getItem("token");

  const sendMessage = async () => {
    if (!message && !imageUrl) return alert("Write message or image");

    setLoading(true);
    try {
      const payload: any = {
        message,
      };

      if (imageUrl) payload.image_url = imageUrl;
      if (mode === "single") payload.telegram_id = telegramId;

      const endpoint =
        mode === "single"
          ? "/notifications/send"
          : "/notifications/broadcast";

      const res = await API.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error sending");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col gap-3">

      <h1 className="text-lg font-bold text-center">📩 Send Message</h1>

      {/* MODE */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("single")}
          className={`flex-1 p-2 rounded ${
            mode === "single" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          👤 Single
        </button>

        <button
          onClick={() => setMode("broadcast")}
          className={`flex-1 p-2 rounded ${
            mode === "broadcast" ? "bg-green-600" : "bg-gray-700"
          }`}
        >
          📢 All
        </button>
      </div>

      {/* TELEGRAM ID */}
      {mode === "single" && (
        <input
          placeholder="Telegram ID"
          value={telegramId}
          onChange={(e) => setTelegramId(e.target.value)}
          className="p-2 rounded bg-gray-800"
        />
      )}

      {/* IMAGE URL */}
      <input
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="p-2 rounded bg-gray-800"
      />

      {/* MESSAGE */}
      <textarea
        placeholder="Message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
        className="p-2 rounded bg-gray-800"
      />

      {/* BUTTON */}
      <button
        onClick={sendMessage}
        className="bg-blue-600 p-3 rounded font-bold"
      >
        {loading ? "Sending..." : "🚀 Send"}
      </button>

      {/* RESULT */}
      {result && (
        <div className="bg-gray-800 p-2 rounded text-sm">
          ✅ Done
          {mode === "broadcast" && (
            <>
              <p>Total: {result.total}</p>
              <p>Sent: {result.successCount}</p>
              <p>Failed: {result.failedCount}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}