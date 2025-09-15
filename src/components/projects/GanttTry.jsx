"use client";

import { Scheduler } from "@aldabil/react-scheduler";

export default function SchedulerTry() {
  const events = [
    {
      event_id: 1,
      title: "Task 1",
      start: new Date(),
      end: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
    {
      event_id: 2,
      title: "Task 2",
      start: new Date(),
      end: new Date(new Date().setDate(new Date().getDate() + 14)),
    },
  ];

  return (
    <div style={{ height: 600 }}>
      <Scheduler
        view="week"
        events={events}
        week={{
          startHour: 8,
          endHour: 20,
        }}
        month={{
          weekStartOn: 1,
        }}
      />
    </div>
  );
}
