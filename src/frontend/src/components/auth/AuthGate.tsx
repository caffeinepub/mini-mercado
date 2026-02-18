import { ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { LoginPage } from '../../pages/LoginPage';
import { AuthInitializingScreen } from './AuthInitializingScreen';

interface AuthGateProps {
  children: ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { identity, isInitializing } = useInternetIdentity();

  // Show initializing screen while loading stored identity
  if (isInitializing) {
    return <AuthInitializingScreen />;
  }

  // Show login page if not authenticated
  if (!identity) {
    return <LoginPage />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}
