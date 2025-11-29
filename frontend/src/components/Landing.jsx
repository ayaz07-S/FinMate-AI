import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  Lock,
  Target,
  Sparkles,
  Upload,
  X,
  FileText,
  Eye,
  LogsIcon,
  LogInIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import ChatBot from "./chatbot.jsx";
import logo from "../assets/logo.png";


const FinMateAI = () => {
  const [chatbotMinimized, setChatbotMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState("timeline");
  const [days, setDays] = useState(12);
  const [crisisDeadline, setCrisisDeadline] = useState(null); // Store the deadline timestamp
  const [selectedAction, setSelectedAction] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState(null);
  const [hoveringInnerTab, setHoveringInnerTab] = useState(null);
  const [backendData, setBackendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [csvPreview, setCsvPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Handle CSV file selection and preview with PapaParse
  const handleFileSelect = (event) => {
    console.log('📂 File select triggered');
    const file = event.target.files?.[0];
    console.log('📄 File:', file);
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setUploadStatus({ type: 'error', message: '❌ Please upload a CSV file' });
      return;
    }

    setSelectedFile(file);
    setUploadStatus({ type: 'info', message: '📄 Parsing CSV file...' });

    // Parse CSV with PapaParse for preview
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, meta, errors } = results;

        // Check for parsing errors
        if (errors.length > 0) {
          setUploadStatus({
            type: 'error',
            message: `❌ CSV parsing error: ${errors[0].message}`
          });
          setCsvPreview(null);
          return;
        }

        // Validate required columns
        const columns = meta.fields || [];
        const hasDateColumn = columns.some(col =>
          col.toLowerCase().includes('date')
        );
        const hasIncomeColumn = columns.some(col =>
          col.toLowerCase().includes('income')
        );

        if (!hasDateColumn || !hasIncomeColumn) {
          setUploadStatus({
            type: 'error',
            message: `❌ CSV must have 'date' and 'income' columns. Found: ${columns.join(', ')}`
          });
          setCsvPreview(null);
          return;
        }

        // Calculate stats
        const incomeColumn = columns.find(col => col.toLowerCase().includes('income'));
        const totalIncome = data.reduce((sum, row) => {
          const income = parseFloat(row[incomeColumn]) || 0;
          return sum + income;
        }, 0);
        const avgIncome = data.length > 0 ? totalIncome / data.length : 0;

        // Set preview data
        setCsvPreview({
          columns,
          totalRows: data.length,
          previewRows: data.slice(0, 5), // First 5 rows
          stats: {
            totalIncome: Math.round(totalIncome),
            avgIncome: Math.round(avgIncome),
            minIncome: Math.round(Math.min(...data.map(r => parseFloat(r[incomeColumn]) || 0))),
            maxIncome: Math.round(Math.max(...data.map(r => parseFloat(r[incomeColumn]) || 0))),
          }
        });

        setUploadStatus({
          type: 'success',
          message: `✅ CSV parsed! ${data.length} days of data found. Review below and confirm upload.`
        });
      },
      error: (error) => {
        setUploadStatus({
          type: 'error',
          message: `❌ Failed to parse CSV: ${error.message}`
        });
        setCsvPreview(null);
      }
    });

    // Clear the file input
    event.target.value = '';
  };

  // Cancel preview and reset
  const cancelPreview = () => {
    setCsvPreview(null);
    setSelectedFile(null);
    setUploadStatus(null);
  };

  // Confirm and upload to backend
  const confirmUpload = async () => {
    console.log('🚀 confirmUpload called');
    console.log('📄 selectedFile:', selectedFile);

    if (!selectedFile) {
      console.log('❌ No file selected!');
      return;
    }

    setUploading(true);
    setUploadStatus({ type: 'info', message: '📤 Uploading to server...' });

    try {
      // Upload CSV to backend
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('📤 Sending to backend...');
      const uploadResponse = await fetch('http://localhost:8000/api/income/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Upload failed:', errorText);
        throw new Error('Upload failed: ' + errorText);
      }

      const uploadData = await uploadResponse.json();
      console.log('✅ CSV uploaded:', uploadData);

      // Clear preview after successful upload
      setCsvPreview(null);
      setSelectedFile(null);

      // Now generate forecast with uploaded data
      setLoading(true);
      console.log('📊 Generating forecast...');
      const forecastResponse = await fetch('http://localhost:8000/api/forecast/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: 'demo_user' }),
      });

      console.log('📥 Forecast response status:', forecastResponse.status);

      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();
        console.log('✅ Forecast generated with your data:', forecastData);
        console.log('📊 Chart will update with new values');
        setBackendData(forecastData);

        if (forecastData.crisis && forecastData.crisis.days_to_crisis) {
          // Set deadline timestamp (now + days to crisis)
          const deadline = new Date();
          deadline.setDate(deadline.getDate() + forecastData.crisis.days_to_crisis);
          setCrisisDeadline(deadline.getTime());
          setDays(forecastData.crisis.days_to_crisis);
          console.log(`⏰ Crisis countdown updated to ${forecastData.crisis.days_to_crisis} days`);
        }

        setUploadStatus({
          type: 'success',
          message: '🎉 Your personalized forecast is ready!'
        });
      } else {
        const errorText = await forecastResponse.text();
        console.error('❌ Forecast failed:', errorText);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: `❌ Upload failed: ${error.message}`
      });
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  // Fetch data from backend on component mount
  useEffect(() => {
    const fetchForecast = async () => {
      try {
        console.log('🚀 Fetching forecast from backend...');
        const response = await fetch('http://localhost:8000/api/forecast/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: 'rahul' }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Backend data received:', data);
          setBackendData(data);

          // Set crisis countdown from backend
          if (data.crisis && data.crisis.days_to_crisis) {
            // Set deadline timestamp (now + days to crisis)
            const deadline = new Date();
            deadline.setDate(deadline.getDate() + data.crisis.days_to_crisis);
            setCrisisDeadline(deadline.getTime());
            setDays(data.crisis.days_to_crisis);
            console.log(`⏰ Crisis in ${data.crisis.days_to_crisis} days`);
          }
        } else {
          const errorText = await response.text();
          console.error('❌ Backend responded with error:', response.status, errorText);
        }
      } catch (error) {
        console.error('❌ Failed to fetch from backend:', error);
        console.error('Error details:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  // Countdown timer - calculates remaining time from deadline timestamp
  useEffect(() => {
    if (!crisisDeadline) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const timeRemaining = crisisDeadline - now;
      const daysRemaining = timeRemaining / (1000 * 60 * 60 * 24); // Convert ms to days
      setDays(Math.max(0, daysRemaining));
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [crisisDeadline]);

  // ==================== CONSTANTS ====================
  const DAILY_EXPENSES = 200; // ₹200/day expenses
  const STARTING_BALANCE = backendData?.current_balance || 18000; // Dynamic from backend or fallback
  const DAYS_TO_RENT = 28; // 4 weeks = 28 days
  const RENT_DAY_WEEK_IDX = 4; // Week 4 in forecastData array (index 4)

  // ==================== CHART DATA CALCULATION ====================
  // Check if backend has valid scenarios data (with actual arrays)
  const hasValidBackendData = backendData?.scenarios?.pessimistic?.length > 0 &&
    backendData?.scenarios?.base?.length > 0 &&
    backendData?.scenarios?.optimistic?.length > 0;

  // Generate weekly chart data from backend or use defaults
  const forecastData = hasValidBackendData ?
    (() => {
      console.log('🔍 Backend scenarios received:');
      console.log('Pessimistic (first 7 days):', backendData.scenarios.pessimistic.slice(0, 7));
      console.log('Base (first 7 days):', backendData.scenarios.base.slice(0, 7));
      console.log('Optimistic (first 7 days):', backendData.scenarios.optimistic.slice(0, 7));

      // Calculate cumulative balances for each scenario
      const calculateCumulativeBalance = (dailyIncomes, startBalance) => {
        let balance = startBalance;
        return dailyIncomes.map(income => {
          balance += income - DAILY_EXPENSES;
          return balance;
        });
      };

      const chaosCumulative = calculateCumulativeBalance(backendData.scenarios.pessimistic, STARTING_BALANCE);
      const survivalCumulative = calculateCumulativeBalance(backendData.scenarios.base, STARTING_BALANCE);
      const thriveCumulative = calculateCumulativeBalance(backendData.scenarios.optimistic, STARTING_BALANCE);

      console.log('💰 Cumulative balances (Week 1 end):');
      console.log('Chaos:', chaosCumulative[6]);
      console.log('Survival:', survivalCumulative[6]);
      console.log('Thrive:', thriveCumulative[6]);

      // Group into weeks (7 days each) and show last day of week
      const weeklyData = [];
      const daysPerWeek = 7;
      const totalWeeks = Math.ceil(backendData.scenarios.dates.length / daysPerWeek);

      // Calculate how many weeks are "historical" (already happened)
      // Assume first 2 weeks are historical data
      const historicalWeeks = 2;

      // Add starting point
      weeklyData.push({
        week: "Now",
        chaos: STARTING_BALANCE,
        survival: STARTING_BALANCE,
        thrive: STARTING_BALANCE,
        actual: STARTING_BALANCE, // Add actual value for blue line
        current: true,
      });

      for (let weekNum = 0; weekNum < Math.min(totalWeeks, 7); weekNum++) {
        const endOfWeekIdx = (weekNum + 1) * daysPerWeek - 1;

        if (endOfWeekIdx < chaosCumulative.length) {
          const isHistorical = weekNum < historicalWeeks;
          const baseBalance = Math.round(survivalCumulative[endOfWeekIdx]);

          const weekData = {
            week: weekNum === 3 ? "Rent Day (Week 4)" : `Week ${weekNum + 1}`,
            chaos: Math.round(chaosCumulative[endOfWeekIdx]),
            survival: baseBalance,
            thrive: Math.round(thriveCumulative[endOfWeekIdx]),
            // Add actual (blue line) for historical weeks only
            ...(isHistorical && { actual: baseBalance }),
          };
          console.log(`Week ${weekNum + 1}:`, weekData);
          weeklyData.push(weekData);
        }
      }

      console.log('📊 Weekly cumulative balance chart:', weeklyData);
      return weeklyData;
    })()
    : [
      {
        week: "Now",
        chaos: 45000,
        survival: 45000,
        thrive: 45000,
        actual: 45000,
        current: true,
      },
      {
        week: "Week 1",
        chaos: 42000,
        survival: 44000,
        thrive: 47000,
        actual: 43500,
      },
      {
        week: "Week 2",
        chaos: 36000,
        survival: 41000,
        thrive: 50000,
        actual: 40000,
      },
      {
        week: "Week 3",
        chaos: 28000,
        survival: 38000,
        thrive: 55000,
      },
      {
        week: "Rent Day",
        chaos: 18000,
        survival: 35000,
        thrive: 62000,
      },
      {
        week: "Week 5",
        chaos: 12000,
        survival: 33000,
        thrive: 68000,
      },
      {
        week: "Week 6",
        chaos: 8000,
        survival: 32000,
        thrive: 75000,
      },
      {
        week: "Week 7",
        chaos: 5000,
        survival: 31000,
        thrive: 82000,
      },
    ];

  // ==================== PATH CARDS DATA CALCULATION ====================
  // Calculate timeline data (Chaos/Survival/Thrive cards) from backend or use defaults
  const timelineData = hasValidBackendData && forecastData.length > RENT_DAY_WEEK_IDX ?
    (() => {
      // Calculate total income and expenses for each path (28 days to rent day)
      const calculateMetrics = (scenarioData) => {
        const totalIncome = scenarioData.slice(0, DAYS_TO_RENT).reduce((sum, val) => sum + val, 0);
        const totalExpenses = DAYS_TO_RENT * DAILY_EXPENSES;
        const netSaved = totalIncome - totalExpenses;
        const finalBalance = STARTING_BALANCE + netSaved;

        return {
          totalIncome: Math.round(totalIncome),
          totalExpenses: Math.round(totalExpenses),
          saved: Math.round(netSaved),
          finalBalance: Math.round(finalBalance),
        };
      };

      const chaosMetrics = calculateMetrics(backendData.scenarios.pessimistic);
      const survivalMetrics = calculateMetrics(backendData.scenarios.base);
      const thriveMetrics = calculateMetrics(backendData.scenarios.optimistic);

      return {
        chaos: {
          color: "#CB202D",
          icon: TrendingDown,
          amount: forecastData[RENT_DAY_WEEK_IDX]?.chaos || chaosMetrics.finalBalance,
          label: "Chaos Path",
          description: chaosMetrics.finalBalance < 0 ? "By Rent Day - Crisis! 🔥" : "By Rent Day - Tight 😰",
          saved: chaosMetrics.saved,
          spent: chaosMetrics.totalExpenses,
          totalIncome: chaosMetrics.totalIncome,
        },
        survival: {
          color: "#eab308",
          icon: AlertTriangle,
          amount: forecastData[RENT_DAY_WEEK_IDX]?.survival || survivalMetrics.finalBalance,
          label: "Survival Path",
          description: survivalMetrics.finalBalance > 15000 ? "By Rent Day - Safe ✓" : "By Rent Day - Close Call ⚠️",
          saved: survivalMetrics.saved,
          spent: survivalMetrics.totalExpenses,
          totalIncome: survivalMetrics.totalIncome,
        },
        thrive: {
          color: "#22c55e",
          icon: TrendingUp,
          amount: forecastData[RENT_DAY_WEEK_IDX]?.thrive || thriveMetrics.finalBalance,
          label: "Thrive Path",
          description: "By Rent Day - Thriving! 🎉",
          saved: thriveMetrics.saved,
          spent: thriveMetrics.totalExpenses,
          totalIncome: thriveMetrics.totalIncome,
        },
      };
    })()
    : {
      chaos: {
        color: "#CB202D",
        icon: TrendingDown,
        amount: -5000,
        label: "Chaos Path",
        description: "By Rent Day - Crisis! 🔥",
        saved: 0,
        spent: 23000,
      },
      survival: {
        color: "#eab308",
        icon: AlertTriangle,
        amount: 32000,
        label: "Survival Path",
        description: "By Rent Day - Safe ✓",
        saved: 3240,
        spent: 15760,
      },
      thrive: {
        color: "#22c55e",
        icon: TrendingUp,
        amount: 42000,
        label: "Thrive Path",
        description: "By Rent Day - Thriving! 🎉",
        saved: 6500,
        spent: 11500,
      },
    };

  // ==================== SUGGESTIONS CALCULATION ====================
  // Get action suggestions from backend or use defaults
  const suggestions = backendData?.suggestions || [
    {
      id: 1,
      action: "Take 2 extra shifts this week",
      impact: "+₹3,200",
      type: "income",
    },
    {
      id: 2,
      action: "Skip dining out (5 days)",
      impact: "+₹1,500",
      type: "expense",
    },
    {
      id: 3,
      action: "Reduce entertainment budget",
      impact: "+₹800",
      type: "expense",
    },
  ];

  // ==================== INCOME STATS CALCULATION ====================
  // Calculate weekly income data for sidebar from backend or use defaults
  const incomeData = backendData?.scenarios ?
    (() => {
      const weeklyIncomeData = [];
      const daysPerWeek = 7;

      // Calculate weekly averages from base scenario (realistic forecast)
      for (let weekNum = 0; weekNum < 8; weekNum++) {
        const startIdx = weekNum * daysPerWeek;
        const endIdx = Math.min(startIdx + daysPerWeek, backendData.scenarios.base.length);

        if (startIdx < backendData.scenarios.base.length) {
          const weeklyIncome = backendData.scenarios.base
            .slice(startIdx, endIdx)
            .reduce((sum, income) => sum + income, 0);

          weeklyIncomeData.push({
            week: weekNum < 4 ? `W${weekNum + 1}` : `F${weekNum - 3}`,
            amount: Math.round(weeklyIncome),
            forecast: weekNum >= 4,
          });
        }
      }

      return weeklyIncomeData;
    })()
    : [
      { week: "W1", amount: 12000 },
      { week: "W2", amount: 8500 },
      { week: "W3", amount: 11200 },
      { week: "W4", amount: 9800 },
      { week: "F1", amount: 10500, forecast: true },
      { week: "F2", amount: 9200, forecast: true },
      { week: "F3", amount: 11800, forecast: true },
      { week: "F4", amount: 10100, forecast: true },
    ];

  // Calculate max value for income chart dynamically
  const maxValue = Math.max(
    ...incomeData.map(d => d.amount),
    60000 // Minimum 60k
  );

  // ==================== THIS MONTH STATS CALCULATION ====================
  // Calculate current month statistics
  const thisMonthStats = backendData?.scenarios ?
    (() => {
      // Get current date and calculate days in current month so far
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const dayOfMonth = today.getDate();

      // Calculate total earned (sum of base scenario for days elapsed this month)
      const daysThisMonth = Math.min(dayOfMonth, backendData.scenarios.base.length);
      const totalEarned = backendData.scenarios.base
        .slice(0, daysThisMonth)
        .reduce((sum, income) => sum + income, 0);

      // Calculate total spent (days × daily expenses)
      const totalSpent = daysThisMonth * DAILY_EXPENSES;

      // Calculate projected shortage at Rent Day (Week 4)
      const projectedShortage = forecastData[RENT_DAY_WEEK_IDX]?.chaos || 0;

      return {
        totalEarned: Math.round(totalEarned),
        totalSpent: Math.round(totalSpent),
        projectedShortage: Math.round(projectedShortage),
        daysElapsed: daysThisMonth,
      };
    })()
    : {
      totalEarned: 0,
      totalSpent: 14200,
      projectedShortage: -5000,
      daysElapsed: 30,
    };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-lg border border-gray-200 rounded-lg p-4 shadow-lg">
          <p className="text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="text-sm"
            >
              {entry.name}: ₹{entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-white text-gray-900">
      {/* Main Content */}
      <div className="p-4">
        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-xl font-semibold text-gray-900">Loading backend data...</p>
              <p className="text-sm text-gray-600 mt-2">Connecting to FastAPI server</p>
            </div>
          </div>
        )}

        {/* Backend Connection Status */}
        {!loading && backendData && (
          <div className="max-w-7xl mx-auto mb-4">
            <div className="bg-green-50 border border-green-300 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800 font-semibold">
                ✅ Connected to Backend - Real AI Data Loaded!
              </span>
            </div>
          </div>
        )}

        {!loading && !backendData && (
          <div className="max-w-7xl mx-auto mb-4">
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-orange-800 font-semibold">
                ⚠️ Demo Data Mode - Upload CSV for Your Personalized Forecast
              </span>
            </div>
          </div>
        )}

        {/* CSV Upload Section */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome, Rahul! 👋
                </h2>
                <p className="text-lg text-gray-600">
                  Manage your Financial Income Smartly
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="csv-upload"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="csv-upload"
                  onClick={() => console.log('🖱️ Label clicked, csvPreview:', csvPreview, 'uploading:', uploading)}
                  className={`px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all flex items-center gap-2 ${uploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:scale-105'
                    }`}
                >
                  <Upload className="w-5 h-5" />
                  {uploading ? 'Uploading...' : 'Upload Income CSV'}
                </label>
              </div>
            </div>

            {/* Upload Status Messages */}
            {uploadStatus && !csvPreview && (
              <div className={`mt-4 p-3 rounded-lg ${uploadStatus.type === 'success' ? 'bg-green-100 border border-green-300' :
                uploadStatus.type === 'error' ? 'bg-red-100 border border-red-300' :
                  'bg-blue-100 border border-blue-300'
                }`}>
                <p className={`text-sm font-semibold ${uploadStatus.type === 'success' ? 'text-green-800' :
                  uploadStatus.type === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>
                  {uploadStatus.message}
                </p>
              </div>
            )}

            {/* CSV Preview Section */}
            {csvPreview && (
              <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Preview Header */}
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white">
                    <Eye className="w-5 h-5" />
                    <span className="font-semibold">CSV Preview</span>
                    <span className="bg-white/20 px-2 py-1 rounded text-sm">
                      {csvPreview.totalRows} rows detected
                    </span>
                  </div>
                  <button
                    onClick={cancelPreview}
                    className="text-white hover:bg-white/20 p-1 rounded transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-3 p-4 bg-gray-50">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Total Days</p>
                    <p className="text-xl font-bold text-gray-900">{csvPreview.totalRows}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Total Income</p>
                    <p className="text-xl font-bold text-green-600">₹{csvPreview.stats.totalIncome.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Avg/Day</p>
                    <p className="text-xl font-bold text-blue-600">₹{csvPreview.stats.avgIncome.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Range</p>
                    <p className="text-lg font-bold text-gray-700">
                      ₹{csvPreview.stats.minIncome} - ₹{csvPreview.stats.maxIncome}
                    </p>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    First 5 rows preview:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          {csvPreview.columns.map((col, idx) => (
                            <th key={idx} className="px-4 py-2 text-left font-semibold text-gray-700 border-b">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.previewRows.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-gray-50">
                            {csvPreview.columns.map((col, colIdx) => (
                              <td key={colIdx} className="px-4 py-2 border-b border-gray-100">
                                {row[col]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvPreview.totalRows > 5 && (
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      ... and {csvPreview.totalRows - 5} more rows
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                  <button
                    onClick={cancelPreview}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmUpload}
                    disabled={uploading}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg transition-all font-semibold disabled:opacity-50"
                  >
                    {uploading ? '⏳ Uploading...' : '✅ Confirm & Upload'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        <>
          {/* Welcome Header Removed (Moved to Top) */}

          <div className="max-w-7xl mx-auto mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <img src={logo} alt="FinMate AI Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">FinMate AI</h1>
                  <p className="text-blue-600 text-sm">
                    "Smart Money for Gig Workers"
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Current Balance
                </div>
                <div className="text-2xl font-bold text-gray-900">₹{STARTING_BALANCE.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-gradient-to-r from-[#CB202D] to-[#FC8019] rounded-2xl p-5 shadow-2xl border border-[#FC8019]/30 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <AlertTriangle className="w-8 h-8" />
                  <div>
                    <div className="text-2xl font-bold">
                      ⚠️ FINANCIAL CRISIS ALERT
                    </div>
                    <div className="text-red-100">
                      Balance will hit zero in {Math.floor(days)} days
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold">
                    {Math.floor(days)}
                  </div>
                  <div className="text-sm">days remaining</div>
                </div>
              </div>
              <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${(days / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mb-6">
            <div className="flex gap-2 bg-white/80 rounded-xl p-2 backdrop-blur shadow-sm border border-gray-200">
              {["timeline", "forecast", "actions", "Activites", "autopilot"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${activeTab === tab
                      ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {activeTab === "timeline" && (
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        Three Possible Futures
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Next 4 weeks predicted by AI
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-blue-300">
                      <Sparkles className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        Butterfly Effect Active
                      </span>
                    </div>
                  </div>

                  {/* Graph */}
                  <div className="mb-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={forecastData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                        />
                        <XAxis
                          dataKey="week"
                          stroke="#6b7280"
                          style={{ fontSize: "14px" }}
                        />
                        <YAxis
                          stroke="#6b7280"
                          style={{ fontSize: "14px" }}
                          tickFormatter={(value) =>
                            `₹${(value / 1000).toFixed(0)}k`
                          }
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ paddingTop: "20px" }}
                          iconType="circle"
                        />

                        {/* Rent threshold line */}
                        <ReferenceLine
                          y={15000}
                          stroke="#FC8019"
                          strokeDasharray="3 3"
                          label={{
                            value: "Crisis Threshold (₹15k)",
                            fill: "#FC8019",
                            position: "right",
                          }}
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
                          strokeWidth={
                            highlightedPath === "chaos" ? 4 : 3
                          }
                          strokeDasharray="5 5"
                          dot={{
                            r: highlightedPath === "chaos" ? 6 : 5,
                            fill: "#CB202D",
                          }}
                          name="🔴 Chaos Path"
                          opacity={
                            highlightedPath === null ||
                              highlightedPath === "chaos"
                              ? 1
                              : 0.3
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="survival"
                          stroke="#eab308"
                          strokeWidth={
                            highlightedPath === "survival" ? 4 : 3
                          }
                          strokeDasharray="5 5"
                          dot={{
                            r:
                              highlightedPath === "survival"
                                ? 6
                                : 5,
                            fill: "#eab308",
                          }}
                          name="🟡 Survival Path"
                          opacity={
                            highlightedPath === null ||
                              highlightedPath === "survival"
                              ? 1
                              : 0.3
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="thrive"
                          stroke="#22c55e"
                          strokeWidth={
                            highlightedPath === "thrive" ? 4 : 3
                          }
                          strokeDasharray="5 5"
                          dot={{
                            r: highlightedPath === "thrive" ? 6 : 5,
                            fill: "#22c55e",
                          }}
                          name="🟢 Thrive Path"
                          opacity={
                            highlightedPath === null ||
                              highlightedPath === "thrive"
                              ? 1
                              : 0.3
                          }
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Path Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(timelineData).map(
                      ([key, data]) => {
                        const Icon = data.icon;
                        return (
                          <div
                            key={key}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${highlightedPath === key
                              ? "ring-4 ring-opacity-50 scale-105"
                              : "hover:scale-102"
                              }`}
                            style={{
                              borderColor: data.color,
                              backgroundColor: `${data.color}10`,
                              ringColor:
                                highlightedPath === key
                                  ? data.color
                                  : "transparent",
                            }}
                            onClick={() =>
                              setHighlightedPath(
                                highlightedPath === key
                                  ? null
                                  : key,
                              )
                            }
                            onMouseEnter={() =>
                              setHighlightedPath(key)
                            }
                            onMouseLeave={() =>
                              setHighlightedPath(null)
                            }
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{
                                  backgroundColor: `${data.color}30`,
                                  color: data.color,
                                }}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div
                                className="font-semibold"
                                style={{ color: data.color }}
                              >
                                {data.label}
                              </div>
                            </div>
                            <div
                              className="text-3xl font-bold mb-1"
                              style={{ color: data.amount > 0 ? "#22c55e" : "#CB202D" }}
                            >
                              ₹
                              {Math.abs(
                                data.amount,
                              ).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                              {data.description}
                            </div>
                            <div className="pt-3 flex justify-around gap-2">
                              <div className="flex flex-col items-center">
                                <div
                                  className="px-3 py-2 rounded-lg bg-green-100 border-2 border-green-500 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-125 hover:shadow-lg hover:z-10 relative"
                                  onMouseEnter={() => setHoveringInnerTab(key)}
                                  onMouseLeave={() => setHoveringInnerTab(null)}
                                >
                                  <div className="text-xs text-green-700">Saved</div>
                                  <div className="text-xs font-bold text-green-600">
                                    ₹{(data.saved / 1000).toFixed(1)}k
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-center">
                                <div
                                  className="px-3 py-2 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-125 hover:shadow-lg hover:z-10 relative"
                                  style={{ backgroundColor: "#FEE2E2", borderColor: "#CB202D" }}
                                  onMouseEnter={() => setHoveringInnerTab(key)}
                                  onMouseLeave={() => setHoveringInnerTab(null)}
                                >
                                  <div className="text-xs" style={{ color: "#CB202D" }}>Spent</div>
                                  <div className="text-xs font-bold" style={{ color: "#CB202D" }}>
                                    ₹{(data.spent / 1000).toFixed(1)}k
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              {activeTab === "forecast" && (
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    Income Forecast
                  </h2>

                  <div className="space-y-3">
                    {incomeData.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4"
                      >
                        <div
                          className={`w-16 text-sm font-semibold ${item.forecast ? "text-green-600" : "text-gray-600"}`}
                        >
                          {item.week}
                        </div>
                        <div className="flex-1 h-10 bg-gray-100 rounded-lg overflow-hidden relative">
                          <div
                            className={`h-full transition-all ${item.forecast
                              ? "bg-gradient-to-r from-green-500 to-blue-500"
                              : "bg-gradient-to-r from-blue-500 to-cyan-500"
                              }`}
                            style={{
                              width: `${(item.amount / 12000) * 100}%`,
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-end pr-3 text-sm font-semibold text-gray-900">
                            ₹{item.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500" />
                      <span>Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span>Forecast</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "actions" && (
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                    <Target className="w-6 h-6 text-blue-600" />
                    AI Recommendations
                  </h2>

                  <div className="space-y-3">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedAction === suggestion.id
                          ? "bg-gradient-to-r from-green-50 to-blue-50 border-blue-500"
                          : "bg-white border-gray-200 hover:border-blue-300"
                          }`}
                        onClick={() =>
                          setSelectedAction(suggestion.id)
                        }
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-900">
                            {suggestion.action}
                          </div>
                          <div className="text-green-600 font-bold">
                            {suggestion.impact}
                          </div>
                        </div>
                        {selectedAction === suggestion.id && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="text-sm text-gray-600 mb-2">
                              Butterfly Effect Preview:
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1 p-2 bg-red-100 rounded text-xs text-center text-gray-900">
                                Chaos: Still -₹5,000
                              </div>
                              <div className="flex-1 p-2 bg-yellow-100 rounded text-xs text-center text-gray-900">
                                Survival: -₹200
                              </div>
                              <div className="flex-1 p-2 bg-green-100 rounded text-xs text-center text-gray-900">
                                Thrive: +₹10,500
                              </div>
                            </div>
                            <button className="mt-3 w-full py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all">
                              Apply This Action
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "Activites" && (
                <div className="space-y-6">
                  <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-gray-200 shadow-lg">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">
                      This Month
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600">
                          Total Earned
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          ₹{thisMonthStats.totalEarned.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {thisMonthStats.daysElapsed} days this month
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          Total Spent
                        </div>
                        <div className="text-2xl font-bold" style={{ color: "#CB202D" }}>
                          ₹{thisMonthStats.totalSpent.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ₹{DAILY_EXPENSES}/day × {thisMonthStats.daysElapsed} days
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          Projected Shortage
                        </div>
                        <div className="text-2xl font-bold" style={{ color: "#FC8019" }}>
                          {thisMonthStats.projectedShortage < 0 ? '-' : ''}₹{Math.abs(thisMonthStats.projectedShortage).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          At Rent Day (Week 4)
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          Auto-Saved
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          ₹3,240
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-gray-200 shadow-lg">
                    <h3 className="text-lg font-bold mb-4 text-gray-900">
                      Recent Activity
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Auto-save triggered
                        </span>
                        <span className="text-green-600 font-semibold">+₹80</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Blocked: Food delivery
                        </span>
                        <span className="font-semibold" style={{ color: "#FC8019" }}>-₹350</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Shift completed
                        </span>
                        <span className="text-green-600 font-semibold">+₹1,200</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Rent reminder set
                        </span>
                        <span className="text-blue-600 font-semibold">12 days</span>
                      </div>
                    </div>
                  </div>
                </div>)}

              {activeTab === "autopilot" && (
                <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                    <Lock className="w-6 h-6 text-green-600" />
                    Autonomous AI Actions
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-300 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-900">
                            Auto-Save Enabled
                          </span>
                        </div>
                        <div className="text-green-600 font-bold">
                          10% Daily
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        ₹80 locked today • Total saved: ₹3,240
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 border border-[#FC8019]/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" style={{ color: "#FC8019" }} />
                          <span className="font-semibold text-gray-900">
                            Risky Expense Blocks
                          </span>
                        </div>
                        <div className="font-bold" style={{ color: "#FC8019" }}>
                          Active
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Prevented 2 impulse purchases this week •
                        Saved: ₹1,850
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-300 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          Emergency Fund Builder
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1 text-gray-700">
                          <span>Progress to 1 month salary</span>
                          <span className="text-blue-600 font-bold">
                            18%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 w-[18%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - ChatBot (Always Visible) */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden h-[600px] flex flex-col sticky top-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">FinMate AI Assistant</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs text-white/80">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ChatBot
                    isInline={true}
                    onClose={() => { }}
                    isMinimized={false}
                    onToggleMinimize={() => { }}
                  />
                </div>
              </div>
            </div>

          </div>
        </>
      </div>
    </div>
  );
};

export default FinMateAI;