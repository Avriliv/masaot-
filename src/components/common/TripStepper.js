import React from 'react';
import { Stepper, Step, StepLabel, Paper, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2, 0),
  direction: 'rtl'
}));

const steps = [
  'פרטי הטיול',
  'תכנון מסלול',
  'תכנון לוגיסטי',
  'אישורים וטפסים',
  'סיכום'
];

const TripStepper = ({ activeStep }) => {
  return (
    <StyledPaper elevation={0}>
      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </StyledPaper>
  );
};

export default TripStepper;
