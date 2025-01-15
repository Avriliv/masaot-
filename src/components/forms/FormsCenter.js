// src/components/forms/FormsCenter.js
import React, { useState } from 'react';

const FormsCenter = () => {
    const [selectedForm, setSelectedForm] = useState(null);

    const forms = {
        education: [
            {
                id: 'edu-1',
                name: 'טופס תיאום טיולים',
                description: 'טופס חובה להגשה למשרד החינוך',
                deadline: '14 ימים לפני הטיול',
                url: 'https://meyda.education.gov.il/files/Bitachon/EmergencyPortalTripRequestForm.pdf'
            },
            {
                id: 'edu-2',
                name: 'אישור הורים לטיול',
                description: 'טופס הצהרת הורים ואישור יציאה לטיול',
                deadline: '7 ימים לפני הטיול',
                url: 'https://meyda.education.gov.il/files/Bitachon/ParentsTripApprovalForm.pdf'
            },
            {
                id: 'edu-3',
                name: 'הצהרת בריאות',
                description: 'טופס הצהרת בריאות למשתתף בטיול',
                deadline: '7 ימים לפני הטיול',
                url: 'https://meyda.education.gov.il/files/Bitachon/HealthDeclarationForm.pdf'
            }
        ],
        security: [
            {
                id: 'sec-1',
                name: 'אישור ביטחוני',
                description: 'אישור מהגורמים הביטחוניים למסלול',
                deadline: '10 ימים לפני הטיול',
                url: 'https://www.102.gov.il/Pages/request.aspx'
            }
        ],
        safety: [
            {
                id: 'saf-1',
                name: 'בדיקת ציוד בטיחות',
                description: 'רשימת תיוג לציוד בטיחות נדרש',
                deadline: 'יום לפני הטיול',
                isChecklist: true,
                items: [
                    'ערכת עזרה ראשונה',
                    'אמצעי קשר תקינים',
                    'מפות ומצפן',
                    'מים רזרביים'
                ]
            }
        ]
    };

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            direction: 'rtl'
        },
        header: {
            marginBottom: '30px',
            textAlign: 'center'
        },
        categoriesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
        },
        category: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        formItem: {
            padding: '15px',
            marginBottom: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        },
        downloadButton: {
            backgroundColor: '#1e90ff',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px',
            transition: 'background-color 0.3s ease'
        },
        checklist: {
            listStyle: 'none',
            padding: 0
        },
        checklistItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 0'
        },
        deadline: {
            color: '#dc3545',
            fontSize: '0.9em',
            marginTop: '5px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>מרכז טפסים ואישורים</h1>
                <p>כל הטפסים והאישורים הנדרשים לטיול מרוכזים במקום אחד</p>
            </div>

            <div style={styles.categoriesGrid}>
                {/* טפסי משרד החינוך */}
                <div style={styles.category}>
                    <h2>טפסי משרד החינוך</h2>
                    {forms.education.map(form => (
                        <div key={form.id} style={styles.formItem}>
                            <h3>{form.name}</h3>
                            <p>{form.description}</p>
                            <p style={styles.deadline}>
                                <strong>מועד הגשה:</strong> {form.deadline}
                            </p>
                            <button 
                                style={styles.downloadButton}
                                onClick={() => window.open(form.url, '_blank')}
                            >
                                הורד טופס
                            </button>
                        </div>
                    ))}
                </div>

                {/* אישורים ביטחוניים */}
                <div style={styles.category}>
                    <h2>אישורים ביטחוניים</h2>
                    {forms.security.map(form => (
                        <div key={form.id} style={styles.formItem}>
                            <h3>{form.name}</h3>
                            <p>{form.description}</p>
                            <p style={styles.deadline}>
                                <strong>מועד הגשה:</strong> {form.deadline}
                            </p>
                            <button 
                                style={styles.downloadButton}
                                onClick={() => window.open(form.url, '_blank')}
                            >
                                פתח טופס מקוון
                            </button>
                        </div>
                    ))}
                </div>

                {/* בטיחות */}
                <div style={styles.category}>
                    <h2>בטיחות</h2>
                    {forms.safety.map(form => (
                        <div key={form.id} style={styles.formItem}>
                            <h3>{form.name}</h3>
                            <p>{form.description}</p>
                            {form.isChecklist && (
                                <ul style={styles.checklist}>
                                    {form.items.map((item, index) => (
                                        <li key={index} style={styles.checklistItem}>
                                            <input type="checkbox" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p style={styles.deadline}>
                                <strong>מועד ביצוע:</strong> {form.deadline}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FormsCenter;