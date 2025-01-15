import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Button,
  Box,
  Typography,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ParentalApprovalService from '../../services/ParentalApprovalService';

const ParticipantsTable = ({ tripId, onUpdate }) => {
  const [participants, setParticipants] = useState([]);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  // מבנה משתתף ריק
  const emptyParticipant = {
    id: '',
    name: '',
    familyName: '',
    grade: '',
    healthIssues: '',
    parentPhone: '',
    parentName: '',
    residence: '',
    present: true,
    notes: '',
    approvalStatus: null,
    approvalForm: null
  };

  // טיפול בהוספת/עריכת משתתף
  const handleEdit = (participant = null) => {
    setEditingParticipant(participant || { ...emptyParticipant, id: Date.now() });
    setDialogOpen(true);
  };

  // שמירת משתתף
  const handleSave = () => {
    try {
      if (editingParticipant.id) {
        setParticipants(prev =>
          prev.map(p => p.id === editingParticipant.id ? editingParticipant : p)
        );
      } else {
        setParticipants(prev => [...prev, editingParticipant]);
      }
      setDialogOpen(false);
      setEditingParticipant(null);
      if (onUpdate) onUpdate(participants);
    } catch (err) {
      setError('אירעה שגיאה בשמירת המשתתף');
    }
  };

  // מחיקת משתתף
  const handleDelete = (id) => {
    try {
      setParticipants(prev => prev.filter(p => p.id !== id));
      if (onUpdate) onUpdate(participants.filter(p => p.id !== id));
    } catch (err) {
      setError('אירעה שגיאה במחיקת המשתתף');
    }
  };

  // ייבוא מקובץ Excel
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // TODO: implement Excel import
      console.log('Importing from Excel:', file.name);
    } catch (err) {
      setError('אירעה שגיאה בייבוא הקובץ');
    }
  };

  // ייצוא לקובץ Excel
  const handleExport = async () => {
    try {
      // TODO: implement Excel export
      console.log('Exporting to Excel');
    } catch (err) {
      setError('אירעה שגיאה בייצוא הקובץ');
    }
  };

  // שליחת אישור הורים
  const handleSendApproval = async (participant) => {
    try {
      await ParentalApprovalService.sendApprovalRequest(participant, {
        id: tripId,
        name: 'טיול שנתי לצפון', // TODO: קבל מהקונטקסט
        startDate: '2024-12-20',
        endDate: '2024-12-22',
        description: 'טיול שנתי מסורתי לצפון הארץ',
        location: 'צפון הארץ'
      });

      // עדכון סטטוס האישור במערכת
      setParticipants(prev =>
        prev.map(p =>
          p.id === participant.id
            ? { ...p, approvalStatus: 'pending' }
            : p
        )
      );
    } catch (err) {
      setError('אירעה שגיאה בשליחת אישור ההורים');
    }
  };

  // בדיקת סטטוס אישורים
  const checkApprovalStatuses = async () => {
    try {
      const updatedParticipants = await Promise.all(
        participants.map(async (participant) => {
          if (participant.approvalForm) {
            const status = await ParentalApprovalService.checkApprovalStatus(
              participant.approvalForm.id
            );
            return { ...participant, approvalStatus: status };
          }
          return participant;
        })
      );
      setParticipants(updatedParticipants);
    } catch (err) {
      console.error('Error checking approval statuses:', err);
    }
  };

  // בדיקת סטטוס אישורים כל דקה
  useEffect(() => {
    const interval = setInterval(checkApprovalStatuses, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      {/* כותרת וכפתורים */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2 
      }}>
        <Typography variant="h6" component="h2">
          רשימה שמית
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            component="label"
          >
            ייבוא מאקסל
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleImport}
            />
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
          >
            ייצוא לאקסל
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleEdit()}
          >
            הוסף משתתף
          </Button>
        </Stack>
      </Box>

      {/* הודעת שגיאה */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* טבלת משתתפים */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>מס'</TableCell>
              <TableCell>שם</TableCell>
              <TableCell>שם משפחה</TableCell>
              <TableCell>מקום מגורים</TableCell>
              <TableCell>בעיות בריאות/אלרגיה</TableCell>
              <TableCell>מייל הורה</TableCell>
              <TableCell>טלפון הורה</TableCell>
              <TableCell>שם הורה</TableCell>
              <TableCell>שכבה</TableCell>
              <TableCell>הערות</TableCell>
              <TableCell>נוכח</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.map((participant, index) => (
              <TableRow key={participant.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{participant.name}</TableCell>
                <TableCell>{participant.familyName}</TableCell>
                <TableCell>{participant.residence}</TableCell>
                <TableCell>
                  {participant.healthIssues && (
                    <Chip 
                      label={participant.healthIssues}
                      color="error"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>{participant.parentEmail}</TableCell>
                <TableCell>{participant.parentPhone}</TableCell>
                <TableCell>{participant.parentName}</TableCell>
                <TableCell>{participant.grade}</TableCell>
                <TableCell>{participant.notes}</TableCell>
                <TableCell>
                  <Chip 
                    label={participant.present ? 'נוכח' : 'לא נוכח'}
                    color={participant.present ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    {participant.approvalStatus ? (
                      <Tooltip title={
                        participant.approvalStatus === 'approved'
                          ? 'אושר'
                          : 'ממתין לאישור'
                      }>
                        <Chip
                          icon={
                            participant.approvalStatus === 'approved'
                              ? <CheckCircleIcon />
                              : <PendingIcon />
                          }
                          label={
                            participant.approvalStatus === 'approved'
                              ? 'מאושר'
                              : 'ממתין'
                          }
                          color={
                            participant.approvalStatus === 'approved'
                              ? 'success'
                              : 'warning'
                          }
                          size="small"
                        />
                      </Tooltip>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SendIcon />}
                        onClick={() => handleSendApproval(participant)}
                      >
                        שלח אישור
                      </Button>
                    )}
                    <IconButton size="small" onClick={() => handleEdit(participant)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(participant.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* דיאלוג הוספה/עריכה */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingParticipant?.id ? 'עריכת משתתף' : 'הוספת משתתף חדש'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)', pt: 2 }}>
            <TextField
              label="שם פרטי"
              value={editingParticipant?.name || ''}
              onChange={(e) => setEditingParticipant(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="שם משפחה"
              value={editingParticipant?.familyName || ''}
              onChange={(e) => setEditingParticipant(prev => ({ ...prev, familyName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="מקום מגורים"
              value={editingParticipant?.residence || ''}
              onChange={(e) => setEditingParticipant(prev => ({ ...prev, residence: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>שכבה</InputLabel>
              <Select
                value={editingParticipant?.grade || ''}
                onChange={(e) => setEditingParticipant(prev => ({ ...prev, grade: e.target.value }))}
                label="שכבה"
              >
                <MenuItem value="ז">ז'</MenuItem>
                <MenuItem value="ח">ח'</MenuItem>
                <MenuItem value="ט">ט'</MenuItem>
                <MenuItem value="י">י'</MenuItem>
                <MenuItem value="יא">י"א</MenuItem>
                <MenuItem value="יב">י"ב</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="בעיות בריאות/אלרגיה"
              value={editingParticipant?.healthIssues || ''}
              onChange={(e) => setEditingParticipant(prev => ({ ...prev, healthIssues: e.target.value }))}
              fullWidth
            />
            <TextField
              label="שם הורה"
              value={editingParticipant?.parentName || ''}
              onChange={(e) => setEditingParticipant(prev => ({ ...prev, parentName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="טלפון הורה"
              value={editingParticipant?.parentPhone || ''}
              onChange={(e) => setEditingParticipant(prev => ({ ...prev, parentPhone: e.target.value }))}
              fullWidth
            />
            <TextField
              label="דוא״ל הורה"
              type="email"
              value={editingParticipant?.parentEmail || ''}
              onChange={(e) => setEditingParticipant(prev => ({ ...prev, parentEmail: e.target.value }))}
              fullWidth
            />
            <TextField
              label="הערות"
              value={editingParticipant?.notes || ''}
              onChange={(e) => setEditingParticipant(prev => ({ ...prev, notes: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>ביטול</Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParticipantsTable;
