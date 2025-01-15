// src/components/students/StudentsTable.js
import React, { useState } from 'react';

const StudentsTable = ({ onSave }) => {
    const [students, setStudents] = useState([]);
    const [newStudent, setNewStudent] = useState({
        name: '',
        age: '',
        hometown: '',
        motherPhone: '',
        fatherPhone: '',
        allergies: '',
        isVegetarian: false,
        parentApprovalStatus: false,
        parentEmail: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewStudent({
            ...newStudent,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const addStudent = () => {
        setStudents([...students, newStudent]);
        setNewStudent({
            name: '',
            age: '',
            hometown: '',
            motherPhone: '',
            fatherPhone: '',
            allergies: '',
            isVegetarian: false,
            parentApprovalStatus: false,
            parentEmail: ''
        });
    };

    const handleSave = () => {
        // שמירת הנתונים לפי הצורך (למשל: לשמור בבסיס נתונים או בקובץ)
        if (onSave) {
            onSave(students);
        }
    };

    return (
        <div>
            <h2>רשימת תלמידים</h2>
            <table>
                <thead>
                    <tr>
                        <th>שם</th>
                        <th>גיל</th>
                        <th>מקום מגורים</th>
                        <th>טלפון אמא</th>
                        <th>טלפון אבא</th>
                        <th>רגישויות</th>
                        <th>צמחוני/טבעוני</th>
                        <th>אישור הורים</th>
                        <th>דוא"ל הורים</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student, index) => (
                        <tr key={index}>
                            <td>{student.name}</td>
                            <td>{student.age}</td>
                            <td>{student.hometown}</td>
                            <td>{student.motherPhone}</td>
                            <td>{student.fatherPhone}</td>
                            <td>{student.allergies}</td>
                            <td>{student.isVegetarian ? 'כן' : 'לא'}</td>
                            <td>{student.parentApprovalStatus ? 'מאושר' : 'לא מאושר'}</td>
                            <td>{student.parentEmail}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h3>הוספת תלמיד חדש</h3>
            <form>
                <input name="name" value={newStudent.name} onChange={handleChange} placeholder="שם" required />
                <input name="age" value={newStudent.age} onChange={handleChange} placeholder="גיל" required />
                <input name="hometown" value={newStudent.hometown} onChange={handleChange} placeholder="מקום מגורים" required />
                <input name="motherPhone" value={newStudent.motherPhone} onChange={handleChange} placeholder="טלפון אמא" required />
                <input name="fatherPhone" value={newStudent.fatherPhone} onChange={handleChange} placeholder="טלפון אבא" required />
                <input name="allergies" value={newStudent.allergies} onChange={handleChange} placeholder="רגישויות" />
                <label>
                    צמחוני/טבעוני:
                    <input name="isVegetarian" type="checkbox" checked={newStudent.isVegetarian} onChange={handleChange} />
                </label>
                <label>
                    אישור הורים:
                    <input name="parentApprovalStatus" type="checkbox" checked={newStudent.parentApprovalStatus} onChange={handleChange} />
                </label>
                <input name="parentEmail" value={newStudent.parentEmail} onChange={handleChange} placeholder={`דוא"ל הורים`} required />
                <button type="button" onClick={addStudent}>הוסף תלמיד</button>
            </form>
            <button onClick={handleSave}>שמור</button>
        </div>
    );
};

export default StudentsTable;
