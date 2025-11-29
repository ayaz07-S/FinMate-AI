import { Zap, TrendingUp, Scissors, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface ActionSimulatorProps {
  onActionSelect: (action: string | null) => void;
  selectedAction: string | null;
}

export default function ActionSimulator({ onActionSelect, selectedAction }: ActionSimulatorProps) {
  const actions = [
    {
      id: 'extra-shift',
      title: 'Take 3 Extra Shifts',
      description: 'Work Friday-Sunday evenings (peak hours)',
      icon: Clock,
      impact: '+₹4,000 by rent day',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-300',
    },
    {
      id: 'reduce-expense',
      title: 'Cut Non-Essential Spending',
      description: 'Reduce entertainment & dining out by 50%',
      icon: Scissors,
      impact: '+₹2,000 saved',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-300',
    },
    {
      id: 'peak-hours',
      title: 'Focus on Peak Hours',
      description: 'Work only during lunch (12-2pm) & dinner (7-10pm)',
      icon: TrendingUp,
      impact: '+₹1,000 efficiency gain',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-300',
    },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="h-7 w-7 text-yellow-400" />
        <div>
          <h2 className="text-2xl">AI-Recommended Actions</h2>
          <p className="text-gray-400">Select an action to see the Butterfly Effect on your timeline</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {actions.map((action) => {
          const Icon = action.icon;
          const isSelected = selectedAction === action.id;
          
          return (
            <button
              key={action.id}
              onClick={() => onActionSelect(isSelected ? null : action.id)}
              className={`bg-gradient-to-br ${action.bgColor} backdrop-blur-lg rounded-2xl p-6 border-2 ${
                isSelected ? 'border-yellow-400 ring-4 ring-yellow-400/20' : action.borderColor
              } hover:scale-105 transition-all text-left`}
            >
              <div className={`bg-gradient-to-br ${action.color} rounded-full p-3 inline-block mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className={`text-xl mb-2 ${action.textColor}`}>{action.title}</h3>
              <p className="text-gray-300 mb-4 text-sm">{action.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg text-white">{action.impact}</span>
                {isSelected && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">
                    Active ✨
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedAction && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="h-6 w-6 text-yellow-400" />
            <h3 className="text-xl text-yellow-300">Butterfly Effect Simulation</h3>
          </div>
          <p className="text-gray-200 text-lg">
            The timeline above now shows the projected impact of your selected action. 
            Notice how this single decision creates a ripple effect across all future weeks, 
            potentially moving you from the Chaos path toward Survival or even Thrive! 📈
          </p>
        </div>
      )}

      {!selectedAction && (
        <div className="text-center text-gray-400 py-6">
          <p>👆 Click on any action to simulate its impact on your financial future</p>
        </div>
      )}
    </div>
  );
}
