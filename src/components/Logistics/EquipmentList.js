import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TextField,
    Checkbox,
    Button,
    Typography,
    Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';

const defaultEquipment = [
    // כלי אוכל
    { id: 1, category: 'כלי אוכל', name: 'סכו"ם (סכין, כף, מזלג)', quantity: 1, checked: false },
    { id: 2, category: 'כלי אוכל', name: 'צלחת', quantity: 1, checked: false },
    { id: 3, category: 'כלי אוכל', name: 'כוס רב פעמית', quantity: 1, checked: false },

    // היגיינה
    { id: 4, category: 'היגיינה', name: 'מברשת שיניים ומשחה', quantity: 1, checked: false },
    { id: 5, category: 'היגיינה', name: 'נייר טואלט', quantity: 1, checked: false },
    { id: 6, category: 'היגיינה', name: 'סבון', quantity: 1, checked: false },

    // בגדים
    { id: 7, category: 'בגדים', name: 'חולצה להחלפה', quantity: 1, checked: false },
    { id: 8, category: 'בגדים', name: 'מכנסיים להחלפה', quantity: 1, checked: false },
    { id: 9, category: 'בגדים', name: 'גרביים', quantity: 1, checked: false },
    { id: 10, category: 'בגדים', name: 'כובע', quantity: 1, checked: false },

    // ציוד
    { id: 11, category: 'ציוד', name: 'דיאודורנט', quantity: 1, checked: false },
    { id: 12, category: 'ציוד', name: 'פנס (עדיפות לפנס ראש)', quantity: 1, checked: false },
    { id: 13, category: 'ציוד', name: 'עדיפות למכנס טיולים', quantity: 1, checked: false },

    // מים
    { id: 14, category: 'מים', name: 'ליטר מים ליום (4 נודניות)', quantity: 4, checked: false }
];

const EquipmentList = () => {
    const [equipment, setEquipment] = useState(defaultEquipment);
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});

    const handleEdit = (item) => {
        setEditingId(item.id);
        setEditValues(item);
    };

    const handleSave = (id) => {
        setEquipment(equipment.map(item => 
            item.id === id ? { ...editValues } : item
        ));
        setEditingId(null);
    };

    const handleCheck = (id) => {
        setEquipment(equipment.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    const handleShare = () => {
        // כאן נוסיף בהמשך פונקציונליות לשיתוף הרשימה
        console.log('Sharing equipment list...');
    };

    const handleDelete = (id) => {
        setEquipment(equipment.filter(item => item.id !== id));
    };

    // קיבוץ הפריטים לפי קטגוריות
    const groupedEquipment = equipment.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                    רשימת ציוד אישי
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<ShareIcon />}
                    onClick={handleShare}
                >
                    שתף רשימה
                </Button>
            </Box>
            
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="equipment list">
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">קטגוריה</TableCell>
                            <TableCell align="right">פריט</TableCell>
                            <TableCell align="right">כמות</TableCell>
                            <TableCell align="right">נארז</TableCell>
                            <TableCell align="right">פעולות</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(groupedEquipment).map(([category, items]) => (
                            <React.Fragment key={category}>
                                {items.map((item, index) => (
                                    <TableRow key={item.id}>
                                        {index === 0 && (
                                            <TableCell
                                                align="right"
                                                rowSpan={items.length}
                                                sx={{ backgroundColor: '#f5f5f5' }}
                                            >
                                                {category}
                                            </TableCell>
                                        )}
                                        <TableCell align="right">
                                            {editingId === item.id ? (
                                                <TextField
                                                    value={editValues.name}
                                                    onChange={(e) => setEditValues({
                                                        ...editValues,
                                                        name: e.target.value
                                                    })}
                                                    size="small"
                                                />
                                            ) : item.name}
                                        </TableCell>
                                        <TableCell align="right">
                                            {editingId === item.id ? (
                                                <TextField
                                                    type="number"
                                                    value={editValues.quantity}
                                                    onChange={(e) => setEditValues({
                                                        ...editValues,
                                                        quantity: parseInt(e.target.value)
                                                    })}
                                                    size="small"
                                                    sx={{ width: '70px' }}
                                                />
                                            ) : item.quantity}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Checkbox
                                                checked={item.checked}
                                                onChange={() => handleCheck(item.id)}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {editingId === item.id ? (
                                                <IconButton onClick={() => handleSave(item.id)}>
                                                    <SaveIcon />
                                                </IconButton>
                                            ) : (
                                                <IconButton onClick={() => handleEdit(item)}>
                                                    <EditIcon />
                                                </IconButton>
                                            )}
                                            <IconButton 
                                                onClick={() => handleDelete(item.id)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default EquipmentList;
