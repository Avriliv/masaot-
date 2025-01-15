import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  Grid,
  Divider,
  Alert,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel
} from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Save as SaveIcon,
  Clear as ClearIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const ParentApprovalForm = ({ studentName, tripDetails, onSubmit }) => {
  const [formData, setFormData] = useState({
    parentName: '',
    parentId: '',
    phone: '',
    alternatePhone: '',
    email: '',
    address: '',
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    },
    medicalInfo: {
      hasMedicalCondition: false,
      medicalConditions: '',
      medications: '',
      allergies: ''
    },
    canSwim: 'no' // yes/no
  });
  
  const [signature, setSignature] = useState(null);
  const signatureRef = useRef();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked
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

    const formDataWithSignature = {
      ...formData,
      signature: signature,
      timestamp: new Date().toISOString(),
      studentName,
      tripDetails
    };

    onSubmit(formDataWithSignature);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  };

  const downloadForm = () => {
    const formContent = `
טופס אישור הורים - ${tripDetails}

פרטי התלמיד/ה:
שם: ${studentName}

פרטי ההורה:
שם: ${formData.parentName}
ת.ז: ${formData.parentId}
טלפון: ${formData.phone}
טלפון נוסף: ${formData.alternatePhone}
דוא"ל: ${formData.email}
כתובת: ${formData.address}

איש קשר לחירום:
שם: ${formData.emergencyContact.name}
קרבה: ${formData.emergencyContact.relation}
טלפון: ${formData.emergencyContact.phone}

מידע רפואי:
מצב רפואי מיוחד: ${formData.medicalInfo.hasMedicalCondition ? 'כן' : 'לא'}
פירוט: ${formData.medicalInfo.medicalConditions}
תרופות: ${formData.medicalInfo.medications}
אלרגיות: ${formData.medicalInfo.allergies}

יכולת שחייה: ${formData.canSwim === 'yes' ? 'יודע/ת לשחות' : 'לא יודע/ת לשחות'}

תאריך: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([formContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `אישור_הורים_${studentName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 2, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
        טופס אישור הורים - {tripDetails}
      </Typography>

      {showSuccessAlert && (
        <Alert severity="success" sx={{ mb: 2 }}>
          הטופס נשלח בהצלחה!
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            פרטי התלמיד/ה
          </Typography>
          <TextField
            fullWidth
            label="שם התלמיד/ה"
            value={studentName}
            disabled
            sx={{ mb: 2 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            פרטי ההורה
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="שם מלא"
            name="parentName"
            value={formData.parentName}
            onChange={handleInputChange}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="תעודת זהות"
            name="parentId"
            value={formData.parentId}
            onChange={handleInputChange}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="טלפון"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="טלפון נוסף"
            name="alternatePhone"
            value={formData.alternatePhone}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="דוא״ל"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="כתובת"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            איש קשר לחירום
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="שם איש קשר"
            name="emergencyContact.name"
            value={formData.emergencyContact.name}
            onChange={handleInputChange}
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="קרבה"
            name="emergencyContact.relation"
            value={formData.emergencyContact.relation}
            onChange={handleInputChange}
            required
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="טלפון"
            name="emergencyContact.phone"
            value={formData.emergencyContact.phone}
            onChange={handleInputChange}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            מידע רפואי
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.medicalInfo.hasMedicalCondition}
                onChange={handleCheckboxChange}
                name="medicalInfo.hasMedicalCondition"
              />
            }
            label="האם יש מצב רפואי מיוחד שעלינו לדעת עליו?"
          />
        </Grid>

        {formData.medicalInfo.hasMedicalCondition && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="פירוט המצב הרפואי"
              name="medicalInfo.medicalConditions"
              value={formData.medicalInfo.medicalConditions}
              onChange={handleInputChange}
            />
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="תרופות קבועות"
            name="medicalInfo.medications"
            value={formData.medicalInfo.medications}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="אלרגיות"
            name="medicalInfo.allergies"
            value={formData.medicalInfo.allergies}
            onChange={handleInputChange}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <FormControl component="fieldset">
            <FormLabel component="legend">האם בנך/בתך יודע/ת לשחות?</FormLabel>
            <RadioGroup
              row
              name="canSwim"
              value={formData.canSwim}
              onChange={handleInputChange}
            >
              <FormControlLabel value="yes" control={<Radio />} label="יודע/ת לשחות" />
              <FormControlLabel value="no" control={<Radio />} label="לא יודע/ת לשחות" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            חתימה דיגיטלית
          </Typography>
        </Grid>

        <Grid item xs={12}>
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

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadForm}
            >
              הורד טופס
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={!signature}
            >
              שלח טופס
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentApprovalForm;
