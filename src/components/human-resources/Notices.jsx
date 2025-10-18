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
  IconButton,
  Tooltip,
  TablePagination,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const Notices = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch all notices
  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/notices/get`);
      const notices = res.data?.data || res.data || [];
      setData(notices);
      setPage(0);
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

  const handleDelete = async (noticeId) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    toast.loading("Deleting notice...");
    try {
      await axios.delete(`${BASE_URL}/api/notices/delete/${noticeId}`);
      toast.dismiss();
      toast.success("Notice deleted");
      // close modal if deleted item was open
      if (selectedNotice?.id === noticeId) {
        handleCloseModal();
      }
      fetchNotices();
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error("Failed to delete notice");
    }
  };

  // pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
                {paginatedData?.length > 0 ? (
                  paginatedData.map((notice, index) => (
                    <TableRow key={notice.id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
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
                        <Box display="flex" alignItems="center" gap={1}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEdit(notice)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(notice.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
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

          <TablePagination
            component="div"
            count={data.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{ mt: 1 }}
          />
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
