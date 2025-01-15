import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectTrips, addTrip, updateTrip, setCurrentTrip } from '../../redux/slices/tripsSlice';
import {
    Container,
    Typography,
    Box,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    InputAdornment,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tooltip,
    Autocomplete,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Sort as SortIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import {
    tripTemplates,
    israelLocations,
} from '../../data/tripTemplates';
import TripCard from './TripCard';
import BudgetDialog from '../budget/BudgetDialog';
import GuidanceDialog from '../guidance/GuidanceDialog';
import TripChecklist from '../checklist/TripChecklist';
import ParentApprovalForm from '../forms/ParentApprovalForm';

const MyTrips = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const trips = useSelector(selectTrips);
    const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [savedStatus, setSavedStatus] = useState('');
    const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [approvalStatus, setApprovalStatus] = useState({});
    const [openTasksDialog, setOpenTasksDialog] = useState(false);
    const [selectedTripForTasks, setSelectedTripForTasks] = useState(null);
    const [showReminders, setShowReminders] = useState(true);
    const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
    const [selectedTripForBudget, setSelectedTripForBudget] = useState(null);
    const [openGuidanceDialog, setOpenGuidanceDialog] = useState(false);
    const [selectedTripForGuidance, setSelectedTripForGuidance] = useState(null);
    const [openNewTripDialog, setOpenNewTripDialog] = useState(false);
    const [openChecklist, setOpenChecklist] = useState(false);
    const [selectedTripForChecklist, setSelectedTripForChecklist] = useState(null);

    useEffect(() => {
        // טען סטטוס אישורים
        const savedApprovals = JSON.parse(localStorage.getItem('approvals') || '{}');
        setApprovalStatus(savedApprovals);
    }, []);

    const handleCreateFromTemplate = (template) => {
        const newTrip = {
            id: Date.now().toString(),
            basicDetails: {
                ...template.template,
                tripName: `${template.name} - ${new Date().toLocaleDateString()}`,
                startDate: '',
                endDate: '',
                status: 'draft',
                location: '',
                numStudents: 0,
                numStaff: 0,
                description: '',
                ageGroup: '',
                organizationType: ''
            },
            title: template.name,
            status: 'draft',
            participants: [],
            logistics: template.template.logistics || {
                transportation: [],
                equipment: [],
                food: [],
            },
            schedule: template.template.schedule || [],
            budget: {
                expenses: [],
                income: [],
            },
            approvals: {
                parentalApprovals: [],
                schoolApprovals: [],
                securityApprovals: []
            },
            notes: '',
            lastModified: new Date().toISOString()
        };

        dispatch(addTrip(newTrip));
        setOpenTemplateDialog(false);
        setSavedStatus('נשמר בהצלחה');
        setTimeout(() => setSavedStatus(''), 3000);
    };

    const handleTripClick = (trip) => {
        dispatch(setCurrentTrip(trip));
        navigate(`/trip/${trip.id}`);
    };

    const handleUpdateTrip = (updatedTrip) => {
        dispatch(updateTrip(updatedTrip));
    };

    const handleDuplicateTrip = (tripToDuplicate) => {
        const newTrip = {
            ...tripToDuplicate,
            id: Date.now().toString(),
            basicDetails: {
                ...tripToDuplicate.basicDetails,
                tripName: `${tripToDuplicate.basicDetails.tripName} - עותק`,
                status: 'draft',
            },
            status: 'draft',
            lastModified: new Date().toISOString(),
        };

        dispatch(addTrip(newTrip));
        setSavedStatus('הטיול שוכפל בהצלחה');
        setTimeout(() => setSavedStatus(''), 3000);
    };

    const handleDeleteTrip = (tripId) => {
        // dispatch(removeTrip(tripId));
        setSavedStatus('הטיול נמחק בהצלחה');
        setTimeout(() => setSavedStatus(''), 3000);
    };

    const getCompletionPercentage = (trip) => {
        const sections = ['basicDetails', 'participants', 'logistics', 'schedule', 'budget', 'approvals'];
        const completedSections = sections.filter((section) => {
            if (section === 'basicDetails') {
                const requiredFields = ['tripName', 'startDate', 'endDate', 'numStudents', 'numStaff', 'ageGroup', 'organizationType'];
                return requiredFields.every((field) => trip.basicDetails[field]);
            }
            if (Array.isArray(trip[section])) {
                return trip[section].length > 0;
            }
            if (typeof trip[section] === 'object') {
                return Object.values(trip[section]).some((value) =>
                    Array.isArray(value) ? value.length > 0 : Boolean(value)
                );
            }
            return false;
        });
        return (completedSections.length / sections.length) * 100;
    };

    const handleOpenApprovalForm = (trip) => {
        setSelectedTrip(trip);
        setOpenApprovalDialog(true);
    };

    const handleSendApproval = () => {
        // שמור את סטטוס האישור
        const newApprovalStatus = {
            ...approvalStatus,
            [selectedTrip.id]: {
                sent: true,
                date: new Date().toISOString(),
                status: 'pending',
            },
        };
        setApprovalStatus(newApprovalStatus);
        localStorage.setItem('approvals', JSON.stringify(newApprovalStatus));
        // כאן נוסיף בהמשך שליחת מייל עם הטופס
        console.log('Sending approval form via email');
        setOpenApprovalDialog(false);
    };

    const handleShareApproval = () => {
        // שמור את סטטוס האישור
        const newApprovalStatus = {
            ...approvalStatus,
            [selectedTrip.id]: {
                sent: true,
                date: new Date().toISOString(),
                status: 'pending',
            },
        };
        setApprovalStatus(newApprovalStatus);
        localStorage.setItem('approvals', JSON.stringify(newApprovalStatus));
        // כאן נוסיף בהמשך יצירת קישור לשיתוף
        console.log('Sharing approval form link');
        setOpenApprovalDialog(false);
    };

    const getApprovalStatus = (tripId) => {
        const status = approvalStatus[tripId];
        if (!status) return 'לא נשלח';
        if (status.status === 'approved') return 'אושר';
        if (status.status === 'pending') return 'ממתין לאישור';
        return 'לא נשלח';
    };

    const handleOpenBudgetDialog = (trip) => {
        setSelectedTripForBudget(trip);
        setOpenBudgetDialog(true);
    };

    const handleOpenGuidance = (trip) => {
        setSelectedTripForGuidance(trip);
        setOpenGuidanceDialog(true);
    };

    const handleOpenChecklist = (trip) => {
        setSelectedTripForChecklist(trip);
        setOpenChecklist(true);
    };

    const getTripTasks = (trip) => {
        const defaultTasks = [
            { id: 'participants', title: 'רשימת משתתפים', status: 'pending', icon: null },
            { id: 'approvals', title: 'אישורי הורים', status: 'pending', icon: null },
            { id: 'budget', title: 'תקציב', status: 'pending', icon: null },
            { id: 'equipment', title: 'ציוד', status: 'pending', icon: null },
            { id: 'transportation', title: 'הסעות', status: 'pending', icon: null },
        ];

        return trip.tasks || defaultTasks;
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'draft':
                return 'טיוטה';
            case 'pending':
                return 'ממתין לאישור';
            case 'approved':
                return 'מאושר';
            case 'completed':
                return 'הושלם';
            default:
                return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft':
                return 'default';
            case 'pending':
                return 'warning';
            case 'approved':
                return 'success';
            case 'completed':
                return 'primary';
            default:
                return 'default';
        }
    };

    const filteredAndSortedTrips = trips
        .filter((trip) => {
            if (filterStatus !== 'all' && trip.status !== filterStatus) return false;
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                return (
                    trip.basicDetails.tripName.toLowerCase().includes(searchLower) ||
                    (trip.basicDetails.description &&
                        trip.basicDetails.description.toLowerCase().includes(searchLower)) ||
                    (trip.basicDetails.location &&
                        trip.basicDetails.location.toLowerCase().includes(searchLower))
                );
            }
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.lastModified) - new Date(a.lastModified);
                case 'name':
                    return a.basicDetails.tripName.localeCompare(b.basicDetails.tripName);
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    הטיולים שלי
                </Typography>
                <Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenTemplateDialog(true)}
                        sx={{ ml: 2 }}
                    >
                        טיול חדש
                    </Button>
                </Box>
            </Box>

            {/* סרגל חיפוש וסינון */}
            <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="חיפוש טיול..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchQuery('')}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{ flexGrow: 1 }}
                />

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>מיין לפי</InputLabel>
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        label="מיין לפי"
                        startAdornment={<SortIcon sx={{ mr: 1 }} />}
                    >
                        <MenuItem value="date">תאריך עדכון</MenuItem>
                        <MenuItem value="name">שם</MenuItem>
                        <MenuItem value="status">סטטוס</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>סטטוס</InputLabel>
                    <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="סטטוס"
                    >
                        <MenuItem value="all">הכל</MenuItem>
                        <MenuItem value="draft">טיוטה</MenuItem>
                        <MenuItem value="pending">ממתין לאישור</MenuItem>
                        <MenuItem value="approved">מאושר</MenuItem>
                        <MenuItem value="completed">הושלם</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* הודעת סטטוס */}
            {savedStatus && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {savedStatus}
                </Alert>
            )}

            {/* רשימת הטיולים */}
            <Grid container spacing={3}>
                {filteredAndSortedTrips.map((trip) => (
                    <Grid item xs={12} sm={6} md={4} key={trip.id}>
                        <TripCard
                            trip={trip}
                            getTripTasks={getTripTasks}
                            getStatusText={getStatusText}
                            getStatusColor={getStatusColor}
                            showReminders={showReminders}
                            setSelectedTripForTasks={setSelectedTripForTasks}
                            setOpenTasksDialog={setOpenTasksDialog}
                            navigate={navigate}
                            handleDuplicateTrip={handleDuplicateTrip}
                            handleDeleteTrip={handleDeleteTrip}
                            handleOpenApprovalForm={handleOpenApprovalForm}
                            handleOpenBudgetDialog={handleOpenBudgetDialog}
                            handleOpenGuidance={handleOpenGuidance}
                            handleOpenChecklist={handleOpenChecklist}
                            onEdit={(trip) => navigate(`/plan-trip/${trip.id}`)}
                            onDelete={handleDeleteTrip}
                            handleUpdateTrip={(updatedTrip) => {
                                handleUpdateTrip(updatedTrip);
                            }}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* דיאלוג יצירת טיול חדש */}
            <Dialog
                open={openTemplateDialog}
                onClose={() => setOpenTemplateDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>יצירת טיול חדש</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Autocomplete
                            value={selectedTemplate}
                            onChange={(event, newValue) => setSelectedTemplate(newValue)}
                            options={tripTemplates}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="בחר תבנית טיול"
                                    variant="outlined"
                                />
                            )}
                            sx={{ mb: 2 }}
                        />

                        <Autocomplete
                            value={selectedLocation}
                            onChange={(event, newValue) => setSelectedLocation(newValue)}
                            options={israelLocations}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="בחר מיקום"
                                    variant="outlined"
                                />
                            )}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenTemplateDialog(false)}>ביטול</Button>
                    <Button
                        onClick={() => handleCreateFromTemplate(selectedTemplate)}
                        variant="contained"
                        disabled={!selectedTemplate}
                    >
                        צור טיול
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Task Dialog */}
            <Dialog
                open={openTasksDialog}
                onClose={() => setOpenTasksDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>משימות לטיול</DialogTitle>
                <DialogContent>
                    {selectedTripForTasks && (
                        <Box>
                            {getTripTasks(selectedTripForTasks).map((task) => (
                                <Box key={task.id} sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1">{task.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        סטטוס: {task.status === 'completed' ? 'הושלם' : 'ממתין'}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenTasksDialog(false)}>סגור</Button>
                </DialogActions>
            </Dialog>

            {/* Budget Dialog */}
            <Dialog
                open={openBudgetDialog}
                onClose={() => setOpenBudgetDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogContent>
                    <BudgetDialog
                        trip={selectedTripForBudget}
                        onUpdate={(updatedTrip) => {
                            handleUpdateTrip(updatedTrip);
                        }}
                        onClose={() => setOpenBudgetDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Guidance Dialog */}
            <Dialog
                open={openGuidanceDialog}
                onClose={() => setOpenGuidanceDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogContent>
                    <GuidanceDialog
                        trip={selectedTripForGuidance}
                        onClose={() => setOpenGuidanceDialog(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Checklist Dialog */}
            <Dialog
                open={openChecklist}
                onClose={() => setOpenChecklist(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogContent>
                    <TripChecklist
                        trip={selectedTripForChecklist}
                        onUpdate={(updatedTrip) => {
                            handleUpdateTrip(updatedTrip);
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenChecklist(false)}>סגור</Button>
                </DialogActions>
            </Dialog>

            {/* Parent Approval Dialog */}
            <Dialog
                open={openApprovalDialog}
                onClose={() => setOpenApprovalDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogContent>
                    <ParentApprovalForm
                        trip={selectedTrip}
                        onClose={() => setOpenApprovalDialog(false)}
                    />
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default MyTrips;
