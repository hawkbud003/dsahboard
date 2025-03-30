'use client';

import { useAuth } from '@/hooks/use-auth';
import { authClient } from '@/lib/AuthClient';
import { paths } from '@/paths';
import { SignInFormData } from '@/types/auth';
import { signInSchema } from '@/types/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, CircularProgress, Grid } from '@mui/material';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import FormField from '../dashboard/layout/form-field';



export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useAuth();
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    handleSubmit,
    setError,
    register,
    formState: { errors },
  } = useForm<SignInFormData>({ resolver: zodResolver(signInSchema) });

  const onSubmit = React.useCallback(
    async (values: SignInFormData): Promise<void> => {
      try{
        setIsPending(true);
        const data = {
          ...values, 
          username: values.username.toLowerCase(),
        };
        const response = await authClient.signIn(data);
        if (response) {
          await checkSession?.();
          router.refresh();
        }
      } catch (error:any) {
        setError('root', { type: 'server', message: error.message});
      } finally {
        setIsPending(false);
      }
    },
    [checkSession, router, setError]
  );

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign in</Typography>
        <Typography color="text.secondary" variant="body2">
          Don&apos;t have an account?{' '}
          <Link component={RouterLink} href={paths.auth.signUp} underline="hover" variant="subtitle2">
            Sign up
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          {/* UserName */}
          <Grid item xs={12} md={6} mb={1}>
            <Box sx={{ minWidth: 120 }}>
              <FormField
                  type="text"
                  placeholder="Username"
                  name="username"
                  register={register}
                  error={errors.username}
              />
            </Box>
          </Grid>

          {/* Password */}
          <Grid item xs={12} md={6} mb={1}>
            <Box sx={{ minWidth: 120 }}>
              <FormField
                  type="password"
                  placeholder="Password"
                  name="password"
                  register={register}
                  error={errors.password}
              />
            </Box>
          </Grid>
          <div>
            <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
              Forgot password?
            </Link>
          </div>
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          {!isPending && (
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button variant="contained" color="primary" type="submit">
              Sign in
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
        </Stack>
      </form>
    </Stack>
  );
}
