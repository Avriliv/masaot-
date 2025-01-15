import React, { memo } from 'react';
import { Autocomplete, TextField, CircularProgress, Typography } from '@mui/material';

const LocationAutocomplete = memo(({ 
    label, 
    value, 
    onChange, 
    error, 
    helperText, 
    locations, 
    loading, 
    onInputChange 
}) => {
    const handleChange = (event, newValue) => {
        // מעביר את כל האובייקט כמו שהוא
        onChange(newValue);
    };

    return (
        <Autocomplete
            value={value}
            onChange={handleChange}
            onInputChange={onInputChange}
            options={locations || []}
            loading={loading}
            getOptionLabel={(option) => option?.name || ''}
            isOptionEqualToValue={(option, value) => {
                // אם אחד מהערכים ריק
                if (!option || !value) return false;
                
                // השוואה לפי id
                if (option.id && value.id) {
                    return option.id === value.id;
                }
                
                // השוואה לפי קואורדינטות
                if (option.coordinates && value.coordinates) {
                    return option.coordinates[0] === value.coordinates[0] &&
                           option.coordinates[1] === value.coordinates[1];
                }
                
                // השוואה לפי שם ומיקום
                return option.name === value.name && 
                       option.address === value.address;
            }}
            renderOption={(props, option) => (
                <li {...props}>
                    <div>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {option.address}
                        </Typography>
                    </div>
                </li>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    variant="outlined"
                    fullWidth
                    error={error}
                    helperText={helperText}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
            noOptionsText="לא נמצאו תוצאות"
            loadingText="מחפש..."
        />
    );
});

LocationAutocomplete.displayName = 'LocationAutocomplete';

export default LocationAutocomplete;
