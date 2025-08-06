import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../../services/api";
import { getStockItems } from "../../services/api";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  Autocomplete,
} from "@mui/material";

const OrderForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockItems, setStockItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    customerName: "",
    product: "",
    quantity: 1,
    price: 0,
    totalAmount: 0,
    status: "Pending",
    paymentMethod: "Credit Card",
    paymentStatus: "Pending",
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",
    },
  });

  useEffect(() => {
    fetchStockItems();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setFormData((prev) => ({
        ...prev,
        product: selectedProduct.product,
        price: selectedProduct.price,
        totalAmount: selectedProduct.price * prev.quantity,
      }));
    }
  }, [selectedProduct]);

  useEffect(() => {
    // Recalculate total amount when quantity or price changes
    setFormData((prev) => ({
      ...prev,
      totalAmount: prev.price * prev.quantity,
    }));
  }, [formData.quantity, formData.price]);

  const fetchStockItems = async () => {
    try {
      setStockLoading(true);
      const res = await getStockItems();
      setStockItems(res.data);
    } catch (err) {
      console.error("Error fetching stock items:", err);
      setError("Failed to load product inventory. Please try again.");
    } finally {
      setStockLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      // Handle nested objects (shipping address)
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleProductSelect = (event, newValue) => {
    setSelectedProduct(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.product || formData.quantity < 1) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await createOrder(formData);
      navigate("/orders");
    } catch (err) {
      console.error("Error creating order:", err);
      setError(
        err.response?.data?.msg || "Failed to create order. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Create New Order
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Customer Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Customer Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Customer Name"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Shipping Address
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Street Address"
                  name="shippingAddress.street"
                  value={formData.shippingAddress.street}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="City"
                  name="shippingAddress.city"
                  value={formData.shippingAddress.city}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="State/Province"
                  name="shippingAddress.state"
                  value={formData.shippingAddress.state}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="ZIP/Postal Code"
                  name="shippingAddress.zipCode"
                  value={formData.shippingAddress.zipCode}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Country"
                  name="shippingAddress.country"
                  value={formData.shippingAddress.country}
                  onChange={handleChange}
                />
              </Grid>

              {/* Order Details */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Order Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={stockItems}
                  loading={stockLoading}
                  getOptionLabel={(option) =>
                    `${option.product} - $${option.price.toFixed(2)}`
                  }
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  onChange={handleProductSelect}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      label="Select Product"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {stockLoading ? (
                              <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Unit Price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    readOnly: !!selectedProduct,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Amount"
                  value={`$${formData.totalAmount.toFixed(2)}`}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Order Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Processing">Processing</MenuItem>
                  <MenuItem value="Shipped">Shipped</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Payment Method"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="PayPal">PayPal</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Cash on Delivery">Cash on Delivery</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Payment Status"
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sx={{ mt: 3 }}>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/orders")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : "Create Order"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </div>
  );
};

export default OrderForm;
