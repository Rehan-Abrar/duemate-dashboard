/**
 * DueMate App
 *
 * Main application component with routing and auth state management.
 *
 * Onboarding flow (new users):
 *   landing → whatsapp-activation → whatsapp-number → otp → (authenticated)
 *
 * Returning users skip straight to the dashboard once the session is valid.
 */

import { useState, useEffect } from "react";
import { theme, generateCSSVariables } from "./theme";

// New AppShell and components
import { AppShell } from "./pages/AppShell";
import { ProfileSetup } from "./pages/ProfileSetup/ProfileSetup";

// New onboarding screens
import { Landing } from "./pages/Landing/Landing";
import { WhatsAppActivation } from "./pages/WhatsAppActivation/WhatsAppActivation";
import { WhatsAppNumber } from "./pages/WhatsAppNumber/WhatsAppNumber";
import { OTPVerification } from "./pages/OTPVerification/OTPVerification";

// Auth utilities
import {
  handleLoginSuccess as storeLoginData,
  getValidToken,
  clearAuth,
} from "./auth";
import { authApi } from "./api";
import type { AuthVerifyResponse } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STYLES (injected via <style> tag — keeps existing theme integration)
// ─────────────────────────────────────────────────────────────────────────────

const globalStyles = `
  ${generateCSSVariables()}

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${theme.fonts.body};
    background-color: ${theme.colors.surface};
    color: ${theme.colors.text};
    line-height: ${theme.lineHeights.normal};
  }

  input, button, select, textarea {
    font-family: inherit;
  }

  a {
    color: ${theme.colors.brand};
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: ${theme.colors.surface}; }
  ::-webkit-scrollbar-thumb { background: ${theme.colors.border}; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: ${theme.colors.borderLight}; }

  :focus-visible { outline: 2px solid ${theme.colors.focus}; outline-offset: 2px; }
  :focus:not(:focus-visible) { outline: none; }

  .app-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: ${theme.colors.surface};
  }

  .app-loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid ${theme.colors.border};
    border-top-color: ${theme.colors.brand};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
`;

import { RoundSpinner } from "./components/ui/spinner";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Top-level application screen.
 *
 * - loading           : Checking localStorage / verifying session with backend
 * - landing           : Marketing landing page (new/unauthenticated visitors)
 * - whatsapp-activation: Step 1 — instruct user to message the bot
 * - whatsapp-number   : Step 2 — collect the phone number and send OTP
 * - otp               : Step 3 — verify the 6-digit OTP
 * - authenticated     : Session valid → render Dashboard
 */
type Screen =
  | "loading"
  | "landing"
  | "whatsapp-activation"
  | "whatsapp-number"
  | "otp"
  | "profile-setup"
  | "authenticated";

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function App() {
  const [screen, setScreen] = useState<Screen>("loading");
  // phoneNumber is passed from WhatsAppNumber → OTPVerification
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [user, setUser] = useState<any>(null);

  // ── Check session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getValidToken();

      if (!token) {
        setScreen("landing");
        return;
      }

      try {
        const userResponse = await authApi.verifySession();
        setUser(userResponse);
        setScreen("authenticated");
      } catch {
        clearAuth();
        setScreen("landing");
      }
    };

    checkAuth();
  }, []);

  // ── Auth success handler (called by OTPVerification) ───────────────────
  const handleLoginSuccess = (response: AuthVerifyResponse) => {
    storeLoginData(response);
    setUser(response.user);
    if (!localStorage.getItem("duemate_user_name")) {
      setScreen("profile-setup");
    } else {
      setScreen("authenticated");
    }
  };

  // ── Logout ──────────────────────────────────────────────────────────────
  const handleLogout = () => {
    setScreen("landing");
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Global design-token styles */}
      <style>{globalStyles}</style>

      {/* Loading spinner */}
      {screen === "loading" && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#EAF0F8] gap-4">
          <RoundSpinner size="xl" color="blue" />
          <span className="text-sm font-semibold text-slate-600 animate-pulse">Loading DueMate...</span>
        </div>
      )}

      {/* Screen 1 — Landing */}
      {screen === "landing" && (
        <Landing onGetStarted={() => setScreen("whatsapp-activation")} />
      )}

      {/* Screen 2 — WhatsApp Activation (instruct user to message bot) */}
      {screen === "whatsapp-activation" && (
        <WhatsAppActivation
          onBack={() => setScreen("landing")}
          onNext={() => setScreen("whatsapp-number")}
        />
      )}

      {/* Screen 3 — Enter WhatsApp Number */}
      {screen === "whatsapp-number" && (
        <WhatsAppNumber
          onBack={() => setScreen("whatsapp-activation")}
          onNext={(phone) => {
            setPhoneNumber(phone);
            setScreen("otp");
          }}
        />
      )}

      {/* Screen 4 — OTP Verification */}
      {screen === "otp" && (
        <OTPVerification
          phoneNumber={phoneNumber}
          onBack={() => setScreen("whatsapp-number")}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* Screen 5 — Profile Setup */}
      {screen === "profile-setup" && (
        <ProfileSetup
          onComplete={(name) => {
            localStorage.setItem("duemate_user_name", name);
            setScreen("authenticated");
          }}
          onSkip={() => {
            setScreen("authenticated");
          }}
        />
      )}

      {/* Authenticated — AppShell */}
      {screen === "authenticated" && user && (
        <AppShell onLogout={handleLogout} user={user} />
      )}
    </>
  );
}

export default App;
