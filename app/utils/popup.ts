import { toast } from "sonner";

const getMessage = (message: unknown) => {
  if (message == null) return "";
  if (typeof message === "string") return message;
  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
};

export const showAppMessage = (message: unknown) => {
  const text = getMessage(message);
  const lower = text.toLowerCase();

  if (lower.includes("error") || lower.includes("failed") || lower.includes("invalid")) {
    toast.error(text.replace(/^error:\s*/i, ""));
  } else if (lower.includes("success") || lower.includes("successful") || lower.includes("copied")) {
    toast.success(text);
  } else if (lower.includes("warning") || lower.includes("cannot") || lower.includes("please")) {
    toast.warning(text);
  } else {
    toast.info(text);
  }
};

export const installPopupOverrides = () => {
  if (typeof window === "undefined") return;
  if ((window as any).__fintradePopupsInstalled) return;
  (window as any).__fintradePopupsInstalled = true;

  window.alert = (message?: unknown) => {
    showAppMessage(message);
  };
};

export function confirmPopup(message: string, title = "Please Confirm"): Promise<boolean> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-[100000] flex items-center justify-center bg-black/55 p-4";

    const modal = document.createElement("div");
    modal.className = "w-full max-w-md rounded-2xl bg-white shadow-2xl border border-[#0B2A5B]/10 overflow-hidden";

    modal.innerHTML = `
      <div class="px-6 py-5 border-b border-gray-100">
        <div class="text-xl font-bold text-[#0B2A5B]">${title}</div>
      </div>
      <div class="px-6 py-5">
        <div class="text-sm leading-6 text-gray-600 whitespace-pre-wrap"></div>
      </div>
      <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
        <button type="button" data-action="cancel" class="px-4 py-2 rounded-lg border border-gray-200 text-[#0B2A5B] font-semibold hover:bg-white transition-colors">Cancel</button>
        <button type="button" data-action="confirm" class="px-4 py-2 rounded-lg bg-[#D50032] text-white font-semibold hover:bg-[#b00029] shadow-sm transition-colors">Confirm</button>
      </div>
    `;

    const messageNode = modal.querySelector(".whitespace-pre-wrap");
    if (messageNode) messageNode.textContent = message;

    const cleanup = (value: boolean) => {
      overlay.remove();
      resolve(value);
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) cleanup(false);
    });
    modal.querySelector('[data-action="cancel"]')?.addEventListener("click", () => cleanup(false));
    modal.querySelector('[data-action="confirm"]')?.addEventListener("click", () => cleanup(true));

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  });
}
