import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { fetchAPI } from "../api.mjs"
import { useNavigate } from "react-router"

export const AuthenticationContext = createContext(null)//check store info if login& state

export function AuthenticationProvider({ children }) {
    // User and status state to be shared via context
    const [user, setUser] = useState(null)
    const [status, setStatus] = useState("resuming") //reloading

    // Attempt to reload user from auth-key saved in local storage
    useEffect(() => {
        const authenticationKey = localStorage.getItem("auth-key")

        if (authenticationKey) {
            fetchAPI("GET", "/users/self", null, authenticationKey)
                .then(response => {
                    if (response.status == 200) {
                        setUser(response.body)
                        setStatus("loaded")
                    } else {
                        setStatus(response.body.message)
                    }
                })
                .catch(error => {
                    setStatus(error)
                })
        } else {
            setStatus("logged out")//setStatus("logged out")/null
        }
    }, [setUser, setStatus])

    // Provide user and status state to all children via context , childer router (for all pages)
    return <AuthenticationContext.Provider value={[user, setUser, status, setStatus]}>
        {children}    
    </AuthenticationContext.Provider>
}

///////////////////////////////////////
export function useAuthenticate(restrictToRoles = null) {
    const [user, setUser, status, setStatus] = useContext(AuthenticationContext)
//get user details
    const getUser = useCallback((authenticationKey) => {
        if (authenticationKey) {
            setStatus("loading")
            fetchAPI("GET", "/users/self", null, authenticationKey)
                .then(response => {
                    if(response.status == 200){
                    setUser(response.body)
                    setStatus("loaded")

                    }else{
                         setStatus(response.body.message)
                    }
                   
                }).catch(error => {
                    setStatus(error)
                })
        }
    }, [setUser, setStatus])

//take email and password and fetch (POST) /api/authenticate
//then stores the key and loads the user.
    const login = useCallback((email, password) => { //change to email
        const body = {
            email,
            password
        }

        setStatus("authenticating")
        fetchAPI("POST", "/authenticate", body)
            .then(response => {
                if (response.status == 200) {
                    const authenticationKey = response.body.key //get from backend as a key
                    localStorage.setItem("auth-key", authenticationKey) //in loacal storage as auth-key
                    console.log(response.body.key)
                    //Load the user by their key
                    getUser(response.body.key)
                    setStatus("loaded")
                } else {
                    setStatus(response.body.message)
                }
                console.log(response)
            })
            .catch(error => {
                console.error(error)
                setStatus(error)
            })
    }, [setStatus, getUser])
    //logout the user
    const logout = useCallback(() => {
        fetchAPI("DELETE", "/authenticate", null, user.authenticationKey)
            .then(response => {
                setUser(null)
                localStorage.removeItem("auth-key")
                setStatus("logged out")////null
                })//added to navigate to "/" after logut
     navigate("/") 
      }, [setUser, user, setStatus])


    //Refresh the data from the backend
    const refresh = useCallback(() => {
        getUser(user.authenticationKey)
    }, [user, getUser])

    const navigate = useNavigate()

    useEffect(() => {
        if (restrictToRoles
            && status != "resuming"
            && (!user || !restrictToRoles.includes(user.role))) {
            navigate("/") //kickout conditions 1- roles 2- not resuming 3 not user / user role not in restricted
        }
    }, [user, status, restrictToRoles, navigate])

    return {
        user,
        login,
        logout,
        refresh,
        status,    ///of authentication e.g. loading
    }
}

//cont {user, , ,} = useAuthenticate()
//use: to know if anyone logged or not & who is the currrent user
//how to use:
//in LoginView const {login,status, user} = useAuthenticate()
//in layout conditionaly enable and disable lower menu based on user role
//    {/* turn off button if user.role !=admin */}
//            {/* <button disabled={role !="admin"}> */}