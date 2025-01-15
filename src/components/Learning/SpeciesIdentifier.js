import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Dialog,
  IconButton
} from '@mui/material';
import { Camera as CameraIcon, Close as CloseIcon } from '@mui/icons-material';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import Webcam from 'react-webcam';
import { animals, plants } from '../../data/natureData';

const SpeciesIdentifier = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [model, setModel] = useState(null);
  const webcamRef = useRef(null);

  // Load TensorFlow model when component mounts
  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
      } catch (error) {
        console.error('Error loading TensorFlow model:', error);
      }
    };
    loadModel();
  }, []);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('לא הצלחנו לגשת למצלמה. אנא ודאו שנתתם הרשאת גישה למצלמה.');
    }
  };

  const stopCamera = () => {
    setIsCapturing(false);
  };

  const matchWithDatabase = (predictions) => {
    const matches = [];

    // Helper function to calculate similarity score
    const calculateSimilarity = (prediction, dbName) => {
      const predWords = prediction.toLowerCase().split(' ');
      const dbWords = dbName.toLowerCase().split(' ');
      let matchCount = 0;

      for (const predWord of predWords) {
        if (dbWords.some(dbWord => dbWord.includes(predWord) || predWord.includes(dbWord))) {
          matchCount++;
        }
      }

      return matchCount / Math.max(predWords.length, dbWords.length);
    };

    // Check animals
    for (const animal of animals) {
      for (const prediction of predictions) {
        const similarity = calculateSimilarity(prediction.className, animal.latinName);
        if (similarity > 0.3) { // Lower threshold for better matches
          matches.push({
            type: 'חיה',
            item: animal,
            confidence: prediction.probability * similarity
          });
        }
      }
    }

    // Check plants
    for (const plant of plants) {
      for (const prediction of predictions) {
        const similarity = calculateSimilarity(prediction.className, plant.latinName);
        if (similarity > 0.3) { // Lower threshold for better matches
          matches.push({
            type: 'צמח',
            item: plant,
            confidence: prediction.probability * similarity
          });
        }
      }
    }

    // Sort by confidence and return top 3
    return matches
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  };

  const captureImage = async () => {
    if (!webcamRef.current || !model) return;

    try {
      setAnalyzing(true);

      // Get image from webcam
      const imageSrc = webcamRef.current.getScreenshot();
      
      // Create an HTML image element
      const img = new Image();
      img.src = imageSrc;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Classify the image
      const predictions = await model.classify(img);
      
      // Match with our database
      const matches = matchWithDatabase(predictions);
      setResults(matches);

      // Stop camera
      stopCamera();
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('אירעה שגיאה בזיהוי התמונה. אנא נסו שוב.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Dialog 
        open={isCapturing} 
        fullScreen 
        onClose={stopCamera}
      >
        <Box sx={{ 
          position: 'relative', 
          height: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
            onClick={stopCamera}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ 
            flexGrow: 1,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: 'environment'
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Box>

          <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Button
              variant="contained"
              fullWidth
              onClick={captureImage}
              disabled={analyzing || !model}
            >
              {analyzing ? 'מזהה...' : 'צלם תמונה'}
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Card>
        <CardContent>
          {!model ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>טוען את מודל הזיהוי...</Typography>
            </Box>
          ) : (
            <>
              {results ? (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    תוצאות הזיהוי:
                  </Typography>
                  <List>
                    {results.map((result, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`${result.item.name} (${result.type})`}
                          secondary={`רמת ביטחון: ${Math.round(result.confidence * 100)}%`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : null}

              <Button
                variant="contained"
                startIcon={<CameraIcon />}
                onClick={startCamera}
                fullWidth
                sx={{ mt: 2 }}
              >
                פתח מצלמה
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SpeciesIdentifier;
