import React from 'react';
import { Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import NewTrip from './NewTrip';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addTrip } from '../../redux/slices/tripsSlice';

const NewTripDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = (formData) => {
    const newTrip = {
      id: Date.now().toString(),
      basicDetails: {
        tripName: formData.tripName,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        grade: formData.grade,
        type: formData.type,
        location: formData.location
      },
      status: 'draft',
      participants: [],
      logistics: {
        transportation: [],
        equipment: [],
        food: []
      },
      schedule: [],
      budget: {
        expenses: [],
        income: []
      },
      approvals: {
        parentalApprovals: [],
        schoolApprovals: [],
        securityApprovals: []
      },
      notes: '',
      lastModified: new Date().toISOString()
    };

    dispatch(addTrip(newTrip));
    navigate('/my-trips');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Box>
      <NewTrip 
        onSubmit={handleSubmit}
        onBack={handleBack}
        submitButtonText="שמור טיול"
        backButtonText="חזור"
        submitButtonIcon={<ArrowBack />}
      />
    </Box>
  );
};

export default NewTripDetails;
