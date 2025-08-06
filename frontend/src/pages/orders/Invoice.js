import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, generateInvoice } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
} from "@mui/icons-material";

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await getOrderById(id);
      setOrder(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      setPdfLoading(true);
      const response = await generateInvoice(id);

      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: "application/pdf" });

      // Create a link element to download the PDF
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating invoice:", err);
      setError("Failed to generate invoice. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrintInvoice = async () => {
    try {
      setPdfLoading(true);
      const response = await generateInvoice(id);

      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Open the PDF in a new window and print it
      const printWindow = window.open(url, "_blank");
      printWindow.addEventListener(
        "load",
        () => {
          printWindow.print();
          window.URL.revokeObjectURL(url);
        },
        { once: true }
      );
    } catch (err) {
      console.error("Error printing invoice:", err);
      setError("Failed to print invoice. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/orders")}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="warning">Order not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/orders")}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 3,
            alignItems: "center",
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/orders")}
          >
            Back to Orders
          </Button>

          <Typography variant="h4">Invoice</Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadInvoice}
              disabled={pdfLoading}
            >
              {pdfLoading ? <CircularProgress size={24} /> : "Download"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintInvoice}
              disabled={pdfLoading}
            >
              Print
            </Button>
            <Button variant="outlined" startIcon={<EmailIcon />} disabled>
              Email
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 4, mb: 4 }}>
          {/* Invoice Header */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" gutterBottom>
                INVOICE
              </Typography>
              <Typography variant="body2">
                Invoice #: INV-{order._id.substring(0, 8).toUpperCase()}
              </Typography>
              <Typography variant="body2">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body2">
                Status:{" "}
                <Chip
                  label={order.status}
                  color={
                    order.status === "Delivered"
                      ? "success"
                      : order.status === "Shipped"
                      ? "primary"
                      : order.status === "Pending"
                      ? "warning"
                      : "default"
                  }
                  size="small"
                />
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ textAlign: { sm: "right" } }}>
              <Typography variant="h6">
                {user?.name || "Seller Dashboard"}
              </Typography>
              <Typography variant="body2">123 Business Street</Typography>
              <Typography variant="body2">Business City, ST 12345</Typography>
              <Typography variant="body2">Phone: (123) 456-7890</Typography>
              <Typography variant="body2">
                Email: {user?.email || "contact@sellerdashboard.com"}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Customer Information */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6" gutterBottom>
                Bill To:
              </Typography>
              <Typography variant="body1">{order.customerName}</Typography>
              <Typography variant="body2">
                {order.shippingAddress.street}
              </Typography>
              <Typography variant="body2">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zipCode}
              </Typography>
              <Typography variant="body2">
                {order.shippingAddress.country}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} sx={{ textAlign: { sm: "right" } }}>
              <Typography variant="h6" gutterBottom>
                Payment Information:
              </Typography>
              <Typography variant="body2">
                Payment Method: {order.paymentMethod}
              </Typography>
              <Typography variant="body2">
                Payment Status:{" "}
                <Chip
                  label={order.paymentStatus}
                  color={
                    order.paymentStatus === "Completed"
                      ? "success"
                      : order.paymentStatus === "Failed"
                      ? "error"
                      : "warning"
                  }
                  size="small"
                />
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{order.product}</TableCell>
                    <TableCell align="right">{order.quantity}</TableCell>
                    <TableCell align="right">
                      ${order.price.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>

                  {/* Subtotal, Tax, and Total */}
                  <TableRow>
                    <TableCell rowSpan={3} />
                    <TableCell colSpan={2} align="right">
                      Subtotal
                    </TableCell>
                    <TableCell align="right">
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} align="right">
                      Tax (0%)
                    </TableCell>
                    <TableCell align="right">$0.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} align="right">
                      <Typography variant="h6">Total</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6">
                        ${order.totalAmount.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Notes:
            </Typography>
            <Typography variant="body2">
              Thank you for your business! Payment is due within 30 days.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </div>
  );
};

export default Invoice;
