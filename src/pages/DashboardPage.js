import React from 'react';
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
  LinearProgress
} from '@mui/material';
import {
  DirectionsWalk as TripIcon,
  Group as GroupIcon,
  Assignment as TaskIcon,
  Notifications as AlertIcon,
  CheckCircle as ApprovalIcon,
  Warning as WarningIcon,
  TrendingUp as StatsIcon
} from '@mui/icons-material';

const DashboardPage = () => {
  const activeTrips = [
    {
      id: 1,
      name: 'טיול לגליל',
      participants: 45,
      status: 'בתהליך',
      progress: 70,
      alerts: 0
    },
    {
      id: 2,
      name: 'מסע ירושלים',
      participants: 30,
      status: 'מתוכנן',
      progress: 40,
      alerts: 2
    }
  ];

  const approvalTasks = [
    {
      id: 1,
      type: 'אישור הורים',
      completed: 40,
      total: 45,
      deadline: '2024-02-20'
    },
    {
      id: 2,
      type: 'אישור בטחוני',
      completed: 1,
      total: 1,
      deadline: '2024-02-15'
    },
    {
      id: 3,
      type: 'אישור רפואי',
      completed: 35,
      total: 45,
      deadline: '2024-02-18'
    }
  ];

  const stats = {
    totalTrips: 15,
    activeTrips: 2,
    totalParticipants: 75,
    completedTrips: 13
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h5" component="h1" gutterBottom>
          דשבורד
        </Typography>

        {/* סטטיסטיקות */}
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TripIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">טיולים</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.totalTrips}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.activeTrips} פעילים
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GroupIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">משתתפים</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.totalParticipants}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ב-{stats.activeTrips} טיולים פעילים
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ApprovalIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">טיולים שהושלמו</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                  {stats.completedTrips}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  מתוך {stats.totalTrips}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AlertIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">התראות פעילות</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                  2
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  דורשות טיפול
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
          {/* טיולים פעילים */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: { xs: 1, sm: 2 } }}>
              <Typography variant="h6" gutterBottom>
                טיולים פעילים
              </Typography>
              {activeTrips.map((trip, index) => (
                <React.Fragment key={trip.id}>
                  <Box sx={{ p: { xs: 1, sm: 2 } }}>
                    <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1">
                          {trip.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {trip.participants} משתתפים
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" gutterBottom>
                          התקדמות
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={trip.progress}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {trip.alerts > 0 && (
                            <IconButton color="warning">
                              <WarningIcon />
                            </IconButton>
                          )}
                          <Button variant="outlined" size="small">
                            צפה בפרטים
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  {index < activeTrips.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Paper>
          </Grid>

          {/* משימות לאישור */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: { xs: 1, sm: 2 } }}>
              <Typography variant="h6" gutterBottom>
                משימות לאישור
              </Typography>
              <List>
                {approvalTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem>
                      <ListItemIcon>
                        <TaskIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={task.type}
                        secondary={`${task.completed}/${task.total} הושלמו`}
                      />
                      <Box sx={{ minWidth: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(task.completed / task.total) * 100}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </ListItem>
                    {index < approvalTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage;
