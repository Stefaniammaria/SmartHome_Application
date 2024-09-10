import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import style from './NavBar.module.scss';
import { useNavigate } from 'react-router-dom';
import EditProfileDialog from './EditProfileDialog';

const drawerWidth = 240;
export const navItems = [
    { name: 'Log Out', path: '/Login'},
    { name: 'Sensors', path: '/Sensors'}
];

function NavBar(props) {
    const { windowProp } = props;
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [isEditProfileModalOpened, setIsEditProfileModalOpened] = React.useState(false);

    const navigate = useNavigate();

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                Application
            </Typography>
            <Divider />
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemButton sx={{ textAlign: 'center' }} onClick={() => navigate(item.path)}>
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
                <ListItem disablePadding>
                        <ListItemButton sx={{ textAlign: 'center' }} onClick={() => setIsEditProfileModalOpened(true)}>
                            <ListItemText primary={"Edit Profile"} />
                        </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    const container = windowProp !== undefined ? () => windowProp().document.body : undefined;

    return (<>
        <EditProfileDialog open={isEditProfileModalOpened} handleClose={()=>setIsEditProfileModalOpened(false)}></EditProfileDialog>
        <Box sx={{ display: 'flex' }} className={style.content}>
            <CssBaseline />
            <AppBar component="nav">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
                    >
                        Application
                    </Typography>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {navItems.map((item) => (
                            <Button key={item.name} sx={{ color: '#fff' }} onClick={() => navigate(item.path)}>
                                {item.name}
                            </Button>
                        ))}
                        <Button sx={{ color: '#fff' }} onClick={() => setIsEditProfileModalOpened(true)}> Edit Profile </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <nav>
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
        </Box>
        <Box component="main" sx={{ p: 3 }} className={style.content}>
            <Toolbar />
            {props.children}
        </Box></>
    );
}

export default NavBar;