import React from "react";

export default function Sidebar({ timeFrame, setTimeFrame }) {
  return (
    <aside className="sidebar">
      <h2>Time Frame</h2>
      <button
        className={timeFrame === "1m" ? "active" : ""}
        onClick={() => setTimeFrame("1m")}
      >
        1 Minute
      </button>
      <button
        className={timeFrame === "1s" ? "active" : ""}
        onClick={() => setTimeFrame("1s")}
      >
        1 Second
      </button>
    </aside>
  );
}
