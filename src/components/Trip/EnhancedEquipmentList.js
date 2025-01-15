import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
} from '@mui/material';
import {
  Share as ShareIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Print as PrintIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import {
  equipmentCategories,
  tripTypes,
  getEquipmentForTripType,
  getTripTypeRecommendations,
} from '../../data/equipmentData';
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';

const s2ab = (s) => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
};

const EnhancedEquipmentList = ({ tripData }) => {
  const printComponentRef = useRef();
  const [selectedEquipment, setSelectedEquipment] = useState({});
  const [quantities, setQuantities] = useState({});
  const [notes, setNotes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedTripTypes, setSelectedTripTypes] = useState([]);
  const [customItems, setCustomItems] = useState({});
  const [savedLists, setSavedLists] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({ category: '', name: '' });
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [listName, setListName] = useState('');

  // טוען את הרשימות השמורות בטעינה
  useEffect(() => {
    const saved = localStorage.getItem('savedEquipmentLists');
    if (saved) {
      setSavedLists(JSON.parse(saved));
    }
  }, []);

  // מעדכן את הציוד המוצג לפי סוג הטיול
  useEffect(() => {
    if (tripData) {
      const recommendations = getTripTypeRecommendations(
        tripData.season,
        tripData.duration,
        tripData.location
      );
      setSelectedTripTypes(recommendations);
    }
  }, [tripData]);

  const handleTripTypeChange = (event) => {
    setSelectedTripTypes(event.target.value);
  };

  const handleToggle = (category, item) => {
    setSelectedEquipment((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: !prev[category]?.[item],
      },
    }));
  };

  const handleQuantityChange = (category, item, value) => {
    setQuantities(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: value
      }
    }));
  };

  const handleNoteChange = (category, item, value) => {
    setNotes(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: value
      }
    }));
  };

  const handleAddCustomItem = () => {
    if (newItem.category && newItem.name) {
      setCustomItems((prev) => ({
        ...prev,
        [newItem.category]: [...(prev[newItem.category] || []), newItem.name],
      }));
      setOpenAddDialog(false);
      setNewItem({ category: '', name: '' });
    }
  };

  const handleSaveList = () => {
    if (listName) {
      const newList = {
        name: listName,
        equipment: selectedEquipment,
        tripTypes: selectedTripTypes,
        date: new Date().toISOString(),
      };
      const updatedLists = [...savedLists, newList];
      setSavedLists(updatedLists);
      localStorage.setItem('savedEquipmentLists', JSON.stringify(updatedLists));
      setOpenSaveDialog(false);
      setListName('');
    }
  };

  const getSelectedItems = () => {
    return Object.entries(selectedEquipment)
      .flatMap(([category, items]) =>
        Object.entries(items)
          .filter(([, isSelected]) => isSelected)
          .map(([item]) => `${item} (${category})`)
      )
      .join('\n');
  };

  const shareViaWhatsApp = () => {
    const selectedItems = getSelectedItems();
    if (selectedItems) {
      const message = `רשימת ציוד לטיול:\n${selectedItems}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
    }
  };

  const shareViaEmail = () => {
    const selectedItems = getSelectedItems();
    if (selectedItems) {
      const subject = 'רשימת ציוד לטיול';
      const body = `רשימת הציוד שלי לטיול:\n${selectedItems}`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  };

  const addToCalendar = () => {
    if (tripData) {
      const event = {
        title: `טיול: ${tripData.name}`,
        description: `רשימת ציוד:\n${getSelectedItems()}`,
        start: tripData.startDate,
        end: tripData.endDate,
      };
      // כאן נוסיף את הלוגיקה להוספה ליומן
    }
  };

  const handleExportToExcel = () => {
    const wb = utils.book_new();
    const ws_data = [['קטגוריה', 'פריט', 'סימון', 'כמות', 'הערות']];

    Object.entries(currentEquipment).forEach(([category, items]) => {
      items.forEach((item) => {
        ws_data.push([
          category,
          item,
          selectedEquipment[category]?.[item] ? '✓' : '',
          quantities[category]?.[item] || '',
          notes[category]?.[item] || ''
        ]);
      });
    });

    const ws = utils.aoa_to_sheet(ws_data);
    utils.book_append_sheet(wb, ws, 'רשימת ציוד');
    
    const wbout = write(wb, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    saveAs(blob, 'equipment_list.xlsx');
  };

  const handlePrint = () => {
    window.print();
  };

  // מקבל את הציוד המותאם לסוגי הטיול שנבחרו
  const currentEquipment = React.useMemo(() => {
    const baseEquipment = getEquipmentForTripType(selectedTripTypes);
    
    // מוסיף פריטים מותאמים אישית
    Object.entries(customItems).forEach(([category, items]) => {
      if (!baseEquipment[category]) {
        baseEquipment[category] = [];
      }
      baseEquipment[category].push(...items);
    });
    
    return baseEquipment;
  }, [selectedTripTypes, customItems]);

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-equipment-list, #printable-equipment-list * {
              visibility: visible;
            }
            #printable-equipment-list {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
            .print-break-after {
              page-break-after: always;
            }
            @page {
              size: A4;
              margin: 2cm;
            }
          }
        `}
      </style>

      <Container>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            רשימת ציוד לטיול
          </Typography>

          {/* מקרא בחלק העליון */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              מקרא:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {Object.entries(tripTypes).map(([type, label]) => (
                <Chip
                  key={type}
                  label={label}
                  color={selectedTripTypes.includes(type) ? 'primary' : 'default'}
                  onClick={() => {
                    if (selectedTripTypes.includes(type)) {
                      setSelectedTripTypes(prev => prev.filter(t => t !== type));
                    } else {
                      setSelectedTripTypes(prev => [...prev, type]);
                    }
                  }}
                />
              ))}
            </Box>
          </Paper>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>סוג טיול</InputLabel>
            <Select
              multiple
              value={selectedTripTypes}
              onChange={handleTripTypeChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={tripTypes[value]} />
                  ))}
                </Box>
              )}
            >
              {Object.entries(tripTypes).map(([type, label]) => (
                <MenuItem key={type} value={type}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="חפש פריט..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
              className="no-print"
            >
              הוסף פריט
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => setOpenSaveDialog(true)}
              className="no-print"
            >
              שמור רשימה
            </Button>
            <IconButton onClick={shareViaWhatsApp} color="primary" className="no-print">
              <WhatsAppIcon />
            </IconButton>
            <IconButton onClick={shareViaEmail} color="primary" className="no-print">
              <EmailIcon />
            </IconButton>
            <IconButton onClick={addToCalendar} color="primary" className="no-print">
              <CalendarIcon />
            </IconButton>
            <IconButton onClick={handlePrint} color="primary" className="no-print">
              <PrintIcon />
            </IconButton>
            <IconButton onClick={handleExportToExcel} color="primary" className="no-print">
              <FileDownloadIcon />
            </IconButton>
          </Box>
        </Box>

        <div id="printable-equipment-list" ref={printComponentRef}>
          <Typography variant="h5" gutterBottom align="center" sx={{ mb: 3 }}>
            רשימת ציוד לטיול {tripData?.name ? `- ${tripData.name}` : ''}
          </Typography>

          {selectedTripTypes.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                סוג טיול:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedTripTypes.map((type) => (
                  <Chip key={type} label={tripTypes[type]} />
                ))}
              </Box>
            </Box>
          )}

          {Object.entries(currentEquipment).map(([category, items], index) => (
            <div key={category} className={index < Object.keys(currentEquipment).length - 1 ? 'print-break-after' : ''}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                {category}
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>פריט</TableCell>
                      <TableCell align="center">סימון</TableCell>
                      <TableCell align="center">כמות</TableCell>
                      <TableCell>הערות</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items
                      .filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((item) => (
                        <TableRow key={item}>
                          <TableCell>{item}</TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={!!selectedEquipment[category]?.[item]}
                              onChange={() => handleToggle(category, item)}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ width: '120px' }}>
                            <TextField
                              type="number"
                              size="small"
                              value={quantities[category]?.[item] || ''}
                              onChange={(e) => handleQuantityChange(category, item, e.target.value)}
                              InputProps={{ 
                                inputProps: { min: 0 },
                                sx: { textAlign: 'center' }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="הוסף הערה..."
                              value={notes[category]?.[item] || ''}
                              onChange={(e) => handleNoteChange(category, item, e.target.value)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          ))}
        </div>

        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {Object.keys(currentEquipment).map((category, index) => (
            <Tab key={category} label={category} />
          ))}
        </Tabs>

        {Object.entries(currentEquipment).map(([category, items], index) => (
          tabIndex === index && (
            <TableContainer component={Paper} key={category} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>פריט</TableCell>
                    <TableCell align="center">סימון</TableCell>
                    <TableCell align="center">כמות</TableCell>
                    <TableCell>הערות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items
                    .filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((item) => (
                      <TableRow key={item}>
                        <TableCell>{item}</TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={!!selectedEquipment[category]?.[item]}
                            onChange={() => handleToggle(category, item)}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ width: '120px' }}>
                          <TextField
                            type="number"
                            size="small"
                            value={quantities[category]?.[item] || ''}
                            onChange={(e) => handleQuantityChange(category, item, e.target.value)}
                            InputProps={{ 
                              inputProps: { min: 0 },
                              sx: { textAlign: 'center' }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="הוסף הערה..."
                            value={notes[category]?.[item] || ''}
                            onChange={(e) => handleNoteChange(category, item, e.target.value)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        ))}

        {/* דיאלוג להוספת פריט */}
        <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
          <DialogTitle>הוסף פריט חדש</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>קטגוריה</InputLabel>
              <Select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              >
                {Object.keys(currentEquipment).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="שם הפריט"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddDialog(false)}>ביטול</Button>
            <Button onClick={handleAddCustomItem} variant="contained">
              הוסף
            </Button>
          </DialogActions>
        </Dialog>

        {/* דיאלוג לשמירת רשימה */}
        <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
          <DialogTitle>שמור רשימה</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="שם הרשימה"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSaveDialog(false)}>ביטול</Button>
            <Button onClick={handleSaveList} variant="contained">
              שמור
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default EnhancedEquipmentList;
