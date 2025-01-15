import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Fab,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { DataGrid, heIL } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { useTrip } from '../../context/TripContext';

const TripEquipmentManager = ({ tripId }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const { tripState } = useTrip();

  // הגדרת העמודות
  const columns = [
    {
      field: 'category',
      headerName: 'קטגוריה',
      width: 130,
    },
    {
      field: 'name',
      headerName: 'שם הפריט',
      width: 200,
      editable: true,
    },
    {
      field: 'quantity',
      headerName: 'כמות',
      width: 100,
      type: 'number',
      editable: true,
    },
    {
      field: 'weight',
      headerName: 'משקל (גרם)',
      width: 130,
      type: 'number',
      editable: true,
    },
    {
      field: 'status',
      headerName: 'סטטוס',
      width: 130,
      type: 'singleSelect',
      valueOptions: ['packed', 'missing', 'pending'],
      editable: true,
    },
    {
      field: 'assignedTo',
      headerName: 'אחראי',
      width: 150,
      editable: true,
    },
    {
      field: 'notes',
      headerName: 'הערות',
      width: 200,
      editable: true,
    },
    {
      field: 'actions',
      headerName: 'פעולות',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // נתונים לדוגמה
  const rows = [
    {
      id: 1,
      category: 'ביגוד',
      name: 'חולצה טרמית',
      quantity: 2,
      weight: 200,
      status: 'packed',
      assignedTo: 'דני',
      notes: 'שכבה ראשונה'
    },
  ];

  // הגדרות נושא RTL
  const theme = createTheme(
    {
      direction: 'rtl',
    },
    heIL
  );

  return (
    <ThemeProvider theme={theme}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ width: '100%', height: 400, mt: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="ציוד אישי" value="personal" />
            <Tab label="ציוד קבוצתי" value="group" />
          </Tabs>

          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            checkboxSelection
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                direction: 'rtl',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                color: 'text.secondary',
                fontSize: '1rem',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          />

          <Tooltip title="הוסף פריט">
            <Fab
              color="primary"
              size="medium"
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                '&:hover': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s',
                },
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
      </motion.div>
    </ThemeProvider>
  );
};

export default TripEquipmentManager;
