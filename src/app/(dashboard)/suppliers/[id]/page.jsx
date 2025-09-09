"use client"


import PriceBookCategoriesTable from '@/components/suppliers/priceBook/PriceBookCategoriesTable';
import PriceBookImport from '@/components/suppliers/priceBook/PriceBookImport';
import { BASE_URL } from '@/configs/url';
import { Box, Button, Tab, Tabs } from '@mui/material';
import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const SupplierPage = () => {

    const { id } = useParams()
    const [tabIndex, setTabIndex] = useState(0)
    const [data, setData] = useState();


    const fetch = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/suppliers/get/${id}`);
            setData(res.data.data);
        } catch (error) {
            toast.error("Error fetching supplier details", error);
        }
    }


    useEffect(() => {
        fetch();
    }, [id]);

    if (!data) return <div>Loading...</div>;


    return (
        <Box>
            <Button variant="contained" color="primary" onClick={() => window.history.back('/suppliers')}>
                Back
            </Button>

            <h1 className='text-lg font-bold mb-4'>Supplier Price Book</h1>
            <p>{"Supplier: "}{data.name}{`(${id})`}</p>

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