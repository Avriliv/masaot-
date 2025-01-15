import defaultPlantImage from '../assets/images/default-plant.jpg';
import defaultAnimalImage from '../assets/images/default-animal.jpg';
import { searchPixabayImages } from '../services/PixabayService';

// Pixabay Image URLs
const PIXABAY_BASE_URL = 'https://pixabay.com/api/';
const PIXABAY_API_KEY = '48084149-9fd8634c3fd95f6800ddc9556';

export const plants = [
  {
    id: 1,
    name: 'אלון התבור',
    latinName: 'Tabor Oak',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'עץ נשיר, אחד מסמלי החורש הים-תיכוני, בעל עמידות ליובש.',
    habitat: 'חורשים בצפון ובמרכז הארץ.',
    category: 'עצים ושיחים'
  },
  {
    id: 2,
    name: 'חרוב מצוי',
    latinName: 'Carob Tree',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'עץ ירוק-עד, פירותיו משמשים למאכל ולתעשייה.',
    habitat: 'אזורים חמים ויבשים בצפון ובמרכז.',
    category: 'עצים ושיחים'
  },
  {
    id: 3,
    name: 'שיזף מצוי',
    latinName: 'Ziziphus Spina-Christi',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'עץ קוצני קטן, פירותיו אכילים.',
    habitat: 'מדבריות ואזורים צחיחים.',
    category: 'עצים ושיחים'
  },
  {
    id: 4,
    name: 'רימון מצוי',
    latinName: 'Pomegranate',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'עץ נשיר קטן, פירותיו האדומים נחשבים לסמל פוריות.',
    habitat: 'מטעים ואזורים כפריים.',
    category: 'עצים ושיחים'
  },
  {
    id: 5,
    name: 'כלנית מצויה',
    latinName: 'Anemone Coronaria',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'פרח סמלי של ישראל, מופיע בצבעים אדום, לבן וסגול.',
    habitat: 'גבעות, שדות, ובשטחים פתוחים.',
    category: 'פרחים',
    isProtected: true
  },
  {
    id: 6,
    name: 'רקפת מצויה',
    latinName: 'Cyclamen Persicum',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'פרח ורוד או לבן בעל עלים בצורת לב.',
    habitat: 'סלעים ובצל עצים בצפון ובמרכז.',
    category: 'פרחים',
    isProtected: true
  },
  {
    id: 7,
    name: 'חצב מצוי',
    latinName: 'Sea Squill',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'צמח פורח גבוה, המסמל את סוף הקיץ.',
    habitat: 'שטחים פתוחים בכל הארץ.',
    category: 'פרחים'
  },
  {
    id: 8,
    name: 'נרקיס מצוי',
    latinName: 'Narcissus Tazetta',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'פרח לבן-צהוב, בעל ריח עז.',
    habitat: 'שדות לחים בצפון ובמרכז.',
    category: 'פרחים',
    isProtected: true
  },
  {
    id: 9,
    name: 'אירוס הארגמן',
    latinName: 'Iris Atropurpurea',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'פרח מרהיב בצבע ארגמן כהה, מוגן בישראל.',
    habitat: 'אזורים חוליים במישור החוף.',
    category: 'פרחים',
    isProtected: true
  },
  {
    id: 10,
    name: 'גזר קיפח',
    latinName: 'Wild Carrot',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'צמח בר עם תפרחות לבנות דמויות מטריה.',
    habitat: 'שדות וגבעות ברחבי הארץ.',
    category: 'עשבים'
  },
  {
    id: 11,
    name: 'גדילן מצוי',
    latinName: 'Milk Thistle',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'צמח קוצני עם פרחים סגולים. נחשב לצמח מרפא.',
    habitat: 'שדות ושטחים פתוחים.',
    category: 'עשבים'
  },
  {
    id: 12,
    name: 'מרווה משולשת',
    latinName: 'Three-lobed Sage',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'צמח תבלין ארומטי עם פריחה סגולה.',
    habitat: 'גבעות ושטחים סלעיים בצפון ובמרכז.',
    category: 'עשבים'
  },
  {
    id: 13,
    name: 'חוטמית זיפנית',
    latinName: 'Malva Nicaeensis',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'עשב רב-שנתי עם פריחה ורודה.',
    habitat: 'שדות וחורשים פתוחים.',
    category: 'עשבים'
  },
  {
    id: 14,
    name: 'נופר צהוב',
    latinName: 'Yellow Water-lily',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'צמח מים עם פרחים צהובים צפים.',
    habitat: 'בריכות ונחלים בצפון.',
    category: 'צמחי מים וביצות',
    isProtected: true
  },
  {
    id: 15,
    name: 'צבר מצוי',
    latinName: 'Prickly Pear Cactus',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'קקטוס עם פירות מתוקים.',
    habitat: 'מדבריות ואזורים יבשים.',
    category: 'קקטוסים וצמחי מדבר'
  },
  {
    id: 16,
    name: 'מלוח קיפח',
    latinName: 'Atriplex Halimus',
    image: defaultPlantImage,
    imageCredit: 'Default',
    description: 'שיח מלוח שמותאם לאדמות חרסית מלוחות.',
    habitat: 'מדבריות ושולי חולות.',
    category: 'קקטוסים וצמחי מדבר'
  }
];

