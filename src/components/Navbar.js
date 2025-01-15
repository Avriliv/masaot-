import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import MountainLogo from './MountainLogo';
import HomeIcon from '@mui/icons-material/Home';
import headerLogo from '../assets/images/masakoteret.logo.png';

const Navbar = ({ pageTitle, pageDescription }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        mb: { xs: 2, sm: 3 }
      }}
    >
      <Toolbar sx={{ minHeight: '32px !important', padding: '0 16px' }}>
        {/* Logo and App Title */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            '&:hover': {
              '& img': {
                transform: 'scale(1.02)',
                transition: 'transform 0.2s'
              }
            }
          }}
          onClick={() => navigate('/')}
        >
          <Box
            component="img"
            src={headerLogo}
            alt="Masa Logo"
            sx={{
              height: '140px',
              width: 'auto',
              marginRight: 2,
              marginTop: '-54px',
              marginBottom: '-54px',
              filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        </Box>

        {/* Page Title and Description */}
        <Box sx={{ flex: 1 }}>
          {pageTitle && (
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.primary',
                fontWeight: 500,
                fontSize: { xs: '1.1rem', sm: '1.3rem' }
              }}
            >
              {pageTitle}
            </Typography>
          )}
          {pageDescription && (
            <Typography 
              variant="body2"
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {pageDescription}
            </Typography>
          )}
        </Box>

        {/* Home Button */}
        <IconButton 
          onClick={() => navigate('/')}
          sx={{ 
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.04)'
            }
          }}
        >
          <HomeIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
