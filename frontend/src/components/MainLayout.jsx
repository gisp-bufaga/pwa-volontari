import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  Assignment as AssignmentIcon,
  Description as DocumentIcon,
  AccountCircle,
  Logout,
  ExpandLess,
  ExpandMore,
  Event,
} from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';

const drawerWidth = 260;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activitiesOpen, setActivitiesOpen] = useState(true);
  const [segretariaOpen, setSegretariaOpen] = useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

const isActive = (path) => {
  // Gestione speciale per dashboard
  if (path === '/dashboard') {
    return location.pathname === '/dashboard';
  }
  if (path === '/') {
    return location.pathname === '/dashboard';
  }
  return location.pathname.startsWith(path);
};

  // Definizione menu items principali
const menuItems = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',  // ← CAMBIATO da '/' a '/dashboard'
    roles: ['superadmin', 'admin', 'base'],
  },
  {
    title: 'Utenti',
    icon: <PeopleIcon />,
    path: '/users',
    roles: ['superadmin', 'admin'],
  },
];

  // Activities submenu
  const activitiesItems = [
    {
      title: 'Attività',
      icon: <Event />,
      path: '/activities',
      roles: ['superadmin', 'admin', 'base'],
    },
    {
      title: 'Calendario',
      icon: <CalendarIcon />,
      path: '/activities/calendar',
      roles: ['superadmin', 'admin', 'base'],
    },
  ];

  // Segreteria submenu
  const segretariaItems = [
    {
      title: 'Bacheca To-Do',
      icon: <AssignmentIcon />,
      path: '/segreteria/todos',
      roles: ['superadmin', 'admin'],
      area: 'segreteria',
    },
    {
      title: 'Documenti',
      icon: <DocumentIcon />,
      path: '/segreteria/documents',
      roles: ['superadmin', 'admin', 'base'],
    },
  ];

  const canAccess = (item) => {
    if (!user) return false;
    if (!item.roles.includes(user.role)) return false;
    
    // Check area-specific access
    if (item.area && user.role === 'admin') {
      return user.work_areas?.some((wa) => wa.code === item.area);
    }
    
    return true;
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          PWA Volontari
        </Typography>
      </Toolbar>
      <Divider />
      
      <List>
        {/* Menu principale */}
        {menuItems.map((item) => (
          canAccess(item) && (
            <ListItem key={item.title} disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          )
        ))}

        <Divider sx={{ my: 1 }} />

        {/* Activities Section */}
        <ListItemButton onClick={() => setActivitiesOpen(!activitiesOpen)}>
          <ListItemIcon>
            <CalendarIcon />
          </ListItemIcon>
          <ListItemText primary="Attività" />
          {activitiesOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={activitiesOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {activitiesItems.map((item) => (
              canAccess(item) && (
                <ListItem key={item.title} disablePadding>
                  <ListItemButton
                    sx={{ pl: 4 }}
                    selected={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                </ListItem>
              )
            ))}
          </List>
        </Collapse>

        {/* Segreteria Section */}
        <ListItemButton onClick={() => setSegretariaOpen(!segretariaOpen)}>
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="Segreteria" />
          {segretariaOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={segretariaOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {segretariaItems.map((item) => (
              canAccess(item) && (
                <ListItem key={item.title} disablePadding>
                  <ListItemButton
                    sx={{ pl: 4 }}
                    selected={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                  </ListItemButton>
                </ListItem>
              )
            ))}
          </List>
        </Collapse>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* Titolo dinamico basato su route */}
          </Typography>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {user?.first_name} {user?.last_name}
            </Typography>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.first_name?.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleProfile}>
          <AccountCircle sx={{ mr: 1 }} />
          Profilo
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;