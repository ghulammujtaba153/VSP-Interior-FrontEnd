"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "@/configs/url";
import Loader from "../loader/Loader";
import * as XLSX from "xlsx"; // <-- Add XLSX for export

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TablePagination,
  IconButton,
  TextField,
} from "@mui/material";

import WorkerModal from "./WorkerModal";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import ImportCSV from "./ImportCSV";

const WorkerTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [search, setSearch] = useState("");

  // Pagination
  const [page, setPage] = useState(0); // <-- zero-based
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  // Import CSV
  const [openImport, setOpenImport] = useState(false);

  // Export Excel
  const handleExportExcel = async () => {
    try {
      toast.loading("Exporting workers...");
      // Fetch all workers (no pagination)
      const res = await axios.get(
        `${BASE_URL}/api/workers/get?page=1&limit=10000&search=${search}&status=${statusFilter}&jobTitle=${jobFilter}`
      );
      const workers = res.data.workers || [];
      if (workers.length === 0) {
        toast.dismiss();
        toast.info("No workers to export.");
        return;
      }
      // Format for Excel
      const formatted = workers.map(w => ({
        Name: w.name,
        Email: w.email,
        Phone: w.phone,
        Address: w.address,
        "Job Title": w.jobTitle,
        "Weekly Hours": w.weeklyHours,
        "Hourly Rate": w.hourlyRate,
        Status: w.status,
      }));
      const worksheet = XLSX.utils.json_to_sheet(formatted);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Workers");
      XLSX.writeFile(workbook, "Workers VSP.xlsx");
      toast.dismiss();
      toast.success("Workers exported successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Error exporting workers");
    }
  };

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/api/workers/get?page=${page + 1}&limit=${rowsPerPage}&search=${search}&status=${statusFilter}&jobTitle=${jobFilter}`
      );
      setData(res.data.workers);
      setTotalCount(res.data.total);
    } catch (error) {
      toast.error("Error in fetching workers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search, statusFilter, jobFilter]);

  if (loading) return <Loader />;

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id)=>{
    toast.loading("Processing...");
    try{
        await axios.delete(`${BASE_URL}/api/workers/delete/${id}`);
        toast.dismiss();
        toast.success("Worker deleted successfully");
        fetch();

    } catch (err){
        toast.dismiss();
        toast.error("Error in deleting worker");
    }
  }

  return (
    <Box p={2}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">
          Workers ({totalCount})
        </Typography>

        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            color="success"
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setOpenImport(true);
            }}
          >
            + Import
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedWorker(null);
              setViewMode(false);
              setOpenModal(true);
            }}
          >
            + Add Worker
          </Button>
        </Box>
      </Stack>

      {/* Filters + Search */}
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <TextField
          size="small"
          label="Search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0); // reset page when searching
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Job Title</InputLabel>
          <Select
            value={jobFilter}
            label="Job Title"
            onChange={(e) => {
              setJobFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            {[...new Set(data.map((w) => w.jobTitle))].map((title) => (
              <MenuItem key={title} value={title}>
                {title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 150 }}><b>Name</b></TableCell>
              <TableCell sx={{ minWidth: 150 }}><b>Email</b></TableCell>
              <TableCell><b>Phone</b></TableCell>
              <TableCell sx={{ minWidth: 250 }}><b>Address</b></TableCell>
              <TableCell><b>Job Title</b></TableCell>
              <TableCell><b>Weekly Hours</b></TableCell>
              <TableCell><b>Hourly Rate</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell sx={{ minWidth: 150 }}><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((worker) => (
                <TableRow key={worker.id || worker._id}>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell>{worker.email}</TableCell>
                  <TableCell>{worker.phone}</TableCell>
                  <TableCell>{worker.address}</TableCell>
                  <TableCell>{worker.jobTitle}</TableCell>
                  <TableCell>{worker.weeklyHours}</TableCell>
                  <TableCell>{worker.hourlyRate}</TableCell>
                  <TableCell>{worker.status}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedWorker(worker);
                        setViewMode(true);
                        setOpenModal(true);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedWorker(worker);
                        setViewMode(false);
                        setOpenModal(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => {
                        handleDelete(worker.id );
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>

                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No workers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </TableContainer>

      {/* Worker Modal */}
      {openModal && (
        <WorkerModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          refresh={fetch}
          edit={selectedWorker}
          view={viewMode}
        />
      )}

      {/* Import CSV Modal */}
      {openImport && (
        <ImportCSV
          open={openImport}
          onClose={() => setOpenImport(false)}
          fetchWorkers={fetch}
        />
      )}
    </Box>
  );
};

export default WorkerTable;
