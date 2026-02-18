import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

/**
 * Compositional hook that combines Internet Identity authentication
 * with backend actor initialization. Returns null actor when unauthenticated
 * and provides a readiness flag to prevent accidental anonymous backend calls.
 */
export function useAuthenticatedActor() {
  const { identity, isInitializing: authInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const isAuthenticated = !!identity;
  const isInitializing = authInitializing || actorFetching;
  const isReady = isAuthenticated && !isInitializing && !!actor;

  return {
    actor: isReady ? actor : null,
    isAuthenticated,
    isInitializing,
    isReady,
  };
}
