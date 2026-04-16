'use client';
import { createContext, useEffect, useRef, useState } from 'react';


export const Context = createContext();

function ContextBOX({ children }) {
    const [list, setList] = useState([]);         // keep your list
    let [isConnected, setIsConnected] = useState(false);
    const [online, setOnline] = useState(new Set());
    

    return (
        <Context.Provider value={{
            list,                 
            setList,              
            online,
            setOnline,
            isConnected,
            setIsConnected
        }}>
            {children}
        </Context.Provider>
    );
}

export default ContextBOX;