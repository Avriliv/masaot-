import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Grid,
  useTheme,
  useMediaQuery,
  Stack,
  Card,
  CardContent,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Description as DocumentIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  FileCopy as FileIcon,
  Assignment as ChecklistIcon
} from '@mui/icons-material';

const DocumentCategory = {
  GENERAL: 'כללי',
  SAFETY: 'בטיחות',
  MEDICAL: 'רפואי',
  LOGISTICS: 'לוגיסטיקה',
  PERMISSIONS: 'אישורים'
};

const TripDocuments = ({ tripId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [documents, setDocuments] = useState([
    { 
      id: 1, 
      name: 'תיק טיול.pdf', 
      category: DocumentCategory.GENERAL,
      size: 1024 * 1024, 
      uploadDate: new Date().toISOString() 
    },
    { 
      id: 2, 
      name: 'אישור בטחוני.pdf', 
      category: DocumentCategory.SAFETY,
      size: 512 * 1024, 
      uploadDate: new Date().toISOString() 
    }
  ]);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleUpload = async (files) => {
    setLoading(true);
    setError(null);
    try {
      const newDocs = Array.from(files).map(file => ({
        id: Math.random().toString(),
        name: file.name,
        category: selectedCategory || DocumentCategory.GENERAL,
        size: file.size,
        uploadDate: new Date().toISOString()
      }));
      setDocuments(prev => [...prev, ...newDocs]);
      setUploadDialog(false);
    } catch (err) {
      setError('אירעה שגיאה בהעלאת הקבצים');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId) => {
    try {
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    } catch (err) {
      setError('אירעה שגיאה במחיקת הקובץ');
    }
  };

  const handleDownload = async (doc) => {
    try {
      console.log('Downloading:', doc.name);
    } catch (err) {
      setError('אירעה שגיאה בהורדת הקובץ');
    }
  };

  const DocumentList = ({ category }) => {
    const filteredDocs = documents.filter(doc => doc.category === category);
    
    if (isMobile) {
      return (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            {category}
          </Typography>
          <Stack spacing={2}>
            {filteredDocs.map((doc) => (
              <Card key={doc.id} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <FileIcon color="primary" sx={{ mt: 0.5 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {doc.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {`${(doc.size / 1024 / 1024).toFixed(2)} MB • ${new Date(doc.uploadDate).toLocaleDateString('he-IL')}`}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(doc)}
                    >
                      הורד
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(doc.id)}
                    >
                      מחק
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
            {filteredDocs.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center">
                אין מסמכים בקטגוריה זו
              </Typography>
            )}
          </Stack>
        </Box>
      );
    }

    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: { sm: 2, md: 3 }, 
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Typography variant="h6" gutterBottom color="primary">
          {category}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List sx={{ flexGrow: 1 }}>
          {filteredDocs.map((doc) => (
            <ListItem
              key={doc.id}
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <Tooltip title="הורד">
                    <IconButton onClick={() => handleDownload(doc)} size="small">
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="מחק">
                    <IconButton onClick={() => handleDelete(doc.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            >
              <ListItemIcon>
                <FileIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={doc.name}
                secondary={`${(doc.size / 1024 / 1024).toFixed(2)} MB • ${new Date(doc.uploadDate).toLocaleDateString('he-IL')}`}
              />
            </ListItem>
          ))}
          {filteredDocs.length === 0 && (
            <Typography variant="body2" color="text.secondary" align="center">
              אין מסמכים בקטגוריה זו
            </Typography>
          )}
        </List>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2,
        mb: 3 
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          color="primary" 
          fontWeight="bold"
          gutterBottom={isMobile}
        >
          מסמכי הטיול
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialog(true)}
          fullWidth={isMobile}
        >
          העלאת מסמכים
        </Button>
      </Box>

      <Grid container spacing={3}>
        {Object.values(DocumentCategory).map((category) => (
          <Grid item xs={12} md={6} key={category}>
            <DocumentList category={category} />
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={uploadDialog} 
        onClose={() => setUploadDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>העלאת מסמכים</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              בחר קטגוריה:
            </Typography>
            <Grid container spacing={1}>
              {Object.values(DocumentCategory).map((category) => (
                <Grid item key={category}>
                  <Chip
                    label={category}
                    color={selectedCategory === category ? "primary" : "default"}
                    onClick={() => setSelectedCategory(category)}
                    icon={<ChecklistIcon />}
                    variant={selectedCategory === category ? "filled" : "outlined"}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          
          <input
            type="file"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            style={{ display: 'none' }}
            id="file-upload"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ mt: 2 }}
            >
              בחר קבצים להעלאה
            </Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>ביטול</Button>
          <Button
            variant="contained"
            disabled={loading}
            onClick={() => document.getElementById('file-upload').click()}
          >
            {loading ? <CircularProgress size={24} /> : 'העלה'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripDocuments;
