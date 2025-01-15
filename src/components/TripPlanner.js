import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import StepperProgress from './TripPlanner/components/StepperProgress';
import TripDetails from './planning/TripDetails';
import MapPlanning from './planning/MapPlanning';
import TripSummary from './planning/TripSummary';

const steps = [
    {
        label: 'פרטי הטיול',
        component: TripDetails
    },
    {
        label: 'תכנון מסלול',
        component: MapPlanning
    },
    {
        label: 'סיכום',
        component: TripSummary
    }
];

const TripPlanner = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [tripData, setTripData] = useState({});

    const handleUpdate = (data) => {
        setTripData(prevData => ({
            ...prevData,
            ...data
        }));
    };

    const CurrentStep = steps[activeStep].component;

    return (
        <Box sx={{ width: '100%', p: 2, direction: 'rtl' }}>
            <Typography variant="h4" gutterBottom align="center">
                תכנון טיול
            </Typography>
            
            <StepperProgress activeStep={activeStep} />
            
            <Box sx={{ mt: 4 }}>
                <CurrentStep 
                    data={tripData} 
                    onUpdate={handleUpdate}
                    onNext={() => setActiveStep(prev => Math.min(prev + 1, steps.length - 1))}
                    onBack={() => setActiveStep(prev => Math.max(prev - 1, 0))}
                    isLastStep={activeStep === steps.length - 1}
                />
            </Box>
        </Box>
    );
};

export default TripPlanner;
