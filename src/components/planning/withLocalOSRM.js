import React, { useEffect } from 'react';
import { getLocalRoute, checkLocalServerAvailability } from '../../services/LocalOSRMService';

// HOC שמוסיף תמיכה ב-OSRM מקומי
export const withLocalOSRM = (WrappedComponent) => {
  return function WithLocalOSRMComponent(props) {
    useEffect(() => {
      // בדיקת זמינות השרת המקומי בטעינה
      checkLocalServerAvailability().then(isAvailable => {
        console.log('Local OSRM server available:', isAvailable);
      });
    }, []);

    // החלפת פונקציית getRoute המקורית בגרסה החדשה
    const enhancedProps = {
      ...props,
      getRoute: getLocalRoute
    };

    return <WrappedComponent {...enhancedProps} />;
  };
};
