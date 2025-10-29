"use client"


import Loader from '@/components/loader/Loader';
import PriceBookCategoriesTable from '@/components/suppliers/priceBook/PriceBookCategoriesTable';
import PriceBookImport from '@/components/suppliers/priceBook/PriceBookImport';
import { BASE_URL } from '@/configs/url';
import { Box, Button, Paper, Tab, Tabs } from '@mui/material';
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const SupplierPage = () => {


    const [tabIndex, setTabIndex] = useState(0)
    
    

    return (
        <Box p={4} component={Paper}>
            <Button variant="contained" color="primary" onClick={() => window.history.back('/suppliers')}>
                Back
            </Button>

            <h1 className='text-lg font-bold mb-4'>Price Book Category</h1>
            

            <Tabs
                value={tabIndex}
                onChange={(e, newValue) => setTabIndex(newValue)}
                sx={{ mb: 2 }}
            >

                <Tab label="Categories" />
                {/* <Tab label="Import" /> */}
                
            </Tabs>
            {tabIndex === 0 && <PriceBookCategoriesTable />}
            {/* {tabIndex === 1 && <PriceBookImport id={id} />} */}
            

        </Box>
    )
}

export default SupplierPage;