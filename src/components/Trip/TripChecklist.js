import React, { useState, useEffect } from 'react';
import ParentApprovalForm from './ParentApprovalForm';
import BusInspectionForm from './Forms/BusInspectionForm';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CardActions,
  Grid,
  Tooltip,
  Badge,
  ToggleButtonGroup,
  ToggleButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachFile as AttachFileIcon,
  Warning as WarningIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Event as CalendarIcon,
  Search as SearchIcon,
  ArrowLeft as ArrowLeftIcon,
  Assignment as AssignmentIcon,
  FormatListBulleted as FormatListBulletedIcon,
  AccountTree as AccountTreeIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  Undo as UndoIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  LocalHospital as LocalHospitalIcon,
  ContactPhone as ContactPhoneIcon,
  Edit as EditIcon,
  DirectionsBus as DirectionsBusIcon,
  AssignmentInd as AssignmentIndIcon,
  MedicalServices as MedicalServicesIcon,
  Group as GroupIcon
} from '@mui/icons-material';

const checklistCategories = [
  {
    id: 'preparations',
    title: 'הכנות לפני הטיול',
    categories: [
      {
        id: 'forms',
        title: 'אישורים וטפסים',
        items: [
          {
            id: 'parent_approval',
            title: 'אישורי הורים',
            description: 'איסוף אישורי הורים חתומים מכל התלמידים',
            deadline: 7,
            required: true,
            requiresFile: true,
            type: 'approval'
          },
          {
            id: 'medical_declarations',
            title: 'הצהרות רפואיות',
            description: 'איסוף הצהרות בריאות ומידע על מגבלות רפואיות',
            deadline: 7,
            required: true,
            requiresFile: true,
            type: 'medical'
          },
          {
            id: 'allergies_list',
            title: 'רשימת רגישויות',
            description: 'ריכוז רשימת תלמידים עם רגישויות למזון ותרופות',
            deadline: 7,
            required: true,
            type: 'medical'
          },
          {
            id: 'emergency_contacts',
            title: 'אנשי קשר לחירום',
            description: 'רשימת טלפונים של הורים ואנשי קשר למקרה חירום',
            deadline: 5,
            required: true,
            type: 'contact'
          },
          {
            id: 'insurance_confirmation',
            title: 'אישור ביטוח',
            description: 'וידוא כיסוי ביטוחי לכל המשתתפים',
            deadline: 10,
            required: true,
            requiresFile: true,
            type: 'approval'
          }
        ]
      },
      {
        id: 'logistics',
        title: 'לוגיסטיקה והכנות',
        items: [
          {
            id: 'route_approval',
            title: 'אישור מסלול',
            description: 'תכנון ואישור מסלול הטיול',
            deadline: 21,
            required: true,
            requiresFile: true
          },
          {
            id: 'schedule',
            title: 'לוח זמנים',
            description: 'הכנת לוח זמנים מפורט ליום הטיול',
            deadline: 7,
            required: true,
            requiresFile: true
          },
          {
            id: 'medical_equipment',
            title: 'ציוד רפואי',
            description: 'הכנת ערכת עזרה ראשונה ובדיקת תרופות',
            deadline: 2,
            required: true,
            requiresFile: false
          },
          {
            id: 'contact_list',
            title: 'רשימות קשר',
            description: 'הכנת רשימת טלפונים של הורים וגורמי חירום',
            deadline: 3,
            required: true,
            requiresFile: true
          }
        ]
      },
      {
        id: 'students',
        title: 'ניהול תלמידים',
        items: [
          {
            id: 'student_info',
            title: 'מידע על תלמידים',
            description: 'ריכוז מידע רפואי ומגבלות של תלמידים',
            deadline: 7,
            required: true,
            requiresFile: true
          },
          {
            id: 'student_groups',
            title: 'חלוקה לקבוצות',
            description: 'סידור תלמידים בקבוצות וצוותים',
            deadline: 3,
            required: true,
            requiresFile: true
          }
        ]
      }
    ]
  },
  {
    id: 'trip_day',
    title: 'יום הטיול',
    categories: [
      {
        id: 'morning_checklist',
        title: 'בדיקות בוקר',
        items: [
          {
            id: 'bus_check',
            title: 'בדיקת אוטובוס',
            description: 'בדיקת תקינות ובטיחות האוטובוס',
            deadline: 0,
            required: true,
            requiresFile: false
          },
          {
            id: 'attendance_check',
            title: 'בדיקת נוכחות',
            description: 'ספירת תלמידים והתאמה לרשימות',
            deadline: 0,
            required: true,
            requiresFile: false
          },
          {
            id: 'equipment_check',
            title: 'בדיקת ציוד',
            description: 'וידוא שכל הציוד הנדרש נמצא',
            deadline: 0,
            required: true,
            requiresFile: false
          }
        ]
      },
      {
        id: 'during_trip',
        title: 'במהלך הטיול',
        items: [
          {
            id: 'periodic_count',
            title: 'ספירה תקופתית',
            description: 'ספירת תלמידים בכל תחנה/עצירה',
            deadline: 0,
            required: true,
            requiresFile: false
          },
          {
            id: 'water_breaks',
            title: 'הפסקות מים',
            description: 'וידוא שתייה סדירה של התלמידים',
            deadline: 0,
            required: true,
            requiresFile: false
          },
          {
            id: 'medical_monitoring',
            title: 'מעקב רפואי',
            description: 'מעקב אחר תלמידים עם צרכים מיוחדים',
            deadline: 0,
            required: true,
            requiresFile: false
          }
        ]
      },
      {
        id: 'end_of_trip',
        title: 'סיום הטיול',
        items: [
          {
            id: 'final_count',
            title: 'ספירה סופית',
            description: 'ספירת תלמידים לפני חזרה',
            deadline: 0,
            required: true,
            requiresFile: false
          },
          {
            id: 'equipment_collection',
            title: 'איסוף ציוד',
            description: 'וידוא שכל הציוד נאסף',
            deadline: 0,
            required: true,
            requiresFile: false
          },
          {
            id: 'departure_report',
            title: 'דיווח יציאה',
            description: 'דיווח על יציאה חזרה לבית הספר',
            deadline: 0,
            required: true,
            requiresFile: false
          }
        ]
      }
    ]
  }
];

