import { AlertTriangle, Clock } from 'lucide-react';

export default function CrisisAlert() {
  return (
    <div className="rounded-2xl p-6 mb-8 border-2 animate-pulse" style={{ 
      background: "linear-gradient(to right, rgba(203, 32, 45, 0.2), rgba(252, 128, 25, 0.2))",
      borderColor: "rgba(252, 128, 25, 0.5)"
    }}>
      <div className="flex items-start gap-4">
        <div className="rounded-full p-3 flex-shrink-0" style={{ backgroundColor: "#CB202D" }}>
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl" style={{ color: "#FC8019" }}>Crisis Detected: Point of No Return Approaching</h3>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: "rgba(252, 128, 25, 0.3)" }}>
              <Clock className="h-5 w-5" style={{ color: "#FC8019" }} />
              <span className="text-red-200">12 days remaining</span>
            </div>
          </div>
          <p className="text-gray-200 text-lg mb-4">
            At current pace, you'll have only <span style={{ color: "#CB202D" }}>₹5,000</span> by rent day (need ₹10,000). 
            This is <span style={{ color: "#CB202D" }}>₹5,000 short</span> of your minimum requirement.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm text-gray-400 mb-1">Current Balance</p>
              <p className="text-xl text-white">₹18,000</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm text-gray-400 mb-1">Projected by Rent Day</p>
              <p className="text-xl" style={{ color: "#CB202D" }}>₹5,000</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-sm text-gray-400 mb-1">Shortfall</p>
              <p className="text-xl" style={{ color: "#CB202D" }}>-₹5,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
