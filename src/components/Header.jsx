import React from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="header">
      <h1>NIFTY Candlestick Viewer</h1>
      <span className="subtitle">Development is under processing</span>
      <ThemeToggle />
    </header>
  );
}
