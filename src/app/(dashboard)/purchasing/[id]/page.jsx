"use client"

import CreateEditPO from "@/components/purchasing/CreateEditPO";
import { Box, Button, Paper } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const Page = () => {
    const router = useRouter();
    return (
        <Box sx={{ p: 3 }} component={Paper}>
            <Button variant="contained" startIcon={<ArrowBack />} onClick={() => router.back()}>
                
                Back
            </Button>
            <CreateEditPO />
        </Box>
    );
}

export default Page;