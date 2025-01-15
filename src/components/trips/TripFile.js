// src/components/trips/TripFile.js
const TripFile = {
    basicInfo: {
        tripName: '',
        dates: { start: '', end: '' },
        organization: '',
        responsible: {}
    },
    participants: {
        students: [
            {
                id: '',
                name: '',
                class: '',
                medicalInfo: '',
                parentContact: '',
                formsStatus: {
                    parentApproval: false,
                    medicalForm: false,
                    paymentStatus: false
                }
            }
        ],
        staff: [
            {
                id: '',
                name: '',
                role: '',
                phone: '',
                certifications: []
            }
        ]
    },
    route: {
        mapData: {},
        points: [],
        schedule: [],
        emergencyPoints: []
    },
    forms: {
        required: [
            {
                type: 'ministry',
                status: 'pending',
                deadline: '',
                link: ''
            }
        ],
        completed: []
    },
    logistics: {
        equipment: [],
        food: [],
        transportation: {},
        medicalSupplies: []
    }
};