export const tripTypes = {
  DAY_HIKE: 'טיול יום',
  OVERNIGHT: 'לינת שטח',
  DESERT: 'מדבר',
  WATER: 'מסלול מים',
  MOUNTAIN: 'הרים',
  CAMPING: 'קמפינג',
  WINTER: 'טיול חורף',
  SUMMER: 'טיול קיץ'
};

export const equipmentCategories = {
  'אוכל וציוד בישול': {
    basic: [
      'ערכת קפה (קפה, סוכר, תה)',
      'גזייה',
      'קומקום',
      'סכין עם כיסוי',
      'קרש חיתוך',
      'סיר/מחבת',
      'כפות ערבוב',
      'סכו"ם (סכינים, מזלגות, כפות)',
      'כוסות',
      'צלחות וקעריות',
      'פותחן שימורים ויין',
      'סבון וסקוץ\' לכלים',
      'צידנית',
      'שקיות אשפה',
    ],
    overnight: [
      'מיכל מים גדול (5 ליטר)',
      'גריל נייד',
      'פחמים ונוזל הצתה',
      'קרש חיתוך',
      'מלח ותבלינים',
      'שמן/שמן זית',
    ],
    camping: [
      'כירת גז',
      'בלון גז',
      'סיר גדול לבישול',
      'מחבת גדולה',
      'קערות ערבוב',
      'מצתים',
    ]
  },
  'ציוד טכני': {
    basic: [
      'פנס ראש + סוללות',
      'מפת שבילים',
      'מצפן/GPS',
      'סוללה ניידת + כבלי טעינה',
      'שקיות אטומות למים',
    ],
    overnight: [
      'אולר רב-תכליתי',
      'חבל',
      'אזיקונים',
      'פנס עוצמתי נוסף',
    ],
    mountain: [
      'מקלות הליכה',
      'GPS',
      'מפת טופוגרפית',
    ]
  },
  'ביגוד והנעלה': {
    basic: [
      'נעלי הליכה',
      'גרביים נוחות',
      'כובע',
      'משקפי שמש',
      'חולצה להחלפה',
    ],
    summer: [
      'בגד ים',
      'סנדלי הליכה',
      'חולצות דריי-פיט',
      'מכנסיים קצרים',
    ],
    winter: [
      'מעיל חם',
      'שכבות חימום',
      'כפפות',
      'צעיף/חם צוואר',
      'כובע צמר',
      'גרביים תרמיות',
    ],
    desert: [
      'בגדים ארוכים וקלים',
      'כיסוי ראש רחב',
      'בגדים בהירים',
    ]
  },
  'לינה': {
    overnight: [
      'אוהל',
      'יתדות ופטיש',
      'שק שינה',
      'מזרן שטח',
      'כרית',
      'תאורת לילה',
    ],
    camping: [
      'אוהל משפחתי',
      'שולחן מתקפל',
      'כיסאות שטח',
      'ערסל',
      'תאורת קמפינג',
    ]
  },
  'עזרה ראשונה ובטיחות': {
    basic: [
      'ערכת עזרה ראשונה בסיסית',
      'קרם הגנה',
      'דוחה יתושים',
      'תרופות אישיות',
      'פלסטרים',
      'משרוקית חירום',
    ],
    desert: [
      'מלח/אלקטרוליטים',
      'קרם הגנה חזק במיוחד',
      'כובע רחב שוליים',
    ],
    water: [
      'ערכת החייאה',
      'חבל הצלה',
      'מצופים',
    ]
  },
  'היגיינה': {
    basic: [
      'נייר טואלט',
      'מגבונים',
      'ג\'ל חיטוי ידיים',
      'שפתון להגנה',
    ],
    overnight: [
      'מברשת ומשחת שיניים',
      'סבון ושמפו',
      'מגבת',
      'דאודורנט',
    ]
  },
  'מזון בסיסי': {
    basic: [
      'חטיפי אנרגיה',
      'אגוזים ופירות יבשים',
      'פירות',
      'לחם/פיתות',
      'ממרחים',
    ],
    overnight: [
      'מנות בישול',
      'ירקות',
      'שימורים',
      'תבלינים',
    ]
  }
};

export const getEquipmentForTripType = (selectedTypes) => {
  let equipment = {};
  
  // מוסיף ציוד בסיסי לכל טיול
  Object.entries(equipmentCategories).forEach(([category, items]) => {
    equipment[category] = [...(items.basic || [])];
  });

  // מוסיף ציוד ספציפי לפי סוג הטיול
  selectedTypes.forEach(type => {
    Object.entries(equipmentCategories).forEach(([category, items]) => {
      if (items[type]) {
        equipment[category] = [...(equipment[category] || []), ...items[type]];
      }
    });
  });

  // מסיר כפילויות
  Object.keys(equipment).forEach(category => {
    equipment[category] = [...new Set(equipment[category])];
  });

  return equipment;
};

export const getTripTypeRecommendations = (season, duration, location) => {
  const recommendations = [];
  
  // המלצות לפי עונה
  if (season === 'summer') {
    recommendations.push('WATER', 'SUMMER');
  } else if (season === 'winter') {
    recommendations.push('WINTER');
  }

  // המלצות לפי משך
  if (duration > 1) {
    recommendations.push('OVERNIGHT');
    if (duration > 3) {
      recommendations.push('CAMPING');
    }
  } else {
    recommendations.push('DAY_HIKE');
  }

  // המלצות לפי מיקום
  if (location?.toLowerCase().includes('מדבר')) {
    recommendations.push('DESERT');
  } else if (location?.toLowerCase().includes('הר')) {
    recommendations.push('MOUNTAIN');
  }

  return [...new Set(recommendations)];
};
