import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Divider,
  IconButton,
  Grid
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ArrowBack, ArrowForward, Edit as EditIcon } from '@mui/icons-material';
import HikingMap from '../Map/HikingMap';

const TripDaySegmentation = ({ tripData, routePoints, onNext, onBack }) => {
  const [days, setDays] = useState([]);
  const [unassignedPoints, setUnassignedPoints] = useState([]);
  const [dayDescriptions, setDayDescriptions] = useState({});
  const [editingDay, setEditingDay] = useState(null);

  useEffect(() => {
    // אתחול ימים לפי מספר הימים שהוגדר בטופס
    const initialDays = Array(tripData.duration).fill().map((_, index) => ({
      id: `day-${index + 1}`,
      title: `יום ${index + 1}`,
      points: []
    }));
    setDays(initialDays);
    
    // כל הנקודות מתחילות כלא משויכות
    setUnassignedPoints(routePoints.map((point, index) => ({
      id: `point-${index}`,
      ...point
    })));
  }, [tripData, routePoints]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // העתקת המערכים המקוריים
    const newDays = [...days];
    const newUnassignedPoints = [...unassignedPoints];
    
    // הזזה מ/אל רשימת הנקודות הלא משויכות
    if (source.droppableId === 'unassigned') {
      const [movedPoint] = newUnassignedPoints.splice(source.index, 1);
      if (destination.droppableId === 'unassigned') {
        newUnassignedPoints.splice(destination.index, 0, movedPoint);
      } else {
        const dayIndex = days.findIndex(day => day.id === destination.droppableId);
        newDays[dayIndex].points.splice(destination.index, 0, movedPoint);
      }
    } else {
      const sourceDayIndex = days.findIndex(day => day.id === source.droppableId);
      const [movedPoint] = newDays[sourceDayIndex].points.splice(source.index, 1);
      
      if (destination.droppableId === 'unassigned') {
        newUnassignedPoints.splice(destination.index, 0, movedPoint);
      } else {
        const destDayIndex = days.findIndex(day => day.id === destination.droppableId);
        newDays[destDayIndex].points.splice(destination.index, 0, movedPoint);
      }
    }
    
    setDays(newDays);
    setUnassignedPoints(newUnassignedPoints);
  };

  const handleDayDescriptionChange = (dayId, description) => {
    setDayDescriptions(prev => ({
      ...prev,
      [dayId]: description
    }));
  };

  const isAllPointsAssigned = () => {
    return unassignedPoints.length === 0;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        חלוקת המסלול לימים
      </Typography>

      <Grid container spacing={3}>
        {/* מפה אינטראקטיבית */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              מפת המסלול
            </Typography>
            <HikingMap
              selectedPoints={routePoints}
              readOnly
              height="400px"
            />
          </Paper>
        </Grid>

        {/* חלוקה לימים */}
        <Grid item xs={12} md={6}>
          <DragDropContext onDragEnd={handleDragEnd}>
            {/* נקודות לא משויכות */}
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                נקודות לא משויכות
              </Typography>
              <Droppable droppableId="unassigned">
                {(provided) => (
                  <List
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ 
                      minHeight: '50px',
                      bgcolor: 'grey.100',
                      borderRadius: 1
                    }}
                  >
                    {unassignedPoints.map((point, index) => (
                      <Draggable
                        key={point.id}
                        draggableId={point.id}
                        index={index}
                      >
                        {(provided) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ bgcolor: 'white', mb: 1, borderRadius: 1 }}
                          >
                            <ListItemText 
                              primary={`נקודה ${index + 1}`}
                              secondary={`${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`}
                            />
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </Paper>

            {/* ימי הטיול */}
            {days.map((day) => (
              <Paper key={day.id} elevation={2} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {day.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setEditingDay(editingDay === day.id ? null : day.id)}
                    sx={{ ml: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Box>

                {editingDay === day.id && (
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    variant="outlined"
                    placeholder="תיאור היום..."
                    value={dayDescriptions[day.id] || ''}
                    onChange={(e) => handleDayDescriptionChange(day.id, e.target.value)}
                    sx={{ mb: 2 }}
                  />
                )}

                <Droppable droppableId={day.id}>
                  {(provided) => (
                    <List
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      sx={{ 
                        minHeight: '50px',
                        bgcolor: 'grey.100',
                        borderRadius: 1
                      }}
                    >
                      {day.points.map((point, index) => (
                        <Draggable
                          key={point.id}
                          draggableId={point.id}
                          index={index}
                        >
                          {(provided) => (
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{ bgcolor: 'white', mb: 1, borderRadius: 1 }}
                            >
                              <ListItemText 
                                primary={`נקודה ${routePoints.findIndex(p => p.lat === point.lat && p.lng === point.lng) + 1}`}
                                secondary={`${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`}
                              />
                            </ListItem>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </Paper>
            ))}
          </DragDropContext>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          onClick={onBack}
          startIcon={<ArrowBack />}
          variant="outlined"
          color="primary"
        >
          חזור למסלול
        </Button>
        <Button
          onClick={() => onNext(days)}
          endIcon={<ArrowForward />}
          variant="contained"
          color="primary"
          disabled={days.length === 0 || unassignedPoints.length > 0}
        >
          המשך לסיכום
        </Button>
      </Box>
    </Box>
  );
};

export default TripDaySegmentation;
