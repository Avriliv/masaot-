import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Send as SendIcon, 
  Save as SaveIcon, 
  Clear as ClearIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import SignatureCanvas from 'react-signature-canvas';

const ParentalApproval = ({ tripData, students }) => {
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    idNumber: '',
    phone: '',
    canSwim: null,
    healthDeclaration: false,
    hasMedicalLimitation: false,
    medicalDetails: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [signatureError, setSignatureError] = useState(false);
  const signatureRef = useRef();

  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendingStatus, setSendingStatus] = useState({});

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const clearSignature = () => {
    signatureRef.current.clear();
    setSignatureError(false);
  };

  const downloadForm = () => {
    const formContent = `
טופס אישור הורים - ${tripData?.title}
----------------------------
שם התלמיד/ה: ${formData.studentName}
שם ההורה: ${formData.parentName}
תעודת זהות: ${formData.idNumber}
טלפון: ${formData.phone}
יכול/ה לשחות: ${formData.canSwim === true ? 'כן' : formData.canSwim === false ? 'לא' : 'לא הוגדר'}
הצהרת בריאות: ${formData.healthDeclaration ? 'אושר' : 'לא אושר'}
מגבלות רפואיות/אלרגיות: ${formData.hasMedicalLimitation ? 'כן' : 'לא'}
פירוט המגבלות הרפואיות/אלרגיות: ${formData.medicalDetails}
תאריך: ${formData.date}
    `;

    const blob = new Blob([formContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `אישור_הורים_${formData.studentName}.txt`;
    a.click();
  };

  const handleSubmit = () => {
    if (signatureRef.current.isEmpty()) {
      setSignatureError(true);
      return;
    }

    setSignatureError(false);
    setShowSuccess(true);
    // כאן יתווסף קוד לשמירת הטופס
  };

  const handleSendToAll = () => {
    setSendDialogOpen(true);
  };

  const handleSendViaEmail = async (studentId) => {
    // כאן יתווסף קוד לשליחת המייל
    setSendingStatus(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], email: 'sent' }
    }));
  };

  const handleSendViaWhatsApp = async (studentId) => {
    // כאן יתווסף קוד לשליחת הוואטסאפ
    setSendingStatus(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], whatsapp: 'sent' }
    }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="שם התלמיד/ה"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="שם ההורה"
            name="parentName"
            value={formData.parentName}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="תעודת זהות"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="טלפון"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            בני/בתי יודע/ת לשחות?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={formData.canSwim === true ? "contained" : "outlined"}
              onClick={() => handleChange({ target: { name: 'canSwim', value: true }})}
            >
              כן
            </Button>
            <Button
              variant={formData.canSwim === false ? "contained" : "outlined"}
              onClick={() => handleChange({ target: { name: 'canSwim', value: false }})}
            >
              לא
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                required
                checked={formData.healthDeclaration}
                onChange={handleChange}
                name="healthDeclaration"
              />
            }
            label="אני מצהיר/ה כי בני/בתי כשיר/ה מבחינה בריאותית להשתתף בפעילות"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            האם יש לבני/בתי מגבלה רפואית/אלרגיה?
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={formData.hasMedicalLimitation === true ? "contained" : "outlined"}
              onClick={() => handleChange({ target: { name: 'hasMedicalLimitation', value: true }})}
            >
              כן
            </Button>
            <Button
              variant={formData.hasMedicalLimitation === false ? "contained" : "outlined"}
              onClick={() => handleChange({ target: { name: 'hasMedicalLimitation', value: false }})}
            >
              לא
            </Button>
          </Box>
          {formData.hasMedicalLimitation && (
            <Fade in={formData.hasMedicalLimitation}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="פירוט המגבלות הרפואיות/אלרגיות"
                name="medicalDetails"
                value={formData.medicalDetails}
                onChange={handleChange}
                sx={{ mt: 2 }}
              />
            </Fade>
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            חתימה דיגיטלית
          </Typography>
          <Box
            sx={{
              border: theme => `1px solid ${signatureError ? theme.palette.error.main : theme.palette.divider}`,
              borderRadius: 1,
              mb: 1
            }}
          >
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas'
              }}
            />
          </Box>
          {signatureError && (
            <Typography color="error" variant="caption">
              נדרשת חתימה להמשך
            </Typography>
          )}
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={clearSignature}
            sx={{ mt: 1 }}
          >
            נקה חתימה
          </Button>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={downloadForm}
            >
              הורד טופס
            </Button>
            {students?.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                onClick={handleSendToAll}
              >
                שלח לכל ההורים
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      <Dialog
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          שליחת טופס אישור הורים
          <Typography variant="subtitle2" color="text.secondary">
            בחר את אמצעי השליחה לכל הורה
          </Typography>
        </DialogTitle>
        <DialogContent>
          <List>
            {students?.map((student) => (
              <ListItem
                key={student.id}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="שלח במייל">
                      <IconButton
                        onClick={() => handleSendViaEmail(student.id)}
                        disabled={sendingStatus[student.id]?.email === 'sent'}
                        color={sendingStatus[student.id]?.email === 'sent' ? 'success' : 'default'}
                      >
                        {sendingStatus[student.id]?.email === 'sent' ? <CheckIcon /> : <EmailIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="שלח בוואטסאפ">
                      <IconButton
                        onClick={() => handleSendViaWhatsApp(student.id)}
                        disabled={sendingStatus[student.id]?.whatsapp === 'sent'}
                        color={sendingStatus[student.id]?.whatsapp === 'sent' ? 'success' : 'default'}
                      >
                        {sendingStatus[student.id]?.whatsapp === 'sent' ? <CheckIcon /> : <WhatsAppIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemText
                  primary={`${student.name} ${student.familyName}`}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2">
                        {student.parentName} - {student.parentPhone}
                      </Typography>
                      <br />
                      <Typography component="span" variant="body2" color="text.secondary">
                        {student.parentEmail}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>סגור</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          הטופס נשלח בהצלחה!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ParentalApproval;
