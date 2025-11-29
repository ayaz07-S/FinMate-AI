import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useState } from 'react';

export default function TimelineChart({ selectedAction, backendData }) {
  const [hoveringInnerTab, setHoveringInnerTab] = useState(null);
  
  // Base data - current situation
  const baseData = [
    { week: 'Week 1', chaos: 42000, survival: 42000, thrive: 42000, actual: 42000 },
    { week: 'Week 2', chaos: 38000, survival: 38000, thrive: 38000, actual: 38000 },
    { week: 'Current', chaos: 18000, survival: 18000, thrive: 18000, actual: 18000 },
  ];

  // Forecasted data - different scenarios
  let forecastData = [
    { week: 'Week 3', chaos: 12000, survival: 22000, thrive: 28000 },
    { week: 'Week 4', chaos: 8000, survival: 25000, thrive: 32000 },
    { week: 'Rent Day', chaos: 5000, survival: 28000, thrive: 38000 },
    { week: 'Week 6', chaos: 3000, survival: 31000, thrive: 42000 },
  ];

  // Adjust forecast based on selected action
  if (selectedAction === 'extra-shift') {
    forecastData = [
      { week: 'Week 3', chaos: 12000, survival: 26000, thrive: 32000 },
      { week: 'Week 4', chaos: 8000, survival: 29000, thrive: 36000 },
      { week: 'Rent Day', chaos: 5000, survival: 32000, thrive: 42000 },
      { week: 'Week 6', chaos: 3000, survival: 35000, thrive: 46000 },
    ];
  } else if (selectedAction === 'reduce-expense') {
    forecastData = [
      { week: 'Week 3', chaos: 12000, survival: 24000, thrive: 30000 },
      { week: 'Week 4', chaos: 8000, survival: 27000, thrive: 34000 },
      { week: 'Rent Day', chaos: 5000, survival: 30000, thrive: 40000 },
      { week: 'Week 6', chaos: 3000, survival: 33000, thrive: 44000 },
    ];
  } else if (selectedAction === 'peak-hours') {
    forecastData = [
      { week: 'Week 3', chaos: 12000, survival: 23000, thrive: 29000 },
      { week: 'Week 4', chaos: 8000, survival: 26000, thrive: 33000 },
      { week: 'Rent Day', chaos: 5000, survival: 29000, thrive: 39000 },
      { week: 'Week 6', chaos: 3000, survival: 32000, thrive: 43000 },
    ];
  }

  const data = [...baseData, ...forecastData];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-lg border border-gray-200 rounded-lg p-4 shadow-lg">
          <p className="text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: ₹{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative">
      {selectedAction && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-green-100 to-blue-100 border border-blue-300 rounded-lg px-4 py-2 z-10">
          <p className="text-sm text-gray-900 font-semibold">Butterfly Effect Active ✨</p>
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="week" 
            stroke="#6b7280"
            style={{ fontSize: '14px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '14px' }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          
          {/* Rent threshold line */}
          <ReferenceLine 
            y={15000} 
            stroke="#FC8019" 
            strokeDasharray="3 3" 
            label={{ value: 'Crisis Threshold (₹15k)', fill: '#FC8019', position: 'right' }}
          />

          {/* Historical line */}
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ r: 5 }}
            name="Actual (Historical)"
            connectNulls
          />

          {/* Three futures */}
          <Line 
            type="monotone" 
            dataKey="chaos" 
            stroke="#CB202D" 
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 5, fill: '#CB202D' }}
            name="🔴 Chaos Path"
          />
          <Line 
            type="monotone" 
            dataKey="survival" 
            stroke="#eab308" 
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 5, fill: '#eab308' }}
            name="🟡 Survival Path"
          />
          <Line 
            type="monotone" 
            dataKey="thrive" 
            stroke="#22c55e" 
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 5, fill: '#22c55e' }}
            name="🟢 Thrive Path"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Point of No Return Marker */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-red-50 border rounded-lg p-4" style={{ borderColor: "#CB202D" }}>
          <h4 className="mb-1" style={{ color: "#CB202D" }}>Chaos Path</h4>
          <p className="text-2xl font-bold mb-1" style={{ color: "#CB202D" }}>₹5,000</p>
          <p className="text-sm text-gray-600 mb-3">By Rent Day - Crisis! 🚨</p>
          <div className="pt-3 flex justify-around gap-2">
            <div className="flex flex-col items-center">
              <div 
                className="px-3 py-2 rounded-lg bg-green-100 border-2 border-green-500 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-125 hover:shadow-lg hover:z-10 relative"
                onMouseEnter={() => setHoveringInnerTab('chaos')}
                onMouseLeave={() => setHoveringInnerTab(null)}
              >
                <div className="text-xs text-green-700">Saved</div>
                <div className="text-xs font-bold text-green-600">₹0</div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div 
                className="px-3 py-2 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-125 hover:shadow-lg hover:z-10 relative" 
                style={{ backgroundColor: "#FEE2E2", borderColor: "#CB202D" }}
                onMouseEnter={() => setHoveringInnerTab('chaos')}
                onMouseLeave={() => setHoveringInnerTab(null)}
              >
                <div className="text-xs" style={{ color: "#CB202D" }}>Spent</div>
                <div className="text-xs font-bold" style={{ color: "#CB202D" }}>₹23k</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <h4 className="text-yellow-600 mb-1">Survival Path</h4>
          <p className="text-2xl text-yellow-600 font-bold mb-1">₹{selectedAction === 'extra-shift' ? '32,000' : selectedAction === 'reduce-expense' ? '30,000' : selectedAction === 'peak-hours' ? '29,000' : '28,000'}</p>
          <p className="text-sm text-gray-600 mb-3">By Rent Day - Safe ✓</p>
          <div className="pt-3 flex justify-around gap-2">
            <div className="flex flex-col items-center">
              <div 
                className="px-3 py-2 rounded-lg bg-green-100 border-2 border-green-500 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-125 hover:shadow-lg hover:z-10 relative"
                onMouseEnter={() => setHoveringInnerTab('survival')}
                onMouseLeave={() => setHoveringInnerTab(null)}
              >
                <div className="text-xs text-green-700">Saved</div>
                <div className="text-xs font-bold text-green-600">₹3.2k</div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div 
                className="px-3 py-2 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-125 hover:shadow-lg hover:z-10 relative" 
                style={{ backgroundColor: "#FEE2E2", borderColor: "#CB202D" }}
                onMouseEnter={() => setHoveringInnerTab('survival')}
                onMouseLeave={() => setHoveringInnerTab(null)}
              >
                <div className="text-xs" style={{ color: "#CB202D" }}>Spent</div>
                <div className="text-xs font-bold" style={{ color: "#CB202D" }}>₹15.7k</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
          <h4 className="text-green-600 mb-1">Thrive Path</h4>
          <p className="text-2xl text-green-600 font-bold mb-1">₹{selectedAction === 'extra-shift' ? '42,000' : selectedAction === 'reduce-expense' ? '40,000' : selectedAction === 'peak-hours' ? '39,000' : '38,000'}</p>
          <p className="text-sm text-gray-600 mb-3">By Rent Day - Thriving! 🎉</p>
          <div className="pt-3 flex justify-around gap-2">
            <div className="flex flex-col items-center">
              <div 
                className="px-3 py-2 rounded-lg bg-green-100 border-2 border-green-500 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-125 hover:shadow-lg hover:z-10 relative"
                onMouseEnter={() => setHoveringInnerTab('thrive')}
                onMouseLeave={() => setHoveringInnerTab(null)}
              >
                <div className="text-xs text-green-700">Saved</div>
                <div className="text-xs font-bold text-green-600">₹6.5k</div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div 
                className="px-3 py-2 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-125 hover:shadow-lg hover:z-10 relative" 
                style={{ backgroundColor: "#FEE2E2", borderColor: "#CB202D" }}
                onMouseEnter={() => setHoveringInnerTab('thrive')}
                onMouseLeave={() => setHoveringInnerTab(null)}
              >
                <div className="text-xs" style={{ color: "#CB202D" }}>Spent</div>
                <div className="text-xs font-bold" style={{ color: "#CB202D" }}>₹11.5k</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
