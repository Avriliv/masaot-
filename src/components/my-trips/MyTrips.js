import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    Chip,
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
    Group as GroupIcon,
    Description as DocumentIcon,
    LocalShipping as LogisticsIcon,
    AccountBalance as BudgetIcon,
} from '@mui/icons-material';
import { useTrip } from '../../context/TripContext';
import { useNavigate } from 'react-router-dom';

const MyTrips = () => {
    const { tripState } = useTrip();
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const renderBasicInfo = () => (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    פרטי הטיול
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemText
                            primary="שם הטיול"
                            secondary={tripState.basicDetails.tripName || 'לא הוגדר'}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="תאריכים"
                            secondary={`${tripState.basicDetails.startDate ? new Date(tripState.basicDetails.startDate).toLocaleDateString('he-IL') : 'לא הוגדר'} - ${tripState.basicDetails.endDate ? new Date(tripState.basicDetails.endDate).toLocaleDateString('he-IL') : 'לא הוגדר'}`}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="מספר משתתפים"
                            secondary={tripState.basicDetails.participantsCount || 0}
                        />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );

    const renderParticipants = () => (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    משתתפים
                </Typography>
                <List dense>
                    {/* כאן יהיה תצוגת המשתתפים כשנוסיף את הפונקציונליות */}
                    <ListItem>
                        <ListItemText
                            primary="סה״כ משתתפים"
                            secondary={tripState.basicDetails.participantsCount || 0}
                        />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );

    const renderDocuments = () => (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    <DocumentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    מסמכים
                </Typography>
                <List dense>
                    {tripState.approvals.items?.map((item, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={item.name}
                                secondary={item.status}
                            />
                            <Chip
                                label={item.status === 'approved' ? 'מאושר' : 'ממתין'}
                                color={item.status === 'approved' ? 'success' : 'default'}
                                size="small"
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );

    const renderLogistics = () => (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    <LogisticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    לוגיסטיקה
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemText
                            primary="הסעות"
                            secondary={tripState.logistics.transportation || 'לא הוגדר'}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="לינה"
                            secondary={tripState.logistics.accommodation || 'לא הוגדר'}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="מזון"
                            secondary={tripState.logistics.food || 'לא הוגדר'}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="ציוד"
                            secondary={tripState.logistics.equipment || 'לא הוגדר'}
                        />
                    </ListItem>
                </List>
            </CardContent>
        </Card>
    );

    const renderBudget = () => (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    <BudgetIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    תקציב
                </Typography>
                <List dense>
                    <ListItem>
                        <ListItemText
                            primary="תקציב מתוכנן"
                            secondary={`₪${tripState.budget.totalEstimated || 0}`}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="הוצאות בפועל"
                            secondary={`₪${tripState.budget.totalActual || 0}`}
                        />
                    </ListItem>
                </List>
                {tripState.budget.items?.map((item, index) => (
                    <ListItem key={index}>
                        <ListItemText
                            primary={item.description}
                            secondary={`₪${item.amount}`}
                        />
                    </ListItem>
                ))}
            </CardContent>
        </Card>
    );

    const tabContent = [
        { label: 'פרטי הטיול', content: renderBasicInfo() },
        { label: 'משתתפים', content: renderParticipants() },
        { label: 'מסמכים', content: renderDocuments() },
        { label: 'לוגיסטיקה', content: renderLogistics() },
        { label: 'תקציב', content: renderBudget() },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom align="center">
                הטיולים שלי
            </Typography>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    {tabContent.map((tab, index) => (
                        <Tab key={index} label={tab.label} />
                    ))}
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {tabContent[selectedTab].content}
                </Box>
            </Paper>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/planning')}
                >
                    תכנן טיול חדש
                </Button>
            </Box>
        </Box>
    );
};

export default MyTrips;
