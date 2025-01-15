import React, { useState } from 'react';
import { sendEmailToParent } from '../../services/emailService';

const ParentApprovalSystem = ({ tripData }) => {
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [sendStatus, setSendStatus] = useState({});

    const styles = {
        container: {
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            direction: 'rtl'
        },
        form: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px'
        },
        statusTable: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px'
        },
        sendButton: {
            backgroundColor: '#1e90ff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        },
        statusBadge: {
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.9em'
        }
    };

    const generateApprovalForm = (student) => {
        return `
            <html dir="rtl">
                <body>
                    <h2>אישור הורים - ${tripData.tripName}</h2>
                    <p>להורי התלמיד/ה: ${student.name}</p>
                    <p>כיתה: ${student.class}</p>
                    
                    <div class="trip-details">
                        <h3>פרטי הטיול:</h3>
                        <p>תאריך: ${tripData.dates.start} - ${tripData.dates.end}</p>
                        <p>יעד: ${tripData.destination}</p>
                        <p>עלות: ${tripData.cost} ₪</p>
                    </div>

                    <div class="approval-section">
                        <h3>אישור הורים</h3>
                        <p>אני מאשר/ת את השתתפות בני/בתי בטיול</p>
                        <p>חתימה דיגיטלית: ______________</p>
                        <p>תאריך: ______________</p>
                    </div>
                </body>
            </html>
        `;
    };

    const sendApprovalRequests = async () => {
        for (const student of selectedStudents) {
            setSendStatus(prev => ({ ...prev, [student.id]: 'sending' }));
            
            try {
                await sendEmailToParent({
                    to: student.parentEmail,
                    subject: `אישור הורים - ${tripData.tripName}`,
                    html: generateApprovalForm(student),
                    approvalLink: `${window.location.origin}/approve/${student.approvalToken}`
                });

                setSendStatus(prev => ({ ...prev, [student.id]: 'sent' }));
            } catch (error) {
                setSendStatus(prev => ({ ...prev, [student.id]: 'error' }));
            }
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'sending':
                return '#ffcc00'; // צהוב
            case 'sent':
                return '#1e90ff'; // כחול
            case 'error':
                return '#ff4444'; // אדום
            default:
                return '#cccccc'; // אפור
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'sending':
                return 'בשליחה';
            case 'sent':
                return 'נשלח';
            case 'error':
                return 'שגיאה';
            default:
                return 'לא נשלח';
        }
    };

    const ApprovalStatus = () => (
        <table style={styles.statusTable}>
            <thead>
                <tr>
                    <th>שם התלמיד</th>
                    <th>כיתה</th>
                    <th>סטטוס</th>
                    <th>תאריך שליחה</th>
                    <th>תאריך אישור</th>
                </tr>
            </thead>
            <tbody>
                {selectedStudents.map(student => (
                    <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{student.class}</td>
                        <td>
                            <span style={{
                                ...styles.statusBadge,
                                backgroundColor: getStatusColor(sendStatus[student.id])
                            }}>
                                {getStatusText(sendStatus[student.id])}
                            </span>
                        </td>
                        <td>{student.sentDate || '-'}</td>
                        <td>{student.approvalDate || '-'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div style={styles.container}>
            <div style={styles.form}>
                <h2>מערכת אישורי הורים דיגיטליים</h2>
                <p>בחר תלמידים לשליחת אישור:</p>
                
                <div className="students-selection">
                    {/* בחירת תלמידים */}
                </div>

                <button 
                    style={styles.sendButton}
                    onClick={sendApprovalRequests}
                    disabled={selectedStudents.length === 0}
                >
                    שלח אישורים
                </button>

                <ApprovalStatus />
            </div>
        </div>
    );
};

export default ParentApprovalSystem;
