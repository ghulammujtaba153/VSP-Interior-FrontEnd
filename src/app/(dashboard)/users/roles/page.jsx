"use client"

import React from 'react'

import RolesTable from '@/components/users/roles/RolesTable'
import ProtectedRoute from '@/components/ProtectedRoute'


const RolesPage = () => {
    return (
        <ProtectedRoute requiredResource="roles" requiredAction="canView">
            <div>
                <RolesTable />
            </div>
        </ProtectedRoute>
    )
}

export default RolesPage