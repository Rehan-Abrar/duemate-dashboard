import { useState } from "react";
import { Spinner } from "../../components/ui/spinner";

interface ProfileSetupProps {
  onComplete: (name: string) => void;
  onSkip: () => void;
}

export function ProfileSetup({ onComplete, onSkip }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isLoading) {
      setIsLoading(true);
      setTimeout(() => {
        onComplete(name.trim());
      }, 800);
    }
  };

  const handleSkip = () => {
    if (!isLoading) {
      setIsLoading(true);
      setTimeout(() => {
        onSkip();
      }, 600);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-on-surface items-center justify-start overflow-x-hidden bg-background md:justify-center">
      {/* Header / TopAppBar */}
      <header className="w-full h-16 flex items-center justify-center px-6 sticky top-0 bg-background/80 backdrop-blur-sm z-50 md:hidden">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <h1 className="font-headline-md text-[24px] leading-[1.3] font-bold text-secondary">DueMate</h1>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="w-full max-w-[390px] md:max-w-lg px-6 pb-8 flex flex-col items-center md:neumorphic-raised md:rounded-[32px] md:p-12 md:my-8">
        {/* Hero Section */}
        <section className="mt-8 flex flex-col items-center text-center w-full">
          <div className="neumorphic-pill-raised px-4 py-2 rounded-full flex items-center gap-2 mb-8 border border-white/40">
            <span className="material-symbols-outlined text-success text-[18px]">
              check_circle
            </span>
            <span className="text-[12px] uppercase tracking-wider font-semibold text-on-surface-variant">
              WhatsApp Connected
            </span>
          </div>
          <h2 className="text-[32px] leading-[1.2] font-bold text-primary mb-2">
            Welcome to DueMate
          </h2>
          <p className="text-[16px] leading-[1.5] text-on-surface-variant max-w-[280px]">
            Let's personalize your AI academic companion.
          </p>
        </section>

        {/* Modern Spacious Greeting Section */}
        <section className="w-full mt-10 mb-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-3xl neumorphic-raised flex items-center justify-center mb-6">
            <span
              className="material-symbols-outlined text-secondary text-[48px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              waving_hand
            </span>
          </div>
          <h3 className="text-[24px] leading-[1.3] font-bold text-primary mb-3">Hi there! 👋</h3>
          <p className="text-[16px] leading-[1.5] text-on-surface-variant px-4">
            I'm ready to help you manage your Riphah University semester. What should I call you?
          </p>
        </section>

        {/* Simplified Profile Form Card */}
        <section className="w-full mt-4">
          <div className="neumorphic-raised rounded-2xl p-5 w-full py-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Name Input */}
              <div className="flex flex-col gap-3">
                <label className="text-[12px] uppercase tracking-wider font-semibold text-on-surface-variant ml-1">
                  Full Name
                </label>
                <input
                  className="w-full h-14 px-5 rounded-xl neumorphic-inset border-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 text-[18px] font-medium placeholder:text-outline/50 bg-[#EAF0F8] disabled:opacity-50"
                  placeholder="Enter your name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </form>
          </div>
        </section>

        {/* Actions */}
        <section className="w-full mt-10 flex flex-col gap-4">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
            className="neumorphic-button-primary w-full h-14 rounded-xl text-white font-bold text-[20px] flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" color="white" />
                <span>Preparing Dashboard...</span>
              </div>
            ) : (
              "Get Started"
            )}
          </button>
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="w-full py-2 text-on-surface-variant text-[12px] uppercase tracking-wider font-semibold hover:text-secondary transition-colors text-center disabled:opacity-50"
          >
            Skip for now
          </button>
        </section>

        {/* Privacy Card */}
        <section className="w-full mt-8 mb-8">
          <div className="neumorphic-pill-raised p-4 rounded-2xl flex items-center gap-3 border border-white/30">
            <span className="material-symbols-outlined text-outline text-[20px] shrink-0">
              lock
            </span>
            <p className="text-[14px] text-on-surface-variant">
              Your information helps DueMate provide personalized reminders. We keep your data private and secure.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 mt-6 w-full">
            <button className="text-[12px] uppercase tracking-wider font-semibold text-outline hover:text-secondary transition-colors">
              Privacy Policy
            </button>
            <span className="text-outline text-[10px]">•</span>
            <button className="text-[12px] uppercase tracking-wider font-semibold text-outline hover:text-secondary transition-colors">
              Terms of Service
            </button>
            <span className="text-outline text-[10px]">•</span>
            <button className="text-[12px] uppercase tracking-wider font-semibold text-outline hover:text-secondary transition-colors">
              Help Center
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
