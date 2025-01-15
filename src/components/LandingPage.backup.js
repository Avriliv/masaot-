import React from 'react';
import { Box, Card, CardContent, Typography, Container, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Hiking as NewTripIcon,
  Terrain as MapIcon,
  WbSunny as WeatherIcon,
  Backpack as MyTripsIcon,
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
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        {/* Logo Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          mb: 2,
          '&:hover img': {
            transform: 'scale(1.02)',
          }
        }}>
          <img 
            src={logoImage} 
            alt="Masa Logo" 
            style={{ 
              height: '450px',
              transition: 'transform 0.3s ease'
            }}
          />
        </Box>

        {/* Features Grid */}
        <Grid container spacing={3} justifyContent="center" sx={{ mt: -12 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                onClick={() => navigate(feature.path)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ 
                  textAlign: 'center',
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  p: 3
                }}>
                  {feature.icon}
                  <Typography variant="h6" component="h2" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
