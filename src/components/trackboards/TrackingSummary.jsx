"use client";

import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Stack,
  Avatar,
  alpha,
  useTheme,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EngineeringIcon from "@mui/icons-material/Engineering";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const StatCard = ({ title, value, icon, color, subtitle }) => {
  const theme = useTheme();
  return (
    <Card
      elevation={0}
      sx={{
        flex: 1,
        borderRadius: 3,
        border: `1px solid ${alpha(color, 0.15)}`,
        bgcolor: alpha(color, 0.04),
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 8px 20px ${alpha(color, 0.12)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
            >
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ my: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.15),
              color: color,
              width: 52,
              height: 52,
              borderRadius: 2,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'in-progress': return 'warning';
    case 'completed': return 'success';
    case 'scheduled': return 'info';
    default: return 'default';
  }
};

const TrackingSummary = ({ projects = [] }) => {
  const theme = useTheme();

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    scheduled: projects.filter(p => p.status === 'scheduled').length,
    totalWorkers: projects.reduce((acc, p) => acc + (p.workers?.length || 0), 0),
  };

  const progressPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>

      {/* Stat Cards Row — Stack with flex:1 for full width */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <StatCard
          title="Total Projects"
          value={stats.total}
          icon={<AssignmentIcon fontSize="large" />}
          color={theme.palette.primary.main}
          subtitle="All projects in system"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<EngineeringIcon fontSize="large" />}
          color={theme.palette.warning.main}
          subtitle="Currently active sites"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<DoneAllIcon fontSize="large" />}
          color={theme.palette.success.main}
          subtitle="Successfully finished"
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduled}
          icon={<AccessTimeIcon fontSize="large" />}
          color={theme.palette.info.main}
          subtitle="Awaiting start"
        />
      </Stack>

      {/* Row 2: Completion Overview + Recent Projects */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2}>

        {/* Completion Overview */}
        <Card elevation={0} sx={{ flex: 1, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><TrendingUpIcon /></Avatar>}
            title={<Typography variant="h6" fontWeight="bold">Project Completion Overview</Typography>}
            subheader="Overall performance metrics"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          />
          <CardContent>
            {/* Progress bar */}
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>Overall Completion Rate</Typography>
                <Typography variant="body2" fontWeight={600} color="primary.main">
                  {Math.round(progressPercentage)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  '& .MuiLinearProgress-bar': { borderRadius: 5 },
                }}
              />
            </Box>

            {/* Mini stat icons */}
            <Stack direction="row" spacing={2} justifyContent="space-around">
              {[
                { icon: <TrendingUpIcon />, label: 'Total', value: stats.total, color: 'primary' },
                { icon: <EngineeringIcon />, label: 'Active', value: stats.inProgress, color: 'warning' },
                { icon: <DoneAllIcon />, label: 'Done', value: stats.completed, color: 'success' },
                { icon: <GroupIcon />, label: 'Workers', value: stats.totalWorkers, color: 'info' },
              ].map(({ icon, label, value, color }) => (
                <Box
                  key={label}
                  sx={{
                    textAlign: 'center',
                    p: 1.5,
                    flex: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette[color].main, 0.06),
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette[color].main, 0.15),
                      color: `${color}.main`,
                      width: 36,
                      height: 36,
                      mx: 'auto',
                      mb: 0.5,
                    }}
                  >
                    {icon}
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">{value}</Typography>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Recent Projects List */}
        <Card elevation={0} sx={{ flex: 1, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}><AssignmentIcon /></Avatar>}
            title={<Typography variant="h6" fontWeight="bold">Recent Projects</Typography>}
            subheader={`${recentProjects.length} most recent`}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          />
          <CardContent sx={{ p: 0 }}>
            {recentProjects.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <AssignmentIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography color="text.secondary">No projects yet</Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {recentProjects.map((project, i) => (
                  <Box key={project.id}>
                    <ListItem
                      sx={{
                        py: 1.5,
                        borderLeft: '3px solid',
                        borderColor: `${getStatusColor(project.status)}.main`,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" fontWeight="medium" noWrap sx={{ flex: 1, mr: 1 }}>
                              {project.projectSetup?.projectName || project.name || 'Unnamed Project'}
                            </Typography>
                            <Chip
                              label={project.status || 'N/A'}
                              color={getStatusColor(project.status)}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                            <GroupIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {project.workers?.length || 0} workers
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {i < recentProjects.length - 1 && <Divider variant="inset" component="li" />}
                  </Box>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Efficiency Banner */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Tracking Efficiency
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {stats.inProgress} active project{stats.inProgress !== 1 ? 's' : ''} requiring attention today. Keep the momentum!
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 2.5, py: 1.5 }}>
                <Typography variant="h4" fontWeight="bold">{Math.round(progressPercentage)}%</Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>Complete</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, px: 2.5, py: 1.5 }}>
                <Typography variant="h4" fontWeight="bold">{stats.totalWorkers}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>Workers</Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />
        <Box sx={{ position: 'absolute', bottom: -40, right: 80, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
      </Card>

    </Box>
  );
};

export default TrackingSummary;
