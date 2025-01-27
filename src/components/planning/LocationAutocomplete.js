import React, { memo, useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import LocationSearchService from '../../services/LocationSearchService';

const LocationAutocomplete = memo(({ 
    label, 
    value, 
    onChange, 
    error,
    helperText,
    locations,
    loading: externalLoading,
    onInputChange: externalOnInputChange 
}) => {
    const [options, setOptions] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = async (event, newInputValue) => {
        setInputValue(newInputValue);
        
        if (newInputValue.length >= 2) {
            setLoading(true);
            try {
                const results = await LocationSearchService.search(newInputValue);
                setOptions(results);
            } catch (error) {
                console.error('Error searching locations:', error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        } else {
            setOptions([]);
        }

        // אם יש פונקצית onInputChange חיצונית, נקרא לה
        if (externalOnInputChange) {
            externalOnInputChange(event, newInputValue);
        }
    };

    const handleChange = (event, newValue) => {
        onChange(newValue);
    };

    // פונקציה להשוואת ערכים
    const isOptionEqualToValue = (option, value) => {
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
        
        // השוואה לפי שם
        return option.name === value.name;
    };

    return (
        <Autocomplete
            value={value}
            onChange={handleChange}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            options={locations || options}
            loading={externalLoading || loading}
            getOptionLabel={(option) => option?.name || ''}
            isOptionEqualToValue={isOptionEqualToValue}
            renderOption={(props, option) => (
                <li {...props}>
                    <div>
                        <div>{option.name}</div>
                        <div style={{ fontSize: '0.8em', color: 'gray' }}>{option.address}</div>
                    </div>
                </li>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    error={error}
                    helperText={helperText}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {(externalLoading || loading) ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </React.Fragment>
                        ),
                    }}
                />
            )}
        />
    );
});

export default LocationAutocomplete;
