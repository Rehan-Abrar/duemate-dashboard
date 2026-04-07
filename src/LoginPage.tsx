/**
 * LoginPage Component
 * 
 * OTP-based authentication flow:
 * 1. User messages bot on WhatsApp to open 24h service window
 * 2. User enters phone number → receives OTP via WhatsApp
 * 3. User enters OTP → gets JWT tokens → redirects to dashboard
 */

import React, { useState } from "react";
import { theme } from "./theme";
import { authApi, ApiClientError } from "./api";
import {
  normalizePhoneNumber,
  isValidPhoneNumber,
  handleLoginSuccess,
} from "./auth";
import type { AuthVerifyResponse } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
    background: theme.colors.surface,
    fontFamily: theme.fonts.body,
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: theme.colors.surfaceElevated,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    boxShadow: theme.shadows.card,
  },
  logo: {
    fontSize: theme.fontSizes["3xl"],
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.brand,
    textAlign: "center" as const,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: "center" as const,
    marginBottom: theme.spacing["2xl"],
  },
  stepIndicator: {
    display: "flex",
    justifyContent: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  stepDot: {
    width: "8px",
    height: "8px",
    borderRadius: theme.radius.full,
    background: theme.colors.border,
    transition: theme.transitions.fast,
  },
  stepDotActive: {
    background: theme.colors.brand,
    width: "24px",
  },
  stepTitle: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fonts.display,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
    textAlign: "center" as const,
    marginBottom: theme.spacing.md,
  },
  stepDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: "center" as const,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.lineHeights.relaxed,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    display: "block",
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    width: "100%",
    padding: `${theme.spacing.md} ${theme.spacing.md}`,
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    outline: "none",
    transition: theme.transitions.fast,
    boxSizing: "border-box" as const,
  },
  inputFocused: {
    borderColor: theme.colors.brand,
    boxShadow: theme.shadows.focus,
  },
  button: {
    width: "100%",
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fonts.body,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.textInverse,
    background: theme.colors.brand,
    border: "none",
    borderRadius: theme.radius.md,
    cursor: "pointer",
    transition: theme.transitions.fast,
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  buttonSecondary: {
    background: "transparent",
    color: theme.colors.textMuted,
    border: `1px solid ${theme.colors.border}`,
    marginTop: theme.spacing.sm,
  },
  error: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    background: `${theme.colors.danger}20`,
    border: `1px solid ${theme.colors.danger}`,
    borderRadius: theme.radius.md,
    color: theme.colors.danger,
    fontSize: theme.fontSizes.sm,
  },
  botNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    background: theme.colors.surface,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
  },
  botNumberText: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fonts.mono,
    color: theme.colors.brand,
    fontWeight: theme.fontWeights.semibold,
  },
  copyButton: {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
    background: theme.colors.surfaceHover,
    border: "none",
    borderRadius: theme.radius.sm,
    cursor: "pointer",
  },
  botChatButton: {
    display: "block",
    width: "100%",
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    marginBottom: theme.spacing.md,
    textAlign: "center" as const,
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fonts.body,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.borderLight}`,
    borderRadius: theme.radius.md,
    textDecoration: "none",
    transition: theme.transitions.fast,
  },
  otpInputContainer: {
    display: "flex",
    gap: theme.spacing.sm,
    justifyContent: "center",
    marginBottom: theme.spacing.lg,
  },
  otpInput: {
    width: "48px",
    height: "56px",
    textAlign: "center" as const,
    fontSize: theme.fontSizes["2xl"],
    fontFamily: theme.fonts.mono,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text,
    background: theme.colors.surface,
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    outline: "none",
    transition: theme.transitions.fast,
  },
  countdown: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: "center" as const,
    marginTop: theme.spacing.md,
  },
  link: {
    color: theme.colors.brand,
    textDecoration: "none",
    cursor: "pointer",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface LoginPageProps {
  onLoginSuccess: (response: AuthVerifyResponse) => void;
  botNumber?: string;
  botChatLink?: string;
}

type Step = "activate" | "phone" | "otp";

export function LoginPage({
  onLoginSuccess,
  botNumber = "+92 316 7949401", // Replace with actual bot number
  botChatLink = "https://wa.link/w3qr5s",
}: LoginPageProps) {
  const [step, setStep] = useState<Step>("activate");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  // OTP input refs
  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  
  // Countdown timer for resend OTP
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  // Copy bot number to clipboard
  const copyBotNumber = async () => {
    try {
      await navigator.clipboard.writeText(botNumber.replace(/\s/g, ""));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      console.error("Failed to copy");
    }
  };
  
  // Handle phone number submission
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Please enter a valid phone number.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      await authApi.start({ phone_number: normalizedPhone });
      setCountdown(600); // 10 minutes
      setStep("otp");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Auto-submit when complete
    if (digit && index === 5 && newOtp.every((d) => d)) {
      handleVerifyOTP(newOtp.join(""));
    }
  };
  
  // Handle backspace in OTP input
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };
  
  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      handleVerifyOTP(pasted);
    }
  };
  
  // Verify OTP
  const handleVerifyOTP = async (otpCode?: string) => {
    const code = otpCode || otp.join("");
    if (code.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      const response = await authApi.verify({
        phone_number: normalizedPhone,
        otp: code,
      });
      
      handleLoginSuccess(response);
      onLoginSuccess(response);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      await authApi.start({ phone_number: normalizedPhone });
      setCountdown(600);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to resend OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format countdown as MM:SS
  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>📚 DueMate</div>
        <div style={styles.tagline}>Never miss another deadline</div>
        
        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          {(["activate", "phone", "otp"] as Step[]).map((s) => (
            <div
              key={s}
              style={{
                ...styles.stepDot,
                ...(step === s || (s === "activate" && step !== "activate")
                  ? styles.stepDotActive
                  : {}),
                ...(["phone", "otp"].indexOf(s) <= ["phone", "otp"].indexOf(step)
                  ? { background: theme.colors.brand }
                  : {}),
              }}
            />
          ))}
        </div>
        
        {/* Error Message */}
        {error && <div style={styles.error}>{error}</div>}
        
        {/* Step 1: Activate Bot */}
        {step === "activate" && (
          <>
            <div style={styles.stepTitle}>Activate Your Account</div>
            <div style={styles.stepDescription}>
              First, message our WhatsApp bot with "hello" to activate your
              account. This opens a 24-hour window for us to send you messages.
            </div>
            
            <div style={styles.botNumber}>
              <span style={styles.botNumberText}>{botNumber}</span>
              <button
                style={styles.copyButton}
                onClick={copyBotNumber}
                type="button"
              >
                {isCopied ? "✓ Copied" : "Copy"}
              </button>
            </div>

            <a
              href={botChatLink}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.botChatButton}
              aria-label="Open WhatsApp chat with the DueMate bot"
            >
              Open WhatsApp Chat ↗
            </a>
            
            <button
              style={styles.button}
              onClick={() => setStep("phone")}
              type="button"
            >
              I've messaged the bot →
            </button>
          </>
        )}
        
        {/* Step 2: Phone Number */}
        {step === "phone" && (
          <form onSubmit={handleRequestOTP}>
            <div style={styles.stepTitle}>Enter Your Number</div>
            <div style={styles.stepDescription}>
              We'll send a verification code to your WhatsApp.
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="phone">
                WhatsApp Number
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="03XX-XXXXXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onFocus={() => setFocusedInput("phone")}
                onBlur={() => setFocusedInput(null)}
                style={{
                  ...styles.input,
                  ...(focusedInput === "phone" ? styles.inputFocused : {}),
                }}
                autoFocus
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              style={{
                ...styles.button,
                ...(isLoading || !phoneNumber ? styles.buttonDisabled : {}),
              }}
              disabled={isLoading || !phoneNumber}
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </button>
            
            <button
              type="button"
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={() => setStep("activate")}
              disabled={isLoading}
            >
              ← Back
            </button>
          </form>
        )}
        
        {/* Step 3: OTP Verification */}
        {step === "otp" && (
          <>
            <div style={styles.stepTitle}>Enter Code</div>
            <div style={styles.stepDescription}>
              We sent a 6-digit code to your WhatsApp.
            </div>
            
            <div
              style={styles.otpInputContainer}
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onFocus={() => setFocusedInput(`otp-${index}`)}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.otpInput,
                    ...(focusedInput === `otp-${index}`
                      ? { borderColor: theme.colors.brand }
                      : {}),
                  }}
                  disabled={isLoading}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            
            <button
              type="button"
              style={{
                ...styles.button,
                ...(isLoading || otp.some((d) => !d)
                  ? styles.buttonDisabled
                  : {}),
              }}
              onClick={() => handleVerifyOTP()}
              disabled={isLoading || otp.some((d) => !d)}
            >
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </button>
            
            <div style={styles.countdown}>
              {countdown > 0 ? (
                <>Code expires in {formatCountdown(countdown)}</>
              ) : (
                <>
                  Didn't receive the code?{" "}
                  <span
                    style={styles.link}
                    onClick={handleResendOTP}
                  >
                    Resend
                  </span>
                </>
              )}
            </div>
            
            <button
              type="button"
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={() => {
                setStep("phone");
                setOtp(["", "", "", "", "", ""]);
                setError(null);
              }}
              disabled={isLoading}
            >
              ← Change Number
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
