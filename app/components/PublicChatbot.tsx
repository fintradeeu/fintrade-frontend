import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Phone, Mail, Sparkles, CornerDownLeft } from "lucide-react";
import api from "../services/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  isSupport?: boolean;
}

const SUGGESTED_PROMPTS = [
  "What courses do you offer?",
  "Why is stock market education important?",
  "How can I get funded?",
  "Contact Support"
];

export default function PublicChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your FinTrade AI Assistant. How can I help you today? I can answer questions about our courses, trading education, or how you can become a funded professional."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    if (text.trim() === "Contact Support") {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: "You can reach our admissions and general support desk directly at support@fintrade.com or call us at +91 92746 75947. We are happy to help!",
            isSupport: true
          }
        ]);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const res = await api.post("/ai/public/ask", { question: text });
      const answer = res.data?.answer || "I'm having trouble responding right now. Please call or mail us.";
      const isSupport = res.data?.sources?.includes("contact-support") || false;

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: answer,
          isSupport
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I couldn't reach the server. Please contact support directly at support@fintrade.com or +91 92746 75947.",
          isSupport: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#D50032] to-[#FF4D70] text-white shadow-lg shadow-red-200 transition-all hover:scale-110 active:scale-95"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-[#D50032]"></span>
          </span>
          <MessageSquare className="h-6 w-6 transition-transform group-hover:rotate-6" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="flex h-[520px] w-[360px] flex-col rounded-3xl border border-slate-100 bg-white shadow-2xl transition-all duration-300 md:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-[#0B2A5B] to-[#1E3E6F] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Bot className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">FinTrade AI Chat</h3>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Conversation Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50/50 p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#D50032] text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                  }`}
                >
                  {msg.content}

                  {/* Contact Info rendering for support messages */}
                  {msg.isSupport && (
                    <div className="mt-3 border-t border-slate-100 pt-3 space-y-2">
                      <a
                        href="tel:+919274675947"
                        className="flex items-center gap-2 text-xs font-bold text-[#D50032] hover:underline"
                      >
                        <Phone size={13} /> Call: +91 92746 75947
                      </a>
                      <a
                        href="mailto:support@fintrade.com"
                        className="flex items-center gap-2 text-xs font-bold text-[#D50032] hover:underline"
                      >
                        <Mail size={13} /> Mail: support@fintrade.com
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-2xl rounded-bl-none p-3.5 w-20 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-100"></span>
                <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-200"></span>
              </div>
            )}
          </div>

          {/* Suggested Prompts Strip */}
          <div className="px-4 py-2 border-t border-slate-100 bg-white flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="text-[11px] font-bold text-slate-600 border border-slate-200 hover:border-[#D50032] hover:text-[#D50032] rounded-full px-3 py-1 bg-slate-50 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box Footer */}
          <div className="p-3 border-t border-slate-100 bg-white rounded-b-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="flex items-center gap-2 bg-slate-50 rounded-2xl p-1.5 border border-slate-100 focus-within:border-[#D50032] transition-colors"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about courses, website, etc..."
                className="flex-1 bg-transparent px-3 text-xs outline-none text-slate-700 placeholder-slate-400 font-semibold"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#D50032] hover:brightness-105 text-white disabled:opacity-40 transition-opacity"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
