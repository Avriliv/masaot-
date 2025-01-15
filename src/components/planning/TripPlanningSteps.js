import React, { useState } from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
} from '@mui/material';
import BasicInfo from './BasicInfo';
import MapPlanning from './MapPlanning';
import TripSummary from './TripSummary';
import { useTrip } from '../../context/TripContext';

const steps = [
    {
        label: 'פרטי הטיול',
        description: 'הגדרת פרטי הטיול הבסיסיים',
        component: BasicInfo,
        validation: (state) => state?.basicDetails?.tripName
    },
    {
        label: 'תכנון מסלול',
        description: 'תכנון מסלול הטיול על המפה',
        component: MapPlanning,
        validation: (state) => state?.basicDetails?.dailyLocations?.length > 0
    },
    {
        label: 'סיכום',
        description: 'סיכום פרטי הטיול',
        component: TripSummary,
        validation: () => true
    }
];

const TripPlanningSteps = () => {
    const [activeStep, setActiveStep] = useState(0);
    const { state } = useTrip();

    const handleNext = () => {
        const currentStep = steps[activeStep];
        if (currentStep.validation(state)) {
            if (activeStep < steps.length - 1) {
                setActiveStep((prevStep) => prevStep + 1);
            }
        }
    };

    const handleBack = () => {
        if (activeStep > 0) {
            setActiveStep((prevStep) => prevStep - 1);
        }
    };

    const CurrentStepComponent = steps[activeStep].component;

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((step, index) => (
                    <Step key={step.label}>
                        <StepLabel>{step.label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            <Box sx={{ mt: 4 }}>
                <CurrentStepComponent />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                        color="inherit"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                    >
                        חזור
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={!steps[activeStep].validation(state)}
                    >
                        {activeStep === steps.length - 1 ? 'סיים' : 'הבא'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default TripPlanningSteps;
