import React, { createContext, useContext, useEffect, useState } from 'react'
import { authDataContext } from './authContext'
import axios from 'axios'

export const userDataContext = createContext()

function UserContext({ children }) {
  const [userData, setUserData] = useState(null)
  const { serverUrl } = useContext(authDataContext)

  const getCurrentUser = async () => {
    try {
      const result = await axios.get(
        serverUrl + "/api/user/getcurrentuser",
        { withCredentials: true }
      )

      setUserData(result.data)
    } catch (error) {
      // ❗ silent fail – no console error spam
      setUserData(null)
    }
  }

  useEffect(() => {
    // 🔥 IMPORTANT FIX
    const hasCookie = document.cookie.includes("token")
    if (hasCookie) {
      getCurrentUser()
    }
  }, [])

  const value = {
    userData,
    setUserData,
    getCurrentUser
  }

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  )
}

export default UserContext
