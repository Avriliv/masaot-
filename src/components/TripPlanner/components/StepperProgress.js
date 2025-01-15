import React from 'react';
import { Stepper, Step, StepLabel, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import MapIcon from '@mui/icons-material/Map';
import CheckIcon from '@mui/icons-material/CheckCircle';

const steps = [
    {
        label: 'פרטי הטיול',
        description: 'הגדרת פרטי הטיול הבסיסיים',
        icon: <InfoIcon />
    },
    {
        label: 'תכנון מסלול',
        description: 'תכנון מסלול הטיול על המפה',
        icon: <MapIcon />
    },
    {
        label: 'סיכום',
        description: 'סיכום פרטי הטיול',
        icon: <CheckIcon />
    }
];

const StyledStepper = styled(Stepper)(({ theme }) => ({
    '& .MuiStepLabel-root': {
        flexDirection: 'row-reverse'
    },
    '& .MuiStepLabel-labelContainer': {
        marginRight: theme.spacing(1),
        marginLeft: 0
    }
}));

const StepperProgress = ({ activeStep }) => {
    return (
        <StyledStepper activeStep={activeStep} alternativeLabel>
            {steps.map((step) => (
                <Step key={step.label}>
                    <StepLabel StepIconComponent={() => step.icon}>
                        <Typography>{step.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {step.description}
                        </Typography>
                    </StepLabel>
                </Step>
            ))}
        </StyledStepper>
    );
};

export default StepperProgress;
