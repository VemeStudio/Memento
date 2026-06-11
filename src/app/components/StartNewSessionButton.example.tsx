/**
 * USAGE EXAMPLES FOR StartNewSessionButton
 *
 * This file demonstrates how to integrate the StartNewSessionButton
 * into different parts of your application.
 */

import { StartNewSessionButton } from "./StartNewSessionButton";
import { Settings } from "lucide-react";

/**
 * Example 1: Simple Settings Panel
 * A minimal settings panel with the session reset button
 */
export function SettingsPanelExample() {
  return (
    <div
      style={{
        maxWidth: 400,
        margin: "0 auto",
        padding: 24,
        background: "#FBFBF9",
        borderRadius: 16,
        border: "1px solid rgba(44,53,49,0.08)",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Settings size={18} color="#4A6B5D" strokeWidth={1.6} />
          <h2
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: "#2C3531",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Settings
          </h2>
        </div>
        <p style={{ fontSize: 13, color: "#7A8A84", margin: 0 }}>
          Manage your session and application preferences
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 600,
            color: "#7A8A84",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Session Management
        </label>

        {/* Basic usage */}
        <StartNewSessionButton />
      </div>

      <p
        style={{
          fontSize: 11,
          color: "#A8BCAF",
          marginTop: 12,
          fontStyle: "italic",
          lineHeight: 1.5,
        }}
      >
        Note: Starting a new session will clear all saved check statuses and refresh the application.
      </p>
    </div>
  );
}

/**
 * Example 2: Compact Mode in Dropdown Menu
 */
export function DropdownMenuExample() {
  return (
    <div
      style={{
        width: 240,
        background: "#FFFFFF",
        borderRadius: 14,
        padding: 12,
        boxShadow: "0 8px 24px rgba(44,53,49,0.12)",
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <button
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "transparent",
            border: "none",
            borderRadius: 8,
            textAlign: "left",
            cursor: "pointer",
            fontSize: 13,
            color: "#2C3531",
          }}
        >
          Account Settings
        </button>
        <button
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "transparent",
            border: "none",
            borderRadius: 8,
            textAlign: "left",
            cursor: "pointer",
            fontSize: 13,
            color: "#2C3531",
          }}
        >
          Notifications
        </button>
      </div>

      <div
        style={{
          height: 1,
          background: "rgba(44,53,49,0.08)",
          margin: "8px 0",
        }}
      />

      {/* Compact mode for smaller spaces */}
      <StartNewSessionButton compact />
    </div>
  );
}

/**
 * Example 3: Full Settings Page Section
 */
export function FullSettingsPageExample() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 32 }}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 500,
          color: "#2C3531",
          letterSpacing: "-0.03em",
          marginBottom: 8,
        }}
      >
        Application Settings
      </h1>
      <p style={{ fontSize: 14, color: "#7A8A84", marginBottom: 32 }}>
        Configure your preferences and manage your session
      </p>

      {/* Settings sections */}
      <div style={{ marginBottom: 32 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#2C3531",
            marginBottom: 16,
          }}
        >
          Data & Privacy
        </h3>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 14,
            padding: 20,
            border: "1px solid rgba(44,53,49,0.08)",
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#2C3531",
                marginBottom: 6,
              }}
            >
              Clear Session Data
            </p>
            <p
              style={{
                fontSize: 13,
                color: "#7A8A84",
                lineHeight: 1.6,
                marginBottom: 14,
              }}
            >
              Reset all check statuses and start fresh. This will clear your current
              session and reload the application.
            </p>

            <StartNewSessionButton />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 4: Modal Dialog Integration
 */
export function ModalDialogExample() {
  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(30,42,38,0.45)",
          backdropFilter: "blur(3px)",
          zIndex: 300,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          background: "#FAFCFA",
          borderRadius: 20,
          padding: "28px 28px 24px",
          width: "min(440px, 92vw)",
          zIndex: 301,
          boxShadow: "0 20px 60px rgba(30,42,38,0.22)",
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#2C3531",
            marginBottom: 12,
          }}
        >
          Session Options
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#7A8A84",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          Would you like to clear your current session and start over?
        </p>

        <StartNewSessionButton label="Reset & Start Fresh" />
      </div>
    </>
  );
}

/**
 * Example 5: Custom Styled Button
 */
export function CustomStyledExample() {
  return (
    <div style={{ padding: 24 }}>
      {/* You can apply custom className for additional styling */}
      <StartNewSessionButton
        className="custom-reset-btn"
        label="Clear All Progress"
        compact={false}
      />

      <style>{`
        .custom-reset-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(74,107,93,0.15);
        }
      `}</style>
    </div>
  );
}
