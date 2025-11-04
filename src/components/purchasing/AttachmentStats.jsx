import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  LinearProgress,
} from "@mui/material";
import { Description as FileTextIcon } from "@mui/icons-material";

const AttachmentStats = ({ attachmentStats }) => {
  if (!attachmentStats) return null;

  const ordersWithAttachments = parseInt(attachmentStats.ordersWithAttachments || 0);
  const missingAttachments = parseInt(attachmentStats.missingAttachments || 0);
  const total = ordersWithAttachments + missingAttachments;
  const attachmentRate = total > 0 ? (ordersWithAttachments / total) * 100 : 0;

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <FileTextIcon />
            <Typography variant="h6">Attachment Statistics</Typography>
          </Box>
        }
      />
      <CardContent>
        <Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Orders with Attachments
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {ordersWithAttachments} / {total}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={attachmentRate}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Typography variant="body2" color="text.secondary">
              Missing Attachments
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              color={missingAttachments > 0 ? "warning.main" : "success.main"}
            >
              {missingAttachments}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" mt={1} display="block">
            Attachment Coverage: {attachmentRate.toFixed(1)}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AttachmentStats;

