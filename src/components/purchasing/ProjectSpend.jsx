import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { formatCurrency } from "./reportsUtils";

const ProjectSpend = ({ projectSpend }) => {
  if (!projectSpend || projectSpend.length === 0) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardHeader title="Project-wise Spend" />
        <CardContent>
          <Typography color="text.secondary">No project spend data available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader title="Project-wise Spend" />
      <CardContent>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Client</TableCell>
                <TableCell align="right">Total Spent</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectSpend.map((project, idx) => (
                <TableRow key={project.projectId || `general-${idx}`}>
                  <TableCell>
                    {project.projectName || "General Stock"}
                  </TableCell>
                  <TableCell>
                    {project.project?.client?.companyName || "N/A"}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(parseFloat(project.totalSpent || 0))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ProjectSpend;

