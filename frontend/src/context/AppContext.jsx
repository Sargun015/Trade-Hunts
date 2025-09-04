import React from "react";
import { createContext, useEffect, useState } from "react";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/profile/me', { headers: { token } });
            console.log(data);
            if (data.success) {
                setUserProfile(data.profile)
            } else {
                console.log(false)
            }
        } catch (error) {
            console.log(error)
        }

    }


    const loadUserData = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/user/me', { headers: { token } })
            console.log(data);
            if (data.success) {
                setUser(data.user)
                 loadUserProfileData()
            } else {
            }
        } catch (error) {
            console.log(error)
        }

    }

    

    useEffect(()=>{
       if(token){
           loadUserData();
        }
    },[token])
    

    const value={isMenuOpen, setIsMenuOpen, token, setToken, user, userProfile,loading,setLoading};


    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider