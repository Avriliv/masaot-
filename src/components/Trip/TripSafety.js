import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Divider,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Security as SecurityIcon,
  LocalHospital as MedicalIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const TripSafety = ({ tripId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // מצב המערכת
  const [safetyOfficer, setSafetyOfficer] = useState({
    name: 'ישראל ישראלי',
    phone: '050-1234567',
    certification: 'תעודת מע"ר בתוקף'
  });

  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: 1, name: 'מוקד חירום', phone: '100', type: 'משטרה' },
    { id: 2, name: 'מד"א', phone: '101', type: 'רפואה' }
  ]);

  const [safetyChecklist, setSafetyChecklist] = useState([
    { id: 1, item: 'בדיקת ציוד רפואי', completed: true },
    { id: 2, item: 'תיאום עם גורמי ביטחון', completed: false },
    { id: 3, item: 'בדיקת מזג אוויר', completed: true }
  ]);

  const [editDialog, setEditDialog] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [error, setError] = useState(null);

  // טיפול בעריכת איש קשר
  const handleEditContact = (contact) => {
    setEditContact(contact);
    setEditDialog(true);
  };

  const handleSaveContact = () => {
    if (editContact) {
      setEmergencyContacts(prev => 
        prev.map(c => c.id === editContact.id ? editContact : c)
      );
    } else {
      setEmergencyContacts(prev => [
        ...prev,
        { ...editContact, id: Math.max(...prev.map(c => c.id)) + 1 }
      ]);
    }
    setEditDialog(false);
    setEditContact(null);
  };

  const handleDeleteContact = (id) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== id));
  };

  // טיפול ברשימת המטלות
  const toggleChecklistItem = (id) => {
    setSafetyChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography 
        variant={isMobile ? "h6" : "h5"} 
        color="primary" 
        fontWeight="bold"
        gutterBottom
      >
        ניהול בטיחות
      </Typography>

      <Grid container spacing={3}>
        {/* אחראי בטיחות */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">אחראי בטיחות</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={2}>
              <TextField
                label="שם"
                value={safetyOfficer.name}
                onChange={(e) => setSafetyOfficer(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
              />
              <TextField
                label="טלפון"
                value={safetyOfficer.phone}
                onChange={(e) => setSafetyOfficer(prev => ({ ...prev, phone: e.target.value }))}
                fullWidth
              />
              <TextField
                label="הסמכה"
                value={safetyOfficer.certification}
                onChange={(e) => setSafetyOfficer(prev => ({ ...prev, certification: e.target.value }))}
                fullWidth
              />
            </Stack>
          </Paper>
        </Grid>

        {/* אנשי קשר לחירום */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">אנשי קשר לחירום</Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditContact(null);
                  setEditDialog(true);
                }}
                size={isMobile ? "small" : "medium"}
              >
                הוסף איש קשר
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <List>
              {emergencyContacts.map((contact) => (
                <ListItem
                  key={contact.id}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="ערוך">
                        <IconButton 
                          edge="end" 
                          onClick={() => handleEditContact(contact)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="מחק">
                        <IconButton 
                          edge="end" 
                          onClick={() => handleDeleteContact(contact.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                >
                  <ListItemIcon>
                    <PhoneIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={contact.name}
                    secondary={
                      <React.Fragment>
                        {contact.phone}
                        <Chip 
                          label={contact.type} 
                          size="small" 
                          sx={{ ml: 1 }}
                          color="primary"
                          variant="outlined"
                        />
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* רשימת בדיקות בטיחות */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">רשימת בדיקות בטיחות</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              {safetyChecklist.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                          {item.item}
                        </Typography>
                        <Tooltip title={item.completed ? "הושלם" : "לא הושלם"}>
                          <IconButton
                            onClick={() => toggleChecklistItem(item.id)}
                            color={item.completed ? "primary" : "default"}
                            size="small"
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* דיאלוג עריכת איש קשר */}
      <Dialog 
        open={editDialog} 
        onClose={() => {
          setEditDialog(false);
          setEditContact(null);
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editContact ? 'עריכת איש קשר' : 'הוספת איש קשר'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="שם"
              value={editContact?.name || ''}
              onChange={(e) => setEditContact(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="טלפון"
              value={editContact?.phone || ''}
              onChange={(e) => setEditContact(prev => ({ ...prev, phone: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>סוג</InputLabel>
              <Select
                value={editContact?.type || ''}
                label="סוג"
                onChange={(e) => setEditContact(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="משטרה">משטרה</MenuItem>
                <MenuItem value="רפואה">רפואה</MenuItem>
                <MenuItem value="חילוץ">חילוץ</MenuItem>
                <MenuItem value="אחר">אחר</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialog(false);
            setEditContact(null);
          }}>
            ביטול
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveContact}
            disabled={!editContact?.name || !editContact?.phone || !editContact?.type}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripSafety;
