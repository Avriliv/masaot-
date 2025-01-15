import React, { useState } from 'react';
import { 
    Box, Button, Typography, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, IconButton,
    Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import { useTrip } from '../../context/TripContext';

const ParticipantsManagement = ({ onNext, onBack }) => {
    const { tripState, updateTrip } = useTrip();
    const [participants, setParticipants] = useState(tripState.participants || []);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentParticipant, setCurrentParticipant] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        class: '',
        medicalInfo: ''
    });

    const handleOpenDialog = (participant = null) => {
        if (participant) {
            setFormData(participant);
            setCurrentParticipant(participant);
        } else {
            setFormData({
                name: '',
                parentName: '',
                parentEmail: '',
                parentPhone: '',
                class: '',
                medicalInfo: ''
            });
            setCurrentParticipant(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentParticipant(null);
    };

    const handleSaveParticipant = () => {
        if (currentParticipant) {
            // עדכון משתתף קיים
            const updatedParticipants = participants.map(p => 
                p.id === currentParticipant.id ? { ...formData, id: p.id } : p
            );
            setParticipants(updatedParticipants);
        } else {
            // הוספת משתתף חדש
            const newParticipant = {
                ...formData,
                id: Date.now(),
                approvalStatus: 'pending'
            };
            setParticipants([...participants, newParticipant]);
        }
        
        handleCloseDialog();
    };

    const handleDeleteParticipant = (id) => {
        setParticipants(participants.filter(p => p.id !== id));
    };

    const handleSendApproval = (participant) => {
        // כאן תהיה הלוגיקה לשליחת אישור להורים
        console.log('Sending approval request to:', participant.parentEmail);
    };

    const handleContinue = () => {
        // שמירת המשתתפים בקונטקסט
        updateTrip({
            ...tripState,
            participants: participants
        });
        onNext();
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                ניהול משתתפים
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Button 
                    variant="contained" 
                    onClick={() => handleOpenDialog()}
                    sx={{ mb: 2 }}
                >
                    הוסף משתתף
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>שם</TableCell>
                            <TableCell>כיתה</TableCell>
                            <TableCell>שם הורה</TableCell>
                            <TableCell>טלפון</TableCell>
                            <TableCell>סטטוס אישור</TableCell>
                            <TableCell>פעולות</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {participants.map((participant) => (
                            <TableRow key={participant.id}>
                                <TableCell>{participant.name}</TableCell>
                                <TableCell>{participant.class}</TableCell>
                                <TableCell>{participant.parentName}</TableCell>
                                <TableCell>{participant.parentPhone}</TableCell>
                                <TableCell>{participant.approvalStatus}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenDialog(participant)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteParticipant(participant.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleSendApproval(participant)}>
                                        <SendIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {currentParticipant ? 'ערוך משתתף' : 'הוסף משתתף'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="שם התלמיד"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="כיתה"
                        value={formData.class}
                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="שם ההורה"
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="אימייל הורה"
                        type="email"
                        value={formData.parentEmail}
                        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="טלפון הורה"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="מידע רפואי"
                        multiline
                        rows={3}
                        value={formData.medicalInfo}
                        onChange={(e) => setFormData({ ...formData, medicalInfo: e.target.value })}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>ביטול</Button>
                    <Button onClick={handleSaveParticipant} variant="contained">
                        שמור
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={onBack}>
                    חזור
                </Button>
                <Button 
                    variant="contained" 
                    onClick={handleContinue}
                    disabled={participants.length === 0}
                >
                    המשך
                </Button>
            </Box>
        </Box>
    );
};

export default ParticipantsManagement;
