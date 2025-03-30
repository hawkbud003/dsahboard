'use client';

import { accountClient } from '@/lib/AccountClient';
import { UpdatePasswordParams } from '@/types/auth';
import { updatePaswordSchema } from '@/types/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, CircularProgress, Grid } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import FormField from '../layout/form-field';


export function UpdatePasswordForm(): React.JSX.Element {
 
   const [isPending, setIsPending] = React.useState<boolean>(false);
   const [isPasswordUpdated,setIsPasswordUpdated] = React.useState<boolean>(false);
   const defaultValues = {confirm_new_password: '',old_password:'',new_password:''} satisfies UpdatePasswordParams;

   const {
     register,
     handleSubmit,
     setError,
     reset,
     formState: { errors },
   } = useForm<UpdatePasswordParams>({resolver: zodResolver(updatePaswordSchema) });
 
   const onSubmit = React.useCallback(
       async (values: UpdatePasswordParams): Promise<void> => {
         setIsPending(true);
         try {
          const response = await accountClient.updatePassword(values);
          if (response) 
            setIsPasswordUpdated(true);
            reset(defaultValues);
         } catch (error:any) {
          setError('root', { type: 'server', message: error.message});
         } finally {
           setIsPending(false);
         }
       },
       [setError]
    );
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader subheader="Update password" title="Password" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            {/* Old Password */}
            <Grid item xs={12} md={6} mb={1}>
              <Box sx={{ minWidth: 120 }}>
                <FormField
                    type="password"
                    placeholder="Old Password"
                    name="old_password"
                    register={register}
                    error={errors.old_password}
                />
              </Box>
            </Grid>
            {/* New Password */}
            <Grid item xs={12} md={6} mb={1}>
              <Box sx={{ minWidth: 120 }}>
                <FormField
                    type="password"
                    placeholder="New Password"
                    name="new_password"
                    register={register}
                    error={errors.new_password}
                />
              </Box>
            </Grid>
            {/* Confirm New Password */}
            <Grid item xs={12} md={6} mb={1}>
              <Box sx={{ minWidth: 120 }}>
                <FormField
                    type="password"
                    placeholder="Confirm New Password"
                    name="confirm_new_password"
                    register={register}
                    hidePasswordIcon={true}
                    error={errors.confirm_new_password}
                />
              </Box>
            </Grid>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
        {!isPending && (
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button variant="contained" color="primary" type="submit">
              Update Password
              </Button>
            </Box>
          )}
          
          {isPending && (
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Box sx={{ marginLeft: 2 }}>
                  <CircularProgress />
                </Box>
              </Box>
          )}  
        </CardActions>
        {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}   
        {isPasswordUpdated ? <Alert color="success">Password updated successfully</Alert> : null} 
      </Card>
    </form>
  );
}
