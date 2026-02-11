import { useEffect, useRef, useCallback } from 'react';
import { getPendingOrders, removePendingOrder } from '../utils/orderQueue';
import { ordersAPI } from '../services/api';

/**
 * When back online, sync any orders that were queued while offline.
 * Calls onOrderSynced(orderNumber) for each successfully synced order (e.g. to show a toast).
 */
export function SyncOrders({ onOrderSynced }) {
  const syncingRef = useRef(false);

  const syncPending = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    try {
      const pending = await getPendingOrders();
      for (const row of pending) {
        if (row.synced || !row.payload) continue;
        try {
          const res = await ordersAPI.create(row.payload);
          const data = res?.data ?? res;
          const orderNumber = data?.orderNumber || '—';
          await removePendingOrder(row.id);
          if (typeof onOrderSynced === 'function') onOrderSynced(orderNumber);
        } catch (err) {
          console.warn('Failed to sync order:', err);
        }
      }
    } finally {
      syncingRef.current = false;
    }
  }, [onOrderSynced]);

  useEffect(() => {
    if (navigator.onLine) {
      syncPending();
    }
  }, [syncPending]);

  useEffect(() => {
    const handleOnline = () => syncPending();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncPending]);

  return null;
}
