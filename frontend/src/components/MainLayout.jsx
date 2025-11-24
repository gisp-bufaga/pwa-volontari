import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Assignment,
  LocalShipping,
  DirectionsCar,
  Checklist,
  Description,
  Notifications,
  Settings,
  Person,
  Logout,
} from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';

const DRAWER_WIDTH = 260;

export default function MainLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, logout, isAdmin } = useAuthStore();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: Dashboard, path: '/dashboard' },
    { text: 'Profilo', icon: Person, path: '/profile' },
    ...(isAdmin() ? [
      { divider: true, text: 'Amministrazione' },
      { text: 'Utenti', icon: People, path: '/users' },
      { text: 'Attività', icon: Assignment, path: '/activities' },
      { text: 'Forniture', icon: LocalShipping, path: '/forniture' },
      { text: 'Veicoli', icon: DirectionsCar, path: '/vehicles' },
    ] : []),
    { divider: true, text: 'Operazioni' },
    { text: 'Checklist', icon: Checklist, path: '/checklist' },
    { text: 'Report', icon: Description, path: '/reports' },
    { text: 'Notifiche', icon: Notifications, path: '/notifications' },
  ];

  const drawer = (
    <Box>
      {/* Logo */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          PWA Volontari
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ px: 1, pt: 2 }}>
        {menuItems.map((item, index) => {
          if (item.divider) {
            return (
              <Box key={index}>
                <Divider sx={{ my: 1 }} />
                {item.text && (
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2,
                      py: 1,
                      display: 'block',
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                    }}
                  >
                    {item.text}
                  </Typography>
                )}
              </Box>
            );
          }

          return (
            <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) handleDrawerToggle();
                }}
                sx={{
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* Breadcrumb o titolo pagina */}
          </Typography>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.first_name || user?.username}
            </Typography>
            <IconButton onClick={handleProfileMenuOpen} size="small">
              <Avatar
                sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}
              >
                {user?.first_name?.[0] || user?.username?.[0]}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
              <ListItemIcon><Person /></ListItemIcon>
              Profilo
            </MenuItem>
            <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
              <ListItemIcon><Settings /></ListItemIcon>
              Impostazioni
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><Logout /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}