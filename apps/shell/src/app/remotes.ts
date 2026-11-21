/** The remotes the shell offers. Routes, nav links and home cards are generated from this list. */
export interface ShellRemote {
  /** Remote name in federation.manifest.json; also the route path. */
  name: string;
  label: string;
  description: string;
}

export const REMOTES: readonly ShellRemote[] = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    description: 'Explore a snapshot of platform metrics from the dashboard remote.',
  },
  {
    name: 'reports',
    label: 'Reports',
    description: 'View sample reports provided by the reports remote.',
  },
];
