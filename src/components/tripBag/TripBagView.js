import React from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Button,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const TripBagView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tripBagItems = location.state?.items || [];

  const renderParticipantsList = (item) => {
    return (
      <TableContainer component={Paper} sx={{ marginTop: 2, marginBottom: 2 }}>
        <Table sx={{ 
          border: '1px solid rgba(224, 224, 224, 1)',
          '& th': {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
            borderBottom: '2px solid rgba(224, 224, 224, 1)',
            borderRight: '1px solid rgba(224, 224, 224, 1)',
            textAlign: 'center'
          },
          '& td': {
            borderRight: '1px solid rgba(224, 224, 224, 1)',
            textAlign: 'center'
          }
        }}>
          <TableHead>
            <TableRow>
              <TableCell>מס'</TableCell>
              <TableCell>שם פרטי</TableCell>
              <TableCell>שם משפחה</TableCell>
              <TableCell>מקום מגורים</TableCell>
              <TableCell>שם הורה</TableCell>
              <TableCell>טלפון הורה</TableCell>
              <TableCell>דוא"ל הורה</TableCell>
              <TableCell>בעיות בריאות/אלרגיה</TableCell>
              <TableCell>שכבה</TableCell>
              <TableCell>הערות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {item.data.map((participant, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{participant.name}</TableCell>
                <TableCell>{participant.lastName}</TableCell>
                <TableCell>{participant.residence}</TableCell>
                <TableCell>{participant.parentName}</TableCell>
                <TableCell>{participant.parentPhone}</TableCell>
                <TableCell>{participant.parentEmail}</TableCell>
                <TableCell>{participant.healthIssues}</TableCell>
                <TableCell>{participant.grade}</TableCell>
                <TableCell>{participant.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderItem = (item) => {
    switch (item.type) {
      case 'participantsList':
        return renderParticipantsList(item);
      // Add more cases here for other types of items
      default:
        return <Typography>פריט לא מוכר</Typography>;
    }
  };

  return (
    <Box sx={{ padding: 3, direction: 'rtl' }}>
      <Button
        variant="outlined"
        startIcon={<ArrowForwardIcon />}
        onClick={() => navigate('/my-trips')}
        sx={{ marginBottom: 2 }}
      >
        חזרה לטיולים שלי
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        תיק הטיול
      </Typography>

      {tripBagItems.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ marginTop: 4 }}>
          אין פריטים בתיק הטיול
        </Typography>
      ) : (
        <List>
          {tripBagItems.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <Paper sx={{ width: '100%', p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {item.name}
                  </Typography>
                  {renderItem(item)}
                </Paper>
              </ListItem>
              {index < tripBagItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default TripBagView;
