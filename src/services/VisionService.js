const VISION_API_KEY = process.env.REACT_APP_GOOGLE_CLOUD_VISION_API_KEY;
const VISION_API_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';

export const analyzeImage = async (imageData) => {
  try {
    const requestBody = {
      requests: [
        {
          image: {
            content: imageData.split(',')[1] // Remove the data URL prefix
          },
          features: [
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 5
            },
            {
              type: 'LABEL_DETECTION',
              maxResults: 5
            }
          ]
        }
      ]
    };

    const response = await fetch(`${VISION_API_ENDPOINT}?key=${VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('Vision API request failed');
    }

    const data = await response.json();
    
    // Process and combine results
    const objects = data.responses[0].localizedObjectAnnotations || [];
    const labels = data.responses[0].labelAnnotations || [];
    
    // Match with our database
    const results = {
      detectedObjects: objects.map(obj => ({
        name: obj.name,
        confidence: obj.score
      })),
      labels: labels.map(label => ({
        description: label.description,
        confidence: label.score
      }))
    };

    return results;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};
