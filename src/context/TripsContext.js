import React, { createContext, useContext, useReducer, useEffect } from 'react';

const TripsContext = createContext();

const initialState = {
  activeTrips: [],
  plannedTrips: [],
  completedTrips: [],
  lastUpdate: null
};

function tripsReducer(state, action) {
  switch (action.type) {
    case 'ADD_TRIP':
      const newTrip = {
        ...action.payload,
        status: 'planned',
        lastUpdate: new Date().toISOString()
      };
      return {
        ...state,
        plannedTrips: [...state.plannedTrips, newTrip],
        lastUpdate: new Date().toISOString()
      };

    case 'START_TRIP':
      const tripToStart = state.plannedTrips.find(trip => trip.id === action.payload);
      if (!tripToStart) return state;

      const startedTrip = {
        ...tripToStart,
        status: 'active',
        startTime: new Date().toISOString(),
        currentLocation: null,
        participants: tripToStart.participants || []
      };

      return {
        ...state,
        plannedTrips: state.plannedTrips.filter(trip => trip.id !== action.payload),
        activeTrips: [...state.activeTrips, startedTrip],
        lastUpdate: new Date().toISOString()
      };

    case 'UPDATE_TRIP_LOCATION':
      return {
        ...state,
        activeTrips: state.activeTrips.map(trip => 
          trip.id === action.payload.tripId
            ? { ...trip, currentLocation: action.payload.location, lastUpdate: new Date().toISOString() }
            : trip
        ),
        lastUpdate: new Date().toISOString()
      };

    case 'COMPLETE_TRIP':
      const tripToComplete = state.activeTrips.find(trip => trip.id === action.payload);
      if (!tripToComplete) return state;

      const completedTrip = {
        ...tripToComplete,
        status: 'completed',
        endTime: new Date().toISOString()
      };

      return {
        ...state,
        activeTrips: state.activeTrips.filter(trip => trip.id !== action.payload),
        completedTrips: [...state.completedTrips, completedTrip],
        lastUpdate: new Date().toISOString()
      };

    default:
      return state;
  }
}

export function TripsProvider({ children }) {
  const [state, dispatch] = useReducer(tripsReducer, initialState);

  // שומר את המצב בלוקל סטורג'
  useEffect(() => {
    localStorage.setItem('tripsState', JSON.stringify(state));
  }, [state]);

  // טוען את המצב מלוקל סטורג' בטעינה ראשונית
  useEffect(() => {
    const savedState = localStorage.getItem('tripsState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      Object.keys(parsedState).forEach(key => {
        if (key !== 'lastUpdate') {
          dispatch({ type: 'LOAD_' + key.toUpperCase(), payload: parsedState[key] });
        }
      });
    }
  }, []);

  const addTrip = (tripData) => {
    dispatch({ type: 'ADD_TRIP', payload: tripData });
  };

  const startTrip = (tripId) => {
    dispatch({ type: 'START_TRIP', payload: tripId });
  };

  const updateTripLocation = (tripId, location) => {
    dispatch({ type: 'UPDATE_TRIP_LOCATION', payload: { tripId, location } });
  };

  const completeTrip = (tripId) => {
    dispatch({ type: 'COMPLETE_TRIP', payload: tripId });
  };

  return (
    <TripsContext.Provider value={{
      activeTrips: state.activeTrips,
      plannedTrips: state.plannedTrips,
      completedTrips: state.completedTrips,
      lastUpdate: state.lastUpdate,
      addTrip,
      startTrip,
      updateTripLocation,
      completeTrip
    }}>
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripsProvider');
  }
  return context;
}
