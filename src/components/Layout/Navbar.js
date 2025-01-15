import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <AppBar position="static" sx={{ bgcolor: 'white', color: 'primary.main' }}>
            <Toolbar>
                <Typography 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                        flexGrow: 1, 
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                    onClick={() => navigate('/')}
                >
                    מסעות
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button color="inherit" onClick={() => navigate('/new-trip')}>
                        תכנון מסלול
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/dashboard')}>
                        הטיולים שלי
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
