import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Check as CheckIcon, Save as SaveIcon } from '@mui/icons-material';
import { useTrip } from '../../context/TripContext';

const SaveStatus = () => {
  const { tripState } = useTrip();
  const { lastSaved, lastModified } = tripState;

  const isSaving = lastModified && (!lastSaved || lastModified > lastSaved);
  const lastSavedDate = lastSaved ? new Date(lastSaved) : null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        backgroundColor: 'background.paper',
        padding: '4px 12px',
        borderRadius: 20,
        boxShadow: 1,
      }}
    >
      {isSaving ? (
        <>
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">
            שומר שינויים...
          </Typography>
        </>
      ) : lastSavedDate ? (
        <>
          <CheckIcon color="success" sx={{ fontSize: 16 }} />
          <Typography variant="caption" color="text.secondary">
            נשמר לאחרונה: {lastSavedDate.toLocaleTimeString()}
          </Typography>
        </>
      ) : (
        <>
          <SaveIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" color="text.secondary">
            טרם נשמר
          </Typography>
        </>
      )}
    </Box>
  );
};

export default SaveStatus;
