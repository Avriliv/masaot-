// שירות לטיפול במצבי חירום
const SOSService = {
  // שליחת התראת SOS לכל הגורמים הרלוונטיים
  sendSOSAlert: async (trip, currentLocation) => {
    try {
      // שליחת התראה למשרד החינוך
      await notifyEducationMinistry({
        tripId: trip.id,
        tripName: trip.name,
        location: currentLocation,
        participants: trip.participants
      });

      // שליחת התראה למנהל המערכת
      await notifySystemAdmin({
        tripId: trip.id,
        tripName: trip.name,
        location: currentLocation,
        participants: trip.participants
      });

      // שליחת SMS לאנשי קשר לחירום
      for (const contact of trip.emergencyContacts) {
        await sendSMS(contact.phone, createEmergencyMessage(trip, currentLocation));
      }

      // שליחת אימייל לאנשי קשר לחירום
      for (const contact of trip.emergencyContacts) {
        if (contact.email) {
          await sendEmail(contact.email, createEmergencyMessage(trip, currentLocation));
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending SOS alerts:', error);
      return { success: false, error };
    }
  }
};

// פונקציות עזר פנימיות

const notifyEducationMinistry = async (data) => {
  // TODO: להוסיף אינטגרציה עם API של משרד החינוך
  console.log('Notifying Education Ministry:', data);
};

const notifySystemAdmin = async (data) => {
  // TODO: להוסיף אינטגרציה עם מערכת הניהול
  console.log('Notifying System Admin:', data);
};

const sendSMS = async (phoneNumber, message) => {
  // TODO: להוסיף אינטגרציה עם שירות SMS
  console.log('Sending SMS to', phoneNumber, ':', message);
};

const sendEmail = async (email, message) => {
  // TODO: להוסיף אינטגרציה עם שירות אימייל
  console.log('Sending email to', email, ':', message);
};

const createEmergencyMessage = (trip, location) => {
  return `קריאת חירום!
טיול: ${trip.name}
מיקום: ${location.latitude}, ${location.longitude}
דיוק: ${location.accuracy} מטרים
משתתפים: ${trip.participants}
נא ליצור קשר בהקדם!`;
};

export default SOSService;
