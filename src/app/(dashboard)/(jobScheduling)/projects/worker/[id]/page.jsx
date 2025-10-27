"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Tabs, Tab, Box, Button, Link } from "@mui/material";
import { toast } from "react-toastify";

import ProjectOverview from "@/components/project-ui/scheduling/project-details/ProjectOverview";
import CompletedTab from "@/components/project-ui/scheduling/project-details/employee/CompletedTab";
import TodayTab from "@/components/project-ui/scheduling/project-details/employee/TodayTab";
import WeekTab from "@/components/project-ui/scheduling/project-details/employee/WeekTab";
import Loader from "@/components/loader/Loader";
import { BASE_URL } from "@/configs/url";
import { useAuth } from '@/context/authContext';
import Kanban from "@/components/project-ui/scheduling/project-details/Kanban";

const Page = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [tasks, setTasks] = useState([]); // ✅ holds all kanban tasks
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const {user } = useAuth();
  const [totalTasks, setTotalTasks] = useState()

  

  // helper: normalize status for comparisons
  const normalizeStatus = (s) => (s || "").toString().toLowerCase();

  // 🧠 Fetch project
  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/job-scheduling/get/${id}`);
      setTotalTasks(res.data.job || res.data.jobs?.[0] || null)
      setData(res.data.job || res.data.jobs?.[0] || null);
    } catch (error) {
      toast.error("Error fetching project data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Fetch tasks
  const fetchTasks = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/project-kanban/job/${id}`);
    setTotalTasks(res.data)
    // Filter tasks where the logged-in user's email matches assignedWorker.email
    const data = res.data.filter(
      (task) => task.assignedWorker?.email === user?.email
    );

    setTasks(data || []);
  } catch (error) {
    toast.error("Error fetching kanban tasks");
    console.error(error);
  }
};


  useEffect(() => {
    if (id) {
      fetchProject();
      fetchTasks();
    }
  }, [id]);

  // show loader until project data is available
  if (loading || !data) return <Loader />;

  // 🧩 Date helpers
  const startOfDay = (d) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt.getTime();
  };
  const endOfDay = (d) => {
    const dt = new Date(d);
    dt.setHours(23, 59, 59, 999);
    return dt.getTime();
  };

  const now = new Date();
  const todayTsStart = startOfDay(now);
  const todayTsEnd = endOfDay(now);

  // Tasks that overlap today (start <= todayEnd && end >= todayStart)
  const todayTasks = tasks.filter((task) => {
    if (!task.startDate || !task.endDate) return false;
    const s = startOfDay(task.startDate);
    const e = endOfDay(task.endDate);
    return s <= todayTsEnd && e >= todayTsStart;
  });

  // Tasks overlapping next 7 days (including today)
  const weekRangeEnd = endOfDay(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const weekTasks = tasks.filter((task) => {
    if (!task.startDate || !task.endDate) return false;
    const s = startOfDay(task.startDate);
    const e = endOfDay(task.endDate);
    // overlap with [today, weekRangeEnd]
    return s <= weekRangeEnd && e >= todayTsStart;
  });

  // Completed tasks (accept various status naming)
  const completedTasks = tasks.filter((task) => {
    const st = normalizeStatus(task.status);
    return st === "complete" || st === "completed";
  });

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Button
              component={Link}
              href="/projects"
              variant="contained"
              sx={{ mb: 2 }}
            >
              Back
      </Button>
      {/* Project Info */}
      <Box sx={{ mb: 2 }}>
        <p className="text-lg font-semibold">Project ID: {id}</p>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        textColor="primary"
        indicatorColor="primary"
        aria-label="scrollable project tabs"
        sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
      >
        <Tab label="Overview" />
        <Tab label="Kanban" />
        <Tab label="Today" />
        <Tab label="This Week" />
        <Tab label="Completed" />
      </Tabs>

      {/* Tab Panels */}
      <Box sx={{ mt: 2 }}>
        {tab === 0 && <ProjectOverview data={data} />}
        {tab === 1 && <Kanban projectId={id} data={totalTasks} />}
        {tab === 2 && <TodayTab tasks={todayTasks} onStatusChange={fetchTasks} />}
        {tab === 3 && <WeekTab tasks={weekTasks} />}
        {tab === 4 && <CompletedTab tasks={completedTasks} />}
      </Box>
    </Box>
  );
};

export default Page;
