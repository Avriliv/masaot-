import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Checkbox,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Tooltip,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Share as ShareIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Backpack as BackpackIcon,
    LocalHotel as HotelIcon,
    DirectionsBus as BusIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';

// רשימות ציוד מוגדרות מראש לפי סוג טיול
const dayTripItems = [
    // ציוד אישי בסיסי
    { id: 1, name: 'כובע', category: 'ביגוד', quantity: 1, critical: true },
    { id: 2, name: 'נעלי הליכה', category: 'ביגוד', quantity: 1, critical: true },
    { id: 3, name: 'בקבוק מים', category: 'מים ומזון', quantity: 2, critical: true },
    { id: 4, name: 'תיק גב', category: 'ציוד', quantity: 1, critical: true },
    // תוספות מהמסמך
    { id: 11, name: 'חולצת טיול', category: 'ביגוד', quantity: 1, critical: true },
    { id: 12, name: 'מכנסיים ארוכים', category: 'ביגוד', quantity: 1, critical: true },
    { id: 13, name: 'גרביים', category: 'ביגוד', quantity: 2, critical: true },
    { id: 14, name: 'נעליים סגורות', category: 'ביגוד', quantity: 1, critical: true },
    { id: 15, name: 'כלי רחצה', category: 'היגיינה', quantity: 1, critical: true },
    { id: 16, name: 'מגבת', category: 'היגיינה', quantity: 1, critical: true },
    { id: 17, name: 'קרם הגנה', category: 'היגיינה', quantity: 1, critical: true },
    { id: 18, name: 'כובע מצחייה', category: 'ביגוד', quantity: 1, critical: true },
];

const nightTripItems = [
    // ציוד ללינת לילה
    { id: 5, name: 'שק שינה', category: 'לינה', quantity: 1, critical: true },
    { id: 6, name: 'פנס', category: 'ציוד', quantity: 1, critical: true },
    { id: 7, name: 'בגדים חמים', category: 'ביגוד', quantity: 1, critical: true },
    // תוספות מהמסמך
    { id: 19, name: 'מזרן שטח', category: 'לינה', quantity: 1, critical: true },
    { id: 20, name: 'פיג\'מה', category: 'ביגוד', quantity: 1, critical: false },
    { id: 21, name: 'סווטשירט', category: 'ביגוד', quantity: 1, critical: true },
    { id: 22, name: 'כלי אוכל (צלחת + סכו"ם)', category: 'ציוד', quantity: 1, critical: true },
];

const campItems = [
    // ציוד למחנה
    { id: 8, name: 'אוהל', category: 'לינה', quantity: 1, critical: true },
    { id: 9, name: 'מזרן שטח', category: 'לינה', quantity: 1, critical: true },
    { id: 10, name: 'ציוד בישול', category: 'מטבח', quantity: 1, critical: true },
    // תוספות מהמסמך
    { id: 23, name: 'בגדים להחלפה', category: 'ביגוד', quantity: 4, critical: true },
    { id: 24, name: 'חולצות טיול', category: 'ביגוד', quantity: 4, critical: true },
    { id: 25, name: 'מכנסיים קצרים/ארוכים', category: 'ביגוד', quantity: 4, critical: true },
    { id: 26, name: 'בגד ים', category: 'ביגוד', quantity: 1, critical: false },
    { id: 27, name: 'כפכפים/סנדלים', category: 'ביגוד', quantity: 1, critical: false },
    { id: 28, name: 'תרופות אישיות', category: 'רפואי', quantity: 1, critical: true },
];

