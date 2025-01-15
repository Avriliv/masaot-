import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

const Forms = () => {
  const navigate = useNavigate();

  const formTypes = [
    {
      title: 'תכנון מסלול',
      description: 'טופס תכנון מסלול הטיול',
      action: () => navigate('/new-trip')
    },
    {
      title: 'אישור הורים',
      description: 'טופס אישור הורים לטיול',
      action: () => { /* TODO: Add action */ }
    },
    {
      title: 'הצהרת בריאות',
      description: 'טופס הצהרת בריאות למשתתף',
      action: () => { /* TODO: Add action */ }
    },
    {
      title: 'רשימת ציוד',
      description: 'רשימת ציוד נדרש לטיול',
      action: () => { /* TODO: Add action */ }
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <Box sx={{ 
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1000
      }}>
        <IconButton
          onClick={() => navigate('/')}
          sx={{
            backgroundColor: '#1e88e5',
            color: 'white',
            '&:hover': {
              backgroundColor: '#1565c0'
            }
          }}
        >
          <HomeIcon />
        </IconButton>
      </Box>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, color: '#1976d2' }}>
        טפסים ואישורים
      </Typography>
      
      <Grid container spacing={3}>
        {formTypes.map((form, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom color="primary">
                  {form.title}
                </Typography>
                <Typography color="text.secondary">
                  {form.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={form.action}
                  sx={{ mr: 1 }}
                >
                  פתח טופס
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Forms;
