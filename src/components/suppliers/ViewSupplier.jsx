"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  Stack,
  Box,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";

const ViewSupplier = ({ open, onClose, selectedSupplier }) => {
  if (!selectedSupplier) return null;

  const contacts = selectedSupplier.contacts || [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {/* Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        View Supplier
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="h6" gutterBottom>
            Supplier Details
          </Typography>

          <Typography variant="body1">
            <strong>Company Name:</strong> {selectedSupplier.companyName}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <EmailIcon fontSize="small" />
            <Typography variant="body1">{selectedSupplier.email}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <ContactPhoneIcon fontSize="small" />
            <Typography variant="body1">{selectedSupplier.phone}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOnIcon fontSize="small" />
            <Typography variant="body1">
              {selectedSupplier.address}, {selectedSupplier.postCode}
            </Typography>
          </Stack>

          {selectedSupplier.notes && (
            <Typography variant="body1">
              <strong>Notes:</strong> {selectedSupplier.notes}
            </Typography>
          )}

          <Typography variant="body2" color="textSecondary">
            <strong>Status:</strong> {selectedSupplier.status}
          </Typography>

          <Typography variant="body2" color="textSecondary">
            <strong>Created At:</strong>{" "}
            {new Date(selectedSupplier.createdAt).toLocaleString()}
          </Typography>

          {/* Divider */}
          {contacts.length > 0 && <Divider sx={{ my: 2 }} />}

          {/* Contacts Section */}
          {contacts.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Contacts
              </Typography>

              <Stack spacing={2}>
                {contacts.map((contact, index) => (
                  <Box
                    key={contact.id || index}
                    sx={{
                      p: 2,
                      border: "1px solid #ddd",
                      borderRadius: 2,
                    //   backgroundColor: "#f9f9f9",
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon fontSize="small" />
                        <Typography variant="body1">
                          {contact.firstName} {contact.lastName}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <EmailIcon fontSize="small" />
                        <Typography variant="body2">
                          {contact.emailAddress}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <ContactPhoneIcon fontSize="small" />
                        <Typography variant="body2">
                          {contact.phoneNumber}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewSupplier;
