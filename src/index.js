import React from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource/rubik';
import '@fontsource/secular-one';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store';

// מציאת האלמנט שבו נרצה להריץ את האפליקציה
const container = document.getElementById('root');

// יצירת השורש והפעלת האפליקציה
const root = createRoot(container, {
  future: {
    v7_startTransition: true,
  },
});
root.render(
  <React.StrictMode>
    <CssBaseline />
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
