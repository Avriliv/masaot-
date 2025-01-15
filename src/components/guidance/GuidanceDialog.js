import React from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    Divider,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
} from '@mui/icons-material';

const GuidanceDialog = ({ trip, onClose }) => {
    const guidelines = [
        {
            title: 'בטיחות',
            items: [
                { text: 'וודא שיש אישורי הורים לכל המשתתפים', type: 'critical' },
                { text: 'בדוק את תנאי מזג האוויר לפני היציאה', type: 'important' },
                { text: 'הכן רשימת טלפונים לשעת חירום', type: 'critical' },
                { text: 'וודא שיש ציוד עזרה ראשונה', type: 'critical' },
            ]
        },
        {
            title: 'לוגיסטיקה',
            items: [
                { text: 'תאם הסעות הלוך וחזור', type: 'important' },
                { text: 'הכן רשימת ציוד מפורטת', type: 'normal' },
                { text: 'בדוק את זמני היציאה והחזרה', type: 'important' },
                { text: 'וודא שיש מספיק מים ומזון', type: 'critical' },
            ]
        },
        {
            title: 'תיאומים',
            items: [
                { text: 'קבל אישור ביטחוני מהרשויות', type: 'critical' },
                { text: 'תאם עם אתרי הביקור', type: 'important' },
                { text: 'עדכן את צוות בית הספר', type: 'normal' },
                { text: 'הכן תכנית גיבוי למקרה של שינוי', type: 'important' },
            ]
        }
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'critical':
                return <WarningIcon color="error" />;
            case 'important':
                return <InfoIcon color="warning" />;
            default:
                return <CheckCircleIcon color="success" />;
        }
    };

    return (
        <>
            <DialogTitle>מדריך מהיר לארגון הטיול</DialogTitle>
            <DialogContent>
                <Typography variant="subtitle1" gutterBottom>
                    להלן רשימת הנחיות חשובות לארגון הטיול. וודא שכל הסעיפים מטופלים לפני היציאה.
                </Typography>

                {guidelines.map((section, index) => (
                    <Box key={section.title} sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
                            {section.title}
                        </Typography>
                        <List>
                            {section.items.map((item, itemIndex) => (
                                <ListItem key={itemIndex}>
                                    <ListItemIcon>
                                        {getIcon(item.type)}
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={item.text}
                                        primaryTypographyProps={{
                                            color: item.type === 'critical' ? 'error.main' : 
                                                   item.type === 'important' ? 'warning.main' : 
                                                   'text.primary'
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        {index < guidelines.length - 1 && <Divider />}
                    </Box>
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>סגור</Button>
            </DialogActions>
        </>
    );
};

export default GuidanceDialog;
