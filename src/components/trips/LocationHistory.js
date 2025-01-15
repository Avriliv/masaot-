import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Map as MapIcon } from '@mui/icons-material';

const LocationHistory = ({ locations }) => {
  const openInMaps = (latitude, longitude) => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        היסטוריית מיקומים
      </Typography>
      
      <List>
        {locations.map((location, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText
                primary={new Date(location.timestamp).toLocaleTimeString()}
                secondary={
                  <React.Fragment>
                    <Typography variant="body2" component="span" display="block">
                      נ.צ.: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Typography>
                    <Typography variant="body2" component="span" display="block">
                      דיוק: {Math.round(location.accuracy)} מטרים
                    </Typography>
                    {location.altitude && (
                      <Typography variant="body2" component="span" display="block">
                        גובה: {Math.round(location.altitude)} מטרים
                      </Typography>
                    )}
                  </React.Fragment>
                }
              />
              <Tooltip title="פתח במפה">
                <IconButton
                  edge="end"
                  onClick={() => openInMaps(location.latitude, location.longitude)}
                >
                  <MapIcon />
                </IconButton>
              </Tooltip>
            </ListItem>
            {index < locations.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        
        {locations.length === 0 && (
          <ListItem>
            <ListItemText
              primary="אין היסטוריית מיקומים"
              secondary="המיקומים יתעדכנו אוטומטית בכל שעה עגולה כשהטיול פעיל"
            />
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default LocationHistory;
