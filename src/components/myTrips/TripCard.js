import React, { useState, useMemo } from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    Button,
    IconButton,
    Tooltip,
    LinearProgress,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogContent,
    DialogActions,
    Chip,
} from '@mui/material';
import {
    DateRange as DateRangeIcon,
    LocationOn as LocationIcon,
    People as PeopleIcon,
    School as SchoolIcon,
    Edit as EditIcon,
    ContentCopy as ContentCopyIcon,
    Delete as DeleteIcon,
    Description as DescriptionIcon,
    AccountBalance as AccountBalanceIcon,
    HelpOutline as HelpOutlineIcon,
    Backpack as BackpackIcon,
    ChevronLeft as ChevronLeftIcon,
    FiberManualRecord as FiberManualRecordIcon,
    AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import TripChecklist from '../checklist/TripChecklist';

const TripCard = ({ 
    trip, 
    getTripTasks,
    getStatusText,
    getStatusColor,
    showReminders,
    setSelectedTripForTasks,
    setOpenTasksDialog,
    navigate,
    handleDuplicateTrip,
    handleDeleteTrip,
    handleOpenApprovalForm,
    handleOpenBudgetDialog,
    handleOpenGuidance,
    handleOpenChecklist,
    handleUpdateTrip
}) => {
    const [openChecklist, setOpenChecklist] = useState(false);

    const normalizedTrip = useMemo(() => {
        if (!trip) return null;
        try {
            const basicDetails = trip.basicDetails || {};
            return {
                ...trip,
                startDate: trip.startDate || basicDetails.startDate || new Date().toISOString().split('T')[0],
                tasks: trip.tasks || basicDetails.tasks || [],
                title: trip.title || basicDetails.tripName || 'טיול חדש',
                location: trip.location || basicDetails.location || 'מיקום לא נקבע',
                description: basicDetails.description || '',
                numStudents: basicDetails.numStudents || 0,
                numStaff: basicDetails.numStaff || 0,
                ageGroup: basicDetails.ageGroup || '',
                startDate: basicDetails.startDate || '',
                endDate: basicDetails.endDate || ''
            };
        } catch (error) {
            console.error('Error normalizing trip:', error);
            return null;
        }
    }, [trip]);

    const getTaskPriority = (task, tripData) => {
        if (!task || !tripData) return 'normal';

        try {
            const startDate = tripData.startDate || tripData.basicDetails?.startDate;
            if (!startDate) return 'normal';

            const today = new Date();
            const tripStart = new Date(startDate);
            const daysUntilTrip = Math.ceil((tripStart - today) / (1000 * 60 * 60 * 24));

            // משימות קריטיות שחייבות להיות מוכנות לפחות שבוע לפני הטיול
            const criticalTasks = ['participants', 'approvals', 'budget'];
            // משימות שצריכות להיות מוכנות לפחות 3 ימים לפני הטיול
            const importantTasks = ['equipment', 'transportation'];
            
            if (criticalTasks.includes(task.id) && daysUntilTrip <= 7) {
                return 'critical';
            } else if (importantTasks.includes(task.id) && daysUntilTrip <= 3) {
                return 'important';
            }
            return 'normal';
        } catch (error) {
            console.error('Error calculating task priority:', error);
            return 'normal';
        }
    };

    const getReminderMessage = (tripData) => {
        if (!tripData) return null;

        try {
            const incompleteTasks = getTripTasks(tripData).filter(task => task.status === 'pending');
            if (!incompleteTasks || incompleteTasks.length === 0) return null;

            const criticalTasks = incompleteTasks.filter(task => getTaskPriority(task, tripData) === 'critical');
            const importantTasks = incompleteTasks.filter(task => getTaskPriority(task, tripData) === 'important');

            if (criticalTasks.length > 0) {
                return {
                    severity: 'error',
                    message: `יש ${criticalTasks.length} משימות קריטיות שדורשות את טיפולך!`,
                    tasks: criticalTasks
                };
            } else if (importantTasks.length > 0) {
                return {
                    severity: 'warning',
                    message: `יש ${importantTasks.length} משימות חשובות שכדאי להשלים בקרוב`,
                    tasks: importantTasks
                };
            }
            return null;
        } catch (error) {
            console.error('Error generating reminder message:', error);
            return null;
        }
    };

    const reminderMessage = useMemo(() => {
        if (!normalizedTrip) return null;
        try {
            return getReminderMessage(normalizedTrip);
        } catch (error) {
            console.error('Error getting reminder message:', error);
            return null;
        }
    }, [normalizedTrip]);

    const taskPriorities = useMemo(() => {
        if (!normalizedTrip?.tasks) return {};
        try {
            return normalizedTrip.tasks.reduce((acc, task) => {
                if (!task) return acc;
                acc[task.id] = getTaskPriority(task, normalizedTrip);
                return acc;
            }, {});
        } catch (error) {
            console.error('Error calculating task priorities:', error);
            return {};
        }
    }, [normalizedTrip]);

    if (!normalizedTrip) return null;

    const incompleteTasks = getTripTasks(trip).filter(task => task.status === 'pending');
    const completionPercentage = getTripTasks(trip).filter(task => task.status === 'completed').length / getTripTasks(trip).length * 100;

    const getBudgetStatus = () => {
        if (!trip.budget) return null;
        
        const totalBudget = trip.budget.plannedTotal || 0;
        const totalExpenses = trip.budget.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
        const remaining = totalBudget - totalExpenses;
        
        return {
            total: totalBudget,
            spent: totalExpenses,
            remaining: remaining,
            status: remaining < 0 ? 'exceeded' : remaining < (totalBudget * 0.1) ? 'warning' : 'good'
        };
    };

    const budgetStatus = getBudgetStatus();

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        {normalizedTrip.title}
                    </Typography>
                    <Chip
                        label={getStatusText(trip.status)}
                        color={getStatusColor(trip.status)}
                        size="small"
                    />
                </Box>

                {normalizedTrip.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {normalizedTrip.description}
                    </Typography>
                )}

                <Divider sx={{ my: 1.5 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DateRangeIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">
                            {normalizedTrip.startDate && normalizedTrip.endDate ? 
                                `${normalizedTrip.startDate} - ${normalizedTrip.endDate}` :
                                'טרם נקבע תאריך'}
                        </Typography>
                    </Box>

                    {normalizedTrip.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                            <Typography variant="body2">
                                {normalizedTrip.location}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PeopleIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">
                            {normalizedTrip.numStudents && normalizedTrip.numStaff ? 
                                `${normalizedTrip.numStudents} חניכים, ${normalizedTrip.numStaff} אנשי צוות` :
                                'טרם הוגדרו משתתפים'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2">
                            {normalizedTrip.ageGroup ? 
                                `${normalizedTrip.ageGroup === 'elementary' ? 'יסודי' : 
                                  normalizedTrip.ageGroup === 'middle' ? 'חטיבת ביניים' : 
                                  normalizedTrip.ageGroup === 'high' ? 'תיכון' : 'אחר'}` : 
                                'טרם נבחרה קבוצת גיל'}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                        עודכן לאחרונה: {new Date(trip.lastModified).toLocaleDateString()}
                    </Typography>
                </Box>

                {/* תזכורות */}
                {reminderMessage && showReminders && (
                    <Alert 
                        severity={reminderMessage.severity}
                        sx={{ mb: 2 }}
                        action={
                            <Button 
                                color="inherit" 
                                size="small"
                                onClick={() => {
                                    setSelectedTripForTasks(trip);
                                    setOpenTasksDialog(true);
                                }}
                            >
                                צפה במשימות
                            </Button>
                        }
                    >
                        {reminderMessage.message}
                    </Alert>
                )}

                {/* התקדמות */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            הושלמו {Math.round(completionPercentage)}% מהמשימות
                        </Typography>
                        <Button
                            size="small"
                            onClick={() => {
                                setSelectedTripForTasks(trip);
                                setOpenTasksDialog(true);
                            }}
                            endIcon={<ChevronLeftIcon />}
                        >
                            {incompleteTasks.length > 0 ? `נותרו ${incompleteTasks.length} משימות` : 'כל המשימות הושלמו'}
                        </Button>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={completionPercentage}
                        sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: completionPercentage === 100 ? 'success.main' : 'primary.main'
                            }
                        }}
                    />
                </Box>

                {/* משימות הבאות */}
                {incompleteTasks.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            משימות הבאות:
                        </Typography>
                        <List dense>
                            {incompleteTasks.slice(0, 3).map((task) => (
                                <ListItem 
                                    key={task.id}
                                    button
                                    onClick={task.action}
                                    sx={{
                                        borderRadius: 1,
                                        mb: 0.5,
                                        bgcolor: getTaskPriority(task, trip) === 'critical' ? 'error.lighter' : 
                                                getTaskPriority(task, trip) === 'important' ? 'warning.lighter' : 
                                                'background.paper'
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        {task.icon}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={task.title}
                                        primaryTypographyProps={{
                                            variant: 'body2',
                                            color: getTaskPriority(task, trip) === 'critical' ? 'error.main' : 
                                                   getTaskPriority(task, trip) === 'important' ? 'warning.main' : 
                                                   'text.primary'
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ChevronLeftIcon />}
                        onClick={() => navigate(`/trip/${trip.id}`)}
                        fullWidth
                    >
                        פרטי הטיול
                    </Button>
                </Box>
            </CardContent>

            {/* Add Budget Summary before CardActions */}
            {budgetStatus && (
                <Box sx={{ px: 2, pb: 2 }}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MoneyIcon color={budgetStatus.status === 'exceeded' ? 'error' : 
                                              budgetStatus.status === 'warning' ? 'warning' : 
                                              'success'} />
                            <Typography variant="body2">
                                תקציב: ₪{budgetStatus.total.toLocaleString()}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color={budgetStatus.status === 'exceeded' ? 'error.main' : 
                                                              budgetStatus.status === 'warning' ? 'warning.main' : 
                                                              'success.main'}>
                                נותר: ₪{budgetStatus.remaining.toLocaleString()}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => handleOpenBudgetDialog(trip)}
                                color={budgetStatus.status === 'exceeded' ? 'error' : 
                                       budgetStatus.status === 'warning' ? 'warning' : 
                                       'primary'}
                            >
                                <AccountBalanceIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    
                    {budgetStatus.status === 'exceeded' && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            חריגה מהתקציב המתוכנן
                        </Alert>
                    )}
                    {budgetStatus.status === 'warning' && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                            נותר פחות מ-10% מהתקציב
                        </Alert>
                    )}
                </Box>
            )}

            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box>
                    <Tooltip title="ערוך">
                        <IconButton 
                            onClick={() => navigate(`/plan-trip/${trip.id}`)}
                            size="small"
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="שכפל">
                        <IconButton
                            onClick={() => handleDuplicateTrip(trip)}
                            size="small"
                        >
                            <ContentCopyIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Tooltip title="מחק">
                    <IconButton
                        onClick={() => handleDeleteTrip(trip.id)}
                        size="small"
                        color="error"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="שלח אישור הורים">
                    <IconButton 
                        size="small"
                        onClick={() => handleOpenApprovalForm(trip)}
                    >
                        <DescriptionIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="ניהול תקציב">
                    <IconButton 
                        size="small"
                        onClick={() => handleOpenBudgetDialog(trip)}
                    >
                        <AccountBalanceIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="מדריך מהיר">
                    <IconButton 
                        size="small"
                        onClick={() => handleOpenGuidance(trip)}
                    >
                        <HelpOutlineIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="רשימת ציוד">
                    <IconButton 
                        size="small"
                        onClick={() => handleOpenChecklist(trip)}
                    >
                        <BackpackIcon />
                    </IconButton>
                </Tooltip>
            </CardActions>

            {/* Checklist Dialog */}
            <Dialog
                open={openChecklist}
                onClose={() => setOpenChecklist(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogContent>
                    <TripChecklist 
                        trip={trip}
                        onUpdate={handleUpdateTrip}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenChecklist(false)}>סגור</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default TripCard;
