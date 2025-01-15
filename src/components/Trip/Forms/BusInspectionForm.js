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
  FormGroup,
  Alert,
  Divider
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Print as PrintIcon,
  Clear as ClearIcon,
  Download as DownloadIcon 
} from '@mui/icons-material';
import SignatureCanvas from 'react-signature-canvas';

const BusInspectionForm = ({ tripData }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    busNumber: '',
    driverName: '',
    driverLicense: '',
    driverPhone: '',
    companyName: '',
    departureTime: '',
    inspectorName: '',
    
    // בדיקות בטיחות לפי חוזר מנכ"ל
    checks: {
      license: false,
      insurance: false,
      firstAidKit: false,
      fireExtinguisher: false,
      emergencyExits: false,
      airConditioner: false,
      cleanBus: false,
      validTachograph: false,
      safetyBelt: false,
      microphone: false
    },
    
    notes: ''
  });

  const [signature, setSignature] = useState(null);
  const signatureRef = useRef();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name.startsWith('check-')) {
      const checkName = name.replace('check-', '');
      setFormData(prev => ({
        ...prev,
        checks: {
          ...prev.checks,
          [checkName]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const clearSignature = () => {
    signatureRef.current.clear();
    setSignature(null);
  };

  const handleSubmit = () => {
    if (!signature) {
      alert('נא לחתום על הטופס לפני השליחה');
      return;
    }

    const allChecked = Object.values(formData.checks).every(item => item);
    if (!allChecked) {
      alert('יש לסמן את כל פריטי הבדיקה');
      return;
    }

    console.log('Form submitted:', { ...formData, signature });
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  const safetyChecks = [
    { name: 'license', label: 'רישיון רכב בתוקף' },
    { name: 'insurance', label: 'ביטוח בתוקף' },
    { name: 'firstAidKit', label: 'ערכת עזרה ראשונה תקינה ומלאה' },
    { name: 'fireExtinguisher', label: 'מטף כיבוי אש תקין' },
    { name: 'emergencyExits', label: 'יציאות חירום תקינות ומשולטות' },
    { name: 'airConditioner', label: 'מיזוג אוויר תקין' },
    { name: 'cleanBus', label: 'האוטובוס נקי ומסודר' },
    { name: 'validTachograph', label: 'טכוגרף בתוקף' },
    { name: 'safetyBelt', label: 'חגורות בטיחות תקינות בכל המושבים' },
    { name: 'microphone', label: 'מערכת כריזה תקינה' }
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        טופס בדיקת אוטובוס - {tripData?.title}
      </Typography>

      {showSuccessAlert && (
        <Alert severity="success" sx={{ mb: 2 }}>
          הטופס נשלח בהצלחה!
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="תאריך"
            name="date"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="מספר האוטובוס"
            name="busNumber"
            value={formData.busNumber}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="שם הנהג"
            name="driverName"
            value={formData.driverName}
            onChange={handleChange}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="מספר רישיון נהג"
            name="driverLicense"
            value={formData.driverLicense}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="טלפון הנהג"
            name="driverPhone"
            value={formData.driverPhone}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="שם חברת ההסעות"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            בדיקות בטיחות
          </Typography>
          <FormGroup>
            {safetyChecks.map(check => (
              <FormControlLabel
                key={check.name}
                control={
                  <Checkbox
                    checked={formData.checks[check.name]}
                    onChange={handleChange}
                    name={`check-${check.name}`}
                  />
                }
                label={check.label}
              />
            ))}
          </FormGroup>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="הערות"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="שם הבודק"
            name="inspectorName"
            value={formData.inspectorName}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            חתימה דיגיטלית
          </Typography>
          <Box
            sx={{
              border: '1px solid #ccc',
              borderRadius: 1,
              backgroundColor: '#fff',
              mb: 2
            }}
          >
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas'
              }}
              onEnd={() => setSignature(signatureRef.current.toDataURL())}
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={clearSignature}
            sx={{ mr: 1 }}
          >
            נקה חתימה
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
        >
          הדפס טופס
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          disabled={!signature}
        >
          שמור טופס
        </Button>
      </Box>
    </Paper>
  );
};

export default BusInspectionForm;
