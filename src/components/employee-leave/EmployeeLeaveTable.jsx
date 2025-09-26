"use client";

import Loader from '@/components/loader/Loader';
import { BASE_URL } from '@/configs/url';
import { useAuth } from '@/context/authContext';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, IconButton, TextField, TablePagination
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EmployeeLeaveModal from './EmployeeLeaveModal';
import { toast } from 'react-toastify';

const ROWS_PER_PAGE = 5;

const EmployeeLeaveTable = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editLeave, setEditLeave] = useState(null);
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/employee-leave/get/${user.id}`);
      setData(res.data.employeeLeave || res.data); // depends on API response
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    toast.loading("Please wait...");
    try {
      await axios.post(`${BASE_URL}/api/employee-leave/delete`, {
        id, userId: user.id
      });
        toast.dismiss();
        toast.success("Leave deleted successfully");
      fetchData();
    } catch (error) {
        toast.dismiss();
        toast.error("Error deleting leave");
      console.error("Error deleting leave:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Filtered data for search
  const filteredData = data.filter(
    (leave) =>
      leave.leaveType?.toLowerCase().includes(search.toLowerCase()) ||
      leave.status?.toLowerCase().includes(search.toLowerCase()) ||
      leave.reason?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const paginatedData = filteredData.slice(
    page * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE + ROWS_PER_PAGE
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Helper to calculate number of days between two dates (inclusive)
  const getNumDays = (start, end) => {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);
    // Calculate difference in milliseconds and convert to days, add 1 for inclusive
    const diffTime = endDate - startDate;
    return diffTime >= 0 ? Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1 : "";
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
          onClick={() => {
            setEditLeave(null);
            setOpen(true);
          }}
        >
          Request Leave
        </Button>
        <TextField
          size="small"
          placeholder="Search leave..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 220 }}
        />
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Leave Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>No. Days</TableCell> {/* Added column header */}
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell>{leave.leaveType}</TableCell>
                <TableCell>{leave.startDate}</TableCell>
                <TableCell>{leave.endDate}</TableCell>
                <TableCell>
                  {getNumDays(leave.startDate, leave.endDate)}
                </TableCell>
                <TableCell>{leave.status}</TableCell>
                <TableCell>{leave.reason}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setEditLeave(leave);
                      setOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(leave.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No leave records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={ROWS_PER_PAGE}
          rowsPerPageOptions={[ROWS_PER_PAGE]}
        />
      </TableContainer>

      {/* Leave Request/Edit Modal */}
      <EmployeeLeaveModal
        open={open}
        handleClose={() => {
          setOpen(false);
          setEditLeave(null);
        }}
        onLeaveAdded={fetchData}
        editLeave={editLeave}
      />
    </div>
  );
};

export default EmployeeLeaveTable;
