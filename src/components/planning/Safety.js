// src/components/planning/Safety.js
import React from 'react';

const Safety = ({ data, onUpdate }) => {
    const styles = {
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px'
        },
        section: {
            marginBottom: '30px',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        formGroup: {
            marginBottom: '15px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold'
        },
        input: {
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd'
        },
        checkbox: {
            marginRight: '8px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
        }
    };

    const handleChange = (category, field, value) => {
        onUpdate({
            safety: {
                ...data.safety,
                [category]: {
                    ...data.safety[category],
                    [field]: value
                }
            }
        });
    };

    return (
        <div style={styles.container}>
            {/* צוות נדרש */}
            <div style={styles.section}>
                <h3>צוות נדרש</h3>
                <div style={styles.grid}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>מספר מדריכים</label>
                        <input
                            type="number"
                            style={styles.input}
                            value={data.safety.requiredStaff.guides}
                            onChange={(e) => handleChange('requiredStaff', 'guides', e.target.value)}
                            min="0"
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>מספר מלווים רפואיים</label>
                        <input
                            type="number"
                            style={styles.input}
                            value={data.safety.requiredStaff.medics}
                            onChange={(e) => handleChange('requiredStaff', 'medics', e.target.value)}
                            min="0"
                        />
                    </div>
                </div>
            </div>

            {/* אישורים */}
            <div style={styles.section}>
                <h3>אישורים נדרשים</h3>
                <div style={styles.formGroup}>
                    {[
                        'אישור ביטחוני',
                        'אישור בטיחותי',
                        'אישורי הורים',
                        'ביטוח',
                        'תיאום טיולים'
                    ].map(permission => (
                        <div key={permission}>
                            <input
                                type="checkbox"
                                style={styles.checkbox}
                                checked={data.safety.permissions.includes(permission)}
                                onChange={(e) => {
                                    const newPermissions = e.target.checked
                                        ? [...data.safety.permissions, permission]
                                        : data.safety.permissions.filter(p => p !== permission);
                                    handleChange('permissions', '', newPermissions);
                                }}
                            />
                            <label>{permission}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* אנשי קשר לחירום */}
            <div style={styles.section}>
                <h3>אנשי קשר לחירום</h3>
                <div style={styles.grid}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>איש קשר ראשי</label>
                        <input
                            type="text"
                            style={styles.input}
                            placeholder="שם ומספר טלפון"
                            value={data.safety.emergencyContacts[0] || ''}
                            onChange={(e) => {
                                const newContacts = [...data.safety.emergencyContacts];
                                newContacts[0] = e.target.value;
                                handleChange('emergencyContacts', '', newContacts);
                            }}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>איש קשר משני</label>
                        <input
                            type="text"
                            style={styles.input}
                            placeholder="שם ומספר טלפון"
                            value={data.safety.emergencyContacts[1] || ''}
                            onChange={(e) => {
                                const newContacts = [...data.safety.emergencyContacts];
                                newContacts[1] = e.target.value;
                                handleChange('emergencyContacts', '', newContacts);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* דרכי מילוט */}
            <div style={styles.section}>
                <h3>דרכי מילוט</h3>
                <div style={styles.formGroup}>
                    <label style={styles.label}>נקודות פינוי</label>
                    <textarea
                        style={styles.input}
                        value={data.safety.emergencyRoutes.join('\n')}
                        onChange={(e) => handleChange('emergencyRoutes', '', e.target.value.split('\n'))}
                        placeholder="רשום כל נקודת פינוי בשורה נפרדת"
                        rows="4"
                    />
                </div>
            </div>
        </div>
    );
};

export default Safety;
