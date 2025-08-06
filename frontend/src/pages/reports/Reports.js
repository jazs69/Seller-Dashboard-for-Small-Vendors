import React, { useState, useEffect, useCallback } from "react";
import {
  getSalesReport,
  getInventoryReport,
  getLowStockReport,
} from "../../services/api";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  MenuItem,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CalendarMonth as CalendarIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

// Chart colors
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sales report state
  const [salesData, setSalesData] = useState(null);
  const [salesTimeframe, setSalesTimeframe] = useState("month");

  // Inventory report state
  const [inventoryData, setInventoryData] = useState(null);
  const [inventorySortBy, setInventorySortBy] = useState("value");

  // Low stock report state
  const [lowStockData, setLowStockData] = useState(null);
  const [lowStockPage, setLowStockPage] = useState(0);
  const [lowStockRowsPerPage, setLowStockRowsPerPage] = useState(10);

  const fetchSalesReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSalesReport(salesTimeframe);
      setSalesData(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching sales report:", err);
      setError("Failed to load sales report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [salesTimeframe]);

  const fetchInventoryReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getInventoryReport(inventorySortBy);
      setInventoryData(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching inventory report:", err);
      setError("Failed to load inventory report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [inventorySortBy]);

  const fetchLowStockReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getLowStockReport();
      setLowStockData(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching low stock report:", err);
      setError("Failed to load low stock report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 0) {
      fetchSalesReport();
    } else if (activeTab === 1) {
      fetchInventoryReport();
    } else if (activeTab === 2) {
      fetchLowStockReport();
    }
  }, [activeTab, fetchSalesReport, fetchInventoryReport, fetchLowStockReport]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSalesTimeframeChange = (event) => {
    setSalesTimeframe(event.target.value);
  };

  const handleInventorySortChange = (event) => {
    setInventorySortBy(event.target.value);
  };

  const handleLowStockChangePage = (event, newPage) => {
    setLowStockPage(newPage);
  };

  const handleLowStockChangeRowsPerPage = (event) => {
    setLowStockRowsPerPage(parseInt(event.target.value, 10));
    setLowStockPage(0);
  };

  const renderSalesReport = () => {
    if (!salesData) return null;

    const {
      salesByPeriod,
      salesByProduct,
      totalRevenue,
      orderCount,
      averageOrderValue,
    } = salesData;

    return (
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h3" color="primary">
              ${totalRevenue.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Orders
            </Typography>
            <Typography variant="h3" color="primary">
              {orderCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Average Order Value
            </Typography>
            <Typography variant="h3" color="primary">
              ${averageOrderValue.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        {/* Sales Over Time Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={salesByPeriod}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#82ca9d"
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Sales by Product Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales by Product
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={salesByProduct}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Sales by Product Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByProduct}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                  nameKey="product"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {salesByProduct.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderInventoryReport = () => {
    if (!inventoryData) return null;

    const { inventoryByCategory, totalItems, totalValue, lowStockCount } =
      inventoryData;

    return (
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Total Products
            </Typography>
            <Typography variant="h3" color="primary">
              {totalItems}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Inventory Value
            </Typography>
            <Typography variant="h3" color="primary">
              ${totalValue.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center", height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Items
            </Typography>
            <Typography variant="h3" color="error">
              {lowStockCount}
            </Typography>
          </Paper>
        </Grid>

        {/* Inventory by Category Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Inventory by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={inventoryByCategory}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Number of Products" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Inventory Value by Category Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Inventory Value by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inventoryByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="category"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {inventoryByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, "Value"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderLowStockReport = () => {
    if (!lowStockData) return null;

    const { lowStockItems, totalLowStockValue } = lowStockData;

    // Pagination
    const paginatedItems = lowStockItems.slice(
      lowStockPage * lowStockRowsPerPage,
      lowStockPage * lowStockRowsPerPage + lowStockRowsPerPage
    );

    return (
      <Grid container spacing={3}>
        {/* Summary Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              Total Low Stock Value
            </Typography>
            <Typography variant="h3" color="error">
              ${totalLowStockValue.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {lowStockItems.length} items below threshold
            </Typography>
          </Paper>
        </Grid>

        {/* Low Stock Items Table */}
        <Grid item xs={12}>
          <Paper sx={{ width: "100%" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                    <TableCell align="right">Threshold</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedItems.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.product}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{item.alertThreshold}</TableCell>
                      <TableCell align="right">
                        ${item.price.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            item.quantity === 0 ? "Out of Stock" : "Low Stock"
                          }
                          color={item.quantity === 0 ? "error" : "warning"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={lowStockItems.length}
              rowsPerPage={lowStockRowsPerPage}
              page={lowStockPage}
              onPageChange={handleLowStockChangePage}
              onRowsPerPageChange={handleLowStockChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Reports & Analytics
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          {activeTab === 0 && (
            <TextField
              select
              size="small"
              value={salesTimeframe}
              onChange={handleSalesTimeframeChange}
              sx={{ minWidth: 150 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </TextField>
          )}

          {activeTab === 1 && (
            <TextField
              select
              size="small"
              value={inventorySortBy}
              onChange={handleInventorySortChange}
              sx={{ minWidth: 150 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="value">Sort by Value</MenuItem>
              <MenuItem value="quantity">Sort by Quantity</MenuItem>
              <MenuItem value="alphabetical">Sort Alphabetically</MenuItem>
            </TextField>
          )}

          <Button variant="outlined" startIcon={<DownloadIcon />} disabled>
            Export
          </Button>
          <Button variant="outlined" startIcon={<PrintIcon />} disabled>
            Print
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: "100%", mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Sales Report" />
          <Tab label="Inventory Report" />
          <Tab label="Low Stock Report" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="50vh"
            >
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {activeTab === 0 && renderSalesReport()}
              {activeTab === 1 && renderInventoryReport()}
              {activeTab === 2 && renderLowStockReport()}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Reports;
