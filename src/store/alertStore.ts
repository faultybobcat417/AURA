import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PriceAlert } from '../types';

interface AlertState {
  alerts: PriceAlert[];
  alertHistory: { id: string; alertId: string; triggeredAt: string; message: string }[];
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  removeAlert: (id: string) => void;
  checkAlerts: (modelId: string, currentPrice: number, currentLatency: number, uptime: number) => void;
  getActiveAlertsForModel: (modelId: string) => PriceAlert[];
  getTriggeredCount: () => number;
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: [],
      alertHistory: [],

      addAlert: (alert) => {
        const newAlert: PriceAlert = {
          ...alert,
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: new Date().toISOString(),
          triggered: false,
        };
        set({ alerts: [...get().alerts, newAlert] });
      },

      removeAlert: (id) => {
        set({ alerts: get().alerts.filter(a => a.id !== id) });
      },

      checkAlerts: (modelId, currentPrice) => {
        const { alerts, alertHistory } = get();
        const triggered: typeof alertHistory = [];

        const updatedAlerts = alerts.map(a => {
          if (a.modelId !== modelId || a.triggered) return a;

          const shouldTrigger =
            a.condition === 'below' ? currentPrice <= a.targetPrice :
            a.condition === 'above' ? currentPrice >= a.targetPrice :
            false;

          if (shouldTrigger) {
            triggered.push({
              id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              alertId: a.id,
              triggeredAt: new Date().toISOString(),
              message: `${modelId} price ${a.condition} ${a.targetPrice}`,
            });
            return { ...a, triggered: true, triggeredAt: new Date().toISOString() };
          }
          return a;
        });

        if (triggered.length) {
          set({
            alerts: updatedAlerts,
            alertHistory: [...alertHistory, ...triggered].slice(-50),
          });
        }
      },

      getActiveAlertsForModel: (modelId) => {
        return get().alerts.filter(a => a.modelId === modelId && !a.triggered);
      },

      getTriggeredCount: () => {
        return get().alertHistory.length;
      },
    }),
    {
      name: 'aura-alerts',
    }
  )
);
