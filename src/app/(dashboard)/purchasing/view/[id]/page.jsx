"use client"

import { 
    Box, 
    Button, 
    Paper, 
    Typography, 
    Card, 
    CardContent, 
    CardHeader,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Divider,
    IconButton,
    Avatar,
    Stack,
} from "@mui/material";
import { 
    ArrowBack, 
    Edit,
    Business,
    Email,
    Phone,
    LocationOn,
    Assignment,
    CalendarToday,
    AttachMoney,
    Description,
    Attachment,
    Download,
    Inventory,
} from "@mui/icons-material";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/configs/url";
import Loader from "@/components/loader/Loader";
import { toast } from "react-toastify";
import { PurchasingTemplate } from "@/utils/PurchasingTemplate";

const Page = () => {

    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [purchaseOrder, setPurchaseOrder] = useState(null);

    const fetchPurchaseOrder = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/purchases/get/${id}`);
            setPurchaseOrder(res.data.data || null);
        } catch (error) {
            console.error("Error fetching purchase order:", error);
            toast.error("Failed to load purchase order");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (id) {
            fetchPurchaseOrder();
        }
    }, [id]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-AU", {
            style: "currency",
            currency: "AUD",
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-AU", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getStatusColor = (status) => {
        const statusColors = {
            draft: "warning",
            submit: "info",
            submitted: "info",
            approved: "success",
            rejected: "error",
            pending: "warning",
            delivered: "success",
            delayed: "error",
        };
        return statusColors[status?.toLowerCase()] || "default";
    };

    const handleDownloadAttachment = (attachment) => {
        try {
            if (attachment.filename) {
                const url = `${BASE_URL}/uploads/purchases/${attachment.filename}`;
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error("Error opening attachment:", error);
            toast.error("Unable to open attachment");
        }
    };

    const handleEdit = () => {
        router.push(`/dashboard/purchasing/${id}`);
    };

    if(loading) return <Loader />;

    if(!purchaseOrder) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" fontWeight="bold">Purchase Order not found</Typography>
            </Box>
        );
    }

    const InfoRow = ({ icon: Icon, label, value, color = "primary" }) => (
        <Box display="flex" alignItems="flex-start" gap={2} sx={{ mb: 2 }}>
            <Avatar sx={{ bgcolor: `${color}.light/50`, width: 40, height: 40 }}>
                <Icon sx={{ color: `${color}.main` }} fontSize="small" />
            </Avatar>
            <Box flex={1}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {label}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                    {value || 'N/A'}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ p: 3 }} component={Paper}>

            <Button variant="contained" startIcon={<ArrowBack />} onClick={() => router.back()}>
                Back
            </Button>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h4" fontWeight="bold">
                        Purchase Order #{purchaseOrder.id}
                    </Typography>
                    <Chip
                        label={purchaseOrder.status || "N/A"}
                        color={getStatusColor(purchaseOrder.status)}
                        size="medium"
                    />
                </Box>
                
                <Button 
                    variant="contained" 
                    startIcon={<Download />}
                    onClick={async () => {
                        try {
                            const templateData = {
                                purchaseOrder: purchaseOrder,
                                supplier: purchaseOrder.suppliers || {},
                                project: purchaseOrder.project || {},
                                lineItems: purchaseOrder.lineItems || [],
                                company: {
                                    name: "VSP Interiors Limited",
                                    address: "36 Parkway Drive, Rosedale,",
                                    city: "Auckland 0632",
                                    phone: "(09) 442 2588",
                                    email: "vishal@vspinteriors.co.nz",
                                    website: "www.vspinteriors.co.nz"
                                },
                                user: {
                                    name: "Janet See Ooi",
                                    phone: "Janet 021 383 914",
                                    email: "janet@vspinteriors.co.nz"
                                }
                            };
                            await PurchasingTemplate(templateData);
                        } catch (error) {
                            console.error("Error generating PDF:", error);
                            toast.error("Failed to generate PDF");
                        }
                    }}
                >
                    Download PDF
                </Button>

            </Box>

            <Grid container spacing={3}>
                {/* Left Column - Purchase Order Info */}
                <Grid item  sx={{ minWidth: "100%" }}>
                    {/* Purchase Order Details */}
                    <Card sx={{ mb: 3 }}>
                        <CardHeader
                            title={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Assignment color="primary" />
                                    <Typography variant="h6">Purchase Order Information</Typography>
                                </Box>
                            }
                        />
                        <CardContent>
                            <Grid container spacing={{ xs: 2, sm: 25, md: 60, lg: 90 }}>
                                <Grid item xs={12} md={6}>
                                    <InfoRow
                                        icon={CalendarToday}
                                        label="Order Date"
                                        value={formatDate(purchaseOrder.createdAt)}
                                    />
                                    <InfoRow
                                        icon={CalendarToday}
                                        label="Expected Delivery"
                                        value={formatDate(purchaseOrder.expectedDelivery)}
                                    />
                                    <InfoRow
                                        icon={Assignment}
                                        label="Project"
                                        value={purchaseOrder.project?.projectName || "General Stock"}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <InfoRow
                                        icon={AttachMoney}
                                        label="Total Amount"
                                        value={formatCurrency(purchaseOrder.totalAmount)}
                                        color="success"
                                    />
                                    <InfoRow
                                        icon={Inventory}
                                        label="Line Items"
                                        value={`${purchaseOrder.lineItems?.length || 0} item(s)`}
                                    />
                                    <InfoRow
                                        icon={Attachment}
                                        label="Attachments"
                                        value={`${purchaseOrder.attachments?.length || 0} file(s)`}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Supplier Information */}
                    <Card sx={{ mb: 3 }}>
                        <CardHeader
                            title={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Business color="secondary" />
                                    <Typography variant="h6">Supplier Information</Typography>
                                </Box>
                            }
                        />
                        <CardContent>
                            {purchaseOrder.suppliers ? (
                                <Grid container spacing={{ xs: 2, sm: 10, md: 50 }}>
                                    <Grid item xs={12} md={6}>
                                        <InfoRow
                                            icon={Business}
                                            label="Supplier Name"
                                            value={purchaseOrder.suppliers.name}
                                            color="secondary"
                                        />
                                        <InfoRow
                                            icon={Email}
                                            label="Email"
                                            value={purchaseOrder.suppliers.email}
                                            color="secondary"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <InfoRow
                                            icon={Phone}
                                            label="Phone"
                                            value={purchaseOrder.suppliers.phone}
                                            color="secondary"
                                        />
                                        <InfoRow
                                            icon={LocationOn}
                                            label="Address"
                                            value={`${purchaseOrder.suppliers.address || ''}, ${purchaseOrder.suppliers.postCode || ''}`}
                                            color="secondary"
                                        />
                                    </Grid>
                                </Grid>
                            ) : (
                                <Typography color="text.secondary">No supplier information available</Typography>
                            )}
                        </CardContent>
                    </Card>

                    {/* Line Items */}
                    <Card>
                        <CardHeader
                            title={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Inventory color="primary" />
                                    <Typography variant="h6">Line Items</Typography>
                                </Box>
                            }
                        />
                        <CardContent>
                            {purchaseOrder.lineItems && purchaseOrder.lineItems.length > 0 ? (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Item ID</strong></TableCell>
                                                <TableCell><strong>Description</strong></TableCell>
                                                <TableCell><strong>Category</strong></TableCell>
                                                <TableCell align="right"><strong>Quantity</strong></TableCell>
                                                <TableCell><strong>Unit</strong></TableCell>
                                                <TableCell align="right"><strong>Unit Price</strong></TableCell>
                                                <TableCell align="right"><strong>Subtotal</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {purchaseOrder.lineItems.map((item) => (
                                                <TableRow key={item.id} hover>
                                                    <TableCell>{item.itemId}</TableCell>
                                                    <TableCell>{item.description || "N/A"}</TableCell>
                                                    <TableCell>
                                                        <Chip label={item.category || "N/A"} size="small" />
                                                    </TableCell>
                                                    <TableCell align="right">{item.quantity}</TableCell>
                                                    <TableCell>{item.unit || "N/A"}</TableCell>
                                                    <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                                                    <TableCell align="right">
                                                        <Typography fontWeight="medium">
                                                            {formatCurrency(item.subtotal)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell colSpan={6} align="right">
                                                    <Typography variant="h6" fontWeight="bold">
                                                        Total:
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography variant="h6" fontWeight="bold" color="primary">
                                                        {formatCurrency(purchaseOrder.totalAmount)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography color="text.secondary">No line items found</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Attachments & Notes */}
                <Grid item xs={12} md={4}>
                    {/* Attachments */}
                    <Card sx={{ mb: 3 }}>
                        <CardHeader
                            title={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Attachment color="primary" />
                                    <Typography variant="h6">Attachments</Typography>
                                </Box>
                            }
                        />
                        <CardContent>
                            {purchaseOrder.attachments && purchaseOrder.attachments.length > 0 ? (
                                <Stack spacing={1}>
                                    {purchaseOrder.attachments.map((attachment, index) => (
                                        <Box
                                            key={index}
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="space-between"
                                            sx={{
                                                p: 1.5,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                bgcolor: 'background.paper',
                                            }}
                                        >
                                            <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
                                                <Attachment fontSize="small" color="action" />
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        flex: 1,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    title={attachment.originalname || attachment.filename}
                                                >
                                                    {attachment.originalname || attachment.filename}
                                                </Typography>
                                            </Box>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDownloadAttachment(attachment)}
                                                color="primary"
                                                title="Download"
                                            >
                                                <Download fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography color="text.secondary">No attachments</Typography>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardHeader
                            title={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Description color="primary" />
                                    <Typography variant="h6">Notes</Typography>
                                </Box>
                            }
                        />
                        <CardContent>
                            {purchaseOrder.notes ? (
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {purchaseOrder.notes}
                                </Typography>
                            ) : (
                                <Typography color="text.secondary">No notes provided</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Page;