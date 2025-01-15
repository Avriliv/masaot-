import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useTrip } from '../../../context/TripContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const TimelinePlanner = () => {
  const { tripState, updateTimeline } = useTrip();
  const [activities, setActivities] = useState(tripState.timeline || []);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentActivity, setCurrentActivity] = useState({
    title: '',
    startTime: '',
    duration: '',
    type: '',
    location: '',
    description: '',
    equipment: '',
    responsiblePerson: '',
  });
  const [editIndex, setEditIndex] = useState(-1);

  const activityTypes = [
    'נסיעה',
    'הליכה',
    'ארוחה',
    'הדרכה',
    'פעילות',
    'מנוחה',
    'לינה',
    'אחר',
  ];

  useEffect(() => {
    if (tripState.timeline) {
      setActivities(tripState.timeline);
    }
  }, [tripState.timeline]);

  const handleOpenDialog = (activity = null, index = -1) => {
    if (activity) {
      setCurrentActivity(activity);
      setEditIndex(index);
    } else {
      setCurrentActivity({
        title: '',
        startTime: '',
        duration: '',
        type: '',
        location: '',
        description: '',
        equipment: '',
        responsiblePerson: '',
      });
      setEditIndex(-1);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentActivity({
      title: '',
      startTime: '',
      duration: '',
      type: '',
      location: '',
      description: '',
      equipment: '',
      responsiblePerson: '',
    });
  };

  const handleSaveActivity = () => {
    const newActivities = [...activities];
    if (editIndex >= 0) {
      newActivities[editIndex] = currentActivity;
    } else {
      newActivities.push(currentActivity);
    }
    setActivities(newActivities);
    updateTimeline(newActivities);
    handleCloseDialog();
  };

  const handleDeleteActivity = (index) => {
    const newActivities = activities.filter((_, i) => i !== index);
    setActivities(newActivities);
    updateTimeline(newActivities);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(activities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setActivities(items);
    updateTimeline(items);
  };

  const getActivityTimeDisplay = (activity) => {
    let display = activity.startTime;
    if (activity.duration) {
      display += ` (${activity.duration})`;
    }
    return display;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">לוח זמנים</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          הוסף פעילות
        </Button>
      </Box>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="timeline">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {activities.map((activity, index) => (
                <Draggable key={index} draggableId={`activity-${index}`} index={index}>
                  {(provided) => (
                    <ListItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      component={Paper}
                      elevation={1}
                      sx={{
                        mb: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                    >
                      <Box {...provided.dragHandleProps} sx={{ mr: 2, cursor: 'grab' }}>
                        <DragIcon />
                      </Box>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">{activity.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              ({activity.type})
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {getActivityTimeDisplay(activity)}
                            </Typography>
                            {activity.location && (
                              <Typography variant="body2" component="div">
                                מיקום: {activity.location}
                              </Typography>
                            )}
                            {activity.description && (
                              <Typography variant="body2" color="text.secondary">
                                {activity.description}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleOpenDialog(activity, index)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteActivity(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editIndex >= 0 ? 'ערוך פעילות' : 'הוסף פעילות חדשה'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="שם הפעילות"
                value={currentActivity.title}
                onChange={(e) =>
                  setCurrentActivity({ ...currentActivity, title: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="שעת התחלה"
                type="time"
                value={currentActivity.startTime}
                onChange={(e) =>
                  setCurrentActivity({ ...currentActivity, startTime: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="משך זמן"
                placeholder="לדוגמה: שעה וחצי"
                value={currentActivity.duration}
                onChange={(e) =>
                  setCurrentActivity({ ...currentActivity, duration: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="סוג פעילות"
                value={currentActivity.type}
                onChange={(e) =>
                  setCurrentActivity({ ...currentActivity, type: e.target.value })
                }
              >
                {activityTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="מיקום"
                value={currentActivity.location}
                onChange={(e) =>
                  setCurrentActivity({ ...currentActivity, location: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="תיאור"
                multiline
                rows={3}
                value={currentActivity.description}
                onChange={(e) =>
                  setCurrentActivity({ ...currentActivity, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ציוד נדרש"
                value={currentActivity.equipment}
                onChange={(e) =>
                  setCurrentActivity({ ...currentActivity, equipment: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="אחראי"
                value={currentActivity.responsiblePerson}
                onChange={(e) =>
                  setCurrentActivity({
                    ...currentActivity,
                    responsiblePerson: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ביטול</Button>
          <Button
            onClick={handleSaveActivity}
            variant="contained"
            disabled={!currentActivity.title || !currentActivity.type}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimelinePlanner;
