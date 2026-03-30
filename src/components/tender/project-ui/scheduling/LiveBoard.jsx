"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Avatar,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
  LinearProgress,
  Badge,
  Tooltip,
  IconButton
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import TodayIcon from "@mui/icons-material/Today";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import GroupIcon from "@mui/icons-material/Group";
import BuildIcon from "@mui/icons-material/Build";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { format, isToday, isBefore, differenceInDays } from "date-fns";

// Traffic light status dot
const StatusDot = ({ status }) => {
  const colors = {
    green: "#4caf50",
    amber: "#ff9800",
    red: "#f44336",
  };
  return (
    <Box
      sx={{
        width: 14,
        height: 14,
        borderRadius: "50%",
        bgcolor: colors[status] || colors.amber,
        boxShadow: `0 0 8px ${colors[status] || colors.amber}`,
        flexShrink: 0,
      }}
    />
  );
};

// Determine traffic light for a job
const getTrafficLight = (job) => {
  const now = new Date();
  const end = new Date(job.endDate);
  const daysLeft = differenceInDays(end, now);

  if (job.status === "completed") return "green";
  if (isBefore(end, now)) return "red"; // overdue
  if (daysLeft <= 3) return "amber"; // due soon
  return "green";
};

const getStatusLabel = (status) => {
  switch (status) {
    case "in-progress": return { label: "In Progress", color: "warning" };
    case "completed": return { label: "Completed", color: "success" };
    case "scheduled": return { label: "Scheduled", color: "info" };
    default: return { label: status, color: "default" };
  }
};

