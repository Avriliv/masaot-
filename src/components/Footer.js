import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        backgroundColor: 'white',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 2,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {'© '}{currentYear}{' מסעות - מערכת לתכנון וניהול טיולים חינוכיים'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
