// src/components/forms/StandardForms.js
import React, { useState } from 'react';

const StandardForms = () => {
    const [selectedForm, setSelectedForm] = useState(null);

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            direction: 'rtl'
        },
        formsList: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            marginTop: '20px'
        },
        formCard: {
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        formTitle: {
            fontSize: '1.2em',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#1e90ff'
        },
        requiredBadge: {
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.8em',
            marginRight: '10px'
        },
        downloadButton: {
            backgroundColor: '#1e90ff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%',
            marginTop: '10px'
        }
    };

    // המשך של src/components/forms/StandardForms.js

const StandardForms = () => {
    const [selectedForm, setSelectedForm] = useState(null);

    // מערך הטפסים הסטנדרטיים
    const standardForms = {
        ministry: {
            id: 'min-1',
            title: 'טופס תיאום טיולים - משרד החינוך',
            description: 'טופס חובה להגשה עבור כל טיול',
            url: 'https://edu.gov.il/noar/tiulim/Pages/homepage.aspx',
            deadline: '14 ימים לפני הטיול',
            required: true
        },
        parent: {
            id: 'par-1',
            title: 'אישור הורים',
            description: 'טופס אישור הורים להשתתפות בטיול',
            template: `
                לכבוד
                הורי התלמיד/ה: _____________
                כיתה: _____________

                שלום רב,

                הנדון: טיול שנתי

                בתאריכים _____________
                ייערך טיול שנתי ל_____________

                עלות הטיול: _____________ ₪

                הצהרת הורים:
                אני מאשר/ת בזאת את השתתפות בני/בתי בטיול.
                
                שם ההורה: _____________
                חתימה: _____________
                תאריך: _____________
            `,
            required: true
        },
        medical: {
            id: 'med-1',
            title: 'הצהרת בריאות',
            description: 'טופס הצהרת בריאות ומידע רפואי',
            template: `
                הצהרת בריאות
                
                שם התלמיד/ה: _____________
                ת.ז.: _____________
                
                1. האם יש מגבלות בריאותיות? כן/לא
                   אם כן, פרט: _____________

                2. האם נדרשת תרופה קבועה? כן/לא
                   אם כן, פרט: _____________

                3. האם קיימת רגישות למזון? כן/לא
                   אם כן, פרט: _____________

                חתימת הורה: _____________
                תאריך: _____________
            `,
            required: true
        },
        security: {
            id: 'sec-1',
            title: 'אישור ביטחוני',
            description: 'טופס תיאום ביטחוני מול הרשויות',
            url: 'https://www.police.gov.il',
            deadline: '10 ימים לפני הטיול',
            required: true
        },
        safety: {
            id: 'saf-1',
            title: 'בדיקת בטיחות',
            description: 'רשימת תיוג לבדיקות בטיחות',
            checklist: [
                'ציוד עזרה ראשונה',
                'אמצעי קשר',
                'מים (3 ליטר לאדם)',
                'מפות ניווט',
                'פנסים וסוללות',
                'ציוד חירום'
            ],
            required: true
        }
    };

    // פונקציה להורדת טופס
    const handleDownload = (form) => {
        if (form.url) {
            window.open(form.url, '_blank');
        } else if (form.template) {
            const blob = new Blob([form.template], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${form.title}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    };

    return (
        <div style={styles.container}>
            <h1>טפסים ואישורים סטנדרטיים</h1>
            <p>כל הטפסים הנדרשים לטיול במקום אחד</p>

            <div style={styles.formsList}>
                {Object.values(standardForms).map(form => (
                    <div key={form.id} style={styles.formCard}>
                        <div style={styles.formTitle}>
                            {form.title}
                            {form.required && (
                                <span style={styles.requiredBadge}>חובה</span>
                            )}
                        </div>
                        
                        <p>{form.description}</p>
                        
                        {form.deadline && (
                            <p>
                                <strong>מועד הגשה:</strong> {form.deadline}
                            </p>
                        )}

                        {form.checklist && (
                            <div>
                                <h4>רשימת בדיקה:</h4>
                                <ul>
                                    {form.checklist.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button 
                            style={styles.downloadButton}
                            onClick={() => handleDownload(form)}
                        >
                            {form.url ? 'פתח טופס מקוון' : 'הורד טופס'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StandardForms;