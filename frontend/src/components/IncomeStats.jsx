import { TrendingUp, TrendingDown, Calendar, Wallet } from 'lucide-react';

export default function IncomeStats() {
  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-2">
          <Calendar className="h-6 w-6 text-purple-400" />
          <span className="text-sm text-gray-400">Last Month</span>
        </div>
        <p className="text-3xl text-white mb-1">₹42,000</p>
        <p className="text-sm text-gray-400">September earnings</p>
      </div>

      <div className="bg-gradient-to-br backdrop-blur-lg rounded-2xl p-6 border" style={{
        background: "linear-gradient(to bottom right, rgba(252, 128, 25, 0.1), rgba(252, 128, 25, 0.05))",
        borderColor: "rgba(252, 128, 25, 0.3)"
      }}>
        <div className="flex items-center justify-between mb-2">
          <Wallet className="h-6 w-6" style={{ color: "#FC8019" }} />
          <span className="text-sm text-gray-400">Current Month</span>
        </div>
        <p className="text-3xl text-white mb-1">₹18,000</p>
        <p className="text-sm text-gray-400">October (halfway)</p>
      </div>

      <div className="bg-gradient-to-br backdrop-blur-lg rounded-2xl p-6 border" style={{
        background: "linear-gradient(to bottom right, rgba(203, 32, 45, 0.1), rgba(203, 32, 45, 0.05))",
        borderColor: "rgba(203, 32, 45, 0.3)"
      }}>
        <div className="flex items-center justify-between mb-2">
          <TrendingDown className="h-6 w-6" style={{ color: "#CB202D" }} />
          <span className="text-sm text-gray-400">Trend</span>
        </div>
        <p className="text-3xl mb-1" style={{ color: "#CB202D" }}>-57%</p>
        <p className="text-sm text-gray-400">vs last month pace</p>
      </div>

      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
        <div className="flex items-center justify-between mb-2">
          <TrendingUp className="h-6 w-6 text-blue-400" />
          <span className="text-sm text-gray-400">AI Forecast</span>
        </div>
        <p className="text-3xl text-white mb-1">₹28,000</p>
        <p className="text-sm text-gray-400">Survival path projection</p>
      </div>
    </div>
  );
}
