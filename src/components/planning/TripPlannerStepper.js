import React, { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Container } from '@mui/material';
import BasicInfo from './BasicInfo';
import RouteDetails from './RouteDetails';
import Summary from './Summary';

const steps = [
    'פרטים בסיסיים',
    'תכנון מסלולי',
    'סיכום'
];

const TripPlannerStepper = () => {
    const [activeStep, setActiveStep] = useState(0);
    const navigate = useNavigate();
    const { tripState, updateBasicDetails, updateRoute } = useTrip();

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleFinish = () => {
        navigate('/my-trips');
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return <BasicInfo 
                    onSubmit={handleNext}
                    basicDetails={tripState.basicDetails}
                    onUpdateBasicDetails={updateBasicDetails}
                />;
            case 1:
                return <RouteDetails 
                    onSubmit={handleNext}
                    route={tripState.route}
                    onUpdateRoute={updateRoute}
                />;
            case 2:
                return <Summary 
                    onFinish={handleFinish}
                />;
            default:
                return 'Unknown step';
        }
    };

    return (
        <Container>
            <Box sx={{ width: '100%', mt: 3 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <Box sx={{ mt: 4 }}>
                    {getStepContent(activeStep)}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button
                            variant="contained"
                            disabled={activeStep === 0}
                            onClick={handleBack}
                        >
                            חזור
                        </Button>
                        {activeStep !== steps.length - 1 && (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                            >
                                הבא
                            </Button>
                        )}
                        {activeStep === steps.length - 1 && (
                            <Button
                                variant="contained"
                                onClick={handleFinish}
                            >
                                סיום
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default TripPlannerStepper;
