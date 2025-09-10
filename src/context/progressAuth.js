"use client"

import React, { createContext, useContext, useState } from "react"

const ProgressContext = createContext(undefined)

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState(false)

  return (
    <ProgressContext.Provider value={{ progress, setProgress }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider")
  }
  return context
}
