import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  LocalShipping as TransportIcon,
  Restaurant as FoodIcon,
  Backpack as EquipmentIcon,
  LocalDrink as WaterIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import EquipmentList from './EquipmentList';

const LogisticsManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [equipment, setEquipment] = useState([
    { id: 1, name: 'ערכת עזרה ראשונה', quantity: 3, category: 'בטיחות' },
    { id: 2, name: 'מכשירי קשר', quantity: 5, category: 'תקשורת' },
    { id: 3, name: 'אפודים זוהרים', quantity: 50, category: 'בטיחות' }
  ]);

  const [meals, setMeals] = useState([
    { id: 1, day: 1, type: 'בוקר', description: 'לחם, גבינות, ירקות', participants: 45 },
    { id: 2, day: 1, type: 'צהריים', description: 'פסטה עם רוטב', participants: 45 },
    { id: 3, day: 1, type: 'ערב', description: 'אורז עם שניצל', participants: 45 }
  ]);

  const [transport, setTransport] = useState([
    {
      id: 1,
      type: 'אוטובוס',
      company: 'מטיילי הגליל',
      capacity: 50,
      driver: 'ישראל ישראלי',
      phone: '050-1234567',
      route: 'תל אביב - הר תבור'
    }
  ]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* כותרת */}
        <Typography variant="h5" component="h1" gutterBottom>
          ניהול לוגיסטיקה
        </Typography>

        {/* טאבים */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="logistics tabs">
            <Tab label="ציוד כללי" />
            <Tab label="ציוד אישי" />
            <Tab label="ארוחות" />
            <Tab label="הסעות" />
          </Tabs>
        </Box>

        {/* תוכן הטאבים */}
        {tabValue === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  ציוד כללי
                </Typography>
                <Button startIcon={<AddIcon />}>
                  הוסף פריט
                </Button>
              </Box>
              <List>
                {equipment.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemIcon>
                        <EquipmentIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        secondary={`כמות: ${item.quantity}`}
                      />
                      <Chip label={item.category} size="small" sx={{ mr: 1 }} />
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                    {index < equipment.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        )}

        {tabValue === 1 && (
          <Grid item xs={12}>
            <EquipmentList />
          </Grid>
        )}

        {tabValue === 2 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  תכנון ארוחות
                </Typography>
                <Button startIcon={<AddIcon />}>
                  הוסף ארוחה
                </Button>
              </Box>
              <List>
                {meals.map((meal, index) => (
                  <React.Fragment key={meal.id}>
                    <ListItem>
                      <ListItemIcon>
                        <FoodIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`יום ${meal.day} - ${meal.type}`}
                        secondary={`${meal.description} | משתתפים: ${meal.participants}`}
                      />
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                    {index < meals.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        )}

        {tabValue === 3 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  הסעות
                </Typography>
                <Button startIcon={<AddIcon />}>
                  הוסף הסעה
                </Button>
              </Box>
              <List>
                {transport.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemIcon>
                        <TransportIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${item.type} - ${item.company}`}
                        secondary={`נהג: ${item.driver} | טלפון: ${item.phone} | מסלול: ${item.route}`}
                      />
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                    {index < transport.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default LogisticsManagement;
