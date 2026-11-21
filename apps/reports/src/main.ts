import { initFederation } from '@angular-architects/native-federation';

// Bootstrap only once federation is initialised: the app's Angular imports
// resolve through the import map that initFederation sets up.
initFederation(
  {},
  {
    hostRemoteEntry: { url: './remoteEntry.json' },
  },
)
  .then(() => import('./bootstrap'))
  .catch((error) => console.error('Reports startup failed:', error));
