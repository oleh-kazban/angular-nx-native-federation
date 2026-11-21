import { inject } from '@angular/core';
import { NavigationError, RedirectCommand, Router } from '@angular/router';

/**
 * Router navigation error handler: when a navigation fails (typically because a
 * remote's entry or module could not be loaded), log the error and redirect to
 * the fallback page, passing the attempted URL so the user can retry it.
 */
export const redirectToRemoteUnavailable = (error: NavigationError): RedirectCommand => {
  console.error(`Navigation to ${error.url} failed:`, error.error);

  const router = inject(Router);
  return new RedirectCommand(
    router.createUrlTree(['/remote-unavailable'], { queryParams: { from: error.url } }),
  );
};
