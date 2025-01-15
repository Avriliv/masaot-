import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
} from '@mui/material';
import {
  Home as HomeIcon,
  Add as AddIcon,
  List as ListIcon,
  Description as DescriptionIcon,
  Map as MapIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  LocalShipping as LogisticsIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StandaloneMap from '../Map/StandaloneMap';

const navigationItems = [
  {
    id: 'newTrip',
    title: 'טיול חדש',
    icon: AddIcon,
    path: '/new-trip',
    description: 'תכנון וארגון טיול חדש',
  },
  {
    id: 'myTrips',
    title: 'הטיולים שלי',
    icon: ListIcon,
    path: '/my-trips',
    description: 'צפייה וניהול הטיולים שלך',
  },
  {
    id: 'participants',
    title: 'ניהול משתתפים',
    icon: PeopleIcon,
    path: '/participants',
    description: 'רשימות משתתפים, טפסים ואישורים',
  },
  {
    id: 'security',
    title: 'בטיחות ואבטחה',
    icon: SecurityIcon,
    path: '/security',
    description: 'מעקב GPS, התראות ונקודות חירום',
  },
  {
    id: 'logistics',
    title: 'לוגיסטיקה',
    icon: LogisticsIcon,
    path: '/logistics',
    description: 'ציוד, ארוחות והסעות',
  },
  {
    id: 'forms',
    title: 'אישורים וטפסים',
    icon: DescriptionIcon,
    path: '/forms',
    description: 'טפסי משרד החינוך ואישורי הורים',
  },
  {
    id: 'map',
    title: 'מפת שבילים',
    icon: MapIcon,
    path: '/map',
    description: 'מפת שבילים מסומנים ומסלולים',
  },
  {
    id: 'dashboard',
    title: 'פאנל ניהול',
    icon: DashboardIcon,
    path: '/dashboard',
    description: 'ניהול משתמשים וסטטיסטיקות',
  }
];

const MainNavigation = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh', 
      display: 'flex',
      backgroundColor: '#f8fbff'
    }}>
      {/* כפתור בית קבוע */}
      <Box
        sx={{
          width: '64px',
          backgroundColor: '#2196f3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 2,
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          boxShadow: '0 0 15px rgba(0,0,0,0.1)',
          zIndex: 1200
        }}
      >
        <Button
          sx={{
            minWidth: 'unset',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
          }}
          onClick={() => navigate('/')}
        >
          <HomeIcon sx={{ fontSize: 28 }} />
        </Button>
      </Box>

      {/* תוכן ראשי */}
      <Box sx={{ flexGrow: 1, mr: '64px', p: 4 }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            {navigationItems.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    borderRadius: '15px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    backgroundColor: 'white',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                      '& .icon-container': {
                        backgroundColor: '#2196f3',
                        '& svg': {
                          color: 'white',
                          transform: 'scale(1.1)'
                        }
                      }
                    },
                  }}
                  onClick={() => navigate(item.path)}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      p: 3,
                      height: '100%'
                    }}
                  >
                    <Box
                      className="icon-container"
                      sx={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '15px',
                        backgroundColor: '#f0f7ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {React.createElement(item.icon, {
                        sx: { 
                          fontSize: 32, 
                          color: '#2196f3',
                          transition: 'all 0.3s ease'
                        },
                      })}
                    </Box>
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 600,
                        color: '#1a1a1a',
                        mb: 1.5,
                        fontSize: '1.25rem'
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ 
                        flexGrow: 1,
                        lineHeight: 1.6,
                        fontSize: '1rem'
                      }}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* מפה נפרדת */}
      {window.location.pathname === '/map' && (
        <Box sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'background.default'
        }}>
          <StandaloneMap isStandalone={true} />
        </Box>
      )}
    </Box>
  );
};

export default MainNavigation;
