import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useBranding } from '../context/BrandingContext';
import './AIChatPopup.css';

const SESSION_FLAG = 'relaydesk.chatAutoOpened';

export default function AIChatPopup() {
  const { portalName } = useBranding();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const panelRef = useRef(null);
  const bodyRef = useRef(null);

  // Auto pop-open once per session, on sign-in (point 11)
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_FLAG)) return;
    sessionStorage.setItem(SESSION_FLAG, 'true');
    const timer = setTimeout(() => {
      setOpen(true);
      setMessages([
        {
          from: 'bot',
          text: `Hi, ${portalName} here — how may I help you find something? Ask any query.`,
        },
      ]);
    }, 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 24, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.6)' }
    );
  }, [open]);

  useEffect(() => {
    const closeOnRequest = () => setOpen(false);
    window.addEventListener('relaydesk:close-overlays', closeOnRequest);
    return () => window.removeEventListener('relaydesk:close-overlays', closeOnRequest);
  }, []);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const userMsg = { from: 'user', text: draft.trim() };
    setMessages((m) => [...m, userMsg]);
    setDraft('');

    // Placeholder response — wire this up to a real AI/support endpoint later.
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { from: 'bot', text: "Thanks — I've noted that. A support agent will follow up shortly, or you can raise a ticket from the Tickets page." },
      ]);
    }, 500);
  };

  return (
    <div className="ai-chat-root">
      {open && (
        <div className="ai-chat-panel" ref={panelRef}>
          <div className="ai-chat-header">
            <div className="ai-chat-avatar">R</div>
            <div>
              <div className="ai-chat-title">{portalName} Assistant</div>
              <div className="ai-chat-status">● Online</div>
            </div>
            <button className="ai-chat-close" onClick={() => setOpen(false)} type="button" aria-label="Close chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="ai-chat-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`ai-chat-bubble ${m.from}`}>{m.text}</div>
            ))}
          </div>

          <form className="ai-chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask any query…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" aria-label="Send">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button className="ai-chat-fab" onClick={() => setOpen((o) => !o)} type="button" aria-label="Toggle chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}
