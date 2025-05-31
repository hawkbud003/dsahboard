import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from '@/paths';
import { DynamicLogo } from '@/components/core/logo';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-block', fontSize: 0 }}>
          <DynamicLogo colorDark="light" colorLight="dark" height={32} width={122} />
        </Box>
      </Box>
      <Box 
        sx={{ 
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box 
          sx={{ 
            maxWidth: '450px',
            width: '100%',
            mx: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 3
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
