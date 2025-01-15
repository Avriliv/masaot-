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

const Approvals = () => {
  const navigate = useNavigate();

  const approvalTypes = [
    {
      title: 'אישור הורים',
      description: 'טופס אישור הורים לטיול',
      action: () => { /* TODO: Add action */ }
    },
    {
      title: 'אישור בטחוני',
      description: 'אישור ביטחוני מהרשויות המוסמכות',
      action: () => { /* TODO: Add action */ }
    },
    {
      title: 'אישור רפואי',
      description: 'אישורים רפואיים ורשימת תלמידים עם צרכים מיוחדים',
      action: () => { /* TODO: Add action */ }
    },
    {
      title: 'אישור משטרה',
      description: 'אישור משטרה למסלול הטיול',
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
        אישורים נדרשים
      </Typography>

      <Grid container spacing={3}>
        {approvalTypes.map((type, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {type.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {type.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={type.action}
                  sx={{
                    backgroundColor: '#1e88e5',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1565c0'
                    }
                  }}
                >
                  צפה בטופס
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Approvals;
