import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Divider from '@mui/material/Divider';
import { styled, useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import ArticleIcon from '@mui/icons-material/Article';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/GlobalAuth';
import {Menu, Fade, MenuItem} from '@mui/material';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const CustomAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function ButtonAppBar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState({});
  const {logout} = useAuth();
  const [anchorElLogout, setAnchorElLogout] = useState(null);
  const openLogout = Boolean(anchorElLogout);
  const [user, setUser]= useState({
    name: '',
    authorities:'',
  })
  useEffect(() =>{
    if(localStorage.getItem("username")){
      setUser({
        name: localStorage.getItem("username"),
        authorities:localStorage.getItem("authorities"),
      })
    }
  },[])

  const irHacia = (url) =>{
    navigate(url);
  }

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
    setExpandedSections({});
  };

  function stringToColor(string) {
    let hash = 0;
    let i;
  
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    let color = '#';
  
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */
  
    return color;
  }
  console.log(open)
  function stringAvatar(name) {
    const initials = name.split(' ').map(n => n[0]).join('');
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: initials,
    };
  }  const handleClickLogout = (e) =>{
    setAnchorElLogout(e.currentTarget);
  }

  const handleCloseLogout = () => {
    setAnchorElLogout(null);
  }
  const sections = [
    { 
      name: 'Propietarios', 
      icon: <AccountBoxIcon sx={{ color: "#0764CA" }} />, 
      subItems: [
        { name: 'Nuevo propietario', url: '/nuevo-propietario' },
        { name: 'Lista de propietarios', url: '/propietarios' }
      ]
    },
    { 
      name: 'Inquilinos', 
      icon: <AccountBoxIcon sx={{ color: "#E37DAA" }} />, 
      subItems: [
        { name: 'Nuevo inquilino', url: '/nuevo-inquilino' },
        { name: 'Lista de inquilinos', url: '/inquilinos' }
      ]
    },
    { 
      name: 'Garantes', 
      icon: <AccountBoxIcon sx={{ color: "#20C18F" }} />, 
      subItems: [
        { name: 'Nuevo garante', url: '/nuevo-garante' },
        { name: 'Lista de garantes', url: '/garantes' }
      ]
    },
    { 
      name: 'Propiedades', 
      icon: <MapsHomeWorkIcon sx={{ color: "#0764CA" }} />, 
      subItems: [
        { name: 'Nueva Propiedad', url: '/nueva-propiedad' },
        { name: 'Lista de propiedades', url: '/propiedades' }
      ]
    },
    { 
      name: 'Contratos', 
      icon: <ArticleIcon sx={{ color: "#E37DAA" }} />, 
      subItems: [
        { name: 'Nuevo contrato', url: '/nuevo-contrato' },
        { name: 'Lista de contratos', url: '/contratos' }
      ]
    },
    { 
      name: 'Servicios', 
      icon: <ReceiptIcon sx={{ color: "#20C18F" }} />, 
      subItems: [
        { name: 'Nuevo Servicio', url: '/nuevo-servicio' },
        { name: 'Lista de servicios', url: '/servicios' }
      ]
    }
  ];

  const handleSectionToggle = (section) => {
    setExpandedSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section]
    }));
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <CustomAppBar position="fixed" open={open}>
        <Toolbar sx={{ backgroundColor: "#001D34" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, cursor:"pointer" }}  onClick={() => irHacia("/")}>
            InmoProp
          </Typography>
          <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-around", width:"10rem"}}>
          <Typography>
            {user.name}
          </Typography>
          <Avatar {...stringAvatar((user.name).toUpperCase())}
          onClick={handleClickLogout} sx={{cursor:"pointer", backgroundColor:"green"}}
         />
         
          <Menu
          id="fade-menu-logout"
          MenuListProps={{
            'aria-labelledby': 'fade-button-logout',
          }}
          anchorEl={anchorElLogout}
          open={openLogout}
          onClose={handleCloseLogout}
          TransitionComponent={Fade}
        >
          <MenuItem  onClick={logout}>
            Cerrar Sesion
          </MenuItem>
        </Menu>

          </Box>
        </Toolbar>
      </CustomAppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {sections.map((section) => (
            <React.Fragment key={section.name}>
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                            onClick={open ? () => handleSectionToggle(section.name) : null} 
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    pointerEvents: open ? 'auto' : 'none', 
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {section.icon}
                  </ListItemIcon>
                  <ListItemText primary={section.name} sx={{ opacity: open ? 1 : 0 }} />
                  {expandedSections[section.name] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>
              <Collapse in={expandedSections[section.name]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {section.subItems.map((subItem) => (
                    <ListItemButton 
                      key={subItem.name} 
                      sx={{ pl: 4 }}
                      onClick={() => navigate(subItem.url)}  // Redirige al hacer clic
                    >
                      <ListItemText primary={subItem.name} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: open ? `${drawerWidth}px` : `calc(${theme.spacing(7)} + 1px)`,
          transition: theme.transitions.create(['margin-left', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          width: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${theme.spacing(7)} - 1px)`,
        }}
      >
        <DrawerHeader />
       
      </Box>
    </Box>
  );
}