const LiveBoard = () => {
  const theme = useTheme();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/job-scheduling/get`);
      setJobs(res.data.jobs || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("LiveBoard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 60000); // auto-refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const todaysJobs = jobs.filter((j) => {
    const start = new Date(j.startDate);
    const end = new Date(j.endDate);
    const now = new Date();
    return start <= now && end >= now;
  });

  const nextJobs = jobs
    .filter((j) => new Date(j.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5);

  const delayedJobs = jobs.filter((j) => {
    const end = new Date(j.endDate);
    return isBefore(end, new Date()) && j.status !== "completed";
  });

  const allWorkers = jobs.flatMap((j) =>
    (j.workers || []).map((w) => ({
      ...w,
      projectName: j.projectSetup?.projectName || "N/A",
      jobStatus: j.status,
      jobId: j.id,
    }))
  );
  const uniqueWorkers = Object.values(
    allWorkers.reduce((acc, w) => {
      if (!acc[w.id]) acc[w.id] = w;
      return acc;
    }, {})
  );

  const statCards = [
    {
      label: "Active Today",
      value: todaysJobs.length,
      icon: <TodayIcon />,
      color: theme.palette.primary.main,
    },
    {
      label: "Up Next",
      value: nextJobs.length,
      icon: <SkipNextIcon />,
      color: theme.palette.info.main,
    },
    {
      label: "Delayed",
      value: delayedJobs.length,
      icon: <WarningAmberIcon />,
      color: theme.palette.error.main,
    },
    {
      label: "Crew On Site",
      value: uniqueWorkers.length,
      icon: <GroupIcon />,
      color: theme.palette.success.main,
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading Live Board...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            🔴 Live Board
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Factory &amp; Site operational view — auto-refreshes every 60s
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {format(lastRefreshed, "HH:mm:ss")}
          </Typography>
          <Tooltip title="Refresh now">
            <IconButton onClick={fetchJobs} size="small" color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 3,
              border: `1px solid ${alpha(stat.color, 0.15)}`,
              bgcolor: alpha(stat.color, 0.04),
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-3px)", boxShadow: `0 8px 20px ${alpha(stat.color, 0.12)}` },
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {stat.value}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(stat.color, 0.15), color: stat.color, width: 52, height: 52, borderRadius: 2 }}>
                  {stat.icon}
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Row 1: Today + Delays */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2}>
        {/* TODAY'S WORK */}
        <Card elevation={0} sx={{ flex: 1, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: "primary.main" }}><TodayIcon /></Avatar>}
            title={<Typography variant="h6" fontWeight="bold">Today's Work</Typography>}
            subheader={`${todaysJobs.length} active job${todaysJobs.length !== 1 ? "s" : ""}`}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          />
          <CardContent sx={{ p: 0 }}>
            {todaysJobs.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
                <Typography color="text.secondary">No jobs active today</Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {todaysJobs.map((job, i) => {
                  const light = getTrafficLight(job);
                  const { label, color } = getStatusLabel(job.status);
                  return (
                    <Box key={job.id}>
                      <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                        <ListItemIcon sx={{ minWidth: 36, mt: 0.8 }}>
                          <StatusDot status={light} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" fontWeight="bold">
                                {job.projectSetup?.projectName || "Unnamed Project"}
                              </Typography>
                              <Chip label={label} color={color} size="small" />
                            </Box>
                          }
                          secondary={
                            <Stack spacing={0.5} mt={0.5}>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <LocationOnIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                                <Typography variant="caption" color="text.secondary">{job.projectSetup?.siteLocation || "N/A"}</Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <GroupIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                                <Typography variant="caption" color="text.secondary">{job.workers?.length || 0} crew assigned</Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <AccessTimeIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                                <Typography variant="caption" color="text.secondary">Due: {format(new Date(job.endDate), "MMM d, yyyy")}</Typography>
                              </Box>
                            </Stack>
                          }
                        />
                      </ListItem>
                      {i < todaysJobs.length - 1 && <Divider variant="inset" component="li" />}
                    </Box>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>

        {/* DELAYS */}
        <Card elevation={0} sx={{ flex: 1, borderRadius: 3, border: `1px solid ${alpha(theme.palette.error.main, 0.15)}` }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: "error.main" }}><WarningAmberIcon /></Avatar>}
            title={<Typography variant="h6" fontWeight="bold">Delays &amp; Overdue</Typography>}
            subheader={`${delayedJobs.length} job${delayedJobs.length !== 1 ? "s" : ""} overdue`}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          />
          <CardContent sx={{ p: 0 }}>
            {delayedJobs.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
                <Typography color="text.secondary">All jobs on schedule 🎉</Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {delayedJobs.map((job, i) => {
                  const overdueDays = differenceInDays(new Date(), new Date(job.endDate));
                  return (
                    <Box key={job.id}>
                      <ListItem alignItems="flex-start" sx={{ py: 2, borderLeft: `4px solid ${theme.palette.error.main}` }}>
                        <ListItemIcon sx={{ minWidth: 36, mt: 0.8 }}><StatusDot status="red" /></ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" fontWeight="bold">{job.projectSetup?.projectName || "Unnamed"}</Typography>
                              <Chip label={`${overdueDays}d overdue`} color="error" size="small" variant="outlined" />
                            </Box>
                          }
                          secondary={
                            <Stack spacing={0.5} mt={0.5}>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <AccessTimeIcon sx={{ fontSize: 13, color: "error.main" }} />
                                <Typography variant="caption" color="error.main">Was due: {format(new Date(job.endDate), "MMM d, yyyy")}</Typography>
                              </Box>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <LocationOnIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                                <Typography variant="caption" color="text.secondary">{job.projectSetup?.siteLocation || "N/A"}</Typography>
                              </Box>
                            </Stack>
                          }
                        />
                      </ListItem>
                      {i < delayedJobs.length - 1 && <Divider variant="inset" component="li" />}
                    </Box>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Row 2: Next Jobs + Crew */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2}>
        {/* NEXT JOBS */}
        <Card elevation={0} sx={{ flex: 1, borderRadius: 3, border: `1px solid ${alpha(theme.palette.info.main, 0.15)}` }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: "info.main" }}><SkipNextIcon /></Avatar>}
            title={<Typography variant="h6" fontWeight="bold">Up Next</Typography>}
            subheader="Upcoming scheduled jobs"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          />
          <CardContent sx={{ p: 0 }}>
            {nextJobs.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <RadioButtonUncheckedIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                <Typography color="text.secondary">No upcoming jobs</Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {nextJobs.map((job, i) => {
                  const daysUntil = differenceInDays(new Date(job.startDate), new Date());
                  const light = daysUntil <= 2 ? "amber" : "green";
                  return (
                    <Box key={job.id}>
                      <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                        <ListItemIcon sx={{ minWidth: 36, mt: 0.8 }}><StatusDot status={light} /></ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" fontWeight="bold">{job.projectSetup?.projectName || "Unnamed"}</Typography>
                              <Chip label={daysUntil === 0 ? "Tomorrow" : `in ${daysUntil}d`} color={light === "amber" ? "warning" : "info"} size="small" />
                            </Box>
                          }
                          secondary={
                            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                              <AccessTimeIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                              <Typography variant="caption" color="text.secondary">Starts: {format(new Date(job.startDate), "MMM d, yyyy")}</Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {i < nextJobs.length - 1 && <Divider variant="inset" component="li" />}
                    </Box>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>

        {/* CREW ASSIGNMENTS */}
        <Card elevation={0} sx={{ flex: 1, borderRadius: 3, border: `1px solid ${alpha(theme.palette.success.main, 0.15)}` }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: "success.main" }}><GroupIcon /></Avatar>}
            title={<Typography variant="h6" fontWeight="bold">Crew Assignments</Typography>}
            subheader={`${uniqueWorkers.length} worker${uniqueWorkers.length !== 1 ? "s" : ""} across all jobs`}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          />
          <CardContent sx={{ p: 0 }}>
            {uniqueWorkers.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <GroupIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                <Typography color="text.secondary">No crew assigned</Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {uniqueWorkers.slice(0, 8).map((worker, i) => {
                  const initials = (worker.name || "?").split(" ").map((w) => w[0]).join("").toUpperCase();
                  return (
                    <Box key={worker.id}>
                      <ListItem sx={{ py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 44 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: "primary.main" }}>{initials}</Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight="medium">{worker.name}</Typography>}
                          secondary={
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <BuildIcon sx={{ fontSize: 12, color: "text.secondary" }} />
                              <Typography variant="caption" color="text.secondary">{worker.jobTitle || "Worker"} — {worker.projectName}</Typography>
                            </Box>
                          }
                        />
                        <Chip label={worker.jobStatus || "active"} size="small" color={getStatusLabel(worker.jobStatus).color} variant="outlined" />
                      </ListItem>
                      {i < Math.min(uniqueWorkers.length, 8) - 1 && <Divider variant="inset" component="li" />}
                    </Box>
                  );
                })}
                {uniqueWorkers.length > 8 && (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary">+ {uniqueWorkers.length - 8} more workers</Typography>
                  </Box>
                )}
              </List>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* TRAFFIC LIGHT STATUS — ALL JOBS */}
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: "secondary.main" }}><BuildIcon /></Avatar>}
              title={<Typography variant="h6" fontWeight="bold">All Projects — Traffic Light Status</Typography>}
              subheader={`${jobs.length} total projects`}
              sx={{ borderBottom: 1, borderColor: "divider" }}
            />
            <CardContent>
              <Grid container spacing={2}>
                {jobs.map((job) => {
                  const light = getTrafficLight(job);
                  const { label, color } = getStatusLabel(job.status);
                  const progress =
                    job.status === "completed"
                      ? 100
                      : job.status === "in-progress"
                      ? 55
                      : 10;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={job.id}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                          bgcolor: alpha(
                            light === "red"
                              ? theme.palette.error.main
                              : light === "amber"
                              ? theme.palette.warning.main
                              : theme.palette.success.main,
                            0.04
                          ),
                          borderLeft: `4px solid ${
                            light === "red"
                              ? theme.palette.error.main
                              : light === "amber"
                              ? theme.palette.warning.main
                              : theme.palette.success.main
                          }`,
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <StatusDot status={light} />
                            <Typography variant="subtitle2" fontWeight="bold" noWrap>
                              {job.projectSetup?.projectName || "Unnamed"}
                            </Typography>
                          </Box>
                          <Chip label={label} color={color} size="small" />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          color={color === "default" ? "primary" : color}
                          sx={{ height: 6, borderRadius: 3, mb: 1 }}
                        />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            {job.projectSetup?.siteLocation || "No site"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {job.workers?.length || 0} crew
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
    </Box>
  );
};

export default LiveBoard;
