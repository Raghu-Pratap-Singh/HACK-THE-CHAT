'use client';
import { createContext, useEffect, useRef, useState } from 'react';


export const Context = createContext();
// HERE WE WILL ALSO HAVE A CUSTOM ERROR SCREEN WITH A VARIABLE IS_ERROR SO THAT WE CAN DO {is_error && component} which will cover full screen and display the error, and on click ok it disappears

function ContextBOX({ children }) {
    const [list, setList] = useState([]);         // keep your list
    let [isConnected, setIsConnected] = useState(false);
    const [online, setOnline] = useState(new Set());
    
    let[is_error, setIsError] = useState(false);
    let [error_text, setErrorText] = useState("");
    return (
        <Context.Provider value={{
            list,                 
            setList,              
            online,
            setOnline,
            isConnected,
            setIsConnected,
            is_error,
            setIsError,
            error_text,
            setErrorText
        }}>
            {children}
        </Context.Provider>
    );
}

export default ContextBOX;