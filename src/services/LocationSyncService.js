// שירות לסנכרון מיקומים בין BasicInfo ל-MapPlanning
export const LocationSyncService = {
  // המרת מיקום מפורמט של BasicInfo לפורמט של MapPlanning
  convertToMapLocation(basicLocation) {
    if (!basicLocation) return null;
    
    return {
      coordinates: basicLocation.coordinates,
      label: basicLocation.label,
      type: basicLocation.type || 'waypoint'
    };
  },

  // המרת מיקום מפורמט של MapPlanning לפורמט של BasicInfo
  convertToBasicLocation(mapLocation) {
    if (!mapLocation) return null;
    
    return {
      coordinates: mapLocation.coordinates,
      label: mapLocation.label,
      type: mapLocation.type || 'waypoint'
    };
  },

  // המרת מערך dailyLocations למבנה route
  convertDailyLocationsToRoute(dailyLocations = []) {
    if (!dailyLocations.length) return null;

    // נשתמש ביום הראשון והאחרון בתור נקודות ההתחלה והסיום
    const firstDay = dailyLocations[0] || {};
    const lastDay = dailyLocations[dailyLocations.length - 1] || {};

    return {
      startPoint: this.convertToMapLocation(firstDay.start),
      endPoint: this.convertToMapLocation(lastDay.end),
      waypoints: dailyLocations
        .slice(1, -1)
        .reduce((points, day) => {
          if (day.start) points.push(this.convertToMapLocation(day.start));
          if (day.end) points.push(this.convertToMapLocation(day.end));
          return points;
        }, [])
    };
  },

  // המרת route למערך dailyLocations
  convertRouteToDailyLocations(route, numDays = 1) {
    if (!route || !route.startPoint || !route.endPoint) return [];

    const dailyLocations = new Array(numDays).fill(null).map(() => ({}));

    // הגדרת נקודת ההתחלה ליום הראשון
    if (dailyLocations[0]) {
      dailyLocations[0].start = this.convertToBasicLocation(route.startPoint);
    }

    // הגדרת נקודת הסיום ליום האחרון
    if (dailyLocations[numDays - 1]) {
      dailyLocations[numDays - 1].end = this.convertToBasicLocation(route.endPoint);
    }

    // חלוקת נקודות הביניים בין הימים
    if (route.waypoints && route.waypoints.length > 0) {
      const pointsPerDay = Math.ceil(route.waypoints.length / (numDays - 2));
      
      route.waypoints.forEach((point, index) => {
        const dayIndex = Math.floor(index / pointsPerDay) + 1;
        if (dayIndex < numDays - 1) {
          const convertedPoint = this.convertToBasicLocation(point);
          if (!dailyLocations[dayIndex].start) {
            dailyLocations[dayIndex].start = convertedPoint;
          } else {
            dailyLocations[dayIndex].end = convertedPoint;
          }
        }
      });
    }

    return dailyLocations;
  }
};
