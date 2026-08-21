'use client';

import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import type { TodayCheckInResponse } from '@/services/dashboard-service';
import { useAuthStore } from '@/stores/authStore';

const WS_BASE =
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1')
    .replace(/^http/, 'ws')
    .replace('/api/v1', '');

export type FeedStatus = 'connecting' | 'connected' | 'error' | 'disconnected';

export function useCheckInFeed(orgId: string | undefined) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [events, setEvents] = useState<TodayCheckInResponse[]>([]);
  const [status, setStatus] = useState<FeedStatus>('disconnected');
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!orgId) return;

    const client = new Client({
      brokerURL: `${WS_BASE}/ws`,
      connectHeaders: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        setStatus('connected');
        client.subscribe(`/topic/checkins/${orgId}`, (message) => {
          try {
            const event = JSON.parse(message.body) as TodayCheckInResponse;
            setEvents((prev) => [event, ...prev].slice(0, 100));
          } catch {
            // malformed frame — ignore
          }
        });
      },
      onDisconnect: () => setStatus('disconnected'),
      onStompError: () => setStatus('error'),
      onWebSocketError: () => setStatus('error'),
    });

    setStatus('connecting');
    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setStatus('disconnected');
    };
  }, [orgId, accessToken]);

  const prependEvent = (event: TodayCheckInResponse) =>
    setEvents((prev) => [event, ...prev].slice(0, 100));

  return { events, status, prependEvent };
}
