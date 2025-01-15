import React from 'react';
import { 
  Alert, 
  AlertTitle,
  Box, 
  IconButton, 
  Collapse, 
  Stack,
  Typography,
  Chip 
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const AlertsPanel = ({ alerts, onDismiss }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        maxWidth: '80%',
        minWidth: 300
      }}
    >
      <Stack spacing={1}>
        {alerts.map((alert) => (
          <Collapse key={alert.id} in={true}>
            <Alert
              severity={alert.type}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => onDismiss(alert.id)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ mb: 1, boxShadow: 3 }}
            >
              {alert.message}
              {alert.type === 'warning' && alert.accuracy && (
                <div>דיוק נוכחי: {Math.round(alert.accuracy)} מטרים</div>
              )}
            </Alert>
          </Collapse>
        ))}
      </Stack>
    </Box>
  );
};

export default AlertsPanel;
