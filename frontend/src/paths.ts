export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    createCampaign: '/dashboard/campaign/create',
    creative: '/dashboard/creative',
    creativeCreate: '/dashboard/creative/create',
    analysis: '/dashboard/home',
    wallet: '/dashboard/admin/wallet',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
