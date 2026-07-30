import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as api from '../api/client';

const BrandingContext = createContext(null);

const DEFAULTS = {
  branding_logo_url: '',
  branding_portal_name: 'Relay Desk',
  dashboard_tickets_enabled: 'true',
  session_timeout_minutes: '10',
  staging_splash_image_url: '',
  forgot_password_enabled: 'true',
};

export function BrandingProvider({ children }) {
  const { token } = useAuth();
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getSettings(token);
      setSettings({ ...DEFAULTS, ...data });
    } catch {
      // Fall back to defaults if the backend isn't reachable yet —
      // the rest of the app should still render.
      setSettings(DEFAULTS);
    } finally {
      setLoaded(true);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function save(updates) {
    await api.updateSettings(token, updates);
    setSettings((s) => ({ ...s, ...updates }));
  }

  const value = {
    logoUrl: settings.branding_logo_url || '',
    portalName: settings.branding_portal_name || 'Relay Desk',
    dashboardTicketsEnabled: settings.dashboard_tickets_enabled !== 'false',
    sessionTimeoutMinutes: Number(settings.session_timeout_minutes) || 10,
    stagingSplashImageUrl: settings.staging_splash_image_url || '',
    forgotPasswordEnabled: settings.forgot_password_enabled !== 'false',
    loaded,
    save,
    refresh,
  };

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error('useBranding must be used inside <BrandingProvider>');
  return ctx;
}
