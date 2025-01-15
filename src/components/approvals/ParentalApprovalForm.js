import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  TextField,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import { useParams } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SignatureCanvas from 'react-signature-canvas';

const ParentalApprovalForm = () => {
  const { tripId, participantId } = useParams();
  const [signature, setSignature] = useState(null);
  const [approved, setApproved] = useState(false);
  const [parentName, setParentName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ניקוי החתימה
  const clearSignature = () => {
    if (signature) {
      signature.clear();
    }
  };

  // שמירת האישור
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!signature?.isEmpty() && parentName && approved) {
      try {
        const signatureData = signature.toDataURL();
        
        // TODO: שליחת האישור לשרת
        console.log('Submitting approval:', {
          tripId,
          participantId,
          parentName,
          signatureData,
          approved,
          timestamp: new Date()
        });

        setSuccess(true);
      } catch (err) {
        setError('אירעה שגיאה בשמירת האישור');
      }
    } else {
      setError('נא למלא את כל השדות ולחתום');
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          p: 3
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          האישור התקבל בהצלחה!
        </Typography>
        <Typography color="text.secondary">
          תודה על שיתוף הפעולה
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          אישור השתתפות בטיול
        </Typography>

        <Divider sx={{ my: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                פרטי הטיול
              </Typography>
              {/* TODO: הצגת פרטי הטיול מה-API */}
              <Typography variant="body1">
                יעד: טיול שנתי לצפון
              </Typography>
              <Typography variant="body1">
                תאריכים: 20-22/12/2024
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                הצהרת בריאות
              </Typography>
              <Typography variant="body2" paragraph>
                הנני מצהיר/ה בזאת:
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={approved}
                    onChange={(e) => setApproved(e.target.checked)}
                  />
                }
                label="בני/בתי כשיר/ה לצאת לטיול ואין לי התנגדות להשתתפותו/ה בפעילויות המתוכננות"
              />
            </Box>

            <TextField
              label="שם ההורה המאשר"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              required
              fullWidth
            />

            <Box>
              <Typography variant="h6" gutterBottom>
                חתימה דיגיטלית
              </Typography>
              <Paper
                variant="outlined"
                sx={{ 
                  border: '1px solid rgba(0, 0, 0, 0.23)',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <SignatureCanvas
                  ref={(ref) => setSignature(ref)}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'signature-canvas'
                  }}
                />
              </Paper>
              <Button onClick={clearSignature} sx={{ mt: 1 }}>
                נקה חתימה
              </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!approved || !parentName || (signature && signature.isEmpty())}
              >
                אשר השתתפות
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ParentalApprovalForm;
