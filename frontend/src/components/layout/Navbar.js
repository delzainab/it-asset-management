import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1, 
        bgcolor: '#2c3e50',
        color: '#ffffff',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 0
      }}
    >
      <Toolbar sx={{ borderRadius: 0 }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, letterSpacing: 1, flexGrow: 1 }}>
          IT Asset Management
        </Typography>

        <Box>
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar sx={{ bgcolor: '#e67e22', width: 36, height: 36 }}>
              {user && getInitials(user.fullName)}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{ sx: { borderRadius: 0 } }}
          >
            <MenuItem disabled>
              <Typography variant="body2">{user?.fullName}</Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">Rôle: {user?.roles?.[0]}</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Déconnexion
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;