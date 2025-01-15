import React from 'react';
import { Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

const NavigationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(4),
  direction: 'rtl',
}));

const StepperNavigation = ({ activeStep, handleNext, handleBack, isLastStep }) => {
  return (
    <NavigationContainer>
      <Button
        variant="outlined"
        onClick={handleBack}
        disabled={activeStep === 0}
        startIcon={<NavigateBeforeIcon />}
      >
        חזור
      </Button>
      <Button
        variant="contained"
        onClick={handleNext}
        endIcon={<NavigateNextIcon />}
      >
        {isLastStep ? 'סיים' : 'המשך'}
      </Button>
    </NavigationContainer>
  );
};

export default StepperNavigation;
