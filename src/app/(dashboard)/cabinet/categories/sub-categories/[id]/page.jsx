"use client"

import React, { useState } from 'react'
import MaterialTable from '@/components/cabinet/cabinet-updated/MaterialTable'
import CabinetImport from '@/components/cabinet/cabinet-updated/CabinetImport'
import SubCategories from '@/components/cabinet/cabinet-updated/SubCategories'
import { useParams } from 'next/navigation'
import { Tabs, Tab, Box } from '@mui/material'

const SubCategoriesPage = () => {
  const { id } = useParams()  // id is cabinet category id
  const [tabIndex, setTabIndex] = useState(0)

  return (
    <Box>
      <Tabs
        value={tabIndex}
        onChange={(e, newValue) => setTabIndex(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label="Cabinet Import" />
        <Tab label="Subcategories" />
        <Tab label="Material Table" />
      </Tabs>
      {tabIndex === 0 && <CabinetImport id={id} />}
      {tabIndex === 1 && <SubCategories id={id} />}
      {tabIndex === 2 && <MaterialTable id={id} />}
    </Box>
  )
}

export default SubCategoriesPage