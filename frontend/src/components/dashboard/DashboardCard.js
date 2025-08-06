import React from "react";
import { styled } from "@mui/material/styles";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { theme } from "../../styles/theme";

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.colors.white,
  borderRadius: theme.borderRadius.medium,
  boxShadow: theme.shadows.card,
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 4px 10px rgba(15, 17, 17, 0.2)",
  },
}));

const CardTitle = styled(Typography)(({ theme }) => ({
  color: theme.colors.text.primary,
  fontWeight: 600,
  fontSize: "1rem",
  marginBottom: theme.spacing.sm,
}));

const CardValue = styled(Typography)(({ theme }) => ({
  color: theme.colors.text.primary,
  fontWeight: 700,
  fontSize: "1.5rem",
}));

const DashboardCard = ({ title, value, icon }) => {
  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <CardTitle variant="h6">{title}</CardTitle>
            <CardValue variant="h4">{value}</CardValue>
          </Box>
          {icon && <Box color={theme.colors.accent}>{icon}</Box>}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default DashboardCard;
