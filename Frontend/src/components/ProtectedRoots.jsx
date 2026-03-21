import React, { useEffect, useState } from 'react'
import { ACCESS_TOKEN, REFRESH_TOKEN} from '../constans';
import { Navigate } from 'react-router-dom';
import api from '../api';
import {jwtDecode} from 'jwt-decode';


function ProtectedRoots({children}) {
    const [IsAuthorized, setIsAuthorized] = useState(null)

    useEffect(() => {
        auth().catch(error => {
            console.error('Error during authentication:', error);
            setIsAuthorized(false);
        });
    }, []);


    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
            if (response.status === 200) {  
                localStorage.setItem(ACCESS_TOKEN, response.data.access);
                setIsAuthorized(true);
            }
            else{
                setIsAuthorized(false);
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            setIsAuthorized(false);
        }
    }

    const auth = async () => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN);
        if (!accessToken) {
            setIsAuthorized(false);
            return;
        }
        const decodedToken = jwtDecode(accessToken);
         
        if (decodedToken.exp * 1000 < Date.now()) {
            await refreshToken();
        }else{
            setIsAuthorized(true);
        }  

    if (IsAuthorized === null) {
        auth()
        return <div>Loading...</div>
    }

    return IsAuthorized ? children : <Navigate to="/login" />
}
}

export default ProtectedRoots
