import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const ParticipantsList = ({ onAddToTripBag, onClose }) => {
  const [participants, setParticipants] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // מבנה השורה הריקה לחניך חדש
  const emptyParticipant = {
    id: '',
    name: '',
    lastName: '',
    residence: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    healthIssues: '',
    grade: '',
    notes: '',
    present: false
  };

  // הוספת שורה חדשה
  const addNewRow = () => {
    setParticipants([
      ...participants,
      { ...emptyParticipant, id: (participants.length + 1).toString() }
    ]);
  };

  // עדכון ערך בטבלה
  const handleValueChange = (index, field, value) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index][field] = value;
    setParticipants(updatedParticipants);
  };

  // שמירת השינויים
  const handleSave = () => {
    setOpenDialog(true);
  };

  // הוספה לתיק הטיול
  const handleAddToTripBag = () => {
    onAddToTripBag({
      type: 'participantsList',
      name: `רשימת חניכים`,
      data: participants
    });
    setOpenDialog(false);
  };

  const handleBack = () => {
    console.log('Going back to my trips');
    onClose();
  };

  return (
    <div style={{ direction: 'rtl', padding: '20px' }}>
      <Button
        variant="outlined"
        startIcon={<ArrowForwardIcon />}
        onClick={handleBack}
        sx={{ marginBottom: '20px' }}
      >
        חזרה לטיולים שלי
      </Button>
      
      <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px' }}>
        <TableContainer>
          <Table sx={{ 
            border: '1px solid rgba(224, 224, 224, 1)',
            '& th': {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
              borderBottom: '2px solid rgba(224, 224, 224, 1)',
              borderRight: '1px solid rgba(224, 224, 224, 1)',
              textAlign: 'center',
              padding: '16px 8px',
              fontSize: '1rem',
              color: '#1a237e'
            },
            '& td': {
              borderRight: '1px solid rgba(224, 224, 224, 1)',
              padding: '8px',
              textAlign: 'center'
            },
            '& tr:nth-of-type(even)': {
              backgroundColor: '#fafafa'
            }
          }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '5%' }}>מס'</TableCell>
                <TableCell sx={{ width: '10%' }}>שם פרטי</TableCell>
                <TableCell sx={{ width: '10%' }}>שם משפחה</TableCell>
                <TableCell sx={{ width: '10%' }}>מקום מגורים</TableCell>
                <TableCell sx={{ width: '10%' }}>שם הורה</TableCell>
                <TableCell sx={{ width: '10%' }}>טלפון הורה</TableCell>
                <TableCell sx={{ width: '15%' }}>דוא"ל הורה</TableCell>
                <TableCell sx={{ width: '15%' }}>בעיות בריאות/אלרגיה</TableCell>
                <TableCell sx={{ width: '5%' }}>שכבה</TableCell>
                <TableCell sx={{ width: '10%' }}>הערות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {participants.map((participant, index) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.id}</TableCell>
                  <TableCell>
                    <TextField
                      value={participant.name}
                      onChange={(e) => handleValueChange(index, 'name', e.target.value)}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={participant.lastName}
                      onChange={(e) => handleValueChange(index, 'lastName', e.target.value)}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={participant.residence}
                      onChange={(e) => handleValueChange(index, 'residence', e.target.value)}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={participant.parentName}
                      onChange={(e) => handleValueChange(index, 'parentName', e.target.value)}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={participant.parentPhone}
                      onChange={(e) => handleValueChange(index, 'parentPhone', e.target.value)}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={participant.parentEmail}
                      onChange={(e) => handleValueChange(index, 'parentEmail', e.target.value)}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={participant.healthIssues}
                      onChange={(e) => handleValueChange(index, 'healthIssues', e.target.value)}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={participant.grade}
                      onChange={(e) => handleValueChange(index, 'grade', e.target.value)}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={participant.notes}
                      onChange={(e) => handleValueChange(index, 'notes', e.target.value)}
                      variant="standard"
                      sx={{ width: '100%' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={addNewRow}
            sx={{ marginLeft: '10px' }}
          >
            הוסף שורה
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSave}
            startIcon={<SaveIcon />}
          >
            שמור שינויים
          </Button>
        </div>
      </Paper>

      {/* דיאלוג האישור */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>הוספה לתיק הטיול</DialogTitle>
        <DialogContent>
          האם אתה רוצה להכניס רשימה זו לתיק הטיול?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="error">
            לא
          </Button>
          <Button onClick={handleAddToTripBag} color="primary" autoFocus>
            כן
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ParticipantsList;
