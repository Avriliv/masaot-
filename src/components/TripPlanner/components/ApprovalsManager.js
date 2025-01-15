import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  FormControlLabel,
  Checkbox,
  TextField,
  Alert,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useTrip } from '../../../context/TripContext';

const defaultApprovals = [
  {
    id: 'parentalConsent',
    label: 'אישורי הורים',
    description: 'יש לוודא קבלת אישורי הורים חתומים מכל המשתתפים',
    required: true,
    documents: [],
    status: 'pending',
  },
  {
    id: 'educationMinistry',
    label: 'אישור משרד החינוך',
    description: 'נדרש אישור מטעם משרד החינוך לקיום הטיול',
    required: true,
    documents: [],
    status: 'pending',
  },
  {
    id: 'insurance',
    label: 'ביטוח',
    description: 'אישור על קיום ביטוח מתאים לטיול',
    required: true,
    documents: [],
    status: 'pending',
  },
  {
    id: 'medicalSupport',
    label: 'ליווי רפואי',
    description: 'אישור על הימצאות ליווי רפואי מתאים',
    required: true,
    documents: [],
    status: 'pending',
  },
];

const ApprovalsManager = () => {
  const { tripState, updateApprovals } = useTrip();
  const [approvals, setApprovals] = useState(tripState.approvals?.items || defaultApprovals);
  const [activeStep, setActiveStep] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [newApproval, setNewApproval] = useState({
    label: '',
    description: '',
    required: true,
    documents: [],
    status: 'pending',
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleUpdateApproval = (index, field, value) => {
    const updatedApprovals = [...approvals];
    updatedApprovals[index] = {
      ...updatedApprovals[index],
      [field]: value,
    };
    setApprovals(updatedApprovals);
    updateApprovals({ items: updatedApprovals });
  };

  const handleAddDocument = (approvalIndex, documentName) => {
    const updatedApprovals = [...approvals];
    updatedApprovals[approvalIndex].documents.push({
      name: documentName,
      uploadDate: new Date().toISOString(),
      status: 'uploaded',
    });
    setApprovals(updatedApprovals);
    updateApprovals({ items: updatedApprovals });
  };

  const handleRemoveDocument = (approvalIndex, documentIndex) => {
    const updatedApprovals = [...approvals];
    updatedApprovals[approvalIndex].documents.splice(documentIndex, 1);
    setApprovals(updatedApprovals);
    updateApprovals({ items: updatedApprovals });
  };

  const handleAddNewApproval = () => {
    const updatedApprovals = [
      ...approvals,
      {
        ...newApproval,
        id: `custom-${Date.now()}`,
      },
    ];
    setApprovals(updatedApprovals);
    updateApprovals({ items: updatedApprovals });
    setOpenDialog(false);
    setNewApproval({
      label: '',
      description: '',
      required: true,
      documents: [],
      status: 'pending',
    });
  };

  const getApprovalStatus = (approval) => {
    if (approval.documents.length === 0) {
      return 'pending';
    }
    return 'completed';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">ניהול אישורים</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          הוסף אישור
        </Button>
      </Box>

      <Stepper activeStep={activeStep} orientation="vertical">
        {approvals.map((approval, index) => (
          <Step key={approval.id}>
            <StepLabel
              optional={
                <Typography variant="caption">
                  {approval.required ? 'חובה' : 'רשות'}
                </Typography>
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {approval.label}
                <Chip
                  size="small"
                  label={getApprovalStatus(approval) === 'completed' ? 'הושלם' : 'ממתין'}
                  color={getApprovalStatus(approval) === 'completed' ? 'success' : 'warning'}
                />
              </Box>
            </StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>
                <Typography>{approval.description}</Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    מסמכים מצורפים:
                  </Typography>
                  <Grid container spacing={1}>
                    {approval.documents.map((doc, docIndex) => (
                      <Grid item key={docIndex}>
                        <Chip
                          label={doc.name}
                          onDelete={() => handleRemoveDocument(index, docIndex)}
                          color="primary"
                        />
                      </Grid>
                    ))}
                    <Grid item>
                      <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        onClick={() => handleAddDocument(index, `מסמך ${approval.documents.length + 1}`)}
                      >
                        העלה מסמך
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={approval.status === 'completed'}
                      onChange={(e) =>
                        handleUpdateApproval(index, 'status', e.target.checked ? 'completed' : 'pending')
                      }
                    />
                  }
                  label="האישור התקבל"
                />

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === approvals.length - 1 ? 'סיים' : 'הבא'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    חזור
                  </Button>
                </Box>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>הוספת אישור חדש</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="שם האישור"
                value={newApproval.label}
                onChange={(e) =>
                  setNewApproval({ ...newApproval, label: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="תיאור"
                multiline
                rows={3}
                value={newApproval.description}
                onChange={(e) =>
                  setNewApproval({ ...newApproval, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newApproval.required}
                    onChange={(e) =>
                      setNewApproval({ ...newApproval, required: e.target.checked })
                    }
                  />
                }
                label="אישור חובה"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ביטול</Button>
          <Button
            onClick={handleAddNewApproval}
            variant="contained"
            disabled={!newApproval.label}
          >
            הוסף
          </Button>
        </DialogActions>
      </Dialog>

      {approvals.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Alert
            severity={approvals.every((a) => !a.required || getApprovalStatus(a) === 'completed') ? 'success' : 'warning'}
            icon={approvals.every((a) => !a.required || getApprovalStatus(a) === 'completed') ? <CheckCircleIcon /> : <WarningIcon />}
          >
            {approvals.every((a) => !a.required || getApprovalStatus(a) === 'completed')
              ? 'כל האישורים הנדרשים התקבלו'
              : 'יש אישורים שטרם התקבלו'}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default ApprovalsManager;
