import React, { createContext, useState, useContext } from 'react';


const PatientContext = createContext();

export default function PatientProvider({ children }) {
    const [selectedPatient, setSelectedPatient] = useState(null);

    return (
        <PatientContext.Provider value={{ selectedPatient, setSelectedPatient }}>
            {children}
        </PatientContext.Provider>
    );
};

export const usePatient = () => useContext(PatientContext);