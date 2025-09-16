"use client";

import { useState } from "react";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

export default function GanttChart({ project }) {
  if (!project) return null;

  const [viewMode, setViewMode] = useState(ViewMode.Month);

  const tasks = [
    {
      id: "ShopDrawing",
      name: "Shop Drawing Submission",
      type: "task",
      start: new Date(project.shopDrawingSubmissionDate),
      end: new Date(project.siteMeasureDate),
      progress: 100,
      project: "Design",
    },
    {
      id: "Machining",
      name: "Machining",
      type: "task",
      start: new Date(project.machiningDate),
      end: new Date(project.assemblyDate),
      progress: 70,
      dependencies: ["ShopDrawing"],
      project: "Production",
    },
    {
      id: "Assembly",
      name: "Assembly",
      type: "task",
      start: new Date(project.assemblyDate),
      end: new Date(project.deliveryDate),
      progress: 30,
      dependencies: ["Machining"],
      project: "Production",
    },
    {
      id: "Delivery",
      name: "Delivery",
      type: "task",
      start: new Date(project.deliveryDate),
      end: new Date(project.installationDate),
      progress: 0,
      dependencies: ["Assembly"],
      project: "Logistics",
    },
    {
      id: "Installation",
      name: "Installation Phase",
      type: "task",
      start: new Date(project.installationDate),
      end: new Date(project.installPhaseDate),
      progress: 0,
      dependencies: ["Delivery"],
      project: "Installation",
    },
  ];

  const getBarStyle = (project) => {
    switch (project) {
      case "Design":
        return { backgroundColor: "#93c5fd" };
      case "Production":
        return { backgroundColor: "#86efac" };
      case "Logistics":
        return { backgroundColor: "#fde68a" };
      case "Installation":
        return { backgroundColor: "#fca5a5" };
      default:
        return {};
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      {/* Filter Controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode(ViewMode.Day)}
          className={`px-3 py-1 rounded ${
            viewMode === ViewMode.Day ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Weekly (Day + Date)
        </button>
        <button
          onClick={() => setViewMode(ViewMode.Month)}
          className={`px-3 py-1 rounded ${
            viewMode === ViewMode.Month
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Monthly
        </button>
        {/* <button
          onClick={() => setViewMode(ViewMode.QuarterYear)}
          className={`px-3 py-1 rounded ${
            viewMode === ViewMode.QuarterYear
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          All
        </button> */}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-2 text-sm">
        <span className="px-2 py-1 bg-blue-200 rounded">Design</span>
        <span className="px-2 py-1 bg-green-200 rounded">Production</span>
        <span className="px-2 py-1 bg-yellow-200 rounded">Logistics</span>
        <span className="px-2 py-1 bg-red-200 rounded">Installation</span>
      </div>

      {/* Gantt Chart */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <Gantt
            tasks={tasks.map((task) => ({
              ...task,
              styles: getBarStyle(task.project),
            }))}
            viewMode={viewMode}
            columnWidth={viewMode === ViewMode.Day ? 80 : 120} // wider for day+date
            listCellWidth="200px"
            locale="en-GB" // ensures day+date format like Mon 15
          />
        </div>
      </div>
    </div>
  );
}
