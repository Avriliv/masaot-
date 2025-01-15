import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  DirectionsBus as TransportIcon,
  Hotel as AccommodationIcon,
  Restaurant as FoodIcon,
  Backpack as EquipmentIcon,
} from '@mui/icons-material';

const sections = [
  {
    id: 'transport',
    title: 'הסעות',
    icon: TransportIcon,
    fields: ['נקודת איסוף', 'נקודת פיזור', 'סוג הסעה', 'מספר נוסעים']
  },
  {
    id: 'accommodation',
    title: 'לינה',
    icon: AccommodationIcon,
    fields: ['מיקום', 'סוג לינה', 'מספר לילות', 'דרישות מיוחדות']
  },
  {
    id: 'food',
    title: 'מזון',
    icon: FoodIcon,
    fields: ['סוג ארוחות', 'דיאטות מיוחדות', 'מספר סועדים', 'הערות']
  },
  {
    id: 'equipment',
    title: 'ציוד',
    icon: EquipmentIcon,
    fields: ['ציוד נדרש', 'ציוד מסופק', 'ציוד מיוחד', 'הערות']
  }
];

const LogisticsPlanning = () => {
  const [activeSection, setActiveSection] = useState('transport');
  const [formData, setFormData] = useState({});

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Typography variant="h4" gutterBottom>
        תכנון לוגיסטי
      </Typography>
      
      <Grid container spacing={3}>
        {/* תפריט צד */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2}>
            <List component="nav">
              {sections.map(section => (
                <ListItem
                  button
                  key={section.id}
                  selected={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                >
                  <ListItemIcon>
                    <section.icon />
                  </ListItemIcon>
                  <ListItemText primary={section.title} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* טופס פרטים */}
        <Grid item xs={12} md={9}>
          <Paper elevation={2} sx={{ p: 3 }}>
            {sections.map(section => (
              section.id === activeSection && (
                <div key={section.id}>
                  <Typography variant="h5" gutterBottom>
                    {section.title}
                  </Typography>
                  <Grid container spacing={2}>
                    {section.fields.map(field => (
                      <Grid item xs={12} sm={6} key={field}>
                        <TextField
                          fullWidth
                          label={field}
                          variant="outlined"
                          value={formData[section.id]?.[field] || ''}
                          onChange={(e) => handleInputChange(section.id, field, e.target.value)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="primary">
                      שמור {section.title}
                    </Button>
                  </Box>
                </div>
              )
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LogisticsPlanning;
