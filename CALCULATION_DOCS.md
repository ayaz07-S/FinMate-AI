# FinMate AI - Frontend Calculations Documentation

## 📊 Complete Calculation Flow

### Constants (Shared across all calculations)
```javascript
const DAILY_EXPENSES = 200;        // ₹200/day fixed expenses
const STARTING_BALANCE = 18000;    // ₹18,000 initial balance
const DAYS_TO_RENT = 28;          // 4 weeks until rent day
const RENT_DAY_WEEK_IDX = 4;      // Week 4 index in chart data
```

---

## 1️⃣ CHART DATA (Weekly Graph)

### Input:
- `backendData.scenarios.pessimistic[]` - Daily income predictions (90 days)
- `backendData.scenarios.base[]` - Daily income predictions (90 days)
- `backendData.scenarios.optimistic[]` - Daily income predictions (90 days)

### Calculation:
```javascript
For each day (i):
  balance[i] = balance[i-1] + dailyIncome[i] - DAILY_EXPENSES

For each week (w):
  weekData[w] = balance[w * 7 - 1]  // Last day of week
```

### Output (forecastData array):
```javascript
[
  { week: "Now", chaos: 18000, survival: 18000, thrive: 18000 },
  { week: "Week 1", chaos: 15420, survival: 19800, thrive: 23500 },
  { week: "Week 2", chaos: 12100, survival: 22400, thrive: 28200 },
  ...
]
```

### Visual: Three Lines in Graph
- 🔴 Chaos (Pessimistic): Shows worst-case balance
- 🟡 Survival (Base): Shows realistic balance
- 🟢 Thrive (Optimistic): Shows best-case balance

---

## 2️⃣ PATH CARDS (Chaos/Survival/Thrive)

### Input:
- First 28 days of each scenario (Rent Day period)

### Calculation for each path:
```javascript
Total Income = Sum(dailyIncome[0 to 27])
Total Expenses = 28 × 200 = ₹5,600
Net Saved = Total Income - Total Expenses
Final Balance = 18,000 + Net Saved
```

### Example (Chaos Path):
```
Day 1-28 Income: ₹12,800 (₹457/day avg)
Expenses: ₹5,600 (₹200/day)
Net: ₹7,200
Final: ₹18,000 + ₹7,200 = ₹25,200
```

### Output (timelineData):
```javascript
chaos: {
  amount: 25200,           // Final balance at Rent Day
  saved: 7200,             // Net income - expenses
  spent: 5600,             // Total expenses
  totalIncome: 12800,      // Total income earned
  description: "By Rent Day - Safe ✓"
}
```

---

## 3️⃣ INCOME STATS (Sidebar)

### Input:
- `backendData.scenarios.base[]` - Using base scenario for realistic forecast

### Calculation:
```javascript
For each week (w = 0 to 7):
  weeklyIncome[w] = Sum(dailyIncome[w*7 to w*7+6])
```

### Output (incomeData array):
```javascript
[
  { week: "W1", amount: 3500, forecast: false },  // Historical
  { week: "W2", amount: 3200, forecast: false },
  { week: "W3", amount: 3150, forecast: false },
  { week: "W4", amount: 2980, forecast: false },
  { week: "F1", amount: 2850, forecast: true },   // Future
  { week: "F2", amount: 2720, forecast: true },
  { week: "F3", amount: 2650, forecast: true },
  { week: "F4", amount: 2580, forecast: true },
]
```

### Visual: Bar Chart
- Blue bars: Historical weeks (W1-W4)
- Green bars: Future forecast (F1-F4)

---

## 4️⃣ CRISIS DETECTION

### Input:
- `backendData.crisis.days_to_crisis` - From backend calculation
- `backendData.crisis.deficit_amount` - How much you'll be short

### Calculation (Backend):
```javascript
For each day in pessimistic scenario:
  if (balance < 0):
    days_to_crisis = day_index
    deficit = abs(balance)
    break
```

### Output:
```javascript
Crisis Timer: "12.45 days" (counts down)
Crisis Alert: "⚠️ Crisis detected in 12 days!"
Deficit: "₹1,450 short"
```

---

## 5️⃣ SUGGESTIONS

### Input:
- `backendData.suggestions[]` - From backend AI

### Output:
```javascript
[
  {
    id: 1,
    action: "Take 2 extra shifts this week",
    impact: "+₹3,200",
    type: "income"
  },
  ...
]
```

---

## 📐 Formula Summary

### Daily Balance Update:
```
Balance(day) = Balance(day-1) + Income(day) - 200
```

### Weekly Balance:
```
WeekBalance(w) = StartBalance + Σ(Income[0:w*7]) - (w*7 * 200)
```

### Net Savings (28 days):
```
NetSaved = Σ(Income[0:27]) - (28 * 200)
```

### Final Balance at Rent Day:
```
FinalBalance = 18,000 + NetSaved
```

---

## 🎯 Data Flow

1. **User uploads CSV** → Backend
2. **Backend processes** with Prophet ML → 3 scenarios (90 days each)
3. **Frontend receives** daily predictions
4. **Frontend calculates**:
   - Cumulative balances (daily → weekly)
   - Path metrics (income, expenses, savings)
   - Income stats (weekly totals)
   - Chart data (weekly snapshots)
5. **Frontend displays**:
   - Graph with 3 paths
   - Path cards with calculations
   - Income sidebar
   - Crisis alerts

---

## ✅ All Values are Dynamic!

**No hardcoded numbers** (except constants):
- ✅ Graph data from backend
- ✅ Path card amounts from calculations
- ✅ Saved/spent values from totals
- ✅ Income stats from weekly sums
- ✅ Crisis countdown from backend
- ✅ Suggestions from backend

**Update trigger**: Upload new CSV → All recalculates automatically! 🔄
