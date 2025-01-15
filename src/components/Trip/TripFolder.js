import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import TripDetails from './TripDetails';
import TripParticipants from './TripParticipants';
import TripDocuments from './TripDocuments';
import TripSafety from './TripSafety';
import TripLogistics from './TripLogistics';

const TripFolder = ({ tripId }) => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Paper 
        elevation={3}
        sx={{
          minHeight: 'calc(100vh - 140px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontSize: { xs: '0.8rem', sm: '1rem' },
              minWidth: { xs: 'auto', sm: 160 }
            }
          }}
        >
          <Tab label="פרטי טיול" />
          <Tab label="משתתפים" />
          <Tab label="מסמכים" />
          <Tab label="בטיחות" />
          <Tab label="לוגיסטיקה" />
        </Tabs>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <TabPanel value={value} index={0}>
            <TripDetails tripId={tripId} />
          </TabPanel>

          <TabPanel value={value} index={1}>
            <TripParticipants tripId={tripId} />
          </TabPanel>

          <TabPanel value={value} index={2}>
            <TripDocuments tripId={tripId} />
          </TabPanel>

          <TabPanel value={value} index={3}>
            <TripSafety tripId={tripId} />
          </TabPanel>

          <TabPanel value={value} index={4}>
            <TripLogistics tripId={tripId} />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default TripFolder;
