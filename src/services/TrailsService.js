// מאגר נתונים של שבילי טיולים בישראל
const trails = {
  // שביל ישראל
  israelTrail: {
    id: "INT",
    name: "שביל ישראל",
    length: 1100, // אורך במטרים
    markings: ["כחול", "לבן", "כתום"],
    sections: [
      { id: "INT-01", name: "מטולה - הר מירון", length: 82 },
      { id: "INT-02", name: "הר מירון - הר תבור", length: 94 },
      { id: "INT-03", name: "הר תבור - עמק יזרעאל", length: 85 },
      // ... יתר המקטעים
    ]
  },

  // שבילים מעגליים מסומנים
  circularTrails: [
    {
      id: "CT-001",
      name: "נחל עמוד",
      region: "גליל",
      color: "כחול",
      length: 5.2,
      difficulty: "בינוני"
    },
    {
      id: "CT-002",
      name: "הר ארבל",
      region: "גליל תחתון",
      color: "שחור",
      length: 4.8,
      difficulty: "קשה"
    }
    // ... עוד שבילים
  ],

  // שבילים לאומיים
  nationalTrails: [
    {
      id: "NT-001",
      name: "שביל הגולן",
      length: 125,
      markings: ["ירוק"],
      sections: [
        { id: "NT-001-01", name: "חרמון - מג'דל שמס", length: 15 },
        { id: "NT-001-02", name: "מג'דל שמס - קצרין", length: 22 }
        // ... יתר המקטעים
      ]
    },
    {
      id: "NT-002",
      name: "דרך ההר",
      length: 180,
      markings: ["כחול"],
      sections: []
    }
    // ... עוד שבילים לאומיים
  ],

  // פונקציה לחיפוש שבילים לפי אזור
  findTrailsByRegion: (region) => {
    return {
      circular: trails.circularTrails.filter(trail => trail.region === region),
      national: trails.nationalTrails.filter(trail => 
        trail.sections.some(section => section.name.includes(region))
      )
    };
  },

  // פונקציה לחיפוש שבילים לפי רמת קושי
  findTrailsByDifficulty: (difficulty) => {
    return trails.circularTrails.filter(trail => trail.difficulty === difficulty);
  },

  // פונקציה לקבלת כל השבילים באורך מסוים
  findTrailsByLength: (minLength, maxLength) => {
    return {
      circular: trails.circularTrails.filter(
        trail => trail.length >= minLength && trail.length <= maxLength
      ),
      national: trails.nationalTrails.filter(
        trail => trail.length >= minLength && trail.length <= maxLength
      )
    };
  },

  // פונקציה לקבלת מידע על מקטע ספציפי בשביל ישראל
  getIsraelTrailSection: (sectionId) => {
    return trails.israelTrail.sections.find(section => section.id === sectionId);
  }
};

export default trails;
