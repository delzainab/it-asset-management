import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ComputerIcon from '@mui/icons-material/Computer';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import RoomIcon from '@mui/icons-material/Room';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';
import HelpIcon from '@mui/icons-material/Help';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import useRole from '../../hooks/useRole';

const drawerWidth = 220;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isTechnician, isConsultation } = useRole();

  const adminMenu = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Matériels', icon: <ComputerIcon />, path: '/assets' },
    { text: 'Assignations', icon: <AssignmentIcon />, path: '/assignments' },
    { text: 'Tickets', icon: <ConfirmationNumberIcon />, path: '/tickets' },
    { text: 'Maintenances', icon: <BuildIcon />, path: '/maintenances' },
    { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/users' },
    { text: 'Services', icon: <BusinessIcon />, path: '/services' },
    { text: 'Bureaux', icon: <RoomIcon />, path: '/offices' },
    { text: 'Journaux d\'audit', icon: <HistoryIcon />, path: '/audit-logs' },
    { text: 'Rapports', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Gérer la FAQ', icon: <ManageAccountsIcon />, path: '/faq-admin' },
    { text: 'FAQ', icon: <HelpIcon />, path: '/faq' },
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/settings' }
  ];

  const technicianMenu = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Matériels', icon: <ComputerIcon />, path: '/assets' },
    { text: 'Tickets', icon: <ConfirmationNumberIcon />, path: '/tickets' },
    { text: 'Maintenances', icon: <BuildIcon />, path: '/maintenances' },
    { text: 'FAQ', icon: <HelpIcon />, path: '/faq' }
  ];

  const consultationMenu = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Matériels', icon: <ComputerIcon />, path: '/assets' },
    { text: 'Tickets', icon: <ConfirmationNumberIcon />, path: '/tickets' },
    { text: 'FAQ', icon: <HelpIcon />, path: '/faq' }
  ];

  let menuItems = [];
  if (isAdmin) menuItems = adminMenu;
  else if (isTechnician) menuItems = technicianMenu;
  else if (isConsultation) menuItems = consultationMenu;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#2c3e50',
          color: '#ecf0f1',
          borderRight: 'none',
          borderRadius: 0
        },
      }}
    >
      <Toolbar sx={{ backgroundColor: '#1a2632', minHeight: 64, borderRadius: 0 }}>
        <Typography variant="subtitle1" sx={{ color: '#e67e22', fontWeight: 600, fontSize: '1rem' }}>
          IT
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500, fontSize: '1rem', ml: 0.5 }}>
          Asset
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto', mt: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.2 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  '&:hover': { backgroundColor: '#1a2632' },
                  backgroundColor: location.pathname === item.path ? '#1a2632' : 'transparent',
                  py: 0.8,
                  mx: 0.5,
                  borderRadius: 0
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname === item.path ? '#e67e22' : '#95a5a6', 
                  minWidth: 36 
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: '0.8rem',
                    fontWeight: location.pathname === item.path ? 500 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;