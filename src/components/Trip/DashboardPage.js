import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import TripSummary from './TripSummary';

const DashboardPage = () => {
    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    לוח בקרה
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TripSummary />
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default DashboardPage;
