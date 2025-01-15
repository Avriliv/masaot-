import React, { createContext, useContext, useReducer } from 'react';

const TripContext = createContext();

const initialState = {
    id: null,
    version: 1,
    basicDetails: {
        tripName: '',
        startDate: null,
        endDate: null,
        participantsCount: '',
        ageGroup: '',
        organization: '',
        description: '',
        numDays: '',
        numStudents: '',
        numStaff: '',
        organizationType: '',
        dailyLocations: []
    },
    route: {
        dailyRoutes: [],
        pointsOfInterest: [],
        totalDistance: 0,
        totalDuration: 0,
        totalElevation: {
            ascent: 0,
            descent: 0
        }
    },
    currentStep: 1,
    lastSaved: null
};

const tripReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_BASIC_DETAILS':
            return {
                ...state,
                basicDetails: {
                    ...state.basicDetails,
                    ...action.payload
                }
            };
        case 'UPDATE_ROUTE':
            return {
                ...state,
                route: {
                    ...state.route,
                    ...action.payload
                }
            };
        case 'UPDATE_DAILY_ROUTES':
            return {
                ...state,
                route: {
                    ...state.route,
                    dailyRoutes: action.payload
                }
            };
        case 'UPDATE_STEP':
            return {
                ...state,
                currentStep: action.payload
            };
        case 'SAVE_TRIP':
            return {
                ...state,
                lastSaved: new Date().toISOString()
            };
        default:
            return state;
    }
};

export const TripProvider = ({ children }) => {
    const [state, dispatch] = useReducer(tripReducer, initialState);

    const updateBasicDetails = (details) => {
        dispatch({ type: 'UPDATE_BASIC_DETAILS', payload: details });
    };

    const updateRoute = (route) => {
        dispatch({ type: 'UPDATE_ROUTE', payload: route });
    };

    const updateDailyRoutes = (routes) => {
        dispatch({ type: 'UPDATE_DAILY_ROUTES', payload: routes });
    };

    const updateStep = (step) => {
        dispatch({ type: 'UPDATE_STEP', payload: step });
    };

    const saveTrip = () => {
        dispatch({ type: 'SAVE_TRIP' });
    };

    return (
        <TripContext.Provider
            value={{
                state,
                updateBasicDetails,
                updateRoute,
                updateDailyRoutes,
                updateStep,
                saveTrip
            }}
        >
            {children}
        </TripContext.Provider>
    );
};

export const useTrip = () => {
    const context = useContext(TripContext);
    if (!context) {
        throw new Error('useTrip must be used within a TripProvider');
    }
    return context;
};
