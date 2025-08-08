"use client"
import React, { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import Loader from '@/components/loader/Loader'
import { BASE_URL } from '@/configs/url'
import UserTable from '@/components/users/UserTable'
import ProtectedRoute from '@/components/ProtectedRoute'


const UsersPage = () => {
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState([])


    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/user/get`)
            console.log(res.data)
            setUsers(res.data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])


    if(loading) {
        return <Loader />
    }
    
  return (
    <ProtectedRoute requiredResource="users" requiredAction="canView">
      <div className='w-full h-full'>
        <UserTable users={users} fetchUsers={fetchUsers}/>
      </div>
    </ProtectedRoute>
  )
}

export default UsersPage