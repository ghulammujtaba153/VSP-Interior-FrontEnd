"use client";

import React, { useEffect, useState } from "react";
import Loader from "../loader/Loader";
import NoticeModal from "./NoticeModal";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const Notices = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Fetch all notices
  const fetchNotices = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/notices/get`);
      setData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleEdit = (notice) => {
    setSelectedNotice(notice);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedNotice(null);
    setOpenModal(false);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-4">
      <Card className="shadow-lg">
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h5" fontWeight="bold">
              Notices
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenModal(true)}
            >
              Add Notice
            </Button>
          </div>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>File</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.length > 0 ? (
                  data.map((notice, index) => (
                    <TableRow key={notice.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{notice.title}</TableCell>
                      <TableCell>{notice.content}</TableCell>
                      <TableCell>
                        {notice.status === "active" ? (
                          <span className="text-green-600 font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="text-red-500 font-medium">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {notice.fileUrl ? (
                          <a
                            href={`${BASE_URL}${notice.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View PDF
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleEdit(notice)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No notices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Modal for Add/Edit Notice */}
      <NoticeModal
        open={openModal}
        onClose={handleCloseModal}
        notice={selectedNotice}
        refresh={fetchNotices}
      />
    </div>
  );
};

export default Notices;
