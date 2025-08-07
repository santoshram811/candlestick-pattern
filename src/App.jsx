import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import CandleChart from "./components/CandleChart";
import "./index.css";

export default function App() {
  const [timeFrame, setTimeFrame] = useState("1m");

  return (
    <div className="app-root">
      <Header />
      <div className="main-content">
        <Sidebar timeFrame={timeFrame} setTimeFrame={setTimeFrame} />
        <main className="chart-area">
          <CandleChart timeFrame={timeFrame} />
        </main>
      </div>
    </div>
  );
}
