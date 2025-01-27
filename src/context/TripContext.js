import React, { createContext, useContext, useReducer, useCallback } from 'react';

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
        case 'SET_BASIC_DETAILS':
            console.log('Updating basic details:', action.payload);
            return {
                ...state,
                basicDetails: action.payload
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
            console.log('Updating daily routes:', action.payload);
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

    const updateBasicDetails = useCallback((details) => {
        if (!details) return;
        
        console.log('Updating basic details:', details);
        dispatch({ 
            type: 'SET_BASIC_DETAILS', 
            payload: {
                ...details,
                dailyLocations: details.dailyLocations?.map(day => ({
                    ...day,
                    locations: Array.isArray(day.locations) ? day.locations : []
                })) || []
            }
        });
    }, [dispatch]);

    const updateRoute = useCallback((route) => {
        dispatch({ type: 'UPDATE_ROUTE', payload: route });
    }, []);

    const updateDailyRoutes = useCallback((routes) => {
        dispatch({ type: 'UPDATE_DAILY_ROUTES', payload: routes });
    }, []);

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
