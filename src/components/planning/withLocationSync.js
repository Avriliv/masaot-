import React, { useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { LocationSyncService } from '../../services/LocationSyncService';

// HOC שמוסיף סנכרון מיקומים לקומפוננטות
export const withLocationSync = (WrappedComponent) => {
  return function WithLocationSyncComponent(props) {
    const { tripData, updateBasicDetails, updateRoute } = useTrip();

    useEffect(() => {
      // כאשר משתנים המיקומים היומיים, מעדכנים את ה-route
      if (tripData?.basicDetails?.dailyLocations) {
        const route = LocationSyncService.convertDailyLocationsToRoute(
          tripData.basicDetails.dailyLocations
        );
        if (route) {
          console.log('Updating route from dailyLocations:', route);
          updateRoute(route);
        }
      }
    }, [tripData?.basicDetails?.dailyLocations]);

    useEffect(() => {
      // כאשר משתנה ה-route, מעדכנים את המיקומים היומיים
      if (tripData?.route?.startPoint || tripData?.route?.endPoint) {
        const numDays = tripData?.basicDetails?.numDays || 1;
        const dailyLocations = LocationSyncService.convertRouteToDailyLocations(
          tripData.route,
          numDays
        );
        if (dailyLocations.length > 0) {
          console.log('Updating dailyLocations from route:', dailyLocations);
          updateBasicDetails({
            ...tripData.basicDetails,
            dailyLocations
          });
        }
      }
    }, [tripData?.route?.startPoint, tripData?.route?.endPoint, tripData?.route?.waypoints]);

    // העברת props מקוריים + פונקציות המרה
    const enhancedProps = {
      ...props,
      convertToMapLocation: LocationSyncService.convertToMapLocation,
      convertToBasicLocation: LocationSyncService.convertToBasicLocation
    };

    return <WrappedComponent {...enhancedProps} />;
  };
};
