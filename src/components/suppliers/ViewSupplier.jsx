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
  Grid,
  Paper,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import NotesIcon from "@mui/icons-material/Notes";
import AccessTimeIcon from "@mui/icons-material/AccessTime";


const ViewSupplier = ({ open, onClose, selectedSupplier }) => {
  const capitalizeName = (name) => {
    if (!name) return 'N/A';
    return String(name)
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (!selectedSupplier) return null;

  const contacts = selectedSupplier.contacts || [];

  const InfoRow = ({ icon: Icon, label, value, color }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        py: 1,
      }}
    >
      <Box
        sx={{
          minWidth: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.04)' : 'rgba(144, 202, 249, 0.08)',
          color: "primary.main",
          borderRadius: 1,
          flexShrink: 0,
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Box flex={1}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            textTransform: "uppercase",
            fontWeight: 600,
            fontSize: "0.7rem",
            letterSpacing: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mt: 0.5,
            fontWeight: 500,
            wordBreak: "break-word",
            color: color || "text.primary",
          }}
        >
          {value || "N/A"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          pb: 2,
          pt: 3,
          px: 3,
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <BusinessIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {capitalizeName(selectedSupplier.companyName) || "Supplier Details"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Supplier profile and contact information
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)", "&:hover": { bgcolor: "rgba(255,255,255,0.25)" } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Supplier Info */}
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "primary.main",
              mb: 2,
            }}
          >
            <BusinessIcon />
            Supplier Information
          </Typography>

          <Paper
            variant="outlined"
            sx={{ borderRadius: 2, p: 3, bgcolor: "background.paper" }}
          >

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoRow
                  icon={BusinessIcon}
                  label="Name"
                  value={capitalizeName(selectedSupplier.name)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoRow
                  icon={EmailIcon}
                  label="Email"
                  value={capitalizeName(selectedSupplier.email)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoRow
                  icon={ContactPhoneIcon}
                  label="Phone"
                  value={selectedSupplier.phone}
                />
              </Grid>
              <Grid item xs={12}>
                <InfoRow
                  icon={LocationOnIcon}
                  label="Address"
                  value={capitalizeName(`${selectedSupplier.address || ""}, ${selectedSupplier.postCode || ""}`)}
                />
              </Grid>
              {selectedSupplier.notes && (
                <Grid item xs={12}>
                  <InfoRow
                    icon={NotesIcon}
                    label="Notes"
                    value={capitalizeName(selectedSupplier.notes)}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <InfoRow
                  icon={PersonIcon}
                  label="Status"
                  value={capitalizeName(selectedSupplier.status)}
                  color={
                    selectedSupplier.status === "active"
                      ? "success.main"
                      : "error.main"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoRow
                  icon={AccessTimeIcon}
                  label="Created At"
                  value={new Date(
                    selectedSupplier.createdAt
                  ).toLocaleString()}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Contacts Section */}
          {contacts.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />

              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "primary.main",
                }}
              >
                <ContactPhoneIcon />
                Contact Persons
                <Chip
                  label={contacts.length}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              </Typography>

              <Grid container spacing={2}>
                {contacts.map((contact, index) => (
                  <Grid item xs={12} sm={6} key={contact.id || index}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        height: "100%",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 6,
                        },
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1.5}
                        mb={2}
                      >
                        <Box
                          sx={{
                            width: 45,
                            height: 45,
                            borderRadius: "50%",
                            bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.1)' : 'rgba(144, 202, 249, 0.1)',
                            color: "primary.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                            border: '2px solid',
                            borderColor: 'primary.main'
                          }}
                        >
                          {contact.firstName?.[0] || "?"}
                          {contact.lastName?.[0] || ""}
                        </Box>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight="bold" noWrap>
                            {capitalizeName(`${contact.firstName || ""} ${contact.lastName || ""}`)}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {capitalizeName(contact.role) || "No Role Specified"}
                          </Typography>
                        </Box>
                      </Box>

                      <Stack spacing={1.2}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight={500}>
                            {capitalizeName(contact.emailAddress) || "—"}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <ContactPhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight={500}>
                            {contact.phoneNumber || "—"}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ p: 2, bgcolor: "background.paper" }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          startIcon={<CloseIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewSupplier;
