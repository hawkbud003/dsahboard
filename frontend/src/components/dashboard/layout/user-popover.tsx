import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { SignOut as SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { useRouter } from 'next/navigation';
import * as React from 'react';

import { useAuth } from '@/hooks/use-auth';
import { accountClient } from '@/lib/account-client';
import { authClient } from '@/lib/auth-client';
import { logger } from '@/lib/default-logger';
import { paths } from '@/paths';
import { User } from '@/types/auth';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const { checkSession } = useAuth();
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      await authClient.signOut();
      await checkSession?.();
      router.push(paths.auth.signIn); // Replace with your actual login route
    } catch (err) {
      logger.error('Sign out error', err);
    }
  }, [checkSession, router]);

  async function fetchUser() {
    try {
      const response = await accountClient.getUser();
      setUser(response);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }  

  React.useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="subtitle1">{user?.first_name}</Typography>
        <Typography color="text.secondary" variant="body2">{user?.email}</Typography>
      </Box>
      <Divider />
      <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
