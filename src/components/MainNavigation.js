import React from 'react';
import { Box, Grid, Paper, Typography, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Map as MapIcon,
  Add as AddIcon,
  WbSunny as WeatherIcon,
  Folder as FolderIcon,
  Home as HomeIcon,
  Terrain as MountainLogo,
  Hiking as HikingIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';

const MainNavigation = () => {
  const navigate = useNavigate();

  const mainMenuItems = [
    {
      title: 'תכנון טיולים',
      icon: <MapIcon sx={{ fontSize: 40 }} />,
      path: '/new-trip',
      color: '#4caf50',
      description: 'תכנון וניהול מסלולי טיול'
    },
    {
      title: 'מפה',
      icon: <MapIcon sx={{ fontSize: 40 }} />,
      path: '/map',
      color: '#1976d2'
    },
    {
      title: 'מזג אוויר',
      icon: <WeatherIcon sx={{ fontSize: 40 }} />,
      path: '/weather',
      color: '#ff9800'
    },
    {
      title: 'הטיולים שלי',
      icon: <HikingIcon sx={{ fontSize: 40 }} />,
      path: '/my-trips',
      color: '#f44336',
      description: 'צפייה בטיולים קיימים, תיקי טיול, ניהול משתתפים, בטיחות ולוגיסטיקה'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* לוגו וכותרת */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        mb: 6 
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 2
        }}>
          <MountainLogo sx={{ fontSize: 60, color: 'primary.main', mr: 2 }} />
        </Box>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              color: '#4a90e2',
              fontWeight: 'bold',
              mb: 2
            }}
          >
            מסעות
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              maxWidth: '600px',
              mx: 'auto',
              textAlign: 'center'
            }}
          >
            מערכת לניהול טיולים חינוכיים בישראל
          </Typography>
        </Box>
      </Box>

      {/* כפתור חזרה */}
      <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
        <IconButton 
          onClick={() => navigate('/')}
          sx={{ 
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'scale(1.1)',
              transition: 'transform 0.2s'
            }
          }}
        >
          <HomeIcon />
        </IconButton>
      </Box>

      {/* כרטיסיות ניווט */}
      <Grid container spacing={4}>
        {mainMenuItems.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.path}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                  '& .MuiIconButton-root': {
                    backgroundColor: item.color,
                    transform: 'scale(1.1)'
                  }
                }
              }}
              onClick={() => navigate(item.path)}
            >
              <IconButton
                sx={{
                  backgroundColor: item.color + '22',
                  mb: 2,
                  p: 2,
                  transition: 'all 0.2s',
                  '& .MuiSvgIcon-root': {
                    color: item.color
                  }
                }}
              >
                {item.icon}
              </IconButton>
              <Typography variant="h6" align="center" gutterBottom>
                {item.title}
              </Typography>
              {item.description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  align="center"
                  sx={{ mt: 1 }}
                >
                  {item.description}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MainNavigation;
