"use client"
import { Button } from '@mui/material';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { useRouter } from 'next/navigation';
import React from 'react';


interface AddCampaignProps {
    url: string;  
    redirect: boolean;
}

const RedirectBtn: React.FC<AddCampaignProps> = ({ url,redirect }) => {    

    const router = useRouter();

    const handleClickOrRedirect = () => {
        if (redirect) {
            router.push(url);
        }
    };
    return (
        <Button onClick={handleClickOrRedirect} startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">Add</Button>
    );
};

export default RedirectBtn;