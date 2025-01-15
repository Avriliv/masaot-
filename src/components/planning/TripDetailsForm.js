import React, { memo } from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { gradeOptions, organizationTypeOptions } from './constants';

const TripDetailsForm = memo(({ formData, onInputChange }) => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>מכיתה</InputLabel>
                    <Select
                        value={formData.gradeFrom || ''}
                        onChange={(e) => onInputChange('gradeFrom')(e.target.value)}
                        label="מכיתה"
                    >
                        {gradeOptions.map((grade) => (
                            <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>עד כיתה</InputLabel>
                    <Select
                        value={formData.gradeTo || ''}
                        onChange={(e) => onInputChange('gradeTo')(e.target.value)}
                        label="עד כיתה"
                    >
                        {gradeOptions.map((grade) => (
                            <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                    <InputLabel>סוג ארגון</InputLabel>
                    <Select
                        value={formData.organizationType || ''}
                        onChange={(e) => onInputChange('organizationType')(e.target.value)}
                        label="סוג ארגון"
                    >
                        {organizationTypeOptions.map((type) => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="שם הארגון"
                    name="organization"
                    value={formData.organization || ''}
                    onChange={(e) => onInputChange('organization')(e.target.value)}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="מספר תלמידים"
                    type="number"
                    name="numStudents"
                    value={formData.numStudents || ''}
                    onChange={(e) => onInputChange('numStudents')(e.target.value)}
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="מספר אנשי צוות"
                    type="number"
                    name="numStaff"
                    value={formData.numStaff || ''}
                    onChange={(e) => onInputChange('numStaff')(e.target.value)}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="תיאור הטיול"
                    name="description"
                    multiline
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => onInputChange('description')(e.target.value)}
                />
            </Grid>
        </Grid>
    );
});

TripDetailsForm.displayName = 'TripDetailsForm';

export default TripDetailsForm;
