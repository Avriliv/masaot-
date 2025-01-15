// תבניות טיולים מוכנות
export const tripTemplates = [
    {
        id: 1,
        name: 'טיול שנתי',
        description: 'תבנית לטיול שנתי של יומיים עם לינה בשטח',
        template: {
            description: 'טיול שנתי הכולל פעילויות חינוכיות, גיבוש והכרות עם הארץ',
            numStudents: 60,
            numStaff: 6,
            ageGroup: 'high',
            organizationType: 'school',
            suggestedActivities: [
                'הליכה בשביל ישראל',
                'פעילות ODT',
                'ערב גיבוש',
                'סיור היסטורי'
            ],
            logistics: {
                equipment: [
                    'ציוד לינה',
                    'ציוד בישול',
                    'ערכת עזרה ראשונה',
                    'מים (3 ליטר לאדם ליום)'
                ],
                food: [
                    'ארוחת בוקר: לחם, ממרחים, ירקות',
                    'ארוחת צהריים: פיתות ושקשוקה',
                    'ארוחת ערב: על האש'
                ]
            },
            schedule: [
                {
                    day: 1,
                    activities: [
                        { time: '07:00', description: 'יציאה מבית הספר' },
                        { time: '09:00', description: 'התחלת מסלול הליכה' },
                        { time: '12:00', description: 'ארוחת צהריים' },
                        { time: '16:00', description: 'הגעה לחניון לילה' },
                        { time: '19:00', description: 'ערב גיבוש' }
                    ]
                },
                {
                    day: 2,
                    activities: [
                        { time: '06:00', description: 'השכמה' },
                        { time: '07:00', description: 'ארוחת בוקר' },
                        { time: '08:30', description: 'פעילות ODT' },
                        { time: '12:00', description: 'ארוחת צהריים' },
                        { time: '13:00', description: 'סיור היסטורי' },
                        { time: '16:00', description: 'חזרה הביתה' }
                    ]
                }
            ]
        }
    },
    {
        id: 2,
        name: 'טיול של"ח',
        description: 'תבנית לטיול של"ח חד-יומי עם דגש על היסטוריה וידיעת הארץ',
        template: {
            description: 'טיול של"ח הכולל סיורים באתרים היסטוריים ופעילויות חינוכיות',
            numStudents: 35,
            numStaff: 3,
            ageGroup: 'middle',
            organizationType: 'school',
            suggestedActivities: [
                'סיור באתר ארכיאולוגי',
                'משחק ניווט',
                'הדרכות תלמידים',
                'פעילות חברתית'
            ],
            logistics: {
                equipment: [
                    'כובע',
                    'מים (2 ליטר לאדם)',
                    'ערכת עזרה ראשונה',
                    'ציוד כתיבה'
                ],
                food: [
                    'ארוחת בוקר מהבית',
                    'ארוחת צהריים קלה'
                ]
            },
            schedule: [
                {
                    day: 1,
                    activities: [
                        { time: '08:00', description: 'יציאה מבית הספר' },
                        { time: '09:30', description: 'הגעה לאתר הארכיאולוגי' },
                        { time: '12:00', description: 'ארוחת צהריים' },
                        { time: '13:00', description: 'משחק ניווט' },
                        { time: '15:00', description: 'חזרה לבית הספר' }
                    ]
                }
            ]
        }
    },
    {
        id: 3,
        name: 'טיול תנועת נוער',
        description: 'תבנית לטיול תנועת נוער עם דגש על גיבוש והווי',
        template: {
            description: 'טיול תנועת נוער הכולל פעילויות גיבוש, הווי ומשימות קבוצתיות',
            numStudents: 40,
            numStaff: 5,
            ageGroup: 'middle',
            organizationType: 'youth',
            suggestedActivities: [
                'משימות קבוצתיות',
                'תחרויות שבטים',
                'מורל ושירים',
                'מסלול הליכה'
            ],
            logistics: {
                equipment: [
                    'ציוד לינה',
                    'ציוד לפעילות ערב',
                    'ערכת עזרה ראשונה',
                    'ציוד מוזיקה'
                ],
                food: [
                    'ארוחות משותפות',
                    'נשנושים לפעילות ערב'
                ]
            },
            schedule: [
                {
                    day: 1,
                    activities: [
                        { time: '16:00', description: 'מפקד פתיחה' },
                        { time: '17:00', description: 'משימות קבוצתיות' },
                        { time: '19:00', description: 'ארוחת ערב' },
                        { time: '20:00', description: 'פעילות ערב' }
                    ]
                }
            ]
        }
    }
];

// רשימת מיקומים בישראל
export const israelLocations = [
    // צפון
    { name: 'הר מירון', region: 'צפון', type: 'הר' },
    { name: 'נחל עמוד', region: 'צפון', type: 'נחל' },
    { name: 'הר ארבל', region: 'צפון', type: 'הר' },
    { name: 'עין גדי', region: 'צפון', type: 'מעיין' },
    { name: 'נחל כזיב', region: 'צפון', type: 'נחל' },
    { name: 'הר תבור', region: 'צפון', type: 'הר' },
    
    // מרכז
    { name: 'הרי ירושלים', region: 'מרכז', type: 'הר' },
    { name: 'נחל פרת', region: 'מרכז', type: 'נחל' },
    { name: 'פארק הירקון', region: 'מרכז', type: 'פארק' },
    { name: 'חוף פלמחים', region: 'מרכז', type: 'חוף' },
    { name: 'יער בן שמן', region: 'מרכז', type: 'יער' },
    
    // דרום
    { name: 'מכתש רמון', region: 'דרום', type: 'מכתש' },
    { name: 'הר צין', region: 'דרום', type: 'הר' },
    { name: 'עין עבדת', region: 'דרום', type: 'מעיין' },
    { name: 'חוף אילת', region: 'דרום', type: 'חוף' },
    { name: 'הר הנגב', region: 'דרום', type: 'הר' }
];

// פונקציה לחישוב מספר אנשי צוות מומלץ
export const calculateRecommendedStaff = (numStudents, ageGroup, tripType = 'hiking') => {
    let baseRatio;
    
    // יחס בסיסי לפי גיל
    switch (ageGroup) {
        case 'elementary':
            baseRatio = 8; // 1:8
            break;
        case 'middle':
            baseRatio = 12; // 1:12
            break;
        case 'high':
            baseRatio = 15; // 1:15
            break;
        default:
            baseRatio = 10;
    }
    
    // התאמה לפי סוג הטיול
    switch (tripType) {
        case 'hiking':
            baseRatio *= 0.8; // יותר מדריכים לטיולי שטח
            break;
        case 'urban':
            baseRatio *= 1.2; // פחות מדריכים לטיולים עירוניים
            break;
        case 'water':
            baseRatio *= 0.6; // הרבה יותר מדריכים לפעילויות מים
            break;
    }
    
    // חישוב מספר אנשי הצוות המומלץ
    const recommendedStaff = Math.ceil(numStudents / baseRatio);
    
    // מינימום 2 אנשי צוות תמיד
    return Math.max(2, recommendedStaff);
};
