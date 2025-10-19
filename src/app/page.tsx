"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    email: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [winner, setWinner] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setFormData({ name: "", dob: "", email: "" });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to submit entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectWinner = async () => {
    setMessage("");
    setError("");
    setWinner(null);
    setLoading(true);

    try {
      const response = await fetch("/api/winner");
      const data = await response.json();

      if (response.ok) {
        setWinner(data.winner);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to select winner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Giveaway Entry</h1>
          <p className="text-gray-400">Enter for a chance to win!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              value={formData.dob}
              onChange={(e) =>
                setFormData({ ...formData, dob: e.target.value })
              }
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Entry"}
          </button>
        </form>

        {message && (
          <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="pt-8 border-t border-gray-800">
          <button
            onClick={selectWinner}
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Selecting..." : "Winner of Giveaway"}
          </button>

          {winner && (
            <div className="mt-6 bg-gray-900 border border-gray-700 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-center">
                🎉 Winner! 🎉
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Name:</span> {winner.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {winner.email}
                </p>
                <p>
                  <span className="font-semibold">Date of Birth:</span>{" "}
                  {winner.dob}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}