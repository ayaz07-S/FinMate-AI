// src/components/ChatBot.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, X, Minimize2, Maximize2 } from 'lucide-react';

const ChatBot = ({ onClose, isMinimized, onToggleMinimize, isInline = false }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "Hi Rahul! 👋 I'm your FinMate AI assistant. I can help you with:\n\n• Understanding your financial forecast\n• Explaining crisis alerts\n• Answering questions about your income\n• Providing personalized advice\n\nWhat would you like to know?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsTyping(true);

        try {
            // Build history for context (last 6 messages)
            const history = messages.slice(-6).map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            // Call backend API with OpenAI
            const response = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: 'demo_user',
                    message: currentInput,
                    history: history
                }),
            });

            let botResponse;
            if (response.ok) {
                const data = await response.json();
                botResponse = data.response;
            } else {
                // Fallback to mock response if backend fails
                console.warn('Backend unavailable, using mock response');
                botResponse = generateMockResponse(currentInput);
            }

            const botMessage = {
                id: messages.length + 2,
                type: 'bot',
                text: botResponse,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            // Fallback to mock response
            const botMessage = {
                id: messages.length + 2,
                type: 'bot',
                text: generateMockResponse(currentInput),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const generateMockResponse = (query) => {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('crisis') || lowerQuery.includes('alert')) {
            return "⚠️ Based on your current income pattern, you're projected to face a ₹5,000 deficit in 12 days. This is calculated from:\n\n• Your average daily income: ₹450\n• Daily expenses: ₹200\n• Current balance: ₹18,000\n\nI recommend taking 2 extra shifts this week to avoid the crisis. Would you like me to explain how this would change your forecast?";
        }

        if (lowerQuery.includes('income') || lowerQuery.includes('earn')) {
            return "📊 Your income analysis:\n\n• Last 4 weeks average: ₹450/day\n• This week: ₹380/day (below average)\n• Forecast next week: ₹420/day\n\nYour income is 15% below your average. Consider taking extra shifts or focusing on peak hours to increase earnings.";
        }

        if (lowerQuery.includes('save') || lowerQuery.includes('saving')) {
            return "💰 Your savings strategy:\n\n• Auto-save active: ₹80/day (10% of income)\n• Total saved this month: ₹3,240\n• Emergency fund progress: 18% of 1-month salary\n\nYou're on track! Keep the auto-save enabled and you'll reach your emergency fund goal in 5 months.";
        }

        if (lowerQuery.includes('action') || lowerQuery.includes('suggestion') || lowerQuery.includes('recommend')) {
            return "🎯 Top recommendations for you:\n\n1. **Take 2 extra weekend shifts** (+₹3,200)\n   - This will prevent your crisis completely\n   - Best ROI for your time\n\n2. **Skip dining out for 5 days** (+₹1,500)\n   - Easy expense cut\n   - No major lifestyle impact\n\n3. **Reduce entertainment budget** (+₹800)\n   - Cancel unused subscriptions\n\nTrying all 3? You'd save ₹5,500 and move from Chaos to Survival path!";
        }

        // Default response
        return "I can help you understand your finances better. Try asking me about:\n\n• 'Explain my crisis alert'\n• 'How can I increase my income?'\n• 'Show me saving tips'\n• 'What actions should I take?'\n\nWhat specific aspect would you like to explore?";
    };

    // For inline mode (embedded in dashboard), render without the fixed positioning and header
    if (isInline) {
        return (
            <div className="flex flex-col h-full">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-2 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user'
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                        : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                    }`}
                            >
                                {message.type === 'user' ? (
                                    <User className="w-4 h-4 text-white" />
                                ) : (
                                    <Bot className="w-4 h-4 text-white" />
                                )}
                            </div>
                            <div
                                className={`max-w-[80%] rounded-xl p-2 ${message.type === 'user'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                        : 'bg-white border border-gray-200 text-gray-900'
                                    }`}
                            >
                                <p className="text-xs whitespace-pre-wrap">{message.text}</p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-xl p-2">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-white border-t border-gray-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask about your finances..."
                            disabled={isTyping}
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isTyping}
                            className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {isTyping ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Minimized floating button (only for non-inline mode)
    if (isMinimized) {
        return (
            <button
                onClick={onToggleMinimize}
                className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 animate-pulse"
            >
                <Bot className="w-8 h-8 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-bounce" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">FinMate AI Assistant</h3>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-xs text-white/80">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleMinimize}
                        className="text-white/80 hover:text-white transition-all p-1 hover:bg-white/20 rounded"
                    >
                        <Minimize2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-all p-1 hover:bg-white/20 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user'
                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                }`}
                        >
                            {message.type === 'user' ? (
                                <User className="w-5 h-5 text-white" />
                            ) : (
                                <Bot className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div
                            className={`max-w-[75%] rounded-2xl p-3 ${message.type === 'user'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-900'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            <span
                                className={`text-xs mt-1 block ${message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                                    }`}
                            >
                                {message.timestamp.toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl p-3">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask me anything about your finances..."
                        disabled={isTyping}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isTyping}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isTyping ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                    Powered by FinMate AI • Real-time financial insights
                </p>
            </div>
        </div>
    );
};

export default ChatBot;