"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../loader/Loader";
import { BASE_URL } from "@/configs/url";
import { Box, Alert, Stack, Typography } from "@mui/material";

const NotificationSection = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/notification/get`);
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeen = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/notification/seen/${id}`);
      fetchNotifications(); // refresh after marking
    } catch (error) {
      console.error("Error marking as seen:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader />;

  return (
    <Box>
      {notifications.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No notifications.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {notifications.map((n) => (
            <Alert
              key={n.id}
              severity="warning"
              onClick={() => handleSeen(n.id)}
              sx={{ cursor: "pointer" }}
            >
              {n.message}
            </Alert>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default NotificationSection;