export const animals = [
  {
    id: 1,
    name: 'צבי ארץ ישראלי',
    latinName: 'Israeli Gazelle',
    image: defaultAnimalImage,
    imageCredit: 'Default',
    description: 'צבי מהיר ואצילי, בעל קרניים מפותלות. ניזון מעשבים ועלים.',
    habitat: 'שטחים פתוחים ומדבריות בכל הארץ.',
    isEndemic: true
  },
  {
    id: 2,
    name: 'שועל מצוי',
    latinName: 'Red Fox',
    image: defaultAnimalImage,
    imageCredit: 'Default',
    description: 'טורף קטן בעל כושר הסתגלות מרשים, ניזון ממגוון רחב של מזון, כולל יונקים קטנים, פירות, וחרקים.',
    habitat: 'נפוץ בכל הארץ, מההר ועד המדבר.',
    isEndemic: false
  },
  {
    id: 3,
    name: 'זאב ערבי',
    latinName: 'Arabian Wolf',
    image: defaultAnimalImage,
    imageCredit: 'Default',
    description: 'תת-מין של הזאב האפור, קטן יחסית, מתמחה בציד חיות קטנות ובינוניות.',
    habitat: 'מדבריות הנגב, הערבה, ובקעת הירדן.',
    isEndemic: false
  },
  {
    id: 4,
    name: 'דרבן מצוי',
    latinName: 'Hystrix indica',
    image: defaultAnimalImage,
    imageCredit: 'Default',
    description: 'מכרסם גדול המכוסה בחטים ארוכים המשמשים להגנה. ניזון משורשים, פקעות, ופירות.',
    habitat: 'יערות, גבעות, ואזורי חורש ברחבי הארץ.',
    isEndemic: false
  },
  {
    id: 5,
    name: 'גירית מצויה',
    latinName: 'European Badger',
    image: defaultAnimalImage,
    imageCredit: 'Default',
    description: 'יונק לילי חזק ונחוש, אוכל כל. ידוע בהתנהגותו החפרנית.',
    habitat: 'אזורי חורש, יערות, וגבעות בצפון ובמרכז.',
    isEndemic: false
  },
  {
    id: 6,
    name: 'עיט ניצי',
    latinName: 'Bonelli\'s Eagle',
    image: defaultAnimalImage,
    imageCredit: 'Default',
    description: 'עוף דורס גדול וחזק, טורף ציפורים ויונקים קטנים.',
    habitat: 'מצוקים ועמקים בגליל, בגולן, ובמדבר יהודה.',
    isEndemic: false
  },
  {
    id: 7,
    name: 'חיוויאי הנחשים',
    latinName: 'Short-toed Snake Eagle',
    image: defaultAnimalImage,
    imageCredit: 'Default',
    description: 'עוף דורס הניזון בעיקר מנחשים וזוחלים אחרים.',
    habitat: 'שטחים פתוחים בגליל, בנגב, ובערבה.',
    isEndemic: false
  },
  {
    id: 8,
    name: 'שלדג לבן-החזה',
    latinName: 'White-throated Kingfisher',
    image: defaultAnimalImage,
    imageCredit: 'Default',
    description: 'ציפור יפהפייה בצבעי כחול-טורקיז, צד דגים וחרקים.',
    habitat: 'ליד מקווי מים בצפון ובמרכז הארץ.',
    isEndemic: false
  },
  {
    id: 9,
    name: 'דוכיפת',
    latinName: 'Hoopoe',
    image: defaultAnimalImage,
    imageCredit: 'Default',
    description: 'ציפור הלאום של ישראל, בעלת ציצית ראש מרשימה.',
    habitat: 'שטחים פתוחים וישובים בכל הארץ.',
    isEndemic: false
  },
  {
    id: 10,
    name: 'צב יבשה מצוי',
    latinName: 'Mediterranean Spur-thighed Tortoise',
    image: defaultAnimalImage,
    imageCredit: 'Default',
    description: 'זוחל איטי בעל שריון קשה, צמחוני.',
    habitat: 'שטחים פתוחים וחורש ים-תיכוני.',
    isEndemic: false
  },
  {
    id: 11,
    name: 'צפע ארץ-ישראלי',
    latinName: 'Palestine Viper',
    image: defaultAnimalImage,
    imageCredit: 'Default',
    description: 'נחש ארסי מסוכן, פעיל בעיקר בלילה.',
    habitat: 'אזורי חורש וסלעים בכל הארץ.',
    isEndemic: true
  },
  {
    id: 12,
    name: 'חרדון מצוי',
    latinName: 'Agama Lizard',
    image: defaultAnimalImage,
    imageCredit: 'Default',
    description: 'לטאה גדולה בעלת קשקשים בולטים, הזכר צבעוני מאוד בעונת הרבייה.',
    habitat: 'אזורים סלעיים וקירות אבן.',
    isEndemic: false
  }
];

