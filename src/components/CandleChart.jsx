import "chartjs-adapter-date-fns";
import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import zoomPlugin from "chartjs-plugin-zoom";
Chart.register(zoomPlugin);

import {
  CandlestickController,
  CandlestickElement,
} from "chartjs-chart-financial";
import Papa from "papaparse";
import { useTheme } from "../context/ThemeContext";

Chart.register(CandlestickController, CandlestickElement);

const csvMap = {
  "1m": "/nifty_1m.csv",
  "1s": "/nifty_1s.csv",
};

function parseCSV(data) {
  return data
    .filter(
      (row) =>
        row.open &&
        row.high &&
        row.low &&
        row.close &&
        row.datetime &&
        !isNaN(Number(row.open)) &&
        !isNaN(Number(row.high)) &&
        !isNaN(Number(row.low)) &&
        !isNaN(Number(row.close))
    )
    .map((row) => {
      const date = parseDate(row.datetime);
      return {
        x: date,
        o: Number(row.open),
        h: Number(row.high),
        l: Number(row.low),
        c: Number(row.close),
      };
    });
}

function parseDate(dt) {
  const [date, time] = dt.trim().split(" ");
  const [day, month, year] = date.split("-");
  const d = day.padStart(2, "0");
  const m = month.padStart(2, "0");
  return new Date(`${year}-${m}-${d}T${time}:00`);
}

export default function CandleChart({ timeFrame }) {
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [candles, setCandles] = useState([]);
  const [error, setError] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    setLoading(true);
    setError("");
    Papa.parse(csvMap[timeFrame], {
      download: true,
      header: true,
      skipEmptyLines: true,
      delimiter: "",
      complete: (results) => {
        if (results.errors.length) {
          setError("CSV Parse Error");
        } else {
          const parsed = parseCSV(results.data);
          setCandles(parsed);
        }
        setLoading(false);
      },
      error: () => {
        setError("Failed to load CSV");
        setLoading(false);
      },
    });
  }, [timeFrame]);

  useEffect(() => {
    if (!chartRef.current || !candles.length) return;
    const ctx = chartRef.current.getContext("2d");
    const chartInstance = new Chart(ctx, {
      type: "candlestick",
      data: {
        datasets: [
          {
            label: "NIFTY",
            data: candles,
            type: "candlestick",
            borderColor: "#333",
            borderWidth: 1,
            upColor: "#26a69a",
            downColor: "#ef5350",
            color: "#999",
            barThickness: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { left: 10, right: 10, top: 10, bottom: 10 },
        },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: `NIFTY Candlestick Chart (${
              timeFrame === "1m" ? "1 Minute" : "1 Second"
            })`,
            color: theme === "dark" ? "#fff" : "#1976d2",
            font: { size: 22 },
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
          zoom: {
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: "x",
            },
            pan: {
              enabled: true,
              mode: "x",
            },
          },
        },
        scales: {
          x: {
            type: "time",
            time: {
              unit: timeFrame === "1m" ? "minute" : "second",
              tooltipFormat: "MMM dd, yyyy HH:mm:ss",
            },
            ticks: { color: theme === "dark" ? "#eee" : "#555" },
            grid: { color: theme === "dark" ? "#333" : "#eee" },
          },
          y: {
            ticks: { color: theme === "dark" ? "#eee" : "#555" },
            grid: { color: theme === "dark" ? "#333" : "#eee" },
          },
        },
      },
    });
    return () => chartInstance.destroy();
  }, [candles, timeFrame, theme]);

  return (
    <div
      style={{
        height: "350px",
        width: "1200px",
        margin: "0 auto",
        maxWidth: "100%",
        background: "var(--chart-bg)", // Use theme variable
        borderRadius: 12,
        boxShadow: "0 2px 16px #0001",
        transition: "background 0.3s",
      }}
    >
      <canvas
        ref={chartRef}
        style={{
          background: "var(--chart-bg)", // Use theme variable
          borderRadius: 12,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
      {loading && <div className="loading">Loading data...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
