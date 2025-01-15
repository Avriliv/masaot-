import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    ברוכים הבאים למסעות
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" paragraph>
                    מערכת לתכנון וניהול טיולים חינוכיים בישראל
                </Typography>
                <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => navigate('/route-planning')}
                    sx={{ mt: 2 }}
                >
                    התחל בתכנון מסלול
                </Button>
            </Box>
        </Container>
    );
};

export default HomePage;
