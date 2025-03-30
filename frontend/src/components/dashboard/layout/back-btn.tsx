"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { IconButton } from '@mui/material';
import { Box } from '@mui/system';
import { ArrowBendDownLeft } from '@phosphor-icons/react';

const BackBtn: React.FC= () => {    

    const router = useRouter();
    
    const handleBack = () => {
        router.back();
    };
    
    return (
        <Box mb={2}>
            <IconButton onClick={handleBack}>
                <ArrowBendDownLeft/>
            </IconButton>   
      </Box>
 );
};

export default BackBtn;