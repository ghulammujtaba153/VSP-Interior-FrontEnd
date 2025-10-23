"use client"

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';

const ProjectOverview = ({ data }) => {
  const project = data.projectSetup || {};
  const client = project.client || {};
  const rates = project.rates || [];
  const materials = project.materials || [];
  const variations = project.variations || [];
  const amends = project.amends || [];
  const workers = data.workers || [];

  return (
    <Card sx={{ mt: 2, p: 2 }}>
      <CardContent>
        {/* Project Details */}
        <Typography variant="h6" gutterBottom>Project Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Project Name:</strong> {project.projectName}</Typography>
            <Typography><strong>Location:</strong> {project.siteLocation}</Typography>
            <Typography><strong>Status:</strong> {project.status}</Typography>
            <Typography><strong>Revision:</strong> {project.revision}</Typography>
            <Typography><strong>Start Date:</strong> {new Date(data.startDate).toLocaleDateString()}</Typography>
            <Typography><strong>End Date:</strong> {new Date(data.endDate).toLocaleDateString()}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>QS Name:</strong> {project.qsName}</Typography>
            <Typography><strong>QS Phone:</strong> {project.qsPhone}</Typography>
            <Typography><strong>Notes:</strong> {project.accessNotes}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Client Info */}
        <Typography variant="h6" gutterBottom>Client Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Company:</strong> {client.companyName}</Typography>
            <Typography><strong>Email:</strong> {client.emailAddress}</Typography>
            <Typography><strong>Phone:</strong> {client.phoneNumber}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Address:</strong> {client.address}</Typography>
            <Typography><strong>Post Code:</strong> {client.postCode}</Typography>
            <Typography><strong>Status:</strong> {client.accountStatus}</Typography>
          </Grid>
        </Grid>

        {/* Rates Table */}
        {/* {rates.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Rates</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Markup</TableCell>
                    <TableCell>Sell</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>{rate.type}</TableCell>
                      <TableCell>{rate.cost}</TableCell>
                      <TableCell>{rate.markup}</TableCell>
                      <TableCell>{rate.sell}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )} */}

        {/* Materials Table */}
        {/* {materials.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Materials</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Finish Material</TableCell>
                    <TableCell>Material Type</TableCell>
                    <TableCell>Measure</TableCell>
                    <TableCell>Material Cost</TableCell>
                    <TableCell>Edging Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materials.map((mat) => (
                    <TableRow key={mat.id}>
                      <TableCell>{mat.finishMaterial}</TableCell>
                      <TableCell>{mat.materialType}</TableCell>
                      <TableCell>{mat.measure}</TableCell>
                      <TableCell>{mat.materialCost}</TableCell>
                      <TableCell>{mat.edgingCost}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )} */}

        {/* Variations */}
        {/* {variations.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Variations</Typography>
            <Typography>{JSON.stringify(variations, null, 2)}</Typography>
          </>
        )} */}

        {/* Amends */}
        {amends.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Amends</Typography>
            <Typography>{JSON.stringify(amends, null, 2)}</Typography>
          </>
        )}

        {/* Workers */}
        {workers.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>Assigned Workers</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Assigned Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workers.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell>{worker.name}</TableCell>
                      <TableCell>{worker.email}</TableCell>
                      <TableCell>{worker.jobTitle}</TableCell>
                      <TableCell>{worker.ProjectSetupJobWorker?.hoursAssigned ?? 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectOverview;
