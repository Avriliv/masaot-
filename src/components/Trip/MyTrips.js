import React, { useState, useEffect, useMemo } from 'react';
import { 
    Container, 
    Typography, 
    Card, 
    CardContent, 
    CardMedia,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    TextField,
    InputAdornment,
    Menu,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Tab,
    Tabs,
    Tooltip,
    Stack,
    Alert,
    FiberManualRecordIcon
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    Description as DocumentIcon,
    People as PeopleIcon,
    Security as SecurityIcon,
    LocalShipping as LogisticsIcon,
    AccountBalance as BudgetIcon,
    Map as MapIcon,
    CalendarToday as CalendarIcon,
    Add as AddIcon,
    Circle as StatusIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    ViewModule as GridViewIcon,
    ViewList as ListViewIcon,
    GetApp as ExportIcon,
    Sort as SortIcon,
    DateRange as DateRangeIcon
} from '@mui/icons-material';
import { useTrip } from '../../context/TripContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/he';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('he');
const localizer = momentLocalizer(moment);

// נרמול נתוני טיול
const normalizeTrip = (trip) => {
    if (!trip) return null;

    const today = new Date().toISOString().split('T')[0];

    // יצירת מבנה בסיסי אחיד
    const normalizedTrip = {
        id: trip.id || Date.now(),
        title: '',
        startDate: today,
        endDate: today,
        location: '',
        participants: [],
        tasks: [],
        type: 'dayTrip',
        status: 'pending',
        basicDetails: {
            tripName: '',
            startDate: today,
            endDate: today,
            location: '',
            description: '',
            participantsCount: 0,
            tasks: []
        }
    };

    // העתקת נתונים קיימים
    if (trip.basicDetails) {
        normalizedTrip.basicDetails = {
            ...normalizedTrip.basicDetails,
            tripName: trip.basicDetails.tripName || trip.title || 'טיול חדש',
            startDate: trip.basicDetails.startDate || trip.startDate || today,
            endDate: trip.basicDetails.endDate || trip.endDate || today,
            location: trip.basicDetails.location || trip.location || '',
            description: trip.basicDetails.description || '',
            participantsCount: trip.basicDetails.participantsCount || 0,
            tasks: Array.isArray(trip.basicDetails.tasks) ? trip.basicDetails.tasks : []
        };
    }

    // העתקת נתונים ישירים
    normalizedTrip.title = trip.title || trip.basicDetails?.tripName || 'טיול חדש';
    normalizedTrip.startDate = trip.startDate || trip.basicDetails?.startDate || today;
    normalizedTrip.endDate = trip.endDate || trip.basicDetails?.endDate || today;
    normalizedTrip.location = trip.location || trip.basicDetails?.location || '';
    normalizedTrip.participants = Array.isArray(trip.participants) ? trip.participants : [];
    normalizedTrip.tasks = Array.isArray(trip.tasks) ? trip.tasks : [
        { id: 1, title: 'תכנון מסלול', status: 'pending', priority: 'high' },
        { id: 2, title: 'אישורי הורים', status: 'pending', priority: 'high' },
        { id: 3, title: 'הזמנת הסעות', status: 'pending', priority: 'medium' },
        { id: 4, title: 'תיאום אתרים', status: 'pending', priority: 'medium' }
    ];
    normalizedTrip.type = trip.type || 'dayTrip';
    normalizedTrip.status = trip.status || 'pending';

    return normalizedTrip;
};

