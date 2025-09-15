"use client";

import React from "react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

export default function GanttTry() {
  const tasks = [
    {
      id: "1",
      name: "Task 1",
      start: new Date(),
      end: new Date(new Date().setDate(new Date().getDate() + 7)),
      type: "task",
      progress: 50,
    },
    {
      id: "2",
      name: "Task 2",
      start: new Date(),
      end: new Date(new Date().setDate(new Date().getDate() + 14)),
      type: "task",
      progress: 20,
    },
  ];

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <Gantt tasks={tasks} viewMode={ViewMode.Week} />
    </div>
  );
}
