import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Search as SearchIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

const StudentsList = ({ tripId, onStudentsChange, onSendForms }) => {
  const [students, setStudents] = useState([
    {
      id: 1,
      number: '1',
      name: 'ישראל',
      familyName: 'ישראלי',
      parentName: 'דוד',
      phone: '050-1234567',
      parentPhone: '052-1234567',
      parentEmail: 'david@email.com',
      address: 'תל אביב',
      class: 'י1',
      medicalIssues: 'אלרגיה לבוטנים',
      comments: '',
      present: true,
      parentalApprovalStatus: null // null = לא נשלח, 'sent' = נשלח, 'signed' = חתום
    }
  ]);

  useEffect(() => {
    if (onStudentsChange) {
      onStudentsChange(students);
    }
  }, [students, onStudentsChange]);

  // מצב עריכה
  const [editingStudent, setEditingStudent] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  // מצב מיון וסינון
  const [orderBy, setOrderBy] = useState('number');
  const [order, setOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');

  // סטטיסטיקות
  const [showStats, setShowStats] = useState(false);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterClass = (event) => {
    setFilterClass(event.target.value);
  };

  const filteredStudents = students
    .filter(student => {
      const searchMatch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const classMatch = filterClass ? student.class === filterClass : true;
      
      return searchMatch && classMatch;
    })
    .sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (order === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return bValue < aValue ? -1 : 1;
      }
    });

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setOpenEditDialog(true);
  };

  const handleEditSave = () => {
    const newStudents = students.map(s => 
      s.id === editingStudent.id ? editingStudent : s
    );
    setStudents(newStudents);
    setOpenEditDialog(false);
    setEditingStudent(null);
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(students);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "תלמידים");
    XLSX.writeFile(wb, "רשימת_תלמידים.xlsx");
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const importedStudents = XLSX.utils.sheet_to_json(firstSheet);
      setStudents(importedStudents.map((student, index) => ({
        ...student,
        id: index + 1,
        present: true,
        parentalApprovalStatus: null
      })));
    };
    reader.readAsArrayBuffer(file);
  };

  const getClassStats = () => {
    const stats = {};
    students.forEach(student => {
      stats[student.class] = (stats[student.class] || 0) + 1;
    });
    return stats;
  };

  const uniqueClasses = [...new Set(students.map(s => s.class))].sort();

  const [showSendDialog, setShowSendDialog] = useState(false);

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            label="חיפוש"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>סינון לפי כיתה</InputLabel>
            <Select
              value={filterClass}
              onChange={handleFilterClass}
              label="סינון לפי כיתה"
            >
              <MenuItem value="">הכל</MenuItem>
              {Array.from(new Set(students.map(s => s.class))).map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            color="success"
            onClick={() => setShowSendDialog(true)}
            disabled={!students.length || !students.every(s => s.name && s.parentPhone)}
          >
            סיים רשימה
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingStudent({
                id: students.length + 1,
                number: (students.length + 1).toString(),
                name: '',
                familyName: '',
                parentName: '',
                phone: '',
                parentPhone: '',
                parentEmail: '',
                address: '',
                class: '',
                medicalIssues: '',
                comments: '',
                present: true,
                parentalApprovalStatus: null
              });
              setOpenEditDialog(true);
            }}
          >
            הוסף תלמיד
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'number'}
                    direction={orderBy === 'number' ? order : 'asc'}
                    onClick={() => handleRequestSort('number')}
                  >
                    מספר
                  </TableSortLabel>
                </TableCell>
                <TableCell>שם</TableCell>
                <TableCell>שם משפחה</TableCell>
                <TableCell>שם הורה</TableCell>
                <TableCell>טלפון</TableCell>
                <TableCell>טלפון הורה</TableCell>
                <TableCell>אימייל הורה</TableCell>
                <TableCell>כיתה</TableCell>
                <TableCell>סטטוס אישור הורים</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.number}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.familyName}</TableCell>
                  <TableCell>{student.parentName}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>{student.parentPhone}</TableCell>
                  <TableCell>{student.parentEmail}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {student.parentalApprovalStatus === null && (
                        <Typography variant="body2" color="text.secondary">טרם נשלח</Typography>
                      )}
                      {student.parentalApprovalStatus === 'sent' && (
                        <Typography variant="body2" color="primary">נשלח להורים</Typography>
                      )}
                      {student.parentalApprovalStatus === 'signed' && (
                        <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CheckIcon fontSize="small" />
                          חתום
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => {
                        setEditingStudent(student);
                        setOpenEditDialog(true);
                      }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => {
                        if (window.confirm('האם אתה בטוח שברצונך למחוק תלמיד זה?')) {
                          setStudents(students.filter(s => s.id !== student.id));
                        }
                      }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStudent?.id ? 'עריכת תלמיד' : 'הוספת תלמיד חדש'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)', pt: 2 }}>
            <TextField
              label="שם"
              value={editingStudent?.name || ''}
              onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
            />
            <TextField
              label="שם משפחה"
              value={editingStudent?.familyName || ''}
              onChange={(e) => setEditingStudent({...editingStudent, familyName: e.target.value})}
            />
            <TextField
              label="מקום מגורים"
              value={editingStudent?.address || ''}
              onChange={(e) => setEditingStudent({...editingStudent, address: e.target.value})}
            />
            <TextField
              label="כיתה"
              value={editingStudent?.class || ''}
              onChange={(e) => setEditingStudent({...editingStudent, class: e.target.value})}
            />
            <TextField
              label="שם הורה"
              value={editingStudent?.parentName || ''}
              onChange={(e) => setEditingStudent({...editingStudent, parentName: e.target.value})}
            />
            <TextField
              label="טלפון הורה"
              value={editingStudent?.parentPhone || ''}
              onChange={(e) => setEditingStudent({...editingStudent, parentPhone: e.target.value})}
            />
            <TextField
              label="מייל הורה"
              value={editingStudent?.parentEmail || ''}
              onChange={(e) => setEditingStudent({...editingStudent, parentEmail: e.target.value})}
            />
            <TextField
              label="בעיות בריאות/אלרגיה"
              value={editingStudent?.medicalIssues || ''}
              onChange={(e) => setEditingStudent({...editingStudent, medicalIssues: e.target.value})}
            />
            <TextField
              label="הערות"
              value={editingStudent?.comments || ''}
              onChange={(e) => setEditingStudent({...editingStudent, comments: e.target.value})}
              fullWidth
              multiline
              rows={2}
              sx={{ gridColumn: 'span 2' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>ביטול</Button>
          <Button onClick={handleEditSave} variant="contained" startIcon={<CheckIcon />}>
            שמור
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>האם תרצה לשלוח טפסים?</DialogTitle>
        <DialogContent>
          <Typography>
            רשימת התלמידים מלאה. האם תרצה לשלוח את טופס אישור ההורים לכל ההורים?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSendDialog(false)}>לא עכשיו</Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowSendDialog(false);
              onSendForms && onSendForms();
            }}
          >
            כן, שלח טפסים
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentsList;
