import React from 'react';
import TripPlanningSteps from './TripPlanningSteps';
import EnhancedMapPlanning from './EnhancedMapPlanning';
import EnhancedBasicInfo from './EnhancedBasicInfo';

// יצירת גרסה משופרת של TripPlanningSteps שמשתמשת בקומפוננטות המשופרות
const EnhancedTripPlanningSteps = (props) => {
  // העתקת הקונפיגורציה המקורית
  const steps = [
    {
      label: 'פרטי הטיול',
      description: 'הגדרת פרטי הטיול הבסיסיים',
      component: EnhancedBasicInfo,  // שימוש בגרסה המשופרת
      validation: props.steps[0].validation
    },
    {
      label: 'תכנון מסלול',
      description: 'תכנון מסלול הטיול על המפה',
      component: EnhancedMapPlanning,  // שימוש בגרסה המשופרת
      validation: props.steps[1].validation
    },
    {
      label: 'סיכום',
      description: 'סיכום פרטי הטיול',
      component: props.steps[2].component,
      validation: props.steps[2].validation
    }
  ];

  return <TripPlanningSteps {...props} steps={steps} />;
};

export default EnhancedTripPlanningSteps;
