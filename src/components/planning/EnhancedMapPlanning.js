import React from 'react';
import MapPlanning from './MapPlanning';
import { withLocalOSRM } from './withLocalOSRM';
import { withLocationSync } from './withLocationSync';

// יצירת גרסה משופרת של MapPlanning עם תמיכה ב-OSRM מקומי וסנכרון מיקומים
const EnhancedMapPlanningBase = (props) => {
  return <MapPlanning {...props} />;
};

export const EnhancedMapPlanning = withLocationSync(withLocalOSRM(EnhancedMapPlanningBase));

export default EnhancedMapPlanning;
