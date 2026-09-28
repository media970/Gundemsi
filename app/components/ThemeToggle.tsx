"use client";

import { useEffect, useState } from "react";


const STORAGE_KEY = "gundemsi-theme";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {

    const savedTheme = window.localStorage.getItem(STORAGE_KEY);

    if (savedTheme === "dark") {
      document.documentElement.dataset.theme = "dark";
      setDark(true);
      return;
    }

    if (savedTheme === "light") {
      document.documentElement.dataset.theme = "light";
      setDark(false);
      return;
    }

    document.documentElement.dataset.theme = "light";
    setDark(false);
  }, []);

  function changeTheme() {
    const nextTheme = dark ? "light" : "dark";

    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    setDark(nextTheme === "dark");
  }

  return (
    <button
      type="button"
      aria-label={dark ? "Açık temaya geç" : "Koyu temaya geç"}
      title={dark ? "Açık temaya geç" : "Koyu temaya geç"}
onClick={changeTheme}
        style={{
        width: "42px",
        height: "42px",
        minWidth: "42px",
        minHeight: "42px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid var(--border)",
        borderRadius: "9999px",
        background: "var(--surface)",
        color: "var(--text)",
        cursor: "pointer",
        pointerEvents: "auto",
        touchAction: "manipulation",
        position: "relative",
        zIndex: 9999,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {dark ? (
<svg
  viewBox="0 0 24 24"
  width="20"
  height="20"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  style={{ pointerEvents: "none" }}
  aria-hidden="true"
>
          <circle cx="12" cy="12" r="4" />
          <path
            strokeLinecap="round"
            d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"
          />
        </svg>
      ) : (
<svg
  viewBox="0 0 24 24"
  width="20"
  height="20"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
  style={{ pointerEvents: "none" }}
  aria-hidden="true"
>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.5 15.2A8.5 8.5 0 018.8 3.5 8.5 8.5 0 1020.5 15.2z"
          />
        </svg>
      )}
    </button>
  );
}