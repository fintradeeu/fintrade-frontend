import { useState, useRef, useEffect } from "react";
import { Share2, Link2, Check, X } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  variant?: "icon" | "button";
}

export default function ShareButton({ title, text, url, className = "", variant = "icon" }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const shareUrl = url || window.location.href;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text || title, url: shareUrl });
        return;
      } catch {
        // User cancelled or error — fall through to menu
      }
    }
    setShowMenu((v) => !v);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const socials = [
    {
      name: "WhatsApp",
      icon: "💬",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + shareUrl)}`,
    },
    {
      name: "Twitter",
      icon: "𝕏",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "LinkedIn",
      icon: "in",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: "f",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={handleShare}
        className={
          variant === "button"
            ? "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-[#D50032] hover:bg-red-50 transition-all"
            : "w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-[#D50032] hover:bg-red-50 transition-all"
        }
        title="Share"
      >
        <Share2 className="h-4 w-4" />
        {variant === "button" && <span>Share</span>}
      </button>

      {showMenu && (
        <div
          className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl border border-gray-200 bg-white z-[200] overflow-hidden"
          style={{ animation: "fadeInUp 0.2s ease-out" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold" style={{ color: "#121212" }}>Share</span>
            <button onClick={() => setShowMenu(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-2">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-sm"
                style={{ color: "#121212" }}
                onClick={() => setShowMenu(false)}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#D50032" }}>
                  {s.icon}
                </span>
                {s.name}
              </a>
            ))}
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors text-sm"
              style={{ color: "#121212" }}
            >
              <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(213,0,50,0.1)" }}>
                {copied ? <Check className="h-4 w-4" style={{ color: "#D50032" }} /> : <Link2 className="h-4 w-4" style={{ color: "#D50032" }} />}
              </span>
              {copied ? "Link Copied!" : "Copy Link"}
            </button>
          </div>
          <style>{`
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(-8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
