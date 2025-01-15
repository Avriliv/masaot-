import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { useTrip } from '../../context/TripContext';
import TripDetails from './components/TripDetails';
import MapPlanning from '../planning/MapPlanning';

const steps = [
  'פרטי הטיול',
  'הצגת מסלול',
  'סיכום'
];

export default function TripPlannerMain() {
  const [activeStep, setActiveStep] = useState(0);
  const { tripState, updateStatus, updateTrip } = useTrip();

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      updateStatus('pending_approval');
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    // אם חוזרים משלב המפה, נאפס את המסלול
    if (activeStep === 1) {
      updateTrip({
        route: {
          startPoint: null,
          endPoint: null,
          checkpoints: []
        }
      });
    }
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <TripDetails onNext={handleNext} />;
      case 1:
        return <MapPlanning onSubmit={handleNext} onBack={handleBack} />;
      case 2:
        return <div>סיכום - בקרוב</div>;
      default:
        return null;
    }
  };

  return (
    <Container 
      maxWidth={false}
      sx={{ 
        px: { xs: 1, sm: 1.5, md: 2 },
        py: { xs: 1, sm: 1.5 },
        maxWidth: '900px',
        margin: '0 auto',
        flex: '1 0 auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box 
        sx={{ 
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1, sm: 1.5 }
        }}
      >
        <Typography 
          variant="subtitle1"
          component="h1" 
          gutterBottom 
          align="center"
          sx={{
            fontWeight: 500,
            color: '#37474f',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            mb: 1
          }}
        >
          תכנון טיול חדש
        </Typography>

        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            overflowX: 'auto',
            direction: 'rtl',
            '& .MuiStepLabel-root': {
              flex: '0 0 auto',
              minWidth: { xs: '70px', sm: '90px' }
            },
            '& .MuiStepLabel-label': {
              fontWeight: 'normal',
              fontSize: { xs: '0.65rem', sm: '0.75rem' },
              color: '#546e7a'
            },
            '& .MuiStepLabel-label.Mui-active': {
              color: '#37474f',
              fontWeight: 500
            }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: '250px', sm: '300px' },
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <CardContent 
            sx={{ 
              p: { xs: 1, sm: 1.5 },
              flex: 1,
              overflow: 'auto',
              display: 'flex'
            }}
          >
            {renderStepContent(activeStep)}
          </CardContent>
        </Card>

        {activeStep > 0 && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: 1,
              pt: 0.5
            }}
          >
            <Button
              variant="outlined"
              onClick={handleBack}
              size="small"
              sx={{ 
                minWidth: 0,
                px: 1.5,
                py: 0.5,
                fontSize: '0.8rem',
                borderRadius: 1,
                color: 'text.secondary',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: 'transparent'
                }
              }}
            >
              חזור
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
