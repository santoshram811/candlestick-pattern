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
  // dt: "18-07-2025 09:15"
  const [date, time] = dt.trim().split(" ");
  const [day, month, year] = date.split("-");
  // Ensure two-digit day and month
  const d = day.padStart(2, "0");
  const m = month.padStart(2, "0");
  return new Date(`${year}-${m}-${d}T${time}:00`);
}

export default function CandleChart({ timeFrame }) {
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [candles, setCandles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Papa.parse(csvMap[timeFrame], {
      download: true,
      header: true,
      skipEmptyLines: true,
      delimiter: "", // Let PapaParse auto-detect
      complete: (results) => {
        if (results.errors.length) {
          setError("CSV Parse Error");
        } else {
          const parsed = parseCSV(results.data);
          console.log("First 5 candles:", parsed.slice(0, 5));
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
            barThickness: 4, // Proper candle width
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
            color: "#1976d2",
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
            ticks: { color: "#555" },
            grid: { color: "#eee" },
          },
          y: {
            ticks: { color: "#555" },
            grid: { color: "#eee" },
          },
        },
      },
    });
    return () => chartInstance.destroy();
  }, [candles, timeFrame]);

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <canvas
        ref={chartRef}
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 16px #0001",
          width: "100%",
          height: "100%",
        }}
      />
      {loading && <div className="loading">Loading data...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
