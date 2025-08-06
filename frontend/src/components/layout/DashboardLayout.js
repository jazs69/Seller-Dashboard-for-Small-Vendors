import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar, IconButton, CssBaseline } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import PageContainer from "./PageContainer";

const drawerWidth = 240;

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* App Bar */}
      <Box
        component="header"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Navbar />
        <Toolbar sx={{ display: { sm: "none" } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Box>

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar /> {/* Add spacing below app bar */}
        <PageContainer>
          <Outlet />
        </PageContainer>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
