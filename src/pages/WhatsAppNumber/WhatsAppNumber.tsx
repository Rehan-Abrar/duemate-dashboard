import React, { useState } from "react";
import { authApi, ApiClientError } from "../../api";
import { isValidPhoneNumber, normalizePhoneNumber } from "../../auth";
import { Spinner } from "../../components/ui/spinner";

interface WhatsAppNumberProps {
  onBack: () => void;
  onNext: (phone: string) => void;
}

export function WhatsAppNumber({ onBack, onNext }: WhatsAppNumberProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Let's validate
    if (!phoneNumber.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Please enter a valid phone number (e.g. 03001234567).");
      return;
    }

    setIsLoading(true);

    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      await authApi.start({ phone_number: normalizedPhone });
      onNext(normalizedPhone);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to send OTP. Please verify your number and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-[#EAF0F8]">
      {/* Responsive Container */}
      <main className="w-full max-w-[390px] md:max-w-4xl min-h-[844px] md:min-h-0 flex flex-col relative overflow-hidden bg-[#EAF0F8] text-left md:flex-row md:items-center md:gap-12 md:py-12">
        {/* Left Side: Visual / Branding (Desktop Only) */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 p-8">
          <div className="w-48 h-48 rounded-full bg-[#2563EB]/10 absolute orb-pulse blur-2xl"></div>
          <div className="relative neumorphic-raised w-40 h-40 rounded-full flex flex-col items-center justify-center mb-8">
            <span
              className="material-symbols-outlined text-electric-blue text-[64px]"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              smart_toy
            </span>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-[#10B981] rounded-full border-[6px] border-[#EAF0F8] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px] font-bold">check</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-deep-navy text-center mb-4">Your Academic Companion</h2>
          <p className="text-lg text-text-secondary text-center max-w-sm">
            DueMate organizes your university life so you can focus on what matters.
          </p>
        </div>

        {/* Right Side: Form Area */}
        <div className="flex-1 flex flex-col w-full md:max-w-[440px] md:neumorphic-raised md:rounded-[32px] md:p-8">
          {/* TopAppBar */}
          <header className="flex justify-between items-center px-6 md:px-0 h-16 w-full z-50 sticky top-0 md:relative bg-[#EAF0F8]/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none md:mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="active:scale-95 transition-transform hover:opacity-80 p-2"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-electric-blue">arrow_back</span>
            </button>
            <span className="font-bold text-deep-navy text-lg">DueMate</span>
          </div>
          <div className="flex items-center">
            <span className="text-[12px] font-semibold text-text-secondary px-3 py-1 neumorphic-inset rounded-full">
              Step 2 of 3
            </span>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 px-6 py-8 flex flex-col gap-6">
          {/* Hero Section */}
          <section className="text-center flex flex-col items-center gap-2">
            <div className="px-4 py-1.5 rounded-full bg-[#DCE8FF] text-electric-blue text-[10px] font-bold uppercase tracking-wider mb-2">
              WhatsApp Verification
            </div>
            <h1 className="text-2xl font-bold text-deep-navy">Enter Your Number</h1>
            <p className="text-sm text-text-secondary max-w-[280px]">
              We'll send a verification code to your WhatsApp.
            </p>
          </section>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-4 text-sm text-[#EF4444]">
                {error}
              </div>
            )}

            {/* Phone Input Card */}
            <section className="neumorphic-raised rounded-[20px] p-5 flex flex-col gap-4">
              <label className="text-[12px] font-semibold text-text-secondary uppercase">
                WhatsApp Number
              </label>
              <div className="flex items-center neumorphic-inset rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB]/30 transition-all">
                <div className="flex items-center gap-1.5 pl-4 pr-3 h-14 border-r border-[#c6c6cd]/50 shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-text-secondary">call</span>
                  <span className="text-sm font-semibold text-deep-navy">+92</span>
                </div>
                <input
                  className="flex-1 h-14 px-3 border-none bg-transparent text-base text-deep-navy placeholder:text-[#c6c6cd] focus:outline-none transition-all min-w-0"
                  placeholder="3XX-XXXXXXX"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {/* Primary Action */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[48px] rounded-xl neumorphic-button-primary text-white text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform mt-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" color="white" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </section>
          </form>

          {/* Trust Info */}
          <section className="neumorphic-inset rounded-xl p-4 flex gap-4 items-start">
            <div className="bg-[#2563EB]/10 p-2 rounded-lg">
              <span className="material-symbols-outlined text-electric-blue text-[20px]">lock</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Your number is only used to connect your DueMate WhatsApp assistant and send academic reminders.
            </p>
          </section>

          {/* Visual Element / AI Assistant Orb (Mobile Only) */}
          <div className="mt-auto mb-6 flex justify-center relative md:hidden">
            <div className="w-24 h-24 rounded-full bg-[#2563EB]/10 absolute orb-pulse blur-xl"></div>
            <div className="relative neumorphic-raised w-20 h-20 rounded-full flex items-center justify-center">
              <span
                className="material-symbols-outlined text-electric-blue text-[40px]"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                smart_toy
              </span>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#10B981] rounded-full border-4 border-[#EAF0F8] flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="h-20 flex flex-col items-center justify-center gap-4 px-6 pb-4 md:absolute md:bottom-4 md:left-8 md:h-auto md:w-auto">
          <button
            onClick={onBack}
            className="text-sm font-semibold text-text-secondary hover:text-deep-navy transition-colors flex items-center gap-1 active:translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            Back
          </button>
          {/* Decorative line */}
          <div className="w-32 h-1.5 bg-[#c6c6cd]/30 rounded-full"></div>
        </footer>
        </div>
      </main>
    </div>
  );
}
