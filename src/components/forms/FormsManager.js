// src/components/forms/FormsManager.js
import React, { useState } from 'react';

const FormsManager = () => {
    const [selectedForm, setSelectedForm] = useState(null);

    const forms = {
        ministry: {
            title: 'אישור משרד החינוך',
            description: 'טופס אישור טיולים של משרד החינוך',
            link: 'https://apps.education.gov.il/TripNet/Content/Images/Documents.pdf',
            requirements: [
                'מספר תלמידים',
                'פרטי המוסד החינוכי',
                'תאריכי הטיול',
                'מסלול מפורט'
            ]
        },
        security: {
            title: 'אישור ביטחוני',
            description: 'תיאום ביטחוני מול משטרת ישראל וצה"ל',
            link: 'https://www.police.gov.il/contentPage.aspx?pid=300',
            requirements: [
                'פרטי האחראי',
                'מסלול מדויק',
                'מספר משתתפים',
                'אמצעי קשר'
            ]
        },
        safety: {
            title: 'אישור בטיחות',
            description: 'טופס בטיחות והערכת סיכונים',
            requirements: [
                'רשימת ציוד בטיחות',
                'נקודות תורפה במסלול',
                'תכנית חירום',
                'רשימת אנשי קשר'
            ]
        },
        parents: {
            title: 'אישור הורים',
            description: 'טופס הסכמת הורים לטיול',
            requirements: [
                'פרטי התלמיד',
                'פרטי ההורים',
                'הצהרת בריאות',
                'אישור שחייה (במידת הצורך)'
            ]
        },
        medical: {
            title: 'הצהרת בריאות',
            description: 'טופס הצהרת בריאות למשתתף',
            requirements: [
                'מצב בריאותי',
                'רגישויות',
                'תרופות קבועות',
                'מגבלות גופניות'
            ]
        }
    };

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            direction: 'rtl'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
        },
        cardHover: {
            transform: 'translateY(-5px)'
        },
        title: {
            fontSize: '1.2em',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#1e90ff'
        },
        description: {
            color: '#666',
            marginBottom: '15px'
        },
        button: {
            backgroundColor: '#1e90ff',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%'
        },
        requirements: {
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            marginTop: '20px'
        },
        requirementsList: {
            listStyle: 'none',
            padding: 0,
            margin: 0
        },
        requirementItem: {
            padding: '5px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        checkIcon: {
            color: '#28a745'
        },
        formPreview: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            zIndex: 1000
        }
    };

    return (
        <div style={styles.container}>
            <h1>טפסים ואישורים</h1>
            
            <div style={styles.grid}>
                {Object.entries(forms).map(([key, form]) => (
                    <div 
                        key={key} 
                        style={styles.card}
                        onClick={() => setSelectedForm(key)}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                    >
                        <div style={styles.title}>{form.title}</div>
                        <div style={styles.description}>{form.description}</div>
                        <div style={styles.requirements}>
                            <h4>דרישות:</h4>
                            <ul style={styles.requirementsList}>
                                {form.requirements.map((req, index) => (
                                    <li key={index} style={styles.requirementItem}>
                                        <span style={styles.checkIcon}>✓</span>
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button 
                            style={styles.button}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (form.link) {
                                    window.open(form.link, '_blank');
                                } else {
                                    setSelectedForm(key);
                                }
                            }}
                        >
                            {form.link ? 'הורד טופס' : 'מלא טופס'}
                        </button>
                    </div>
                ))}
            </div>

            {selectedForm && (
                <div style={styles.formPreview}>
                    <h2>{forms[selectedForm].title}</h2>
                    {/* כאן יהיה הטופס המלא */}
                    <button 
                        style={styles.button}
                        onClick={() => setSelectedForm(null)}
                    >
                        סגור
                    </button>
                </div>
            )}
        </div>
    );
};

export default FormsManager;