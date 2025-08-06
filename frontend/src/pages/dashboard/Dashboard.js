import React, { useState, useEffect, useContext } from "react";
import { styled } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getDashboardSummary, getSalesChart } from "../../services/api";
import DashboardCard from "../../components/dashboard/DashboardCard";
import { theme } from "../../styles/theme";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing.lg,
  backgroundColor: theme.colors.background,
  minHeight: "100vh",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.colors.text.primary,
  fontWeight: 700,
  fontSize: "1.5rem",
  marginBottom: theme.spacing.md,
}));

const StyledChart = styled(Card)(({ theme }) => ({
  backgroundColor: theme.colors.white,
  borderRadius: theme.borderRadius.medium,
  boxShadow: theme.shadows.card,
  padding: theme.spacing.md,
  marginTop: theme.spacing.lg,
}));

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartPeriod, setChartPeriod] = useState("week");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const summaryRes = await getDashboardSummary();
        setDashboardData(summaryRes.data);

        const salesRes = await getSalesChart(chartPeriod);
        setSalesData(salesRes.data);

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [chartPeriod]);

  const handlePeriodChange = (period) => {
    setChartPeriod(period);
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!salesData || salesData.length === 0) return null;

    const labels = salesData.map((item) => item._id);
    const revenueData = salesData.map((item) => item.revenue);
    const ordersData = salesData.map((item) => item.orders);

    return {
      labels,
      datasets: [
        {
          label: "Revenue",
          data: revenueData,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          yAxisID: "y",
        },
        {
          label: "Orders",
          data: ordersData,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          yAxisID: "y1",
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    stacked: false,
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Revenue ($)",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Orders",
        },
      },
    },
  };

  // Prepare top products chart
  const prepareTopProductsChart = () => {
    if (
      !dashboardData ||
      !dashboardData.topProducts ||
      dashboardData.topProducts.length === 0
    )
      return null;

    const labels = dashboardData.topProducts.map((item) => item._id);
    const quantityData = dashboardData.topProducts.map(
      (item) => item.totalSold
    );

    return {
      labels,
      datasets: [
        {
          label: "Units Sold",
          data: quantityData,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  };

  const topProductsOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Top Selling Products",
      },
    },
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
      </Box>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Orders */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 140,
                bgcolor: "primary.light",
                color: "primary.contrastText",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography component="h2" variant="h6" gutterBottom>
                  Total Orders
                </Typography>
                <ShoppingCartIcon />
              </Box>
              <Typography component="p" variant="h4">
                {dashboardData?.totalOrders || 0}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {dashboardData?.todayOrders || 0} new today
              </Typography>
            </Paper>
          </Grid>

          {/* Revenue */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 140,
                bgcolor: "success.light",
                color: "success.contrastText",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography component="h2" variant="h6" gutterBottom>
                  Revenue
                </Typography>
                <AttachMoneyIcon />
              </Box>
              <Typography component="p" variant="h4">
                ${dashboardData?.totalRevenue?.toFixed(2) || "0.00"}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                {dashboardData?.revenueGrowth > 0 ? (
                  <>
                    <TrendingUpIcon color="inherit" fontSize="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {dashboardData.revenueGrowth.toFixed(1)}% from last month
                    </Typography>
                  </>
                ) : (
                  <>
                    <TrendingDownIcon color="inherit" fontSize="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {Math.abs(dashboardData?.revenueGrowth || 0).toFixed(1)}%
                      from last month
                    </Typography>
                  </>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Inventory Value */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 140,
                bgcolor: "info.light",
                color: "info.contrastText",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography component="h2" variant="h6" gutterBottom>
                  Inventory Value
                </Typography>
                <InventoryIcon />
              </Box>
              <Typography component="p" variant="h4">
                ${dashboardData?.inventoryValue?.toFixed(2) || "0.00"}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Across all products
              </Typography>
            </Paper>
          </Grid>

          {/* Low Stock Alert */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 140,
                bgcolor:
                  dashboardData?.lowStockCount > 0
                    ? "warning.light"
                    : "grey.300",
                color:
                  dashboardData?.lowStockCount > 0
                    ? "warning.contrastText"
                    : "text.primary",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography component="h2" variant="h6" gutterBottom>
                  Low Stock Alert
                </Typography>
                <WarningIcon />
              </Box>
              <Typography component="p" variant="h4">
                {dashboardData?.lowStockCount || 0}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {dashboardData?.lowStockCount > 0
                  ? "Items need attention"
                  : "All stock levels are good"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Sales Chart */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 400,
              }}
            >
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography
                  component="h2"
                  variant="h6"
                  color="primary"
                  gutterBottom
                >
                  Sales Overview
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label="Week"
                    onClick={() => handlePeriodChange("week")}
                    color={chartPeriod === "week" ? "primary" : "default"}
                    variant={chartPeriod === "week" ? "filled" : "outlined"}
                  />
                  <Chip
                    label="Month"
                    onClick={() => handlePeriodChange("month")}
                    color={chartPeriod === "month" ? "primary" : "default"}
                    variant={chartPeriod === "month" ? "filled" : "outlined"}
                  />
                  <Chip
                    label="Year"
                    onClick={() => handlePeriodChange("year")}
                    color={chartPeriod === "year" ? "primary" : "default"}
                    variant={chartPeriod === "year" ? "filled" : "outlined"}
                  />
                </Stack>
              </Box>
              {salesData && salesData.length > 0 ? (
                <Box sx={{ height: "100%" }}>
                  <Line options={chartOptions} data={prepareChartData()} />
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No sales data available for this period
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Top Products */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 400,
              }}
            >
              <Typography
                component="h2"
                variant="h6"
                color="primary"
                gutterBottom
              >
                Top Selling Products
              </Typography>
              {dashboardData?.topProducts &&
              dashboardData.topProducts.length > 0 ? (
                <Box sx={{ height: "100%", mt: 2 }}>
                  <Bar
                    options={topProductsOptions}
                    data={prepareTopProductsChart()}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No product sales data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography
                  component="h2"
                  variant="h6"
                  color="primary"
                  gutterBottom
                >
                  Recent Orders
                </Typography>
                {dashboardData?.recentOrders &&
                dashboardData.recentOrders.length > 0 ? (
                  <List>
                    {dashboardData.recentOrders.map((order) => (
                      <React.Fragment key={order._id}>
                        <ListItem>
                          <ListItemText
                            primary={`${order.product} (${order.quantity} units)`}
                            secondary={
                              <React.Fragment>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  ${order.totalAmount.toFixed(2)}
                                </Typography>
                                {` — ${new Date(
                                  order.createdAt
                                ).toLocaleDateString()}`}
                              </React.Fragment>
                            }
                          />
                          <Chip
                            label={order.status}
                            color={
                              order.status === "Delivered"
                                ? "success"
                                : order.status === "Shipped"
                                ? "info"
                                : order.status === "Pending"
                                ? "warning"
                                : "default"
                            }
                            size="small"
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ p: 2 }}
                  >
                    No recent orders
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" component={RouterLink} to="/orders">
                  View All Orders
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Low Stock Items */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography
                  component="h2"
                  variant="h6"
                  color="primary"
                  gutterBottom
                >
                  Low Stock Items
                </Typography>
                {dashboardData?.lowStockCount > 0 ? (
                  <List>
                    {dashboardData.lowStockItems &&
                      dashboardData.lowStockItems.map((item) => (
                        <React.Fragment key={item._id}>
                          <ListItem>
                            <ListItemText
                              primary={item.product}
                              secondary={
                                <React.Fragment>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                  >
                                    {item.quantity} units left
                                  </Typography>
                                  {` — Alert threshold: ${item.alertThreshold}`}
                                </React.Fragment>
                              }
                            />
                            <Chip
                              label={
                                item.quantity === 0
                                  ? "Out of Stock"
                                  : "Low Stock"
                              }
                              color={item.quantity === 0 ? "error" : "warning"}
                              size="small"
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      ))}
                  </List>
                ) : (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ p: 2 }}
                  >
                    All stock levels are good
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" component={RouterLink} to="/inventory">
                  Manage Inventory
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default Dashboard;
