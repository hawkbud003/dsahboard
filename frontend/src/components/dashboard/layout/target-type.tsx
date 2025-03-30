import { CampaignFormData } from '@/types/campaign';
import { Box, Grid, IconButton, Typography } from '@mui/material';
import { XCircle } from '@phosphor-icons/react';
import React from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';

interface TargetTypeProps {
    targetType: string;
    isRemovable:boolean
    setTargetType?: (value: string) => void;
    setValue?: UseFormSetValue<CampaignFormData>;
    getValues?: UseFormGetValues<CampaignFormData>;
}

const TargetType: React.FC<TargetTypeProps> = ({ targetType, setTargetType, setValue, getValues,isRemovable }) => {
    return (
        <Grid container spacing={2}>
            {targetType.split(',').map((value, index) => (
            <Grid item key={index}>
                <Grid
                item
                sx={{
                    position: 'relative',
                    padding: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: 1,
                    whiteSpace: 'nowrap',
                    pr: 3,
                    '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)'
                    }
                }}
                >
                <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {value.trim()}
                </Typography>
                {isRemovable &&
                    <IconButton
                    size="small"
                    onClick={() => {
                        const updatedTargetType = targetType
                        .split(',')
                        .filter((_, i) => i !== index)
                        .join(',');
                        setTargetType && setTargetType(updatedTargetType);
                        if (setValue && getValues) {
                        setValue('target_type', getValues('target_type').filter((_, i) => i !== index));
                        }
                    }}
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        transform: 'translate(30%, -30%)', // Adjust positioning
                        padding: 0.5
                    }}
                    >
                    <XCircle color="#fd0808" />
                    </IconButton>
                }
                </Grid>
            </Grid>
            ))}
        </Grid>
    );
};

export default TargetType;