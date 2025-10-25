"use client";
import React, { useState } from "react";
import axios from "axios";

export default function ReportBug() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const sendReport = async () => {
    if (!message.trim()) return alert("Please describe the issue!");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("text", message);
      if (files) Array.from(files).forEach((f) => formData.append("files", f));

      await axios.post("/api/send-bug", formData);
      alert("✅ Bug report sent successfully!");
      setMessage("");
      setFiles(null);
      setShow(false);
    } catch (err: any) {
      console.error(err);
      alert("❌ Failed to send bug report!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition"
      >
        Report Bug
      </button>

      {show && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShow(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              🐞 Report a Bug
            </h2>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the issue..."
              rows={4}
              className="w-full p-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer"
            />

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShow(false)}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={sendReport}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
