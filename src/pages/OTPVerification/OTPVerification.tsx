import React, { useState, useEffect, useRef } from "react";
import { authApi, ApiClientError } from "../../api";
import type { AuthVerifyResponse } from "../../types";
import { Spinner } from "../../components/ui/spinner";

interface OTPVerificationProps {
  phoneNumber: string;
  onBack: () => void;
  onSuccess: (response: AuthVerifyResponse) => void;
}

export function OTPVerification({ phoneNumber, onBack, onSuccess }: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes (600 seconds)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first input on load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for code expiry
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const formatCountdown = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when complete
    if (digit && index === 5 && newOtp.every((d) => d)) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split("");
      setOtp(digits);
      handleVerify(pasted);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otp.join("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.verify({
        phone_number: phoneNumber,
        otp: code,
      });
      onSuccess(response);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        // Reset code on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await authApi.start({ phone_number: phoneNumber });
      setCountdown(600);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to resend code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-[#EAF0F8] md:items-center">
      {/* Container */}
      <div className="w-full max-w-[390px] md:max-w-lg min-h-screen md:min-h-0 flex flex-col bg-[#EAF0F8] relative overflow-hidden pb-8 text-left md:neumorphic-raised md:rounded-[32px] md:p-4">
        {/* Header */}
        <header className="w-full h-16 flex items-center justify-between px-6 md:px-2 sticky top-0 bg-[#EAF0F8]/80 backdrop-blur-md z-50 md:relative md:bg-transparent md:backdrop-blur-none">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="active:scale-95 transition-transform hover:opacity-80 p-2"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-electric-blue">arrow_back</span>
            </button>
            <span className="font-bold text-deep-navy text-lg">DueMate</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Step 3 of 3
            </span>
            <div className="h-1 w-16 bg-[#c6c6cd] rounded-full mt-1 overflow-hidden">
              <div className="h-full w-full bg-[#2563EB]"></div>
            </div>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-1 px-6 md:px-2 flex flex-col pt-8">
          {/* Hero Section */}
          <section className="text-center flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-1.5 bg-[#DCE8FF] px-3 py-1 rounded-full mb-2">
              <span className="material-symbols-outlined text-[14px] text-electric-blue">
                verified_user
              </span>
              <span className="text-[10px] font-bold text-electric-blue uppercase tracking-wider">
                WhatsApp Verification
              </span>
            </div>
            <h1 className="text-2xl font-bold text-deep-navy">Enter Code</h1>
            <p className="text-sm text-text-secondary px-4">
              We sent a 6-digit code to your WhatsApp number: <br />
              <span className="font-bold text-deep-navy">{phoneNumber}</span>
            </p>
            <button
              onClick={onBack}
              className="mt-2 text-electric-blue font-semibold text-sm flex items-center justify-center gap-1 mx-auto hover:underline active:scale-95 transition-transform"
            >
              Change Number
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
          </section>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="flex flex-col gap-6"
          >
            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-4 text-sm text-[#EF4444] mt-4">
                {error}
              </div>
            )}

            {/* OTP Input Card */}
            <section className="mt-6 neumorphic-raised bg-[#EAF0F8] rounded-2xl p-6">
              <div
                className="flex justify-between items-center gap-2"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="otp-input w-11 h-14 bg-[#EAF0F8] border-none rounded-xl text-center text-xl font-bold text-deep-navy neumorphic-inset focus:ring-2 focus:ring-secondary transition-all"
                    maxLength={1}
                    pattern="\d*"
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={isLoading}
                  />
                ))}
              </div>
              {/* Timer */}
              <div className="mt-6 flex items-center justify-center gap-2 text-text-secondary">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                <span className="text-sm">
                  {countdown > 0 ? (
                    `Code expires in ${formatCountdown(countdown)}`
                  ) : (
                    <span className="text-red-500 font-bold">Code expired</span>
                  )}
                </span>
              </div>
            </section>

            {/* Primary Actions */}
            <section className="space-y-6">
              <button
                type="submit"
                disabled={isLoading || otp.some((d) => !d)}
                className="w-full h-[56px] bg-[#2563EB] text-white rounded-2xl font-bold flex items-center justify-center gap-2 neumorphic-raised hover:bg-[#1D4ED8] active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" color="white" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <span>Verify & Continue</span>
                )}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <div className="text-center">
                <p className="text-text-secondary text-sm">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading || countdown > 0}
                    className="text-electric-blue font-bold hover:underline ml-1 disabled:opacity-50 disabled:hover:no-underline"
                  >
                    Resend
                  </button>
                </p>
              </div>
            </section>
          </form>

          {/* Support / Info Card */}
          <section className="mt-auto pt-8">
            <div className="neumorphic-raised bg-[#EAF0F8]/50 p-5 rounded-2xl flex gap-4 items-start border border-white/40">
              <div className="bg-[#DCE8FF] p-2 rounded-xl">
                <span
                  className="material-symbols-outlined text-electric-blue"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  psychology
                </span>
              </div>
              <p className="text-[12px] leading-relaxed text-text-secondary font-medium">
                Your WhatsApp connection allows <span className="text-electric-blue font-bold">DueMate</span> to send assignment reminders, deadline alerts, and AI academic assistance.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
