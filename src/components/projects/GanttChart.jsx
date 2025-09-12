"use client";
import { useState } from "react";
import { Chart } from "react-google-charts";

export default function GanttChart({ project }) {
  if (!project) return null;

  const [viewMode, setViewMode] = useState("all"); // all | weekly | monthly

  // Google Gantt expects columns
  const columns = [
    { type: "string", label: "Task ID" },
    { type: "string", label: "Task Name" },
    { type: "string", label: "Resource" },
    { type: "date", label: "Start Date" },
    { type: "date", label: "End Date" },
    { type: "number", label: "Duration" },
    { type: "number", label: "Percent Complete" },
    { type: "string", label: "Dependencies" },
  ];

  // Project timeline rows
  const rows = [
    [
      "ShopDrawing",
      "Shop Drawing Submission",
      "Design",
      new Date(project.shopDrawingSubmissionDate),
      new Date(project.siteMeasureDate),
      null,
      100,
      null,
    ],
    [
      "Machining",
      "Machining",
      "Production",
      new Date(project.machiningDate),
      new Date(project.assemblyDate),
      null,
      70,
      "ShopDrawing",
    ],
    [
      "Assembly",
      "Assembly",
      "Production",
      new Date(project.assemblyDate),
      new Date(project.deliveryDate),
      null,
      30,
      "Machining",
    ],
    [
      "Delivery",
      "Delivery",
      "Logistics",
      new Date(project.deliveryDate),
      new Date(project.installationDate),
      null,
      0,
      "Assembly",
    ],
    [
      "Installation",
      "Installation Phase",
      "Installation",
      new Date(project.installationDate),
      new Date(project.installPhaseDate),
      null,
      0,
      "Delivery",
    ],
  ];

  // Filter logic
  const today = new Date();
  let filteredRows = rows;
  const isValidDate = (d) => d instanceof Date && !isNaN(d);

  if (viewMode === "weekly") {
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    filteredRows = rows.filter((row) => {
      const start = row[3];
      const end = row[4];
      return (
        isValidDate(start) &&
        isValidDate(end) &&
        start <= nextWeek &&
        end >= today
      );
    });
  } else if (viewMode === "monthly") {
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    filteredRows = rows.filter((row) => {
      const start = row[3];
      const end = row[4];
      return (
        isValidDate(start) &&
        isValidDate(end) &&
        start <= nextMonth &&
        end >= today
      );
    });
  }

  const data = [columns, ...filteredRows];

  const options = {
    height: 500,
    gantt: {
      trackHeight: 35,
      criticalPathEnabled: true, // highlight tasks with no slack
      barCornerRadius: 4,
      arrow: {
        angle: 70,
        width: 2,
        color: "#555",
        radius: 0,
      },
    },
    tooltip: { isHtml: true },
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      {/* Filter Controls */}
      <div className="flex gap-2 mb-4">
        {["all", "weekly", "monthly"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1 rounded capitalize ${
              viewMode === mode ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-2 text-sm">
        <span className="px-2 py-1 bg-blue-200 rounded">Design</span>
        <span className="px-2 py-1 bg-green-200 rounded">Production</span>
        <span className="px-2 py-1 bg-yellow-200 rounded">Logistics</span>
        <span className="px-2 py-1 bg-red-200 rounded">Installation</span>
      </div>

      {/* Scrollable X-axis */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <Chart
            chartType="Gantt"
            width="100%"
            height="500px"
            data={data}
            options={options}
            loader={<div>Loading Gantt Chart...</div>}
          />
        </div>
      </div>
    </div>
  );
}
