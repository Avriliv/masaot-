import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { useTrip } from '../../../context/TripContext';

const expenseCategories = [
  'הסעות',
  'לינה',
  'אטרקציות',
  'מזון',
  'ציוד',
  'מדריכים',
  'ביטוח',
  'אבטחה',
  'רפואה',
  'שונות',
];

const defaultBudgetItems = [
  {
    id: 'transport',
    category: 'הסעות',
    description: 'אוטובוס',
    estimatedCost: 2500,
    actualCost: 0,
    paid: false,
    notes: '',
  },
  {
    id: 'accommodation',
    category: 'לינה',
    description: 'אכסניה',
    estimatedCost: 1800,
    actualCost: 0,
    paid: false,
    notes: '',
  },
];

const BudgetManager = () => {
  const { tripState, updateBudget } = useTrip();
  const [budgetItems, setBudgetItems] = useState(tripState.budget?.items || defaultBudgetItems);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    category: '',
    description: '',
    estimatedCost: 0,
    actualCost: 0,
    paid: false,
    notes: '',
  });

  const calculateTotals = () => {
    return budgetItems.reduce(
      (acc, item) => ({
        estimated: acc.estimated + Number(item.estimatedCost),
        actual: acc.actual + Number(item.actualCost),
        remaining: acc.estimated - acc.actual,
      }),
      { estimated: 0, actual: 0, remaining: 0 }
    );
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setNewItem(item);
    } else {
      setEditingItem(null);
      setNewItem({
        category: '',
        description: '',
        estimatedCost: 0,
        actualCost: 0,
        paid: false,
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewItem({
      category: '',
      description: '',
      estimatedCost: 0,
      actualCost: 0,
      paid: false,
      notes: '',
    });
    setEditingItem(null);
  };

  const handleSaveItem = () => {
    const updatedItems = [...budgetItems];
    if (editingItem) {
      const index = updatedItems.findIndex((item) => item.id === editingItem.id);
      updatedItems[index] = { ...newItem, id: editingItem.id };
    } else {
      updatedItems.push({
        ...newItem,
        id: `budget-${Date.now()}`,
      });
    }
    setBudgetItems(updatedItems);
    updateBudget({ items: updatedItems });
    handleCloseDialog();
  };

  const handleDeleteItem = (id) => {
    const updatedItems = budgetItems.filter((item) => item.id !== id);
    setBudgetItems(updatedItems);
    updateBudget({ items: updatedItems });
  };

  const handleTogglePaid = (id) => {
    const updatedItems = budgetItems.map((item) =>
      item.id === id ? { ...item, paid: !item.paid } : item
    );
    setBudgetItems(updatedItems);
    updateBudget({ items: updatedItems });
  };

  const totals = calculateTotals();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">ניהול תקציב</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          הוסף הוצאה
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="subtitle2">תקציב מתוכנן</Typography>
            <Typography variant="h4">₪{totals.estimated.toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
            <Typography variant="subtitle2">הוצאות בפועל</Typography>
            <Typography variant="h4">₪{totals.actual.toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: totals.remaining >= 0 ? 'info.light' : 'error.light',
              color: 'white',
            }}
          >
            <Typography variant="subtitle2">יתרה</Typography>
            <Typography variant="h4">₪{totals.remaining.toLocaleString()}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>קטגוריה</TableCell>
              <TableCell>תיאור</TableCell>
              <TableCell align="right">עלות מתוכננת</TableCell>
              <TableCell align="right">עלות בפועל</TableCell>
              <TableCell align="right">סטטוס</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgetItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell align="right">₪{item.estimatedCost.toLocaleString()}</TableCell>
                <TableCell align="right">₪{item.actualCost.toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Chip
                    label={item.paid ? 'שולם' : 'טרם שולם'}
                    color={item.paid ? 'success' : 'warning'}
                    onClick={() => handleTogglePaid(item.id)}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'ערוך הוצאה' : 'הוסף הוצאה חדשה'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="קטגוריה"
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
              >
                {expenseCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="תיאור"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="עלות מתוכננת"
                type="number"
                value={newItem.estimatedCost}
                onChange={(e) =>
                  setNewItem({ ...newItem, estimatedCost: Number(e.target.value) })
                }
                InputProps={{
                  startAdornment: '₪',
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="עלות בפועל"
                type="number"
                value={newItem.actualCost}
                onChange={(e) =>
                  setNewItem({ ...newItem, actualCost: Number(e.target.value) })
                }
                InputProps={{
                  startAdornment: '₪',
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="הערות"
                multiline
                rows={2}
                value={newItem.notes}
                onChange={(e) =>
                  setNewItem({ ...newItem, notes: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ביטול</Button>
          <Button
            onClick={handleSaveItem}
            variant="contained"
            disabled={!newItem.category || !newItem.description}
          >
            {editingItem ? 'עדכן' : 'הוסף'}
          </Button>
        </DialogActions>
      </Dialog>

      {budgetItems.length > 0 && totals.remaining < 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          שים לב: חריגה מהתקציב המתוכנן!
        </Alert>
      )}
    </Box>
  );
};

export default BudgetManager;
