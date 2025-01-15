import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Stack,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Phone as PhoneIcon,
  Class as ClassIcon,
  School as SchoolIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';

const TripParticipants = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [participants, setParticipants] = useState([
    { id: 1, name: 'ישראל ישראלי', grade: 'י׳', class: '1', phone: '050-1234567', medical: 'אין' },
    { id: 2, name: 'יעל כהן', grade: 'י׳', class: '2', phone: '050-7654321', medical: 'אלרגיה לבוטנים' }
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAdd = () => {
    setEditingParticipant(null);
    setDialogOpen(true);
  };

  const handleEdit = (participant) => {
    setEditingParticipant(participant);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setParticipants(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError('אירעה שגיאה במחיקת המשתתף');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.target);
      const participantData = {
        name: formData.get('name'),
        grade: formData.get('grade'),
        class: formData.get('class'),
        phone: formData.get('phone'),
        medical: formData.get('medical')
      };

      if (editingParticipant) {
        setParticipants(prev =>
          prev.map(p => p.id === editingParticipant.id ? { ...p, ...participantData } : p)
        );
      } else {
        setParticipants(prev => [...prev, { id: Date.now(), ...participantData }]);
      }

      setDialogOpen(false);
    } catch (err) {
      setError('אירעה שגיאה בשמירת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const ParticipantCard = ({ participant }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {participant.name}
        </Typography>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon color="primary" />
            <Typography variant="body2">
              שכבה {participant.grade} | כיתה {participant.class}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon color="primary" />
            <Typography variant="body2">{participant.phone}</Typography>
          </Box>
          {participant.medical && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MedicalIcon color="error" />
              <Typography variant="body2">{participant.medical}</Typography>
            </Box>
          )}
        </Stack>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <IconButton onClick={() => handleEdit(participant)} size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(participant.id)} size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3 
      }}>
        <Typography variant={isMobile ? "h6" : "h5"} gutterBottom={isMobile}>
          משתתפי הטיול
        </Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          width={{ xs: '100%', sm: 'auto' }}
        >
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            fullWidth={isMobile}
          >
            ייבוא מקובץ Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            fullWidth={isMobile}
          >
            הוסף משתתף
          </Button>
        </Stack>
      </Box>

      {isMobile ? (
        <Box>
          {participants.map((participant) => (
            <ParticipantCard key={participant.id} participant={participant} />
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>שם מלא</TableCell>
                <TableCell>שכבה</TableCell>
                <TableCell>כיתה</TableCell>
                {!isTablet && <TableCell>טלפון</TableCell>}
                {!isTablet && <TableCell>מידע רפואי</TableCell>}
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>{participant.grade}</TableCell>
                  <TableCell>{participant.class}</TableCell>
                  {!isTablet && <TableCell>{participant.phone}</TableCell>}
                  {!isTablet && <TableCell>{participant.medical}</TableCell>}
                  <TableCell>
                    <Tooltip title="ערוך">
                      <IconButton onClick={() => handleEdit(participant)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="מחק">
                      <IconButton onClick={() => handleDelete(participant.id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingParticipant ? 'עריכת משתתף' : 'הוספת משתתף חדש'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                name="name"
                label="שם מלא"
                defaultValue={editingParticipant?.name}
                required
                fullWidth
                autoFocus
              />
              <TextField
                name="grade"
                label="שכבה"
                defaultValue={editingParticipant?.grade}
                required
                fullWidth
              />
              <TextField
                name="class"
                label="כיתה"
                defaultValue={editingParticipant?.class}
                required
                fullWidth
              />
              <TextField
                name="phone"
                label="טלפון"
                defaultValue={editingParticipant?.phone}
                fullWidth
                type="tel"
              />
              <TextField
                name="medical"
                label="מידע רפואי"
                defaultValue={editingParticipant?.medical}
                multiline
                rows={2}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>ביטול</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'שמור'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TripParticipants;
