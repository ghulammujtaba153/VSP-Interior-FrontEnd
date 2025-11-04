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
  Box,
} from "@mui/material";
import { formatCurrency } from "./reportsUtils";

const ItemStats = ({ itemStats }) => {
  if (!itemStats || itemStats.length === 0) {
    return (
      <Card 
        sx={{ 
          mt: 2,
          boxShadow: 1,
          border: '1px solid',
          borderColor: 'grey.200',
          backgroundColor: 'white'
        }}
      >
        <CardHeader 
          title={
            <Typography variant="h6" fontWeight="500">
              Top 5 Items by Quantity
            </Typography>
          }
          sx={{ pb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Typography color="text.secondary" variant="body2">
            No item statistics available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        mt: 2,
        boxShadow: 1,
        border: '1px solid',
        borderColor: 'grey.200',
        backgroundColor: 'white'
      }}
    >
      <CardHeader 
        title={
          <Typography variant="h6" fontWeight="500">
            Top 5 Items by Quantity
          </Typography>
        }
        sx={{ 
          pb: 1,
          '& .MuiCardHeader-title': { fontSize: '1.1rem' }
        }}
      />
      <CardContent sx={{ pt: 0, '&:last-child': { pb: 2 } }}>
        <TableContainer 
          component={Paper} 
          elevation={0}
          sx={{ 
            border: '1px solid',
            borderColor: 'grey.200',
            backgroundColor: 'transparent'
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: '600', py: 1.5, borderColor: 'grey.300' }}>
                  Item Name
                </TableCell>
                <TableCell sx={{ fontWeight: '600', py: 1.5, borderColor: 'grey.300' }}>
                  Category
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: '600', py: 1.5, borderColor: 'grey.300' }}>
                  Total Quantity
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: '600', py: 1.5, borderColor: 'grey.300' }}>
                  Total Spent
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: '600', py: 1.5, borderColor: 'grey.300' }}>
                  Avg Price
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itemStats.map((item, idx) => (
                <TableRow 
                  key={item.itemId || idx}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: 'grey.50' }
                  }}
                >
                  <TableCell sx={{ py: 1.5, borderColor: 'grey.200' }}>
                    <Typography variant="body2" fontWeight="500">
                      {item.item?.name || "Unknown Item"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.5, borderColor: 'grey.200' }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.item?.category || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5, borderColor: 'grey.200' }}>
                    <Typography variant="body2" fontFamily="monospace">
                      {parseFloat(item.totalQuantity || 0).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5, borderColor: 'grey.200' }}>
                    <Typography variant="body2" fontWeight="500" fontFamily="monospace">
                      {formatCurrency(parseFloat(item.totalSpent || 0))}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5, borderColor: 'grey.200' }}>
                    <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                      {formatCurrency(
                        parseFloat(item.totalSpent || 0) /
                          (parseFloat(item.totalQuantity) || 1)
                      )}
                    </Typography>
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

export default ItemStats;