const MyTrips = () => {
    const navigate = useNavigate();
    const { tripState } = useTrip();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [trips, setTrips] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isParticipantsOpen, setParticipantsOpen] = useState(false);
    
    // חדש: מצב תצוגה וסינון
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        // ניקוי ה-localStorage בפיתוח
        if (process.env.NODE_ENV === 'development') {
            localStorage.removeItem('trips');
        }

        try {
            const savedTrips = JSON.parse(localStorage.getItem('trips') || '[]');
            // נרמול כל הטיולים בטעינה
            const normalizedTrips = savedTrips
                .map(trip => normalizeTrip(trip))
                .filter(trip => trip !== null);

            // אם אין טיולים, נוסיף טיול לדוגמה
            if (normalizedTrips.length === 0) {
                const exampleTrip = normalizeTrip({
                    id: Date.now(),
                    title: 'טיול לדוגמה',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    location: 'ירושלים',
                    type: 'dayTrip',
                    status: 'pending',
                    basicDetails: {
                        tripName: 'טיול לדוגמה',
                        description: 'זהו טיול לדוגמה',
                        participantsCount: 20
                    }
                });
                normalizedTrips.push(exampleTrip);
            }

            setTrips(normalizedTrips);
            localStorage.setItem('trips', JSON.stringify(normalizedTrips));
        } catch (error) {
            console.error('Error loading trips:', error);
            setTrips([]);
        }
    }, []);

    // סינון וחיפוש טיולים
    const filteredTrips = trips
        .filter(trip => {
            // סינון לפי חיפוש
            const searchMatch = 
                trip.basicDetails?.tripName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                trip.basicDetails?.description?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // סינון לפי סטטוס
            const statusMatch = filterStatus === 'all' || trip.status === filterStatus;
            
            // סינון לפי תאריך
            const dateMatch = !dateRange.start || !dateRange.end || (
                new Date(trip.basicDetails?.startDate || trip.startDate) >= new Date(dateRange.start) &&
                new Date(trip.basicDetails?.endDate || trip.endDate) <= new Date(dateRange.end)
            );
            
            return searchMatch && statusMatch && dateMatch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.basicDetails?.startDate || b.startDate) - new Date(a.basicDetails?.startDate || a.startDate);
                case 'name':
                    return (a.basicDetails?.tripName || a.title).localeCompare(b.basicDetails?.tripName || b.title);
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });

    // המרת הטיולים לאירועי לוח שנה
    const calendarEvents = trips.map(trip => ({
        title: trip.basicDetails?.tripName || trip.title,
        start: new Date(trip.basicDetails?.startDate || trip.startDate),
        end: new Date(trip.basicDetails?.endDate || trip.endDate),
        resource: trip
    }));

    // ייצוא נתונים
    const exportData = (format) => {
        const data = trips.map(trip => ({
            שם_הטיול: trip.basicDetails?.tripName || trip.title,
            תאריך_התחלה: new Date(trip.basicDetails?.startDate || trip.startDate).toLocaleDateString(),
            תאריך_סיום: new Date(trip.basicDetails?.endDate || trip.endDate).toLocaleDateString(),
            סטטוס: getStatusText(trip.status),
            משתתפים: trip.basicDetails?.participants?.length || trip.participants?.length || 0,
            תיאור: trip.basicDetails?.description
        }));

        switch (format) {
            case 'csv':
                const csv = [
                    Object.keys(data[0]).join(','),
                    ...data.map(item => Object.values(item).join(','))
                ].join('\\n');
                downloadFile(csv, 'trips.csv', 'text/csv');
                break;
            case 'json':
                downloadFile(JSON.stringify(data, null, 2), 'trips.json', 'application/json');
                break;
        }
    };

    const downloadFile = (content, fileName, contentType) => {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleParticipantsClick = (trip) => {
        setSelectedTrip(trip);
        setParticipantsOpen(true);
    };

    const handleCreateTrip = () => {
        const newTripData = normalizeTrip({
            id: Date.now(),
            title: 'טיול חדש',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            location: '',
            type: 'dayTrip',
            status: 'pending',
            participants: [],
            tasks: [
                { id: 1, title: 'תכנון מסלול', status: 'pending', priority: 'high' },
                { id: 2, title: 'אישורי הורים', status: 'pending', priority: 'high' },
                { id: 3, title: 'הזמנת הסעות', status: 'pending', priority: 'medium' },
                { id: 4, title: 'תיאום אתרים', status: 'pending', priority: 'medium' }
            ],
            basicDetails: {
                tripName: 'טיול חדש',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                location: '',
                description: '',
                participantsCount: 0
            }
        });

        const updatedTrips = [...trips, newTripData];
        setTrips(updatedTrips);
        localStorage.setItem('trips', JSON.stringify(updatedTrips));
    };

    // חישוב עדיפות משימה
    const getTaskPriority = (task, tripStartDate) => {
        if (!task || !tripStartDate) return 'low';

        const today = new Date();
        const startDate = new Date(tripStartDate);
        const daysUntilTrip = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));

        if (task.priority === 'high' && daysUntilTrip <= 7) return 'urgent';
        if (task.priority === 'high') return 'high';
        if (daysUntilTrip <= 3) return 'high';
        if (daysUntilTrip <= 7) return 'medium';
        return 'low';
    };

    // קבלת הודעת תזכורת
    const getReminderMessage = (trip) => {
        if (!trip || !trip.tasks || !trip.startDate) return null;

        const urgentTasks = trip.tasks
            .filter(task => getTaskPriority(task, trip.startDate) === 'urgent')
            .map(task => task.title);

        if (urgentTasks.length === 0) return null;
        if (urgentTasks.length === 1) return `משימה דחופה: ${urgentTasks[0]}`;
        return `${urgentTasks.length} משימות דחופות ממתינות לטיפול`;
    };

    const TripCard = ({ trip }) => {
        const reminderMessage = useMemo(() => getReminderMessage(trip), [trip]);
        const taskPriorities = useMemo(() => {
            if (!trip || !trip.tasks) return {};
            return trip.tasks.reduce((acc, task) => {
                acc[task.id] = getTaskPriority(task, trip.startDate);
                return acc;
            }, {});
        }, [trip]);

        if (!trip) return null;

        return (
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        {trip.title || 'טיול חדש'}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            {trip.startDate ? new Date(trip.startDate).toLocaleDateString('he-IL') : 'טרם נקבע'} - {trip.endDate ? new Date(trip.endDate).toLocaleDateString('he-IL') : 'טרם נקבע'}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            {trip.participants?.length || 0} משתתפים
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            <MapIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            {trip.location || 'טרם נקבע מיקום'}
                        </Typography>
                    </Box>

                    {reminderMessage && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            {reminderMessage}
                        </Alert>
                    )}
                </CardContent>

                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate(`/trip/${trip.id || trip.basicDetails?.id}`)}
                    >
                        פרטים נוספים
                    </Button>
                </Box>
            </Card>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                {/* כותרת ראשית וכפתורים */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 4
                }}>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        sx={{ 
                            fontWeight: 'bold',
                            color: 'text.primary'
                        }}
                    >
                        הטיולים שלי
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<ExportIcon />}
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                        >
                            ייצא
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateTrip}
                        >
                            טיול חדש
                        </Button>
                    </Stack>
                </Box>

                {/* סרגל כלים */}
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 2, 
                        mb: 3, 
                        backgroundColor: 'grey.50',
                        borderRadius: 2
                    }}
                >
                    <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={2} 
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                    >
                        <TextField
                            size="small"
                            placeholder="חיפוש טיול..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flexGrow: 1 }}
                        />
                        
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="all">כל הסטטוסים</MenuItem>
                                <MenuItem value="pending">ממתין לאישור</MenuItem>
                                <MenuItem value="approved">מאושר</MenuItem>
                                <MenuItem value="draft">טיוטה</MenuItem>
                                <MenuItem value="cancelled">בוטל</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="date">לפי תאריך</MenuItem>
                                <MenuItem value="name">לפי שם</MenuItem>
                                <MenuItem value="status">לפי סטטוס</MenuItem>
                            </Select>
                        </FormControl>

                        <ButtonGroup>
                            <Tooltip title="תצוגת רשת">
                                <IconButton 
                                    color={viewMode === 'grid' ? 'primary' : 'default'}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <GridViewIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="תצוגת רשימה">
                                <IconButton 
                                    color={viewMode === 'list' ? 'primary' : 'default'}
                                    onClick={() => setViewMode('list')}
                                >
                                    <ListViewIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="תצוגת לוח שנה">
                                <IconButton 
                                    color={viewMode === 'calendar' ? 'primary' : 'default'}
                                    onClick={() => setViewMode('calendar')}
                                >
                                    <CalendarIcon />
                                </IconButton>
                            </Tooltip>
                        </ButtonGroup>
                    </Stack>
                </Paper>

                {/* תצוגת הטיולים */}
                <AnimatePresence mode="wait">
                    {viewMode === 'calendar' ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key="calendar"
                        >
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    height: 600, 
                                    p: 2,
                                    backgroundColor: 'white',
                                    borderRadius: 2
                                }}
                            >
                                <Calendar
                                    localizer={localizer}
                                    events={calendarEvents}
                                    startAccessor="start"
                                    endAccessor="end"
                                    style={{ height: '100%' }}
                                    messages={{
                                        next: "הבא",
                                        previous: "הקודם",
                                        today: "היום",
                                        month: "חודש",
                                        week: "שבוע",
                                        day: "יום"
                                    }}
                                    onSelectEvent={(event) => setSelectedTrip(event.resource)}
                                />
                            </Paper>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key={viewMode}
                        >
                            <Grid container spacing={3}>
                                {filteredTrips.map((trip, index) => (
                                    <Grid 
                                        item 
                                        xs={12} 
                                        sm={viewMode === 'grid' ? 6 : 12} 
                                        md={viewMode === 'grid' ? 4 : 12} 
                                        key={index}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <TripCard trip={trip} />
                                        </motion.div>
                                    </Grid>
                                ))}
                            </Grid>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* תפריט ייצוא */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                >
                    <MenuItem onClick={() => { exportData('csv'); setAnchorEl(null); }}>
                        <ListItemIcon>
                            <GetApp fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>ייצוא ל-CSV</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => { exportData('json'); setAnchorEl(null); }}>
                        <ListItemIcon>
                            <GetApp fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>ייצוא ל-JSON</ListItemText>
                    </MenuItem>
                </Menu>

                <Dialog 
                    open={isParticipantsOpen} 
                    onClose={() => setParticipantsOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        משתתפי הטיול: {selectedTrip?.basicDetails?.tripName || selectedTrip?.title}
                    </DialogTitle>
                    <DialogContent>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>שם</TableCell>
                                        <TableCell>כיתה</TableCell>
                                        <TableCell>אישור הורים</TableCell>
                                        <TableCell>תשלום</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedTrip?.participants?.map((participant, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{participant.name}</TableCell>
                                            <TableCell>{participant.grade}</TableCell>
                                            <TableCell>
                                                {participant.parentalApproval ? 'אושר' : 'ממתין'}
                                            </TableCell>
                                            <TableCell>
                                                {participant.paymentStatus ? 'שולם' : 'לא שולם'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                </Dialog>

                <Dialog 
                    open={false} 
                    onClose={() => setOpenNewTripDialog(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        יצירת טיול חדש
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ p: 2 }}>
                            <TextField
                                label="שם הטיול"
                                value={''}
                                onChange={(e) => setNewTrip({ ...newTrip, title: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="תאריך התחלה"
                                type="date"
                                value={''}
                                onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="תאריך סיום"
                                type="date"
                                value={''}
                                onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="מיקום"
                                value={''}
                                onChange={(e) => setNewTrip({ ...newTrip, location: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleCreateTrip}
                            >
                                יצירת טיול
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Box>
        </Container>
    );
};

export default MyTrips;
