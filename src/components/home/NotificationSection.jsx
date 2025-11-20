"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../loader/Loader";
import { BASE_URL } from "@/configs/url";
import { Box, Alert, Stack, Typography, Button, IconButton } from "@mui/material";
import { useAuth } from '@/context/authContext'

const NotificationSection = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/notification/get`, {
        headers: {
          Authorization: `Bearer ${token}`,   
        }
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeen = async (id) => {
    try {
      await axios.put(`${BASE_URL}/api/notification/seen/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,   // or Authentication: "your value"
        }
      });
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
    <Box
      sx={{
        height: 400, // Fixed height
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "grey.50",
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Notifications ({notifications.length})
        </Typography>
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: notifications.length === 0 ? 2 : 0,
        }}
      >
        {notifications.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No notifications.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0}>
            {notifications?.map((n, index) => (
              <Alert
                key={n.id}
                severity="warning"
                sx={{
                  borderRadius: 0,
                  borderBottom: index < notifications.length - 1 ? 1 : 0,
                  borderColor: "divider",
                 
                }}
              >
                <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box sx={{ flex: 1, mr: 2 }}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(n.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSeen(n.id);
                    }}
                    sx={{
                      minWidth: "auto",
                      px: 2,
                      fontSize: "0.75rem",
                      flexShrink: 0,
                    }}
                  >
                    Mark as Seen
                  </Button>
                </Box>
              </Alert>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default NotificationSection;
