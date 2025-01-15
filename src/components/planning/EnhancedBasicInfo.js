import BasicInfo from './BasicInfo';
import { withLocationSync } from './withLocationSync';

// יצירת גרסה משופרת של BasicInfo עם סנכרון מיקומים
export const EnhancedBasicInfo = withLocationSync(BasicInfo);

export default EnhancedBasicInfo;
