import React, { useContext } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { styled } from "@mui/material/styles";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import { theme } from "../../styles/theme";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(() => ({
  "& .MuiDrawer-paper": {
    width: drawerWidth,
    backgroundColor: theme.colors.secondary,
    color: theme.colors.text.light,
    borderRight: "none",
  },
}));

const StyledListItemButton = styled(ListItemButton)(() => ({
  padding: "8px 16px",
  "&:hover": {
    backgroundColor: theme.colors.hover.primary,
  },
  "&.Mui-selected": {
    backgroundColor: theme.colors.hover.primary,
    "&:hover": {
      backgroundColor: theme.colors.hover.primary,
    },
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(() => ({
  color: theme.colors.text.light,
  minWidth: "40px",
}));

const StyledListItemText = styled(ListItemText)(() => ({
  "& .MuiListItemText-primary": {
    fontSize: "14px",
  },
}));

const menuItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Orders", icon: <ShoppingCartIcon />, path: "/orders" },
  { text: "Inventory", icon: <InventoryIcon />, path: "/inventory" },
  { text: "Reports", icon: <AssessmentIcon />, path: "/reports" },
  { text: "Invoices", icon: <ReceiptIcon />, path: "/invoices" },
];

const bottomMenuItems = [
  { text: "Profile", icon: <PersonIcon />, path: "/profile" },
  { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const adminMenuItems = [
  { text: "Admin Panel", icon: <AdminPanelSettingsIcon />, path: "/admin" },
];

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isAdmin = user?.role === "admin";

  const drawer = (
    <Box sx={{ backgroundColor: theme.colors.secondary, height: "100%" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" noWrap component="div">
          Seller Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.name}
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <StyledListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <StyledListItemIcon>{item.icon}</StyledListItemIcon>
              <StyledListItemText primary={item.text} />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {isAdmin && (
        <>
          <List>
            {adminMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <StyledListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={location.pathname === item.path}
                >
                  <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                  <StyledListItemText primary={item.text} />
                </StyledListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </>
      )}
      <List>
        {bottomMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <StyledListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <StyledListItemIcon>{item.icon}</StyledListItemIcon>
              <StyledListItemText primary={item.text} />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer */}
      <StyledDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", sm: "none" },
        }}
      >
        {drawer}
      </StyledDrawer>

      {/* Desktop drawer */}
      <StyledDrawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
        }}
        open
      >
        {drawer}
      </StyledDrawer>
    </Box>
  );
};

export default Sidebar;
