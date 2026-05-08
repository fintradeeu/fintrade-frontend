import { useState, useEffect } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Send,
  Bot,
  User,
  Clock,
  Sparkles,
} from "lucide-react";



const suggestedTopics = [
  "What is a stop-loss order?",
  "Explain RSI indicator",
  "How to read candlestick patterns?",
  "What is position sizing?",
  "Difference between call and put options",
];

const getInitialMessage = (name: string) => [{
  id: 1,
  sender: "ai",
  content: `Hello ${name}! I'm your AI tutor. I'm here to help you with any questions about trading, technical analysis, risk management, and more. How can I assist you today?`,
  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
}];

export default function AITutor() {
  const [userName, setUserName] = useState("Student");
  const [messages, setMessages] = useState(getInitialMessage("Student"));
  const [inputMessage, setInputMessage] = useState("");
  const [cannotSolve, setCannotSolve] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const name = JSON.parse(stored).full_name || "Student";
      setUserName(name);
      setMessages(getInitialMessage(name));
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      content: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");
    setLoading(true);
    setCannotSolve(false);

    try {
      const response = await api.post("/ai/ask", {
        question: userMessage.content,
        session_id: sessionId || undefined
      });

      if (response.data.session_id) {
        setSessionId(response.data.session_id);
      }

      const aiResponse = {
        id: messages.length + 2,
        sender: "ai",
        content: response.data.answer,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      
      // Basic heuristic to detect if AI couldn't solve it well
      if (response.data.answer.toLowerCase().includes("cannot answer") || response.data.answer.toLowerCase().includes("don't know")) {
        setCannotSolve(true);
      }
    } catch (err: any) {
      console.error("AI Error:", err);
      const errorResponse = {
        id: messages.length + 2,
        sender: "ai",
        content: "Sorry, I am having trouble connecting to my knowledge base right now.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedTopic = (topic: string) => {
    setInputMessage(topic);
  };

  const scheduleDoubtSession = () => {
    alert("Doubt session scheduled! You'll receive a confirmation email with the details.");
    setCannotSolve(false);
  };

  return (
    <DashboardLayout role="student">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2A5B] mb-2">AI Tutor</h1>
        <p className="text-[#0B2A5B]/70">Get instant answers to your trading questions</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <Card className="lg:col-span-3 bg-white shadow-lg flex flex-col" style={{ height: "calc(100vh - 250px)" }}>
          {/* Chat Header */}
          <div className="p-4 border-b border-[#0B2A5B]/10 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#C2A86A] to-[#d4bd8a] rounded-full flex items-center justify-center">
              <Bot className="text-[#0B2A5B]" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-[#0B2A5B]">AI Trading Tutor</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-[#0B2A5B]/60">Online • Instant responses</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${message.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === "ai"
                      ? "bg-gradient-to-br from-[#C2A86A] to-[#d4bd8a]"
                      : "bg-[#0B2A5B]"
                  }`}
                >
                  {message.sender === "ai" ? (
                    <Bot className="text-[#0B2A5B]" size={20} />
                  ) : (
                    <User className="text-[#F4F1EA]" size={20} />
                  )}
                </div>
                <div
                  className={`flex-1 ${message.sender === "user" ? "flex flex-col items-end" : ""}`}
                >
                  <div
                    className={`inline-block p-4 rounded-lg max-w-[85%] ${
                      message.sender === "ai"
                        ? "bg-[#F4F1EA] text-[#0B2A5B]"
                        : "bg-[#0B2A5B] text-[#F4F1EA]"
                    }`}
                  >
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                  <span className="text-xs text-[#0B2A5B]/50 mt-1 flex items-center gap-1">
                    <Clock size={12} />
                    {message.time}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#C2A86A] to-[#d4bd8a]">
                  <Bot className="text-[#0B2A5B]" size={20} />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-4 rounded-lg max-w-[85%] bg-[#F4F1EA] text-[#0B2A5B]">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#0B2A5B]/40 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[#0B2A5B]/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-[#0B2A5B]/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {cannotSolve && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="text-blue-600 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 mb-2">Need Expert Help?</p>
                    <p className="text-sm text-blue-700 mb-3">
                      This question requires personalized guidance from our expert instructors. Schedule a
                      one-on-one doubt session.
                    </p>
                    <Button
                      size="sm"
                      onClick={scheduleDoubtSession}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Schedule Doubt Session
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[#0B2A5B]/10">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask your trading question..."
                className="bg-[#F4F1EA] border-[#0B2A5B]/20"
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
                className="bg-[#0B2A5B] text-[#F4F1EA] hover:bg-[#1a3d7a]"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-4 bg-white shadow-lg">
            <h3 className="font-semibold text-[#0B2A5B] mb-3 text-sm">Quick Stats</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] text-[#0B2A5B]/60 uppercase tracking-wider">Asked</p>
                <p className="text-lg font-bold text-[#0B2A5B]">47</p>
              </div>
              <div>
                <p className="text-[10px] text-[#0B2A5B]/60 uppercase tracking-wider">Resolution</p>
                <p className="text-lg font-bold text-[#C2A86A]">92%</p>
              </div>
              <div>
                <p className="text-[10px] text-[#0B2A5B]/60 uppercase tracking-wider">Expert</p>
                <p className="text-lg font-bold text-[#0B2A5B]">3</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg">
            <h3 className="font-semibold text-[#0B2A5B] mb-4 flex items-center gap-2">
              <Sparkles className="text-[#C2A86A]" size={20} />
              Suggested Topics
            </h3>
            <div className="space-y-2">
              {suggestedTopics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedTopic(topic)}
                  className="w-full text-left p-3 bg-[#F4F1EA] hover:bg-[#e8e4d9] rounded-lg text-sm text-[#0B2A5B] transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-[#0B2A5B] to-[#1a3d7a] text-[#F4F1EA] shadow-lg">
            <h3 className="font-semibold mb-2">Need More Help?</h3>
            <p className="text-sm text-[#F4F1EA]/80 mb-4">
              If the AI tutor can't answer your question, we'll connect you with an expert instructor.
            </p>
            <Button className="w-full bg-[#C2A86A] text-[#0B2A5B] hover:bg-[#d4bd8a] shadow-md shadow-[#C2A86A]/20">
              Schedule Live Session
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
