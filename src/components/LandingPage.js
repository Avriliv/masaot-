import React from 'react';
import { Box, Card, CardContent, Typography, Container, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Hiking as NewTripIcon,
  Terrain as MapIcon,
  WbSunny as WeatherIcon,
  Backpack as MyTripsIcon,
  MenuBook as LearningIcon,
  LocationOn as TrackingIcon,
} from '@mui/icons-material';
import logoImage from '../assets/images/masa.logo.png';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'תכנון טיול חדש',
      icon: <NewTripIcon sx={{ fontSize: 50, color: '#2E7D32' }} />,
      path: '/new-trip',
      description: 'תכנון וניהול מסלולי טיול חדשים'
    },
    {
      title: 'מפה',
      icon: <MapIcon sx={{ fontSize: 50, color: '#1565C0' }} />,
      path: '/map',
      description: 'צפייה במפת שבילי הליכה ומסלולים'
    },
    {
      title: 'מזג אוויר',
      icon: <WeatherIcon sx={{ fontSize: 50, color: '#EF6C00' }} />,
      path: '/weather',
      description: 'מזג האוויר הנוכחי ותחזית ל-5 ימים'
    },
    {
      title: 'הטיולים שלי',
      icon: <MyTripsIcon sx={{ fontSize: 50, color: '#6A1B9A' }} />,
      path: '/my-trips',
      description: 'ניהול הטיולים שלי ותיקי השטח'
    },
    {
      title: 'אזור למידה',
      icon: <LearningIcon sx={{ fontSize: 50, color: '#2d5a27' }} />,
      path: '/learning-center',
      description: 'מדריכי טבע, צמחים ובעלי חיים'
    },
    {
      title: 'מעקב טיולים',
      icon: <TrackingIcon sx={{ fontSize: 50, color: '#d32f2f' }} />,
      path: '/live-tracking',
      description: 'מעקב אחר טיולים פעילים ומערכת SOS'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: '#f5f5f5',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Container 
        maxWidth="xl" 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 3, md: 4 },
          height: '100vh'
        }}
      >
        <Box sx={{
          width: '100%',
          maxWidth: 1400,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 0, md: 1 }
        }}>
          {/* Logo Section */}
          <Box sx={{ 
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            mb: { xs: 2, md: 4 },
            mt: { xs: -4, md: -6 }
          }}>
            <img 
              src={logoImage} 
              alt="Masa Logo" 
              style={{ 
                width: 'auto',
                height: '50vh',
                minHeight: '300px',
                maxHeight: '500px',
                objectFit: 'contain',
                marginBottom: '20px'
              }}
            />
          </Box>

          {/* Features Grid */}
          <Grid 
            container 
            spacing={3}
            sx={{ 
              width: '100%',
              maxWidth: '90%',
              mx: 'auto',
              mt: -4
            }}
          >
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                <Card
                  onClick={() => navigate(feature.path)}
                  sx={{
                    height: '100%',
                    minHeight: { xs: '100px', md: '140px' },
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: 2,
                    bgcolor: 'white',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    p: { xs: 1.5, md: 2 }
                  }}>
                    {React.cloneElement(feature.icon, {
                      sx: { 
                        fontSize: { xs: 32, md: 40 },
                        color: feature.icon.props.sx.color,
                        mb: 0.5
                      }
                    })}
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      sx={{ 
                        fontSize: { xs: '0.9rem', md: '1.1rem' },
                        fontWeight: 600,
                        textAlign: 'center',
                        mb: 0.5
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        color: 'text.secondary',
                        textAlign: 'center',
                        display: { xs: 'none', md: 'block' }
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
      {/* Footer */}
      <Box 
        component="footer" 
        sx={{
          width: '100%',
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: '0 -1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="body2" 
            align="center"
            sx={{ 
              color: 'text.secondary',
              fontWeight: 500,
              letterSpacing: 0.5
            }}
          >
            AVRI <span style={{ margin: '0 8px', opacity: 0.6 }}>|</span> 2024
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;