// ציוד קבוצתי
const groupEquipmentItems = [
    { id: 101, name: 'ג\'ריקן מים (5 ליטר)', category: 'מים', quantity: 10, critical: true },
    { id: 102, name: 'סקל קפה', category: 'מטבח', quantity: 1, critical: false },
    { id: 103, name: 'ערכת עזרה ראשונה', category: 'רפואי', quantity: 1, critical: true },
    { id: 104, name: 'קרח רענון', category: 'מטבח', quantity: 5, critical: false },
    { id: 105, name: 'שתיה קלה', category: 'מטבח', quantity: 4, critical: false },
    { id: 106, name: 'מיחם/תרמוס/קומקום חשמלי', category: 'מטבח', quantity: 1, critical: false },
    { id: 107, name: 'מסננת', category: 'מטבח', quantity: 1, critical: false },
    { id: 108, name: 'קערה עבור סלט/תה', category: 'מטבח', quantity: 1, critical: false },
    { id: 109, name: 'כוסות חד"פ', category: 'מטבח', quantity: 1, critical: false },
];

// ציוד צוות
const staffEquipmentItems = [
    { id: 201, name: 'תיק מדריך/צוות הנהלה', category: 'ציוד', quantity: 1, critical: true },
    { id: 202, name: 'ערכת חובש', category: 'רפואי', quantity: 1, critical: true },
    { id: 203, name: 'טלפון + מטען + סוללה נוספת', category: 'תקשורת', quantity: 2, critical: true },
    { id: 204, name: 'רשימות', category: 'ניהול', quantity: 1, critical: true },
    { id: 205, name: 'כרטיסי חניך', category: 'ניהול', quantity: 1, critical: true },
    { id: 206, name: 'משרוקית למשטרה', category: 'בטיחות', quantity: 1, critical: true },
    { id: 207, name: 'פנקס/עט כחול חדש', category: 'ציוד', quantity: 1, critical: false },
];

const defaultEquipmentLists = {
    dayTrip: [...dayTripItems],
    nightTrip: [...dayTripItems, ...nightTripItems],
    camp: [...dayTripItems, ...nightTripItems, ...campItems],
    group: [...groupEquipmentItems],
    staff: [...staffEquipmentItems],
};

