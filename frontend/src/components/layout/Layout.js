import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const drawerWidth = 220;

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Navbar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;