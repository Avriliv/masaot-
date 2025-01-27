import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[800],
            }}
        >
            <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary" align="center">
                    {'© '}
                    {new Date().getFullYear()}
                    {' מסעות - מערכת לתכנון וניהול טיולים חינוכיים'}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                    {'מפות באדיבות '}
                    <a href="https://www.openstreetmap.org/copyright" style={{ color: 'inherit' }}>OpenStreetMap</a>
                    {' ו'}
                    <a href="https://israelhiking.osm.org.il" style={{ color: 'inherit' }}>Israel Hiking Map</a>
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;
