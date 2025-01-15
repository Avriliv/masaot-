import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  trips: JSON.parse(localStorage.getItem('trips') || '[]'),
  currentTrip: null,
};

export const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    addTrip: (state, action) => {
      state.trips.push(action.payload);
      localStorage.setItem('trips', JSON.stringify(state.trips));
    },
    setCurrentTrip: (state, action) => {
      state.currentTrip = action.payload;
    },
    updateTrip: (state, action) => {
      const index = state.trips.findIndex(trip => trip.id === action.payload.id);
      if (index !== -1) {
        state.trips[index] = action.payload;
        if (state.currentTrip?.id === action.payload.id) {
          state.currentTrip = action.payload;
        }
        localStorage.setItem('trips', JSON.stringify(state.trips));
      }
    },
    deleteTrip: (state, action) => {
      state.trips = state.trips.filter(trip => trip.id !== action.payload);
      if (state.currentTrip?.id === action.payload) {
        state.currentTrip = null;
      }
      localStorage.setItem('trips', JSON.stringify(state.trips));
    },
  },
});

export const { addTrip, setCurrentTrip, updateTrip, deleteTrip } = tripsSlice.actions;

export const selectTrips = (state) => state.trips.trips;
export const selectCurrentTrip = (state) => state.trips.currentTrip;

export default tripsSlice.reducer;
