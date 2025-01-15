import React from 'react';
import MapPlanning from './MapPlanning';
import { withLocalOSRM } from './withLocalOSRM';
import { withLocationSync } from './withLocationSync';
import EnhancedMap from './EnhancedMap';

// יצירת גרסה משופרת של MapPlanning עם תמיכה ב-OSRM מקומי וסנכרון מיקומים
const EnhancedMapPlanningBase = (props) => {
  const enhancedProps = {
    ...props,
    MapComponent: EnhancedMap
  };
  
  return <MapPlanning {...enhancedProps} />;
};

export const EnhancedMapPlanning = withLocationSync(withLocalOSRM(EnhancedMapPlanningBase));

export default EnhancedMapPlanning;
