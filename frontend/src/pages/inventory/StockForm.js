import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createStockItem,
  getStockItemById,
  updateStockItem,
} from "../../services/api";
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
  FormControlLabel,
  Switch,
} from "@mui/material";

const categories = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Books",
  "Toys & Games",
  "Beauty & Personal Care",
  "Sports & Outdoors",
  "Automotive",
  "Health & Wellness",
  "Office Supplies",
  "Other",
];

const StockForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    product: "",
    description: "",
    category: "",
    quantity: 0,
    price: 0,
    costPrice: 0,
    sku: "",
    alertThreshold: 5,
    imageUrl: "",
  });

  useEffect(() => {
    if (isEditMode) {
      fetchStockItem();
    }
  }, [id]);

  const fetchStockItem = async () => {
    try {
      setInitialLoading(true);
      const res = await getStockItemById(id);
      setFormData(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching stock item:", err);
      setError("Failed to load product details. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle numeric inputs
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: value === "" ? "" : Number(value),
      });
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const generateSKU = () => {
    if (!formData.product || !formData.category) {
      setError("Please enter product name and category to generate SKU");
      return;
    }

    // Generate a SKU based on category and product name
    const categoryPrefix = formData.category.substring(0, 3).toUpperCase();
    const productPart = formData.product
      .replace(/\s+/g, "-")
      .substring(0, 5)
      .toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    const sku = `${categoryPrefix}-${productPart}-${randomNum}`;

    setFormData({
      ...formData,
      sku,
    });
  };

  const validateForm = () => {
    if (!formData.product) {
      setError("Product name is required");
      return false;
    }
    if (!formData.category) {
      setError("Category is required");
      return false;
    }
    if (!formData.sku) {
      setError("SKU is required");
      return false;
    }
    if (formData.quantity < 0) {
      setError("Quantity cannot be negative");
      return false;
    }
    if (formData.price <= 0) {
      setError("Price must be greater than zero");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditMode) {
        await updateStockItem(id, formData);
      } else {
        await createStockItem(formData);
      }

      navigate("/inventory");
    } catch (err) {
      console.error("Error saving stock item:", err);
      setError(
        err.response?.data?.msg || "Failed to save product. Please try again."
      );
      setLoading(false);
    }
  };

  if (initialLoading) {
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

  return (
    <div style={{ padding: "40px" }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          {isEditMode ? "Edit Product" : "Add New Product"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Product Name"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="SKU"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          size="small"
                          onClick={generateSKU}
                          sx={{ ml: 1 }}
                        >
                          Generate
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Image URL"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </Grid>

              {/* Inventory Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Inventory Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Quantity in Stock"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Alert Threshold"
                  name="alertThreshold"
                  value={formData.alertThreshold}
                  onChange={handleChange}
                  inputProps={{ min: 1 }}
                  helperText="Alert when stock falls below this level"
                />
              </Grid>

              {/* Pricing Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Pricing Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Selling Price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Cost Price"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText={
                    formData.price && formData.costPrice
                      ? `Profit Margin: ${(
                          ((formData.price - formData.costPrice) /
                            formData.price) *
                          100
                        ).toFixed(2)}%`
                      : ""
                  }
                />
              </Grid>

              <Grid item xs={12} sx={{ mt: 3 }}>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/inventory")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : isEditMode ? (
                      "Update Product"
                    ) : (
                      "Add Product"
                    )}
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

export default StockForm;
