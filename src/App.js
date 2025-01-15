import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './components/NotFound';
import Map from './components/Map/Map';
import Navbar from './components/Navbar';
import HomePage from './components/LandingPage';
import MyTrips from './components/myTrips/MyTrips';
import TripPlanningSteps from './components/planning/TripPlanningSteps';
import WeatherPage from './pages/WeatherPage';
import ParticipantsManagement from './components/Participants/ParticipantsManagement';
import SecurityManagement from './components/Security/SecurityManagement';
import LogisticsManagement from './components/Logistics/LogisticsManagement';
import DashboardPage from './pages/DashboardPage';
import TripBagView from './components/tripBag/TripBagView';
import TripDetails from './components/Trip/TripDetails';
import ParentalApprovalForm from './components/approvals/ParentalApprovalForm';
import LearningCenter from './components/Learning/LearningCenter';
import LiveTrackingView from './components/LiveTracking/LiveTrackingView';
import { TripProvider } from './context/TripContext';
import { TripsProvider } from './context/TripsContext';

// Create rtl cache
const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create theme
const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
  },
  typography: {
    fontFamily: [
      'Rubik',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});

// יצירת Layout component
const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

// הגדרת נתיבי האפליקציה
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <TripsProvider>
        <TripProvider>
          <Layout />
        </TripProvider>
      </TripsProvider>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'map',
        element: <Map />
      },
      {
        path: 'my-trips',
        element: <MyTrips />
      },
      {
        path: 'new-trip',
        element: (
          <TripProvider>
            <TripPlanningSteps />
          </TripProvider>
        )
      },
      {
        path: 'weather',
        element: <WeatherPage />
      },
      {
        path: 'participants',
        element: <ParticipantsManagement />
      },
      {
        path: 'security',
        element: <SecurityManagement />
      },
      {
        path: 'logistics',
        element: <LogisticsManagement />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />
      },
      {
        path: 'trip-bag',
        element: <TripBagView />
      },
      {
        path: 'trip-details',
        element: <TripDetails />
      },
      {
        path: 'trip/:id',
        element: <TripDetails />
      },
      {
        path: 'parental-approval',
        element: <ParentalApprovalForm />
      },
      {
        path: 'learning-center',
        element: <LearningCenter />
      },
      {
        path: 'live-tracking',
        element: <LiveTrackingView />
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true
  }
});

function App() {
  return (
    <ErrorBoundary>
      <CacheProvider value={rtlCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RouterProvider router={router} />
        </ThemeProvider>
      </CacheProvider>
    </ErrorBoundary>
  );
}

export default App;
