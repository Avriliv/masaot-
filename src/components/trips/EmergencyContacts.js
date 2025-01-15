import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const EmergencyContacts = ({ contacts = [], onContactsChange }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    relation: ''
  });

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      if (editingContact !== null) {
        // עריכת איש קשר קיים
        const updatedContacts = contacts.map((contact, index) =>
          index === editingContact ? newContact : contact
        );
        onContactsChange(updatedContacts);
      } else {
        // הוספת איש קשר חדש
        onContactsChange([...contacts, newContact]);
      }
      
      setOpenDialog(false);
      setNewContact({
        name: '',
        phone: '',
        email: '',
        relation: ''
      });
      setEditingContact(null);
    }
  };

  const handleDeleteContact = (index) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    onContactsChange(updatedContacts);
  };

  const handleEditContact = (contact, index) => {
    setNewContact(contact);
    setEditingContact(index);
    setOpenDialog(true);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">אנשי קשר לחירום</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingContact(null);
            setNewContact({
              name: '',
              phone: '',
              email: '',
              relation: ''
            });
            setOpenDialog(true);
          }}
        >
          הוסף איש קשר
        </Button>
      </Box>

      <List>
        {contacts.map((contact, index) => (
          <Paper key={index} sx={{ mb: 2 }}>
            <ListItem>
              <ListItemText
                primary={contact.name}
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" display="block">
                      טלפון: {contact.phone}
                    </Typography>
                    {contact.email && (
                      <Typography component="span" variant="body2" display="block">
                        אימייל: {contact.email}
                      </Typography>
                    )}
                    {contact.relation && (
                      <Typography component="span" variant="body2" display="block">
                        קרבה: {contact.relation}
                      </Typography>
                    )}
                  </React.Fragment>
                }
              />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleEditContact(contact, index)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDeleteContact(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </Paper>
        ))}
        
        {contacts.length === 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="textSecondary" align="center">
              לא נוספו אנשי קשר לחירום
            </Typography>
          </Paper>
        )}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingContact !== null ? 'עריכת איש קשר' : 'הוספת איש קשר חדש'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="שם"
            fullWidth
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="טלפון"
            fullWidth
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="אימייל"
            type="email"
            fullWidth
            value={newContact.email}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="קרבה"
            fullWidth
            value={newContact.relation}
            onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ביטול</Button>
          <Button onClick={handleAddContact} color="primary" variant="contained">
            {editingContact !== null ? 'שמור שינויים' : 'הוסף איש קשר'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyContacts;
