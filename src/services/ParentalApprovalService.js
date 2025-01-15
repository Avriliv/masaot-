import axios from 'axios';

class ParentalApprovalService {
  // שליחת בקשה לאישור הורים
  static async sendApprovalRequest(participant, tripDetails) {
    try {
      // יצירת טופס דיגיטלי עם הפרטים
      const approvalForm = {
        participantId: participant.id,
        participantName: `${participant.name} ${participant.familyName}`,
        parentName: participant.parentName,
        parentEmail: participant.parentEmail,
        parentPhone: participant.parentPhone,
        tripDetails: {
          name: tripDetails.name,
          startDate: tripDetails.startDate,
          endDate: tripDetails.endDate,
          description: tripDetails.description,
          location: tripDetails.location
        },
        approvalLink: `${process.env.REACT_APP_BASE_URL}/approve-trip/${tripDetails.id}/${participant.id}`,
        status: 'pending',
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // תוקף ל-7 ימים
      };

      // שמירת הטופס במערכת
      await this.saveApprovalForm(approvalForm);

      // שליחת SMS להורה
      await this.sendSMS(participant.parentPhone, approvalForm);

      // שליחת אימייל להורה
      await this.sendEmail(participant.parentEmail, approvalForm);

      return { success: true, formId: approvalForm.id };
    } catch (error) {
      console.error('Error sending approval request:', error);
      throw new Error('Failed to send approval request');
    }
  }

  // שליחת SMS להורה
  static async sendSMS(phone, form) {
    // TODO: התחברות לשירות SMS
    const message = `שלום ${form.parentName},
נדרש אישורך להשתתפות ${form.participantName} בטיול ${form.tripDetails.name}.
לאישור לחץ כאן: ${form.approvalLink}`;

    try {
      // TODO: implement SMS service integration
      console.log('Sending SMS:', { phone, message });
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw error;
    }
  }

  // שליחת אימייל להורה
  static async sendEmail(email, form) {
    const emailContent = {
      to: email,
      subject: `אישור השתתפות בטיול - ${form.tripDetails.name}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif;">
          <h2>בקשה לאישור השתתפות בטיול</h2>
          
          <p>שלום ${form.parentName},</p>
          
          <p>נדרש אישורך להשתתפות ${form.participantName} בטיול.</p>
          
          <h3>פרטי הטיול:</h3>
          <ul>
            <li>שם הטיול: ${form.tripDetails.name}</li>
            <li>תאריך יציאה: ${new Date(form.tripDetails.startDate).toLocaleDateString('he-IL')}</li>
            <li>תאריך חזרה: ${new Date(form.tripDetails.endDate).toLocaleDateString('he-IL')}</li>
            <li>יעד: ${form.tripDetails.location}</li>
          </ul>

          <div style="margin: 20px 0;">
            <a href="${form.approvalLink}" 
               style="background-color: #4CAF50; color: white; padding: 14px 20px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              לחץ כאן לאישור השתתפות בטיול
            </a>
          </div>

          <p>האישור בתוקף עד ${new Date(form.expiresAt).toLocaleDateString('he-IL')}</p>
          
          <p style="color: #666; font-size: 0.9em;">
            הודעה זו נשלחה באופן אוטומטי. אין להשיב למייל זה.
          </p>
        </div>
      `
    };

    try {
      // TODO: implement email service integration
      console.log('Sending email:', emailContent);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  // שמירת טופס האישור במערכת
  static async saveApprovalForm(form) {
    try {
      // TODO: implement database integration
      console.log('Saving approval form:', form);
    } catch (error) {
      console.error('Failed to save approval form:', error);
      throw error;
    }
  }

  // בדיקת סטטוס אישור
  static async checkApprovalStatus(formId) {
    try {
      // TODO: implement status check
      return { status: 'pending' };
    } catch (error) {
      console.error('Failed to check approval status:', error);
      throw error;
    }
  }
}

export default ParentalApprovalService;
