/**
 * Adapter para integracao com calendario externo (Google Calendar, Outlook).
 * Agenda interna permanece como fonte da verdade em caso de falha.
 * @see ADR 0005, docs/architecture/failure-modes.md, US-ARQ-07
 */

import { HttpClient, type HttpClientConfig, HttpClientError } from './http-client.js';

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  attendees?: string[];
  location?: string;
  tenantId: string;
}

export interface CalendarConfig extends Partial<HttpClientConfig> {
  apiKey: string;
  calendarId?: string;
}

export interface CalendarAdapter {
  createEvent(event: CalendarEvent): Promise<{ externalId: string }>;
  updateEvent(externalId: string, event: CalendarEvent): Promise<void>;
  deleteEvent(externalId: string): Promise<void>;
  syncEvents(tenantId: string): Promise<CalendarEvent[]>;
}

export function createCalendarAdapter(config: CalendarConfig): CalendarAdapter {
  const client = new HttpClient({
    baseUrl: config.baseUrl || 'https://www.googleapis.com/calendar/v3',
    timeoutMs: config.timeoutMs || 5000,
    maxRetries: config.maxRetries || 3,
    ...config,
  });

  return {
    async createEvent(event: CalendarEvent): Promise<{ externalId: string }> {
      try {
        const response = await client.post<{ id: string }>(
          `/calendars/${config.calendarId || 'primary'}/events`,
          {
            summary: event.title,
            description: event.description,
            start: { dateTime: event.start.toISOString() },
            end: { dateTime: event.end.toISOString() },
            attendees: event.attendees?.map((email) => ({ email })),
            location: event.location,
          },
          {
            Authorization: `Bearer ${config.apiKey}`,
          }
        );

        return { externalId: response.data.id };
      } catch (error) {
        console.error('[CalendarAdapter] Failed to create event:', error);
        if (error instanceof HttpClientError && error.isCircuitOpen) {
          console.warn('[CalendarAdapter] Circuit breaker is open, skipping calendar sync. Internal agenda is source of truth.');
        }
        throw error;
      }
    },

    async updateEvent(externalId: string, event: CalendarEvent): Promise<void> {
      try {
        await client.post(
          `/calendars/${config.calendarId || 'primary'}/events/${externalId}`,
          {
            summary: event.title,
            description: event.description,
            start: { dateTime: event.start.toISOString() },
            end: { dateTime: event.end.toISOString() },
            attendees: event.attendees?.map((email) => ({ email })),
            location: event.location,
          },
          {
            Authorization: `Bearer ${config.apiKey}`,
          }
        );
      } catch (error) {
        console.error('[CalendarAdapter] Failed to update event:', error);
        throw error;
      }
    },

    async deleteEvent(externalId: string): Promise<void> {
      try {
        await client.post(
          `/calendars/${config.calendarId || 'primary'}/events/${externalId}`,
          {},
          {
            Authorization: `Bearer ${config.apiKey}`,
          }
        );
      } catch (error) {
        console.error('[CalendarAdapter] Failed to delete event:', error);
        throw error;
      }
    },

    async syncEvents(tenantId: string): Promise<CalendarEvent[]> {
      try {
        const response = await client.get<{ items: Array<{ id: string; summary: string; description?: string; start: { dateTime: string }; end: { dateTime: string }; attendees?: Array<{ email: string }>; location?: string }> }>(
          `/calendars/${config.calendarId || 'primary'}/events`,
          {
            Authorization: `Bearer ${config.apiKey}`,
          }
        );

        return response.data.items.map((item) => ({
          id: item.id,
          title: item.summary,
          description: item.description,
          start: new Date(item.start.dateTime),
          end: new Date(item.end.dateTime),
          attendees: item.attendees?.map((a) => a.email),
          location: item.location,
          tenantId,
        }));
      } catch (error) {
        console.error('[CalendarAdapter] Failed to sync events:', error);
        return [];
      }
    },
  };
}
