const PIXABAY_API_KEY = '48084149-9fd8634c3fd95f6800ddc9556';
const PIXABAY_API_URL = 'https://pixabay.com/api/';

export const searchPixabayImages = async (query, type, options = {}) => {
  const params = new URLSearchParams({
    key: PIXABAY_API_KEY,
    q: `${query} ${type}`,
    lang: 'en',
    image_type: 'photo',
    per_page: 5,
    ...options
  });

  try {
    console.log(`Searching for images with query: ${query} ${type}`);
    const response = await fetch(`${PIXABAY_API_URL}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch images');
    const data = await response.json();
    console.log('Received images:', data.hits.map(hit => hit.largeImageURL));

    // Select the best matching image
    const bestMatch = data.hits.find(hit => hit.tags.toLowerCase().includes(query.toLowerCase())) || data.hits[0];
    return bestMatch?.largeImageURL || null;
  } catch (error) {
    console.error('Error fetching Pixabay images:', error);
    return null;
  }
};

export const getPixabayImageUrl = (imageId) => {
  return `https://pixabay.com/get/g${imageId}.jpg`;
};
