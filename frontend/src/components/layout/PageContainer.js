import React from "react";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { theme } from "../../styles/theme";

const StyledPageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing.xl,
  backgroundColor: theme.colors.background,
  minHeight: "100vh",
  width: "100%",
  "@media (max-width: 600px)": {
    padding: theme.spacing.md,
  },
}));

const PageContainer = ({ children }) => {
  return <StyledPageContainer>{children}</StyledPageContainer>;
};

export default PageContainer;
