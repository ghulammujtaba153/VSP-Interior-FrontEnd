"use client"


import PriceBookCategoriesTable from '@/components/suppliers/priceBook/PriceBookCategoriesTable';
import PriceBookImport from '@/components/suppliers/priceBook/PriceBookImport';
import { Box, Button, Tab, Tabs } from '@mui/material';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'

const SupplierPage = () => {

    const { id } = useParams()
    const [tabIndex, setTabIndex] = useState(0)
    return (
        <Box>
            <Button variant="contained" color="primary" onClick={() => window.history.back('/suppliers')}>
                Back
            </Button>
            <Tabs
                value={tabIndex}
                onChange={(e, newValue) => setTabIndex(newValue)}
                sx={{ mb: 2 }}
            >

                <Tab label="Categories" />
                <Tab label="Import" />
                
            </Tabs>
            {tabIndex === 0 && <PriceBookCategoriesTable id={id} />}
            {tabIndex === 1 && <PriceBookImport id={id} />}
            

        </Box>
    )
}

export default SupplierPage;