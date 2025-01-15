import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocalFlorist as PlantIcon,
  Pets as AnimalIcon,
  WaterDrop as WaterfallIcon,
  Warning as WarningIcon,
  CameraAlt as CameraIcon
} from '@mui/icons-material';
import { plants, animals, seasonalInfo, loadAnimalImages } from '../../data/natureData';
import { searchPixabayImages } from '../../services/PixabayService';
import SpeciesIdentifier from './SpeciesIdentifier';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const LearningCenter = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [plantImages, setPlantImages] = useState({});
  const [animalImages, setAnimalImages] = useState({});

  useEffect(() => {
    const loadImages = async () => {
      try {
        // Load plant images
        for (const plant of plants) {
          const imageUrl = await searchPixabayImages(plant.latinName + ' flower');
          if (imageUrl) {
            setPlantImages(prev => ({ ...prev, [plant.id]: imageUrl }));
          }
        }

        const updatedAnimals = await loadAnimalImages();
        setAnimalImages(updatedAnimals.reduce((acc, animal) => ({
          ...acc,
          [animal.id]: animal.image
        }), {}));
      } catch (error) {
        console.error('Error loading animal images:', error);
      }
    };

    loadImages();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderPlantCard = (plant) => (
    <Grid item xs={12} sm={6} md={4} key={plant.id}>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={plantImages[plant.id] || plant.image}
          alt={plant.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {plant.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {plant.latinName}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {plant.isProtected && (
              <Chip 
                icon={<PlantIcon />} 
                label="צמח מוגן" 
                color="success" 
                size="small" 
              />
            )}
            {plant.isPoisonous && (
              <Chip 
                icon={<WarningIcon />} 
                label="צמח רעיל" 
                color="error" 
                size="small" 
              />
            )}
          </Box>

          <Typography variant="body2">
            {plant.description}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderAnimalCard = (animal) => (
    <Grid item xs={12} sm={6} md={4} key={animal.id}>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={animalImages[animal.id] || animal.image}
          alt={animal.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {animal.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {animal.latinName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {animal.isEndemic && (
              <Chip 
                icon={<AnimalIcon />} 
                label="מין אנדמי" 
                color="primary" 
                size="small" 
              />
            )}
          </Box>

          <Typography variant="body2" paragraph>
            {animal.description}
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              אזור מחייה:
            </Typography>
            <Typography variant="body2">
              {animal.habitat}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderSeasonalInfo = () => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        מידע עונתי ומפלים
      </Typography>
      
      <Grid container spacing={4}>
        {/* מפלים */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <WaterfallIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                מפלי מים
              </Typography>
              {seasonalInfo.waterfalls.map((waterfall) => (
                <Box key={waterfall.id} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {waterfall.name}
                  </Typography>
                  <Chip 
                    label={waterfall.status === 'active' ? 'פעיל' : 'לא פעיל'}
                    color={waterfall.status === 'active' ? 'success' : 'default'}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    עדכון אחרון: {waterfall.lastUpdate}
                  </Typography>
                  <ul style={{ margin: '8px 0', paddingInlineStart: '20px' }}>
                    {waterfall.tips.map((tip, index) => (
                      <li key={index}>
                        <Typography variant="body2">{tip}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* טיפים עונתיים */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                טיפים עונתיים
              </Typography>
              {Object.entries(seasonalInfo.seasonalTips).map(([season, tips]) => (
                <Box key={season} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {season === 'winter' && 'חורף'}
                    {season === 'spring' && 'אביב'}
                    {season === 'summer' && 'קיץ'}
                    {season === 'autumn' && 'סתיו'}
                  </Typography>
                  <ul style={{ margin: '8px 0', paddingInlineStart: '20px' }}>
                    {tips.map((tip, index) => (
                      <li key={index}>
                        <Typography variant="body2">{tip}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="learning center tabs"
          centered
        >
          <Tab icon={<PlantIcon />} label="צמחים" />
          <Tab icon={<AnimalIcon />} label="בעלי חיים" />
          <Tab icon={<WaterfallIcon />} label="מידע עונתי" />
          <Tab icon={<CameraIcon />} label="זיהוי מינים" />
        </Tabs>

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="חיפוש..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              maxWidth: 600, 
              mx: 'auto', 
              display: 'block',
              bgcolor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.2)',
                },
              }
            }}
          />
        </Box>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
          צמחים
        </Typography>
        <Grid container spacing={4}>
          {plants
            .filter(plant => 
              plant.name.includes(searchTerm) || 
              plant.latinName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(renderPlantCard)}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
          בעלי חיים
        </Typography>
        <Grid container spacing={4}>
          {animals
            .filter(animal => 
              animal.name.includes(searchTerm) || 
              animal.latinName.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(renderAnimalCard)}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {renderSeasonalInfo()}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
          זיהוי צמחים ובעלי חיים
        </Typography>
        <Typography variant="body1" paragraph>
          צלמו צמח או בעל חיים כדי לזהות אותו. המערכת תנסה להתאים את התמונה למאגר המינים שלנו.
        </Typography>
        <SpeciesIdentifier />
      </TabPanel>
    </Container>
  );
};

export default LearningCenter;
