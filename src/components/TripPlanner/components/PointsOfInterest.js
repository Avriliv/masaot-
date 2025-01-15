import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useTrip } from '../../../context/TripContext';

const PointsOfInterest = () => {
  const { tripState, updateTripPoints } = useTrip();
  const [points, setPoints] = useState(tripState.points || []);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPoint, setCurrentPoint] = useState({
    name: '',
    description: '',
    type: '',
    importance: 3,
    estimatedDuration: '',
    notes: '',
  });
  const [editIndex, setEditIndex] = useState(-1);

  const pointTypes = [
    'אתר היסטורי',
    'נקודת תצפית',
    'מסלול הליכה',
    'אטרקציה',
    'מקום לינה',
    'נקודת מים',
    'אחר'
  ];

  const handleOpenDialog = (point = null, index = -1) => {
    if (point) {
      setCurrentPoint(point);
      setEditIndex(index);
    } else {
      setCurrentPoint({
        name: '',
        description: '',
        type: '',
        importance: 3,
        estimatedDuration: '',
        notes: '',
      });
      setEditIndex(-1);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentPoint({
      name: '',
      description: '',
      type: '',
      importance: 3,
      estimatedDuration: '',
      notes: '',
    });
  };

  const handleSavePoint = () => {
    const newPoints = [...points];
    if (editIndex >= 0) {
      newPoints[editIndex] = currentPoint;
    } else {
      newPoints.push(currentPoint);
    }
    setPoints(newPoints);
    updateTripPoints(newPoints);
    handleCloseDialog();
  };

  const handleDeletePoint = (index) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
    updateTripPoints(newPoints);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">נקודות עניין במסלול</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          הוסף נקודת עניין
        </Button>
      </Box>

      <List>
        {points.map((point, index) => (
          <ListItem
            key={index}
            sx={{
              mb: 2,
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">{point.name}</Typography>
                  <Chip
                    label={point.type}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                  <Rating
                    value={point.importance}
                    readOnly
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary">
                    {point.description}
                  </Typography>
                  {point.estimatedDuration && (
                    <Typography variant="body2" color="text.secondary">
                      משך זמן משוער: {point.estimatedDuration}
                    </Typography>
                  )}
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleOpenDialog(point, index)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDeletePoint(index)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editIndex >= 0 ? 'ערוך נקודת עניין' : 'הוסף נקודת עניין'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="שם הנקודה"
                value={currentPoint.name}
                onChange={(e) =>
                  setCurrentPoint({ ...currentPoint, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="תיאור"
                multiline
                rows={3}
                value={currentPoint.description}
                onChange={(e) =>
                  setCurrentPoint({ ...currentPoint, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="סוג הנקודה"
                value={currentPoint.type}
                onChange={(e) =>
                  setCurrentPoint({ ...currentPoint, type: e.target.value })
                }
                SelectProps={{
                  native: true,
                }}
              >
                <option value=""></option>
                {pointTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography component="legend">חשיבות</Typography>
              <Rating
                value={currentPoint.importance}
                onChange={(_, newValue) =>
                  setCurrentPoint({ ...currentPoint, importance: newValue })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="משך זמן משוער"
                value={currentPoint.estimatedDuration}
                onChange={(e) =>
                  setCurrentPoint({
                    ...currentPoint,
                    estimatedDuration: e.target.value,
                  })
                }
                placeholder="לדוגמה: שעה וחצי, 45 דקות"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="הערות נוספות"
                multiline
                rows={2}
                value={currentPoint.notes}
                onChange={(e) =>
                  setCurrentPoint({ ...currentPoint, notes: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ביטול</Button>
          <Button
            onClick={handleSavePoint}
            variant="contained"
            disabled={!currentPoint.name || !currentPoint.type}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PointsOfInterest;
