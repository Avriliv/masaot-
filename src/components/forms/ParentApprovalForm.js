import React, { useState } from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    FormControl,
    FormControlLabel,
    Checkbox,
    Alert,
} from '@mui/material';

const ParentApprovalForm = ({ trip, onClose }) => {
    const [formData, setFormData] = useState({
        parentName: '',
        studentName: '',
        phone: '',
        email: '',
        healthDeclaration: false,
        paymentConfirmation: false,
        termsAccepted: false
    });

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!formData.parentName || !formData.studentName || !formData.phone || !formData.email) {
            setError('נא למלא את כל השדות החובה');
            return;
        }

        if (!formData.healthDeclaration || !formData.paymentConfirmation || !formData.termsAccepted) {
            setError('נא לאשר את כל ההצהרות הנדרשות');
            return;
        }

        // כאן יש להוסיף את הלוגיקה לשמירת האישור במערכת
        setSubmitted(true);
        setError('');
    };

    if (submitted) {
        return (
            <>
                <DialogContent>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        האישור נשלח בהצלחה!
                    </Alert>
                    <Typography>
                        אישור ההורים עבור {formData.studentName} התקבל במערכת.
                        נשלח אישור למייל {formData.email}.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>סגור</Button>
                </DialogActions>
            </>
        );
    }

    return (
        <>
            <DialogTitle>טופס אישור הורים - {trip.basicDetails.tripName}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        פרטי הטיול
                    </Typography>
                    <Typography variant="body2" paragraph>
                        תאריך: {trip.basicDetails.startDate} - {trip.basicDetails.endDate}
                    </Typography>
                    <Typography variant="body2" paragraph>
                        יעד: {trip.basicDetails.location}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    <TextField
                        label="שם ההורה"
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        required
                    />
                    <TextField
                        label="שם התלמיד/ה"
                        value={formData.studentName}
                        onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                        required
                    />
                    <TextField
                        label="טלפון"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                    />
                    <TextField
                        label="דוא״ל"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        הצהרות
                    </Typography>
                    <FormControl component="fieldset">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.healthDeclaration}
                                    onChange={(e) => setFormData({ ...formData, healthDeclaration: e.target.checked })}
                                />
                            }
                            label="אני מצהיר/ה כי אין מניעה בריאותית להשתתפות בני/בתי בטיול"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.paymentConfirmation}
                                    onChange={(e) => setFormData({ ...formData, paymentConfirmation: e.target.checked })}
                                />
                            }
                            label="אני מאשר/ת את התשלום עבור הטיול"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.termsAccepted}
                                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                                />
                            }
                            label="קראתי והבנתי את כל תנאי הטיול ואני מאשר/ת אותם"
                        />
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>ביטול</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    שלח אישור
                </Button>
            </DialogActions>
        </>
    );
};

export default ParentApprovalForm;
