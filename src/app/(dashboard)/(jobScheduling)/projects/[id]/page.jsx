"use client";

import Loader from '@/components/loader/Loader';
import { BASE_URL } from '@/configs/url';
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Tabs,
  Tab,
  Typography
} from '@mui/material';
import Link from 'next/link';
import ProjectOverview from '@/components/project-ui/scheduling/project-details/ProjectOverview';
import Kanban from '@/components/project-ui/scheduling/project-details/Kanban';
import GanttChart from '@/components/project-ui/scheduling/project-details/GanttChart';
import CalenderView from '@/components/project-ui/scheduling/project-details/CalenderView';
import Notes from  "@/components/project-ui/scheduling/project-details/Notes"
import InventoryView from '@/components/project-ui/scheduling/project-details/InventoryView';
import Calender from '@/components/project-ui/scheduling/project-details/Calender';

const Page = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/job-scheduling/get/${id}`);
      setData(res.data.job || res.data.jobs?.[0]); // support both shapes
    } catch (error) {
      toast.error('Error fetching project data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  if (loading) return <Loader />;

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <Button
        component={Link}
        href="/projects"
        variant="contained"
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      {data ? (
        <>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab label="Overview" />
            <Tab label="Kanban" />
            <Tab label="Gantt Chart" />
            <Tab label="Calender View" />
            <Tab label="Inventory View" />
            <Tab label= "Notes"/>
            <Tab label="Resource View" />
          </Tabs>

          {tab === 0 && (
            <Box sx={{ mt: 2 }}>
              <ProjectOverview data={data} />
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ mt: 2 }}>
              <Kanban projectId={id} data={data}/>
            </Box>
          )}

          {tab === 2 && (
            <Box sx={{ mt: 2 }}>
              <GanttChart projectId={id} data={data}/>
            </Box>
          )}

          {tab === 3 && (
            <Box sx={{ mt: 2 }}>
              <CalenderView projectId={id} data={data}/>
            </Box>
          )}

          {
            tab === 4 && (
              <Box sx={{mt:2}}>
                <InventoryView projectId={id} data={data} />
              </Box>
            )
          }

          {
            tab === 5 && (
              <Box sx={{mt:2}}>
                <Notes projectId={id} data={data} />
                </Box>
            )
          }

          {tab === 6 && (
            <Box sx={{ mt: 2 }}>
              <Calender projectId={id} data={data}/>
            </Box>
          )}
        </>
      ) : (
        <Typography>No project data found.</Typography>
      )}
    </Box>
  );
};

export default Page;
