import { useState } from "react";

interface WhatsAppActivationProps {
  onBack: () => void;
  onNext: () => void;
  botNumber?: string;
  botChatLink?: string;
}

export function WhatsAppActivation({
  onBack,
  onNext,
  botNumber = "+92 316 7949401",
  botChatLink = "https://wa.me/923167949401?text=hello",
}: WhatsAppActivationProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const cleanNumber = botNumber.replace(/[\s\+]/g, "");
    navigator.clipboard.writeText(`+${cleanNumber}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center w-full bg-[#EAF0F8]">
      {/* Top AppBar Component */}
      <header className="fixed top-0 w-full h-16 flex items-center justify-between px-6 z-50 bg-[#EAF0F8]/80 backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-deep-navy font-semibold hover:opacity-80 transition-all"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-text-secondary uppercase tracking-widest">
            Step 1 of 3
          </span>
          <div className="w-24 h-1.5 bg-[#eae7e9] rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-[#2563EB] rounded-full"></div>
          </div>
        </div>
      </header>

      <main className="mt-24 mb-32 w-full max-w-4xl px-6 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-8 max-w-2xl">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full neumorphic-pill mb-4">
            <span
              className="material-symbols-outlined text-electric-blue text-sm mr-2"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              chat_bubble
            </span>
            <span className="text-[12px] font-semibold text-text-secondary uppercase tracking-widest">
              WhatsApp Activation
            </span>
          </div>
          <h1 className="text-3xl font-bold text-deep-navy mb-2">Activate Your Account</h1>
          <p className="text-base text-text-secondary leading-relaxed px-4">
            First, message our WhatsApp bot to connect your account and start receiving smart academic reminders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start w-full">
          {/* Left Column: Activation Card */}
          <div className="flex flex-col gap-8">
            <div className="neumorphic-raised rounded-[20px] p-8 flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#2563EB] font-bold">01</span>
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-deep-navy mb-1">
                    Message DueMate on WhatsApp
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Send the word <span className="font-bold text-deep-navy">hello</span> to activate your account.
                  </p>
                </div>
              </div>

              <div className="neumorphic-inset rounded-xl p-4 flex items-center justify-between bg-[#DCE8FF]/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600 text-sm">call</span>
                  </div>
                  <span className="text-lg font-bold tracking-tight text-deep-navy">{botNumber}</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="neumorphic-button-secondary px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:opacity-80 active:scale-95 transition-all text-sm font-semibold"
                >
                  <span className="material-symbols-outlined text-xs">
                    {copied ? "check" : "content_copy"}
                  </span>
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <a
                  className="neumorphic-button-primary h-[56px] w-full rounded-xl flex items-center justify-center gap-3 text-white font-semibold text-lg hover:brightness-110"
                  href={botChatLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="material-symbols-outlined">message</span>
                  <span>Open WhatsApp Chat ↗</span>
                </a>
                <button
                  onClick={onNext}
                  className="neumorphic-button-secondary h-[56px] w-full rounded-xl flex items-center justify-center gap-2 text-deep-navy font-semibold hover:bg-slate-100"
                >
                  <span>I've messaged the bot</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Trust Note */}
            <div className="bg-[#2563EB]/5 border border-white/40 rounded-xl p-5 flex items-start gap-4 text-left">
              <span
                className="material-symbols-outlined text-electric-blue"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                info
              </span>
              <p className="text-sm text-text-secondary leading-relaxed">
                DueMate uses WhatsApp to send reminders, updates, and academic insights. Your privacy is our priority—we only send what matters to your studies.
              </p>
            </div>
          </div>

          {/* Right Column: Smartphone Mockup */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-[300px] h-[600px] bg-deep-navy rounded-[48px] p-3 shadow-2xl overflow-hidden border-[6px] border-[#334155] text-left">
              {/* Screen Container */}
              <div className="w-full h-full bg-[#f0f2f5] rounded-[40px] overflow-hidden flex flex-col justify-between">
                {/* Chat Header */}
                <div className="bg-deep-navy text-white px-5 py-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <img
                      alt="Bot Avatar"
                      className="w-6 h-6 object-contain"
                      src="https://lh3.googleusercontent.com/aida/AP1WRLvbMejPu71LxcmoGoVKFx-KuuabxP3ZqgYCzVO-RzzfzDKS-bjKYHtl9vodmL-CeTlg2na7H7kYT0h8MzdW8x72dVdy6gQNLmH-8VHr0vZoQ1UJKfQzgztn13u3lyaM-_kuogfC9T-PPKAYSEpOkq6UeaJPXXLugGt2bdEaH8eOwDWPbOYCgRR4dV0re_HFaCne2aXjRN1kp9aPNbaNbG8syC1gWbA7CdcFH6YhJ-_fWXtdnYnNaMhtg0w"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-sm">DueMate AI</div>
                    <div className="text-[10px] text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      online
                    </div>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-4 flex flex-col gap-4">
                  <div className="self-center bg-gray-200/50 text-[10px] px-3 py-1 rounded-full text-gray-600 mb-2">
                    TODAY
                  </div>
                  {/* User Message */}
                  <div className="self-end max-w-[80%]">
                    <div className="chat-bubble-user px-4 py-2 text-sm">hello</div>
                    <div className="text-[10px] text-right text-gray-400 mt-1">10:24 AM</div>
                  </div>
                  {/* Bot Message */}
                  <div className="self-start max-w-[85%] flex items-end gap-2">
                    <div className="chat-bubble-bot px-4 py-3 text-sm leading-snug">
                      Welcome to <span className="font-bold">DueMate</span>! 🎓 <br />
                      <br />
                      Your account has been activated. I'll now start syncing your syllabus and deadlines.
                    </div>
                  </div>
                  {/* Typing Indicator */}
                  <div className="self-start flex gap-1 items-center mt-2 px-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>

                {/* Chat Input Mock */}
                <div className="p-3 bg-white flex items-center gap-2">
                  <div className="flex-1 h-10 bg-gray-100 rounded-full px-4 flex items-center text-gray-400 text-xs">
                    Message DueMate...
                  </div>
                  <div className="w-10 h-10 rounded-full bg-deep-navy flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">mic</span>
                  </div>
                </div>
              </div>
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-deep-navy rounded-b-2xl"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl px-6 py-10 mt-auto flex flex-col md:flex-row items-center justify-between border-t border-deep-navy/5">
        <p className="text-text-secondary text-sm mb-4 md:mb-0">
          © 2024 DueMate AI. Built for students.
        </p>
        <div className="flex items-center gap-8">
          <a
            className="text-xs font-semibold uppercase tracking-wider text-deep-navy hover:text-electric-blue transition-colors"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="text-xs font-semibold uppercase tracking-wider text-deep-navy hover:text-electric-blue transition-colors"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="text-xs font-semibold uppercase tracking-wider text-deep-navy hover:text-electric-blue transition-colors"
            href="#"
          >
            Help Center
          </a>
        </div>
      </footer>
    </div>
  );
}
