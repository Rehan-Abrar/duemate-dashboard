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

import { useState, useEffect, lazy, Suspense } from "react";
import { theme, generateCSSVariables } from "./theme";

// Eager imports - small and needed for initialization
import { RoundSpinner } from "./components/ui/spinner";
import {
  handleLoginSuccess as storeLoginData,
  getValidToken,
  clearAuth,
} from "./auth";
import { authApi } from "./api";
import type { AuthVerifyResponse } from "./types";

// Lazy imports - page-level code splitting
// Using wrapper to convert named exports to default exports for React.lazy
const AppShell = lazy(() => import("./pages/AppShell").then(m => ({ default: m.AppShell })));
const ProfileSetup = lazy(() => import("./pages/ProfileSetup/ProfileSetup").then(m => ({ default: m.ProfileSetup })));
const Landing = lazy(() => import("./pages/Landing/Landing").then(m => ({ default: m.Landing })));
const WhatsAppActivation = lazy(() => import("./pages/WhatsAppActivation/WhatsAppActivation").then(m => ({ default: m.WhatsAppActivation })));
const WhatsAppNumber = lazy(() => import("./pages/WhatsAppNumber/WhatsAppNumber").then(m => ({ default: m.WhatsAppNumber })));
const OTPVerification = lazy(() => import("./pages/OTPVerification/OTPVerification").then(m => ({ default: m.OTPVerification })));

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

  @media (prefers-reduced-motion: reduce) {
    html:focus-within { scroll-behavior: auto; }
  }

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

// Loading fallback for Suspense boundaries
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#EAF0F8] gap-4">
      <RoundSpinner size="xl" color="blue" />
      <span className="text-sm font-semibold text-slate-600 animate-pulse">Loading...</span>
    </div>
  );
}

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
        <Suspense fallback={<PageLoader />}>
          <Landing onGetStarted={() => setScreen("whatsapp-activation")} />
        </Suspense>
      )}

      {/* Screen 2 — WhatsApp Activation (instruct user to message bot) */}
      {screen === "whatsapp-activation" && (
        <Suspense fallback={<PageLoader />}>
          <WhatsAppActivation
            onBack={() => setScreen("landing")}
            onNext={() => setScreen("whatsapp-number")}
          />
        </Suspense>
      )}

      {/* Screen 3 — Enter WhatsApp Number */}
      {screen === "whatsapp-number" && (
        <Suspense fallback={<PageLoader />}>
          <WhatsAppNumber
            onBack={() => setScreen("whatsapp-activation")}
            onNext={(phone) => {
              setPhoneNumber(phone);
              setScreen("otp");
            }}
          />
        </Suspense>
      )}

      {/* Screen 4 — OTP Verification */}
      {screen === "otp" && (
        <Suspense fallback={<PageLoader />}>
          <OTPVerification
            phoneNumber={phoneNumber}
            onBack={() => setScreen("whatsapp-number")}
            onSuccess={handleLoginSuccess}
          />
        </Suspense>
      )}

      {/* Screen 5 — Profile Setup */}
      {screen === "profile-setup" && (
        <Suspense fallback={<PageLoader />}>
          <ProfileSetup
            onComplete={(name) => {
              localStorage.setItem("duemate_user_name", name);
              setScreen("authenticated");
            }}
            onSkip={() => {
              setScreen("authenticated");
            }}
          />
        </Suspense>
      )}

      {/* Authenticated — AppShell */}
      {screen === "authenticated" && user && (
        <Suspense fallback={<PageLoader />}>
          <AppShell onLogout={handleLogout} user={user} />
        </Suspense>
      )}
    </>
  );
}

export default App;