const TripChecklist = ({ tripData, onUpdateChecklist }) => {
  const [checklist, setChecklist] = useState({});
  const [expandedPhases, setExpandedPhases] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [uploadDialog, setUploadDialog] = useState({ open: false, item: null });
  const [customItems, setCustomItems] = useState([]);
  const [newItemDialog, setNewItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '', deadline: 7 });
  const [view, setView] = useState('next_tasks');
  const [searchText, setSearchText] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (tripData?.startDate) {
      const timer = setInterval(() => {
        const tripDate = new Date(tripData.startDate);
        const now = new Date();
        const diff = tripDate.getTime() - now.getTime();

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);

          setCountdown({ days, hours, minutes, seconds });
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [tripData?.startDate]);

  const calculateProgress = (categoryId) => {
    const foundCategory = checklistCategories
      .flatMap(phase => phase.categories)
      .find(cat => cat.id === categoryId);
    
    if (!foundCategory) return 0;
    
    const items = foundCategory.items;
    if (!items || items.length === 0) return 0;
    
    const completedItems = items.filter(item => checklist[item.id]?.completed).length;
    return Math.round((completedItems / items.length) * 100);
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!tripData?.startDate) return null;
    const tripDate = new Date(tripData.startDate);
    const deadlineDate = new Date(tripDate);
    deadlineDate.setDate(deadlineDate.getDate() - deadline);
    const today = new Date();
    const daysUntil = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return daysUntil;
  };

  const getItemStatus = (item) => {
    const daysUntil = getDaysUntilDeadline(item.deadline);
    const itemState = checklist[item.id];

    if (itemState?.completed) {
      return { color: 'success', icon: <CheckCircleIcon />, text: 'הושלם' };
    } else if (daysUntil !== null) {
      if (daysUntil < 0) {
        return { color: 'error', icon: <WarningIcon />, text: 'באיחור' };
      } else if (daysUntil <= 3) {
        return { color: 'warning', icon: <ScheduleIcon />, text: `${daysUntil} ימים` };
      }
    }
    return { color: 'default', icon: <ScheduleIcon />, text: `${daysUntil} ימים` };
  };

  const handleTogglePhase = (phaseId) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const handleToggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const getCategorySummary = (category) => {
    const total = category.items.length;
    const completed = category.items.filter(item => checklist[item.id]?.completed).length;
    const required = category.items.filter(item => item.required && !checklist[item.id]?.completed).length;
    const urgent = category.items.filter(item => {
      const daysUntil = getDaysUntilDeadline(item.deadline);
      return daysUntil !== null && daysUntil <= 3 && !checklist[item.id]?.completed;
    }).length;

    return { total, completed, required, urgent };
  };

  const handleToggleItem = (itemId) => {
    const newChecklist = {
      ...checklist,
      [itemId]: {
        ...checklist[itemId],
        completed: !checklist[itemId]?.completed,
        completedAt: !checklist[itemId]?.completed ? Date.now() : null
      }
    };
    setChecklist(newChecklist);
    onUpdateChecklist?.(newChecklist);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setChecklist(prev => ({
        ...prev,
        [uploadDialog.item.id]: {
          ...prev[uploadDialog.item.id],
          file: file.name
        }
      }));
    }
    setUploadDialog({ open: false, item: null });
  };

  const handleAddCustomItem = () => {
    const itemId = `custom_${Date.now()}`;
    const newCustomItem = {
      ...newItem,
      id: itemId,
      required: false,
      requiresFile: false
    };
    setCustomItems(prev => [...prev, newCustomItem]);
    setNewItemDialog(false);
    setNewItem({ title: '', description: '', deadline: 7 });
  };

  const getNextTasks = () => {
    const allTasks = checklistCategories.flatMap(phase =>
      phase.categories.flatMap(category =>
        category.items.map(item => ({
          ...item,
          phase: phase.title,
          category: category.title
        }))
      )
    );

    return allTasks
      .filter(item => !checklist[item.id]?.completed)
      .sort((a, b) => {
        const aDays = getDaysUntilDeadline(a.deadline);
        const bDays = getDaysUntilDeadline(b.deadline);
        if (aDays <= 3 && bDays > 3) return -1;
        if (bDays <= 3 && aDays > 3) return 1;
        if (a.required !== b.required) return a.required ? -1 : 1;
        return (aDays || 0) - (bDays || 0);
      })
      .slice(0, 5);
  };

  const getOverdueTasks = () => {
    const allTasks = checklistCategories.flatMap(phase =>
      phase.categories.flatMap(category =>
        category.items.map(item => ({
          ...item,
          phase: phase.title,
          category: category.title
        }))
      )
    );

    return allTasks.filter(item => {
      if (checklist[item.id]?.completed) return false;
      const daysUntil = getDaysUntilDeadline(item.deadline);
      return daysUntil !== null && daysUntil < 0;
    });
  };

  const getCompletedTasks = () => {
    return checklistCategories
      .flatMap(phase =>
        phase.categories.flatMap(category =>
          category.items.map(item => ({
            ...item,
            phase: phase.title,
            category: category.title
          }))
        )
      )
      .filter(item => checklist[item.id]?.completed);
  };

  const handleOpenApprovalForm = (studentId) => {
    setSelectedStudent(studentId);
    setShowApprovalForm(true);
  };

  const handleApprovalSubmit = (formData) => {
    console.log('Form submitted:', formData);
    setShowApprovalForm(false);
  };

  const renderFormsSection = (items) => {
    const groupedItems = items.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {});

    const typeIcons = {
      approval: <DescriptionIcon color="primary" />,
      medical: <LocalHospitalIcon color="error" />,
      contact: <ContactPhoneIcon color="success" />
    };

    const typeLabels = {
      approval: 'אישורים נדרשים',
      medical: 'מידע רפואי',
      contact: 'פרטי קשר'
    };

    return (
      <Box>
        {Object.entries(groupedItems).map(([type, items]) => (
          <Card key={type} sx={{ mb: 2, bgcolor: 'background.paper' }}>
            <CardHeader
              avatar={typeIcons[type]}
              title={typeLabels[type]}
              subheader={`${items.filter(item => checklist[item.id]?.completed).length}/${items.length} הושלמו`}
            />
            <CardContent>
              <List>
                {items.map(item => (
                  <ListItem
                    key={item.id}
                    sx={{
                      mb: 1,
                      bgcolor: checklist[item.id]?.completed ? 'success.light' : 'background.default',
                      borderRadius: 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={checklist[item.id]?.completed || false}
                        onChange={() => handleToggleItem(item.id)}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {item.title}
                          </Typography>
                          {item.requiresFile && (
                            <Tooltip title="נדרש למלא טופס">
                              <Button
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => handleOpenApprovalForm(item.id)}
                              >
                                מלא טופס
                              </Button>
                            </Tooltip>
                          )}
                          {getDaysUntilDeadline(item.deadline) <= 3 && (
                            <Tooltip title="דחוף!">
                              <Chip
                                label={`${getDaysUntilDeadline(item.deadline)} ימים`}
                                size="small"
                                color="error"
                                icon={<ScheduleIcon />}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      }
                      secondary={item.description}
                    />
                    {checklist[item.id]?.completed && (
                      <ListItemSecondaryAction>
                        <Tooltip title="הושלם בתאריך">
                          <Typography variant="caption" color="text.secondary">
                            {new Date(checklist[item.id]?.completedAt || Date.now()).toLocaleDateString()}
                          </Typography>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        ))}

        <Dialog
          open={showApprovalForm}
          onClose={() => setShowApprovalForm(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            <ParentApprovalForm
              studentName="ישראל ישראלי"
              tripDetails={`טיול שנתי לצפון (${new Date(tripData?.startDate).toLocaleDateString()} - ${new Date(tripData?.endDate).toLocaleDateString()})`}
              onSubmit={handleApprovalSubmit}
            />
          </DialogContent>
        </Dialog>
      </Box>
    );
  };

  const renderContent = () => {
    switch (view) {
      case 'next_tasks':
        return (
          <Card>
            <CardHeader 
              title="המשימות הבאות שלך"
              subheader="המשימות הדחופות והחשובות ביותר"
            />
            <CardContent>
              <List>
                {getNextTasks().map(item => (
                  <ListItem
                    key={item.id}
                    sx={{
                      mb: 1,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      boxShadow: 1
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        checked={checklist[item.id]?.completed || false}
                        onChange={() => handleToggleItem(item.id)}
                        color={getItemStatus(item).color}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1">
                            {item.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({item.phase} - {item.category})
                          </Typography>
                          {item.required && (
                            <Chip 
                              size="small" 
                              color="error" 
                              label="חובה"
                              sx={{ height: 20 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={item.description}
                    />
                    <ListItemSecondaryAction>
                      {item.deadline > 0 && (
                        <Chip
                          size="small"
                          icon={<CalendarIcon />}
                          label={`${getDaysUntilDeadline(item.deadline)} ימים`}
                          color={getItemStatus(item).color}
                          variant="outlined"
                        />
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                <ListItem
                  sx={{ 
                    justifyContent: 'center',
                    mt: 2
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setView('all')}
                    endIcon={<ArrowLeftIcon />}
                  >
                    צפה בכל המשימות
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        );
      case 'all':
        return (
          <Card>
            <CardHeader 
              title="כל המשימות"
              action={
                <TextField
                  size="small"
                  placeholder="חיפוש משימות..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              }
            />
            <CardContent>
              <List>
                {checklistCategories
                  .flatMap(phase =>
                    phase.categories.flatMap(category =>
                      category.items
                        .filter(item => 
                          item.title.includes(searchText) || 
                          item.description.includes(searchText)
                        )
                        .map(item => ({
                          ...item,
                          phase: phase.title,
                          category: category.title
                        }))
                    )
                  )
                  .map(item => (
                    <ListItem
                      key={item.id}
                      sx={{
                        mb: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        boxShadow: 1
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={checklist[item.id]?.completed || false}
                          onChange={() => handleToggleItem(item.id)}
                          color={getItemStatus(item).color}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                              variant="body1"
                              sx={{
                                textDecoration: checklist[item.id]?.completed ? 'line-through' : 'none',
                                color: checklist[item.id]?.completed ? 'text.secondary' : 'text.primary'
                              }}
                            >
                              {item.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({item.phase} - {item.category})
                            </Typography>
                            {item.required && (
                              <Chip 
                                size="small" 
                                color="error" 
                                label="חובה"
                                sx={{ height: 20 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={item.description}
                      />
                      <ListItemSecondaryAction>
                        {item.deadline > 0 && (
                          <Chip
                            size="small"
                            icon={<CalendarIcon />}
                            label={`${getDaysUntilDeadline(item.deadline)} ימים`}
                            color={getItemStatus(item).color}
                            variant="outlined"
                          />
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Card>
        );
      case 'by_phase':
        return (
          <Box>
            {checklistCategories.map(phase => (
              <Accordion key={phase.id} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{phase.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {phase.categories.map(category => (
                    <Box key={category.id} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                        {category.title}
                      </Typography>
                      {category.id === 'forms' ? (
                        renderFormsSection(category.items)
                      ) : (
                        <List>
                          {category.items.map(item => (
                            <ListItem
                              key={item.id}
                              sx={{
                                mb: 1,
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                boxShadow: 1
                              }}
                            >
                              <ListItemIcon>
                                <Checkbox
                                  checked={checklist[item.id]?.completed || false}
                                  onChange={() => handleToggleItem(item.id)}
                                  color={getItemStatus(item).color}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography 
                                      variant="body1"
                                      sx={{
                                        textDecoration: checklist[item.id]?.completed ? 'line-through' : 'none',
                                        color: checklist[item.id]?.completed ? 'text.secondary' : 'text.primary'
                                      }}
                                    >
                                      {item.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      ({item.phase} - {item.category})
                                    </Typography>
                                    {item.required && (
                                      <Chip 
                                        size="small" 
                                        color="error" 
                                        label="חובה"
                                        sx={{ height: 20 }}
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={item.description}
                              />
                              <ListItemSecondaryAction>
                                {item.deadline > 0 && (
                                  <Chip
                                    size="small"
                                    icon={<CalendarIcon />}
                                    label={`${getDaysUntilDeadline(item.deadline)} ימים`}
                                    color={getItemStatus(item).color}
                                    variant="outlined"
                                  />
                                )}
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>צ'קליסט הכנה לטיול</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, newView) => newView && setView(newView)}
            size="small"
          >
            <ToggleButton value="next_tasks">
              <Tooltip title="משימות הבאות">
                <FormatListBulletedIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="by_phase">
              <Tooltip title="לפי שלבים">
                <AccountTreeIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            minHeight: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6">ימים לטיול</Typography>
              </Box>
              {tripData?.startDate ? (
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    mb: 2 
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                        {countdown.days || 0}
                      </Typography>
                      <Typography variant="body2">ימים</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    justifyContent: 'center',
                    '& > div': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      borderRadius: 1,
                      p: 1
                    }
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5">{countdown.hours || 0}</Typography>
                      <Typography variant="caption">שעות</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5">{countdown.minutes || 0}</Typography>
                      <Typography variant="caption">דקות</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5">{countdown.seconds || 0}</Typography>
                      <Typography variant="caption">שניות</Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center' }}>
                  לא נקבע תאריך
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText', minHeight: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6">משימות שהושלמו</Typography>
              </Box>
              <Typography variant="h4">
                {Object.values(checklist).filter(item => item.completed).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.main', color: 'error.contrastText', minHeight: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <WarningIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6">משימות באיחור</Typography>
              </Box>
              <Typography variant="h4">
                {getOverdueTasks().length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'warning.main', 
            color: 'warning.contrastText',
            minHeight: '100%',
            cursor: 'pointer'
          }}
          onClick={() => setView('next_tasks')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <ScheduleIcon sx={{ fontSize: 32, mr: 1 }} />
                <Typography variant="h6">משימות לביצוע</Typography>
              </Box>
              <Typography variant="h4">
                {getNextTasks().length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {renderContent()}
    </Box>
  );
};

export default TripChecklist;
