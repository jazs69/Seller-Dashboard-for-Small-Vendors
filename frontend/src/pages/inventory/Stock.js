import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  getStockItems,
  deleteStockItem,
  updateStockQuantity,
} from "../../services/api";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  InputAdornment,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

const Stock = () => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Quick update quantity dialog state
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [itemToUpdate, setItemToUpdate] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");

  useEffect(() => {
    fetchStockItems();
  }, []);

  const fetchStockItems = async () => {
    try {
      setLoading(true);
      const res = await getStockItems();
      setStockItems(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching stock items:", err);
      setError("Failed to load inventory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const handleLowStockFilterChange = (event) => {
    setLowStockFilter(event.target.checked);
    setPage(0);
  };

  // Delete item handlers
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteStockItem(itemToDelete._id);
      setStockItems(stockItems.filter((item) => item._id !== itemToDelete._id));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error("Error deleting stock item:", err);
      setError("Failed to delete item. Please try again.");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Quick update quantity handlers
  const handleUpdateClick = (item) => {
    setItemToUpdate(item);
    setNewQuantity(item.quantity.toString());
    setUpdateDialogOpen(true);
  };

  const handleUpdateConfirm = async () => {
    try {
      const quantity = parseInt(newQuantity, 10);
      if (isNaN(quantity) || quantity < 0) {
        setError("Please enter a valid quantity");
        return;
      }

      const res = await updateStockQuantity(itemToUpdate._id, { quantity });

      // Update stock items list with the updated item
      setStockItems(
        stockItems.map((item) =>
          item._id === itemToUpdate._id ? res.data : item
        )
      );

      setUpdateDialogOpen(false);
      setItemToUpdate(null);
      setNewQuantity("");
    } catch (err) {
      console.error("Error updating stock quantity:", err);
      setError("Failed to update quantity. Please try again.");
    }
  };

  const handleUpdateCancel = () => {
    setUpdateDialogOpen(false);
    setItemToUpdate(null);
    setNewQuantity("");
  };

  // Filter and search stock items
  const filteredItems = stockItems.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "" || item.category === categoryFilter;
    const matchesLowStock = !lowStockFilter || item.isLowStock;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Get unique categories for filter
  const categories = [
    ...new Set(stockItems.map((item) => item.category)),
  ].sort();

  // Pagination
  const paginatedItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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

  return (
    <div style={{ padding: "40px" }}>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Inventory Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/inventory/new"
          >
            Add Product
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ width: "100%", mb: 2 }}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  label="Search Products"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Category"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterListIcon />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Chip
                    icon={<WarningIcon />}
                    label="Low Stock Only"
                    color={lowStockFilter ? "error" : "default"}
                    onClick={() => setLowStockFilter(!lowStockFilter)}
                    sx={{ cursor: "pointer" }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={2} sx={{ textAlign: "right" }}>
                <Typography variant="body2" color="textSecondary">
                  {filteredItems.length} items found
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">In Stock</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <TableRow hover key={item._id}>
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {item.imageUrl ? (
                            <Box
                              component="img"
                              src={item.imageUrl}
                              alt={item.product}
                              sx={{
                                width: 40,
                                height: 40,
                                mr: 2,
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                mr: 2,
                                bgcolor: "grey.200",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {item.product.charAt(0)}
                            </Box>
                          )}
                          <Box>
                            <Typography variant="body1">
                              {item.product}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              noWrap
                            >
                              {item.description &&
                                item.description.substring(0, 50)}
                              {item.description && item.description.length > 50
                                ? "..."
                                : ""}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="right">
                        <Box
                          component="span"
                          onClick={() => handleUpdateClick(item)}
                          sx={{
                            cursor: "pointer",
                            textDecoration: "underline",
                            color: item.isLowStock ? "error.main" : "inherit",
                          }}
                        >
                          {item.quantity}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ${item.price.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {item.isLowStock ? (
                          <Chip
                            label="Low Stock"
                            color="error"
                            size="small"
                            icon={<WarningIcon />}
                          />
                        ) : (
                          <Chip label="In Stock" color="success" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <Tooltip title="Edit Product">
                            <IconButton
                              size="small"
                              color="primary"
                              component={RouterLink}
                              to={`/inventory/edit/${item._id}`}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Product">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(item)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete "{itemToDelete?.product}"? This
              action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update Quantity Dialog */}
        <Dialog open={updateDialogOpen} onClose={handleUpdateCancel}>
          <DialogTitle>Update Quantity</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Update stock quantity for "{itemToUpdate?.product}"
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Quantity"
              type="number"
              fullWidth
              variant="outlined"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              inputProps={{ min: 0 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleUpdateCancel}>Cancel</Button>
            <Button onClick={handleUpdateConfirm} color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default Stock;
