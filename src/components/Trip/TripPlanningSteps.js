import React, { useState } from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Container
} from '@mui/material';
import BasicInfo from '../planning/BasicInfo';
import MapPlanning from '../planning/MapPlanning';
import TripSummary from '../planning/TripSummary';
import { useTrip } from '../../context/TripContext';
import { useTrips } from '../../context/TripsContext';
import { useNavigate } from 'react-router-dom';

const steps = [
    {
        label: 'פרטים בסיסיים',
        description: 'הגדרת פרטי הטיול הבסיסיים',
        component: BasicInfo
    },
    {
        label: 'תכנון מסלול',
        description: 'תכנון מסלול הטיול על המפה',
        component: MapPlanning
    },
    {
        label: 'סיכום',
        description: 'סיכום פרטי הטיול',
        component: TripSummary
    }
];

const TripPlanningSteps = () => {
    const [activeStep, setActiveStep] = useState(0);
    const { tripState } = useTrip();
    const { addTrip } = useTrips();
    const navigate = useNavigate();

    const handleNext = () => {
        if (activeStep < steps.length - 1) {
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        if (activeStep > 0) {
            setActiveStep((prevStep) => prevStep - 1);
        }
    };

    const handleFinish = () => {
        // מוסיף את הטיול החדש למערכת
        addTrip({
            id: Date.now(),
            ...tripState,
            status: 'planned',
            createdAt: new Date().toISOString()
        });
        
        navigate('/my-trips');
    };

    const CurrentStepComponent = steps[activeStep].component;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((step) => (
                    <Step key={step.label}>
                        <StepLabel>{step.label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Box sx={{ mt: 4 }}>
                <CurrentStepComponent onSubmit={handleNext} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        variant="contained"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                    >
                        חזור
                    </Button>
                    {activeStep < steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                        >
                            הבא
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleFinish}
                        >
                            סיים
                        </Button>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default TripPlanningSteps;