// Function to load Pixabay images for animals
export const loadAnimalImages = async () => {
  const updatedAnimals = [...animals];
  for (const animal of updatedAnimals) {
    const imageUrl = await searchPixabayImages(animal.latinName + ' animal');
    if (imageUrl) {
      animal.image = imageUrl;
      animal.imageCredit = 'Pixabay';
    }
  }
  return updatedAnimals;
};

export const seasonalInfo = {
  waterfalls: [
    {
      id: 1,
      name: 'מפל התנור',
      status: 'active',
      lastUpdate: '2024-12-29',
      bestSeason: ['winter', 'spring'],
      tips: ['מומלץ להגיע אחרי גשם', 'יש להצטייד בנעלי הליכה בתוך המים']
    },
    {
      id: 2,
      name: 'מפל עין גדי',
      status: 'active',
      lastUpdate: '2024-12-29',
      bestSeason: ['all'],
      tips: ['מומלץ להגיע בשעות הבוקר', 'להצטייד במים רבים', 'ניתן לטבול במים']
    },
    {
      id: 3,
      name: 'מפלי סער',
      status: 'active',
      lastUpdate: '2024-12-29',
      bestSeason: ['winter', 'spring'],
      tips: ['יש לבדוק מזג אוויר לפני ההגעה', 'זהירות מהחלקה על סלעים רטובים']
    }
  ],
  seasonalTips: {
    winter: [
      'להצטייד בביגוד חם ואטום למים',
      'לבדוק תחזית גשמים לפני היציאה',
      'להיזהר משיטפונות בנחלים',
      'לקחת שכבות ביגוד נוספות',
      'להצטייד בפנס תקין'
    ],
    spring: [
      'להצטייד במים רבים',
      'להיזהר מזוחלים מתעוררים',
      'זמן טוב לצפות בפריחה',
      'להביא כובע ומסנן קרינה',
      'לצאת מוקדם לטיולים ארוכים'
    ],
    summer: [
      'לטייל בשעות הבוקר המוקדמות',
      'להצטייד בהרבה מים (לפחות 3 ליטר לאדם)',
      'להימנע מטיולים בשעות החמות',
      'חובה כובע רחב שוליים',
      'להכיר נקודות מילוי מים במסלול'
    ],
    autumn: [
      'עונה מצוינת לטיולים ארוכים',
      'להיערך לשינויי מזג אוויר',
      'לבדוק תחזית לפני היציאה',
      'להצטייד בפנס לשעות החשיכה המוקדמות',
      'זמן טוב לצפות בנדידת ציפורים'
    ]
  }
};
