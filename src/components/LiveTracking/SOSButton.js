import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Box,
  Typography
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const SOSButton = ({ onSOS, currentLocation }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastSOS, setLastSOS] = useState(null);

  const handleClickOpen = () => {
    setOpen(true);
    setMessage('');
    setShowConfirmation(false);
  };

  const handleClose = () => {
    setOpen(false);
    setMessage('');
    setShowConfirmation(false);
  };

  const handleConfirm = () => {
    if (currentLocation) {
      const sosData = {
        location: currentLocation,
        message: message.trim(),
        timestamp: new Date(),
        status: 'active',
        sender: {
          role: 'מנהל מערכת',
          name: 'משה ישראלי' // בהמשך נוסיף מערכת משתמשים
        }
      };
      
      onSOS(sosData);
      setLastSOS(sosData);
      setShowConfirmation(true);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="error"
        size="large"
        startIcon={<WarningIcon />}
        onClick={handleClickOpen}
        sx={{
          borderRadius: 2,
          py: 2,
          boxShadow: 3,
          '&:hover': {
            backgroundColor: 'error.dark',
          },
        }}
      >
        SOS - לחצן מצוקה
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        {!showConfirmation ? (
          // טופס שליחת SOS
          <>
            <DialogTitle id="alert-dialog-title" color="error">
              {"שליחת קריאת מצוקה"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                האם את/ה בטוח/ה שברצונך לשלוח אות מצוקה?
                {!currentLocation && (
                  <Box sx={{ color: 'error.main', mt: 1 }}>
                    אזהרה: לא ניתן לקבל את המיקום הנוכחי שלך!
                  </Box>
                )}
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="הודעה (אופציונלי)"
                type="text"
                fullWidth
                multiline
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                variant="outlined"
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                ביטול
              </Button>
              <Button 
                onClick={handleConfirm} 
                color="error" 
                variant="contained" 
                autoFocus
                disabled={!currentLocation}
              >
                שלח קריאת מצוקה
              </Button>
            </DialogActions>
          </>
        ) : (
          // אישור שליחת SOS
          <>
            <DialogTitle id="confirmation-dialog-title" color="success">
              {"קריאת המצוקה נשלחה בהצלחה"}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>פרטי הקריאה:</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>זמן:</strong> {lastSOS?.timestamp.toLocaleTimeString()}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>מיקום:</strong> {lastSOS?.location.latitude.toFixed(6)}, {lastSOS?.location.longitude.toFixed(6)}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>דיוק:</strong> {Math.round(lastSOS?.location.accuracy)} מטרים
                </Typography>
                {lastSOS?.message && (
                  <Typography variant="body2" gutterBottom>
                    <strong>הודעה:</strong> {lastSOS.message}
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary" variant="contained">
                סגור
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default SOSButton;
