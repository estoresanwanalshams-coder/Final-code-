const whatsappNumber = "971559319338";

export function FloatingWhatsApp() {
  return (
    <a
      href={`https://wa.me/${whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white text-[#25D366] shadow-[0_18px_42px_rgba(0,0,0,0.24)] transition hover:scale-105 hover:text-[#1ebe5d] focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 md:bottom-6"
    >
      <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16.03 3.2A12.74 12.74 0 0 0 5.2 22.66L3.5 28.8l6.29-1.65A12.73 12.73 0 1 0 16.03 3.2Zm0 2.32a10.41 10.41 0 0 1 8.83 15.94 10.39 10.39 0 0 1-13.78 3.44l-.45-.27-3.73.98 1-3.63-.3-.47A10.42 10.42 0 0 1 16.03 5.52Zm-4.48 5.54c-.25 0-.66.1-1 .47-.35.38-1.32 1.29-1.32 3.14 0 1.85 1.35 3.64 1.54 3.89.19.25 2.61 4.18 6.43 5.69 3.18 1.25 3.83 1 4.52.94.69-.06 2.23-.91 2.54-1.79.32-.88.32-1.63.22-1.79-.1-.16-.35-.25-.73-.44-.38-.19-2.23-1.1-2.58-1.23-.35-.13-.6-.19-.85.19-.25.38-.98 1.23-1.2 1.48-.22.25-.44.28-.82.09-.38-.19-1.61-.59-3.07-1.89-1.13-1.01-1.9-2.26-2.12-2.64-.22-.38-.02-.59.17-.77.17-.17.38-.44.57-.66.19-.22.25-.38.38-.63.13-.25.06-.47-.03-.66-.09-.19-.85-2.05-1.17-2.8-.31-.73-.62-.63-.85-.64h-.73Z" />
      </svg>
    </a>
  );
}