const TripChecklist = ({ trip, onUpdate }) => {
    const [equipment, setEquipment] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', category: '', quantity: 1, critical: false });
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedList, setSelectedList] = useState('personal'); // personal/group/staff

    useEffect(() => {
        // טעינת רשימת הציוד מהטיול או יצירת רשימה חדשה לפי סוג הטיול
        if (trip.equipment) {
            setEquipment(trip.equipment);
        } else {
            const defaultList = defaultEquipmentLists[trip.type] || defaultEquipmentLists.dayTrip;
            setEquipment(defaultList.map(item => ({ ...item, checked: false })));
        }
    }, [trip]);

    const handleToggleItem = (itemId) => {
        const updatedEquipment = equipment.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
        );
        setEquipment(updatedEquipment);
        onUpdate({ ...trip, equipment: updatedEquipment });
    };

    const handleAddItem = () => {
        const newItemWithId = {
            ...newItem,
            id: Math.max(...equipment.map(item => item.id), 0) + 1,
            checked: false
        };
        const updatedEquipment = [...equipment, newItemWithId];
        setEquipment(updatedEquipment);
        onUpdate({ ...trip, equipment: updatedEquipment });
        setOpenAddDialog(false);
        setNewItem({ name: '', category: '', quantity: 1, critical: false });
    };

    const handleDeleteItem = (itemId) => {
        const updatedEquipment = equipment.filter(item => item.id !== itemId);
        setEquipment(updatedEquipment);
        onUpdate({ ...trip, equipment: updatedEquipment });
    };

    const handleShareList = () => {
        // TODO: implement sharing functionality
        console.log('Sharing list...');
    };

    const handleListChange = (event) => {
        setSelectedList(event.target.value);
        let newEquipment = [];
        switch(event.target.value) {
            case 'personal':
                newEquipment = defaultEquipmentLists[trip.type] || defaultEquipmentLists.dayTrip;
                break;
            case 'group':
                newEquipment = defaultEquipmentLists.group;
                break;
            case 'staff':
                newEquipment = defaultEquipmentLists.staff;
                break;
        }
        setEquipment(newEquipment.map(item => ({ ...item, checked: false })));
        onUpdate({ ...trip, equipment: newEquipment });
    };

    const categories = ['all', ...new Set(equipment.map(item => item.category))];
    const filteredEquipment = selectedCategory === 'all' 
        ? equipment 
        : equipment.filter(item => item.category === selectedCategory);

    const missingCriticalItems = equipment.filter(item => item.critical && !item.checked);

    return (
        <Box>
            {/* כותרת וכפתורים */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                    רשימת ציוד
                    {trip.type === 'dayTrip' && <BackpackIcon sx={{ ml: 1 }} />}
                    {trip.type === 'nightTrip' && <HotelIcon sx={{ ml: 1 }} />}
                    {trip.type === 'camp' && <BusIcon sx={{ ml: 1 }} />}
                </Typography>
                <Box>
                    <FormControl sx={{ minWidth: 120, mr: 2 }}>
                        <InputLabel>סוג רשימה</InputLabel>
                        <Select
                            value={selectedList}
                            onChange={handleListChange}
                            label="סוג רשימה"
                        >
                            <MenuItem value="personal">ציוד אישי</MenuItem>
                            <MenuItem value="group">ציוד קבוצתי</MenuItem>
                            <MenuItem value="staff">ציוד צוות</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        startIcon={<ShareIcon />}
                        onClick={handleShareList}
                        sx={{ mr: 1 }}
                    >
                        שתף רשימה
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenAddDialog(true)}
                    >
                        הוסף פריט
                    </Button>
                </Box>
            </Box>

            {/* התראות על פריטים חסרים */}
            {missingCriticalItems.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography>
                        שים לב! חסרים {missingCriticalItems.length} פריטים חיוניים:
                    </Typography>
                    {missingCriticalItems.map(item => (
                        <Chip
                            key={item.id}
                            label={item.name}
                            size="small"
                            color="warning"
                            sx={{ mr: 1, mt: 1 }}
                        />
                    ))}
                </Alert>
            )}

            {/* סינון לפי קטגוריות */}
            <FormControl sx={{ mb: 2, minWidth: 120 }}>
                <InputLabel>קטגוריה</InputLabel>
                <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="קטגוריה"
                >
                    {categories.map(category => (
                        <MenuItem key={category} value={category}>
                            {category === 'all' ? 'הכל' : category}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* רשימת הציוד */}
            <List>
                {filteredEquipment.map(item => (
                    <ListItem
                        key={item.id}
                        sx={{
                            bgcolor: item.checked ? 'action.hover' : 'background.paper',
                            borderRadius: 1,
                            mb: 1,
                        }}
                    >
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={item.checked}
                                onChange={() => handleToggleItem(item.id)}
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Box display="flex" alignItems="center">
                                    {item.name}
                                    {item.critical && (
                                        <Tooltip title="פריט חיוני">
                                            <WarningIcon color="warning" sx={{ ml: 1, fontSize: 20 }} />
                                        </Tooltip>
                                    )}
                                </Box>
                            }
                            secondary={`${item.category} | כמות: ${item.quantity}`}
                        />
                        <ListItemSecondaryAction>
                            <IconButton
                                edge="end"
                                onClick={() => handleDeleteItem(item.id)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            {/* דיאלוג הוספת פריט */}
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
                <DialogTitle>הוסף פריט חדש</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="שם הפריט"
                        fullWidth
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="קטגוריה"
                        fullWidth
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="כמות"
                        type="number"
                        fullWidth
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>חיוני?</InputLabel>
                        <Select
                            value={newItem.critical}
                            onChange={(e) => setNewItem({ ...newItem, critical: e.target.value })}
                            label="חיוני?"
                        >
                            <MenuItem value={false}>לא</MenuItem>
                            <MenuItem value={true}>כן</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)}>ביטול</Button>
                    <Button 
                        onClick={handleAddItem}
                        variant="contained"
                        disabled={!newItem.name || !newItem.category}
                    >
                        הוסף
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TripChecklist;
