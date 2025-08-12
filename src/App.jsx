import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import CandleChart from "./components/CandleChart";
import { ThemeProvider } from "./context/ThemeContext";
import "./styles/index.css";
import "./styles/themes.css";

export default function App() {
  const [timeFrame, setTimeFrame] = useState("1m");

  return (
    <ThemeProvider>
      <div className="app-root">
        <Header />
        <div className="main-content">
          <Sidebar timeFrame={timeFrame} setTimeFrame={setTimeFrame} />
          <main className="chart-area">
            <CandleChart timeFrame={timeFrame} />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
