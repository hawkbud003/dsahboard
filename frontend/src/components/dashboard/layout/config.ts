import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'home', title: 'Home', href: paths.dashboard.analysis, icon: 'plugs-connected' },
  { key: 'campaigns', title: 'Campaigns', href: paths.dashboard.overview, icon: 'plugs-connected' },
  { key: 'creative', title: 'Creatives', href: paths.dashboard.creative, icon: 'file-plus' },
  { key: 'customers', title: 'Customers', href: paths.dashboard.customers, icon: 'user' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
] satisfies NavItemConfig[];
