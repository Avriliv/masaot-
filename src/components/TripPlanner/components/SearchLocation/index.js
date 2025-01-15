import React, { useState } from 'react';
import {
    Box,
    TextField,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert
} from '@mui/material';

const SearchLocation = ({ onLocationSelect, onSelectLocation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchPlaces = async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=il`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            // Filter results to include only places in Israel
            const israelResults = data.filter(result => 
                result.display_name.includes('Israel') || 
                result.display_name.includes('ישראל')
            );
            
            setSearchResults(israelResults.map(result => ({
                name: result.display_name.split(',')[0],
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
                displayName: result.display_name
            })));
        } catch (err) {
            console.error('Error searching places:', err);
            setError('אירעה שגיאה בחיפוש המיקום. אנא נסה שוב.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (event) => {
        const query = event.target.value;
        setSearchQuery(query);
        
        // Debounce the search
        const timeoutId = setTimeout(() => {
            searchPlaces(query);
        }, 500);

        return () => clearTimeout(timeoutId);
    };

    const handleLocationClick = (location) => {
        onLocationSelect(location);
        onSelectLocation(location);
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <Box>
            <TextField
                fullWidth
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="הקלד שם מיקום..."
                InputProps={{
                    endAdornment: loading && <CircularProgress size={20} />
                }}
            />
            
            {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                </Alert>
            )}

            {searchResults.length > 0 && (
                <List sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'background.paper' }}>
                    {searchResults.map((result, index) => (
                        <ListItem
                            key={index}
                            button
                            onClick={() => handleLocationClick(result)}
                            sx={{
                                '&:hover': {
                                    bgcolor: 'action.hover'
                                }
                            }}
                        >
                            <ListItemText 
                                primary={result.name}
                                secondary={result.displayName}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default SearchLocation;
