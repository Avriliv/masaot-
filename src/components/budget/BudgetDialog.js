import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    List,
    ListItem,
    IconButton,
    Divider,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

const BudgetDialog = ({ trip, onUpdate, onClose }) => {
    const [budget, setBudget] = useState(trip.budget || {
        plannedTotal: 0,
        expenses: [],
        income: []
    });

    const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
    const [newIncome, setNewIncome] = useState({ source: '', amount: '' });

    const handleAddExpense = () => {
        if (!newExpense.description || !newExpense.amount) return;
        
        const updatedBudget = {
            ...budget,
            expenses: [...budget.expenses, { ...newExpense, id: Date.now() }]
        };
        setBudget(updatedBudget);
        setNewExpense({ description: '', amount: '' });
        
        onUpdate({
            ...trip,
            budget: updatedBudget
        });
    };

    const handleAddIncome = () => {
        if (!newIncome.source || !newIncome.amount) return;
        
        const updatedBudget = {
            ...budget,
            income: [...budget.income, { ...newIncome, id: Date.now() }]
        };
        setBudget(updatedBudget);
        setNewIncome({ source: '', amount: '' });
        
        onUpdate({
            ...trip,
            budget: updatedBudget
        });
    };

    const handleRemoveExpense = (id) => {
        const updatedBudget = {
            ...budget,
            expenses: budget.expenses.filter(exp => exp.id !== id)
        };
        setBudget(updatedBudget);
        onUpdate({
            ...trip,
            budget: updatedBudget
        });
    };

    const handleRemoveIncome = (id) => {
        const updatedBudget = {
            ...budget,
            income: budget.income.filter(inc => inc.id !== id)
        };
        setBudget(updatedBudget);
        onUpdate({
            ...trip,
            budget: updatedBudget
        });
    };

    const totalExpenses = budget.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const totalIncome = budget.income.reduce((sum, inc) => sum + Number(inc.amount), 0);
    const balance = totalIncome - totalExpenses;

    return (
        <>
            <DialogTitle>ניהול תקציב</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>סיכום</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography color="success.main">הכנסות: ₪{totalIncome}</Typography>
                        <Typography color="error.main">הוצאות: ₪{totalExpenses}</Typography>
                        <Typography color={balance >= 0 ? 'success.main' : 'error.main'}>
                            יתרה: ₪{balance}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>הוצאות</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                            label="תיאור"
                            value={newExpense.description}
                            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                            size="small"
                        />
                        <TextField
                            label="סכום"
                            type="number"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                            size="small"
                        />
                        <Button
                            variant="contained"
                            onClick={handleAddExpense}
                            startIcon={<AddIcon />}
                        >
                            הוסף
                        </Button>
                    </Box>
                    <List>
                        {budget.expenses.map((expense) => (
                            <ListItem
                                key={expense.id}
                                secondaryAction={
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => handleRemoveExpense(expense.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <Typography sx={{ flexGrow: 1 }}>{expense.description}</Typography>
                                <Typography sx={{ minWidth: 100, textAlign: 'right' }}>
                                    ₪{expense.amount}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box>
                    <Typography variant="h6" gutterBottom>הכנסות</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                            label="מקור"
                            value={newIncome.source}
                            onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                            size="small"
                        />
                        <TextField
                            label="סכום"
                            type="number"
                            value={newIncome.amount}
                            onChange={(e) => setNewIncome({ ...newIncome, amount: Number(e.target.value) })}
                            size="small"
                        />
                        <Button
                            variant="contained"
                            onClick={handleAddIncome}
                            startIcon={<AddIcon />}
                        >
                            הוסף
                        </Button>
                    </Box>
                    <List>
                        {budget.income.map((income) => (
                            <ListItem
                                key={income.id}
                                secondaryAction={
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => handleRemoveIncome(income.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <Typography sx={{ flexGrow: 1 }}>{income.source}</Typography>
                                <Typography sx={{ minWidth: 100, textAlign: 'right' }}>
                                    ₪{income.amount}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>סגור</Button>
            </DialogActions>
        </>
    );
};

export default BudgetDialog;
