'use client'
import React from "react";

export default function Loginfo() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 flex flex-col items-center">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-6">What is LOG?</h1>

      {/* Description */}
      <div className="max-w-3xl text-center text-lg text-gray-300 mb-10">
        LOG (Logarithmic Optimization Gauge) is a dynamic score that reflects how actively and meaningfully you interact on the platform. It is designed to reward consistency, balance, and genuine engagement rather than spam or one-sided activity.
      </div>

      {/* Cards Section */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full">

        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg hover:scale-105 transition">
          <h2 className="text-xl font-semibold mb-3">💬 Interaction</h2>
          <p className="text-gray-400">
            Your score increases as you send messages and participate in conversations. The more you communicate, the more your presence is felt.
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg hover:scale-105 transition">
          <h2 className="text-xl font-semibold mb-3">⚖️ Balance</h2>
          <p className="text-gray-400">
            LOG rewards balanced conversations. Meaningful exchanges where both sides participate contribute more than one-sided messaging.
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg hover:scale-105 transition">
          <h2 className="text-xl font-semibold mb-3">⏱️ Activity</h2>
          <p className="text-gray-400">
            Time spent being active matters. Consistent usage over time helps your score grow steadily.
          </p>
        </div>

      </div>

      {/* Extra Section */}
      <div className="mt-12 max-w-3xl text-center text-gray-400">
        <p>
          LOG is designed to grow naturally. Spamming or forced interactions provide limited gains, while genuine conversations and long-term activity lead to higher rankings.
        </p>
      </div>

      <div className="mt-10 text-center">
        <p className="text-xs tracking-[0.3em] text-gray-600 uppercase">Engineered, not generated</p>
        <p className="mt-2 text-lg font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-500">
          Pure mathematics • zero AI • real human signal
        </p>
      </div>

      {/* Formula Section */}
      <div className="mt-16 text-center max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Formula Used</h2>
        <p className="text-gray-500 mb-6">A simplified representation of the scoring logic:</p>

        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg font-mono text-sm text-green-400 inline-block">
          LOG = f (Synergy, Activity, Time)
        </div>

        <p className="text-gray-500 mt-6 text-sm">
          Where synergy rewards balanced interaction, activity reflects participation, and time captures consistency.
        </p>
      </div>
    </div>
  );
}