import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const DEFAULT_SETTINGS = {
  taxRate: 8,
  freeShippingThreshold: 100,
  shippingFee: 10,
  supportPhone: '+91 7984025080',
  supportEmail: 'urvishthummar6@gmail.com',
  upiId: 'urvishthummar@okhdfcbank',
};

/**
 * Safely parse settings from localStorage with default fallbacks
 */
export const getStoredSettings = () => {
  try {
    const saved = localStorage.getItem('sparkcare_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        taxRate: typeof parsed.taxRate === 'number' ? parsed.taxRate : DEFAULT_SETTINGS.taxRate,
        freeShippingThreshold:
          typeof parsed.freeShippingThreshold === 'number'
            ? parsed.freeShippingThreshold
            : DEFAULT_SETTINGS.freeShippingThreshold,
        shippingFee:
          typeof parsed.shippingFee === 'number' ? parsed.shippingFee : DEFAULT_SETTINGS.shippingFee,
        supportPhone: parsed.supportPhone || DEFAULT_SETTINGS.supportPhone,
        supportEmail: parsed.supportEmail || DEFAULT_SETTINGS.supportEmail,
        upiId: parsed.upiId || DEFAULT_SETTINGS.upiId,
      };
    }
  } catch (err) {
    console.error('Failed to read sparkcare_settings from storage:', err);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Custom React hook to subscribe to dynamic store settings in real-time.
 * Automatically synchronizes with backend MongoDB and local cache.
 */
export const useSettings = () => {
  const [settings, setSettings] = useState(getStoredSettings);

  useEffect(() => {
    // 1. Handler to sync local changes immediately
    const handleSync = () => {
      setSettings(getStoredSettings());
    };

    // 2. Fetch fresh settings from backend API
    const fetchRemoteSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data?.data) {
          const remote = response.data.data;
          const merged = {
            taxRate: typeof remote.taxRate === 'number' ? remote.taxRate : DEFAULT_SETTINGS.taxRate,
            freeShippingThreshold:
              typeof remote.freeShippingThreshold === 'number'
                ? remote.freeShippingThreshold
                : DEFAULT_SETTINGS.freeShippingThreshold,
            shippingFee:
              typeof remote.shippingFee === 'number'
                ? remote.shippingFee
                : DEFAULT_SETTINGS.shippingFee,
            supportPhone: remote.supportPhone || DEFAULT_SETTINGS.supportPhone,
            supportEmail: remote.supportEmail || DEFAULT_SETTINGS.supportEmail,
            upiId: remote.upiId || DEFAULT_SETTINGS.upiId,
          };
          localStorage.setItem('sparkcare_settings', JSON.stringify(merged));
          setSettings(merged);
        }
      } catch (err) {
        // Silently use cached/default settings if offline or unauthenticated
      }
    };

    fetchRemoteSettings();

    window.addEventListener('sparkcare-settings-sync', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('sparkcare-settings-sync', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  return settings;
};

export default useSettings;
