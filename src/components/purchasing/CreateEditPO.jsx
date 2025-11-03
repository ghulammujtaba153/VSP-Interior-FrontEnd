"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  TextField,
  Typography,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Add, Delete, Save, Send, Upload, Download, Visibility, Attachment } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import { useSearchParams, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const CreateEditPO = () => {
  const [formData, setFormData] = useState({
    jobId: "",
    supplierId: "",
    expectedDelivery: "",
    notes: "",
  });
  const [projects, setProjects] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [attachmentsToRemove, setAttachmentsToRemove] = useState([]);
  const fileInputRef = useRef(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams?.get("id");

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/project-setup/get?page=1&limit=10000`);
      
      setProjects(res.data.data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/suppliers/get?page=1&limit=10000`);
      setSuppliers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  }

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/inventory/get?page=1&limit=10000`);
      setInventory(res.data.inventory || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  }

  const fetchPurchaseData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/purchases/get/${id}`);
      const purchase = res.data.data;
      
      if (purchase) {
        // Set form data
        setFormData({
          jobId: purchase.projectId || "general",
          supplierId: purchase.supplierId?.toString() || "",
          expectedDelivery: purchase.expectedDelivery 
            ? new Date(purchase.expectedDelivery).toISOString().split('T')[0]
            : "",
          notes: purchase.notes || "",
        });

        // Set line items
        if (purchase.lineItems && purchase.lineItems.length > 0) {
          const mappedLineItems = purchase.lineItems.map((item, index) => ({
            id: item.id?.toString() || (index + 1).toString(),
            itemId: item.itemId?.toString() || "",
            description: item.description || "",
            category: item.category || "",
            quantity: item.quantity || 0,
            unit: item.unit || "",
            unitPrice: item.unitPrice || 0,
            subtotal: item.subtotal || 0,
          }));
          setLineItems(mappedLineItems);
        } else {
          // If no line items, keep the default empty line item
          setLineItems([{
            id: "1",
            itemId: "",
            description: "",
            category: "",
            quantity: 0,
            unit: "",
            unitPrice: 0,
            subtotal: 0,
          }]);
        }

        // Load existing attachments
        if (purchase.attachments && Array.isArray(purchase.attachments) && purchase.attachments.length > 0) {
          setExistingAttachments(purchase.attachments);
        } else {
          setExistingAttachments([]);
        }
      }
    } catch (error) {
      console.error("Error fetching purchase data:", error);
      toast.error("Failed to load purchase order data");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProjects(), fetchSuppliers(), fetchInventory()]);
        // Fetch purchase data after loading if editing
        if (id) {
          await fetchPurchaseData();
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  const [lineItems, setLineItems] = useState([
    {
      id: "1",
      itemId: "",
      description: "",
      category: "",
      quantity: 0,
      unit: "",
      unitPrice: 0,
      subtotal: 0,
    },
  ]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        itemId: "",
        description: "",
        category: "",
        quantity: 0,
        unit: "",
        unitPrice: 0,
        subtotal: 0,
      },
    ]);
  };

  const removeLineItem = (id) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (id, field, value) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // If itemId is selected, auto-populate other fields from inventory
          if (field === "itemId" && value) {
            const selectedInventory = inventory.find((inv) => inv.id === parseInt(value));
            if (selectedInventory) {
              updatedItem.description = selectedInventory.name;
              updatedItem.category = selectedInventory.categoryDetails?.name || "";
              updatedItem.unit = selectedInventory.priceBooks?.unit || "";
              updatedItem.unitPrice = parseFloat(selectedInventory.priceBooks?.price || 0);
              // Recalculate subtotal when item is selected
              updatedItem.subtotal =
                Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
            }
          }
          
          // Recalculate subtotal when quantity or unitPrice changes
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.subtotal =
              Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateTotal = () =>
    lineItems.reduce((total, item) => total + item.subtotal, 0);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
    // Reset the input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileRemove = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingAttachment = (index) => {
    const attachment = existingAttachments[index];
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
    // Track which attachments to remove when saving
    setAttachmentsToRemove((prev) => [...prev, attachment]);
  };

  const handleDownloadAttachment = (attachment) => {
    // Create a download link for the attachment
    try {
      // Server serves uploads from /uploads path
      if (attachment.filename) {
        const url = `${BASE_URL}/uploads/purchases/${attachment.filename}`;
        window.open(url, '_blank');
      } else if (attachment.path) {
        // Extract filename from path if needed
        const filename = attachment.path.split(/[\\/]/).pop();
        const url = `${BASE_URL}/uploads/purchases/${filename}`;
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error("Error opening attachment:", error);
      toast.error("Unable to open attachment");
    }
  };

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.supplierId) {
      toast.error("Please select a supplier");
      return;
    }

    // Filter out empty line items
    const validLineItems = lineItems.filter(
      item => item.itemId && item.quantity > 0 && item.unitPrice > 0
    );

    if (validLineItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    // Prepare payload
    const payloadData = {
      projectId: formData.jobId === "general" || formData.jobId === "" ? null : parseInt(formData.jobId),
      supplierId: parseInt(formData.supplierId),
      expectedDelivery: formData.expectedDelivery || null,
      notes: formData.notes || "",
      status: "submit",
      lineItems: validLineItems.map(item => ({
        itemId: parseInt(item.itemId),
        description: item.description || "",
        category: item.category || "",
        quantity: parseFloat(item.quantity) || 0,
        unit: item.unit || "",
        unitPrice: parseFloat(item.unitPrice) || 0,
        subtotal: parseFloat(item.subtotal) || 0,
      })),
      totalAmount: calculateTotal(),
    };

    setSaving(true);
    try {
      let res;
      
      // If files are selected or attachments need to be removed, use FormData; otherwise use JSON
      if (selectedFiles.length > 0 || attachmentsToRemove.length > 0) {
        const formDataToSend = new FormData();
        formDataToSend.append('lineItems', JSON.stringify(payloadData.lineItems));
        formDataToSend.append('projectId', payloadData.projectId || '');
        formDataToSend.append('supplierId', payloadData.supplierId);
        formDataToSend.append('expectedDelivery', payloadData.expectedDelivery || '');
        formDataToSend.append('notes', payloadData.notes);
        formDataToSend.append('status', payloadData.status);
        formDataToSend.append('totalAmount', payloadData.totalAmount);
        
        // Send remaining attachments (existing - removed)
        const remainingAttachments = existingAttachments.filter(
          (att) => !attachmentsToRemove.some((removed) => removed.filename === att.filename)
        );
        formDataToSend.append('existingAttachments', JSON.stringify(remainingAttachments));
        
        // Append new files
        selectedFiles.forEach((file) => {
          formDataToSend.append('files', file);
        });

        if (id) {
          res = await axios.put(`${BASE_URL}/api/purchases/update/${id}`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          toast.success("Purchase order updated successfully");
        } else {
          res = await axios.post(`${BASE_URL}/api/purchases/create`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          toast.success("Purchase order created successfully");
        }
      } else {
        // No new files, but we might need to update attachments (if some were removed)
        if (id && attachmentsToRemove.length > 0) {
          // Some attachments were removed, need to use FormData to send updated attachments
          const formDataToSend = new FormData();
          formDataToSend.append('lineItems', JSON.stringify(payloadData.lineItems));
          formDataToSend.append('projectId', payloadData.projectId || '');
          formDataToSend.append('supplierId', payloadData.supplierId);
          formDataToSend.append('expectedDelivery', payloadData.expectedDelivery || '');
          formDataToSend.append('notes', payloadData.notes);
          formDataToSend.append('status', payloadData.status);
          formDataToSend.append('totalAmount', payloadData.totalAmount);
          
          // Send remaining attachments
          const remainingAttachments = existingAttachments.filter(
            (att) => !attachmentsToRemove.some((removed) => removed.filename === att.filename)
          );
          formDataToSend.append('existingAttachments', JSON.stringify(remainingAttachments));
          
          res = await axios.put(`${BASE_URL}/api/purchases/update/${id}`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          toast.success("Purchase order updated successfully");
        } else {
          // No files and no attachment changes, send as JSON
          if (id) {
            res = await axios.put(`${BASE_URL}/api/purchases/update/${id}`, payloadData);
            toast.success("Purchase order updated successfully");
          } else {
            res = await axios.post(`${BASE_URL}/api/purchases/create`, payloadData);
            toast.success("Purchase order created successfully");
          }
        }
      }
      
      // Clear selected files and attachment removal tracking after successful save
      setSelectedFiles([]);
      setAttachmentsToRemove([]);
      
      // Refresh data if editing
      if (id) {
        await fetchPurchaseData();
      }
    } catch (error) {
      console.error("Error saving purchase order:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to save purchase order";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading && id) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="600">
            {id ? "Edit Purchase Order" : "Create Purchase Order"}
          </Typography>
          <Typography color="text.secondary">
            {id ? "Update the purchase order details" : "Fill in the details to create a new purchase order"}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          

          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? "Saving..." : id ? "Update" : "Submit"}
          </Button>
        </Box>
      </Box>

      {/* Job & Supplier */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="1. Job Selection" />
            <CardContent>
              <TextField
                select
                label="Assign to Job"
                value={formData.jobId}
                onChange={(e) =>
                  setFormData({ ...formData, jobId: e.target.value })
                }
                fullWidth
              >
                <MenuItem value="general">General Stock</MenuItem>
                {projects.map((job) => (
                  <MenuItem key={job.id} value={job.id}>
                    {job.projectName}
                  </MenuItem>
                ))}
              </TextField>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="2. Supplier Selection" />
            <CardContent>
              <TextField
                select
                label="Choose Supplier"
                value={formData.supplierId}
                onChange={(e) =>
                  setFormData({ ...formData, supplierId: e.target.value })
                }
                fullWidth
                sx={{ mb: 2 }}
              >
                {suppliers.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="date"
                label="Expected Delivery"
                InputLabelProps={{ shrink: true }}
                value={formData.expectedDelivery}
                onChange={(e) =>
                  setFormData({ ...formData, expectedDelivery: e.target.value })
                }
                fullWidth
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Line Items */}
      <Card sx={{ mt: 3 }}>
        <CardHeader
          title="3. Add Items"
          action={
            <Button startIcon={<Add />} onClick={addLineItem}>
              Add Item
            </Button>
          }
        />
        <CardContent>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <TextField
                        select
                        value={item.itemId}
                        onChange={(e) =>
                          updateLineItem(item.id, "itemId", e.target.value)
                        }
                        size="small"
                        sx={{ minWidth: 150 }}
                      >
                        <MenuItem value="">
                          <em>Select Item</em>
                        </MenuItem>
                        {inventory.map((inv) => (
                          <MenuItem key={inv.id} value={inv.id}>
                            {inv.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        sx={{ minWidth: 250 }}
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(item.id, "description", e.target.value)
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                      sx={{ minWidth: 120 }}
                        select
                        value={item.category}
                        onChange={(e) =>
                          updateLineItem(item.id, "category", e.target.value)
                        }
                        size="small"
                      >
                        <MenuItem value="timber">Timber</MenuItem>
                        <MenuItem value="hardware">Hardware</MenuItem>
                        <MenuItem value="finishes">Finishes</MenuItem>
                        <MenuItem value="adhesives">Adhesives</MenuItem>
                        <MenuItem value="tools">Tools</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(item.id, "quantity", e.target.value)
                        }
                        size="small"
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.unit}
                        onChange={(e) =>
                          updateLineItem(item.id, "unit", e.target.value)
                        }
                        size="small"
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(item.id, "unitPrice", e.target.value)
                        }
                        size="small"
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Total */}
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Card sx={{ minWidth: 240 }}>
              <CardContent>
                <Typography variant="subtitle1">Total:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {formatCurrency(calculateTotal())}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </CardContent>
      </Card>

      {/* Attachments & Notes */}
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="4. Attachments" />
            <CardContent>
              <Box
                border="2px dashed"
                borderColor="divider"
                p={4}
                textAlign="center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
                <Upload fontSize="large" color="disabled" />
                <Typography color="text.secondary" mt={1} mb={2}>
                  Upload supporting documents, drawings, or specifications
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<Upload />}
                  onClick={handleFileButtonClick}
                >
                  Choose Files
                </Button>
                
                {/* Display existing attachments */}
                {existingAttachments.length > 0 && (
                  <Box mt={3} textAlign="left">
                    <Typography variant="subtitle2" mb={1} fontWeight="bold">
                      Existing Attachments:
                    </Typography>
                    {existingAttachments.map((attachment, index) => (
                      <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          p: 1,
                          mb: 1,
                          bgcolor: 'info.light',
                          borderRadius: 1,
                        }}
                      >
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Attachment fontSize="small" />
                          <Typography variant="body2">
                            {attachment.originalname || attachment.filename}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadAttachment(attachment)}
                            title="Download"
                            color="primary"
                          >
                            <Download fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveExistingAttachment(index)}
                            title="Remove"
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Display newly selected files */}
                {selectedFiles.length > 0 && (
                  <Box mt={3} textAlign="left">
                    <Typography variant="subtitle2" mb={1} fontWeight="bold">
                      New Files to Upload:
                    </Typography>
                    {selectedFiles.map((file, index) => (
                      <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                          p: 1,
                          mb: 1,
                          bgcolor: 'action.hover',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {file.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleFileRemove(index)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="5. Notes & Instructions" />
            <CardContent>
              <TextField
                multiline
                rows={6}
                placeholder="Add any special instructions or notes..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                fullWidth
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateEditPO;
