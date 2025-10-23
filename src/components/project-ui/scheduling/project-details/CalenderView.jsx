"use client";

import Loader from "@/components/loader/Loader";
import { BASE_URL } from "@/configs/url";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Typography, Box } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

const CalendarView = ({ projectId, data }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks from API
  const getTasks = async () => {
    if (!data?.id) return;

    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/project-kanban/job/${data.id}`);
      const tasksData = res.data || [];

      // Map backend tasks → FullCalendar events
      const calendarEvents = tasksData.map((task) => ({
        id: task.id,
        title: `${task.title} (${task.stage})`,
        start: task.startDate,
        end: task.endDate,
        extendedProps: {
          description: task.description,
          status: task.status,
          priority: task.priority,
          stage: task.stage,
        },
        backgroundColor:
          task.status === "completed"
            ? "#4caf50"
            : task.status === "inProgress"
            ? "#2196f3"
            : "#fbc02d",
        borderColor: "#fff",
      }));

      setTasks(calendarEvents);
      console.log("Calendar Events:", calendarEvents);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTasks();
  }, [data?.id]);

  if (loading) return <Loader />;

  return (
    <Box className="bg-white p-4 rounded shadow">
      <Typography variant="h6" gutterBottom>
        📅 Calendar View
      </Typography>

      {tasks.length === 0 ? (
        <Typography color="textSecondary" align="center" sx={{ mt: 4 }}>
          No tasks found for this project
        </Typography>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          height="80vh"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
          }}
          events={tasks}
          eventClick={(info) => {
            const { title, extendedProps } = info.event;
            toast.info(
              `${title}\nStage: ${extendedProps.stage}\nStatus: ${extendedProps.status}\nPriority: ${extendedProps.priority}`,
              { autoClose: 4000 }
            );
          }}
          eventDisplay="block"
        />
      )}
    </Box>
  );
};

export default CalendarView;
