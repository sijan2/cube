import { google } from 'googleapis';
import { db } from '../db';
import { accounts } from '../db/schema';
import { eq } from 'drizzle-orm';

export class GoogleCalendarService {
  async getCalendarClient(userId: string) {
    console.log('🔑 Getting calendar client for user:', userId);
    
    const userAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .limit(1);

    console.log('🔑 Found', userAccount.length, 'accounts for user');

    if (!userAccount.length) {
      console.error('🔑 No Google account linked for user:', userId);
      throw new Error('No Google account linked');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: userAccount[0].accessToken,
      refresh_token: userAccount[0].refreshToken,
    });

    // Handle automatic token refresh
    oauth2Client.on('tokens', async (tokens) => {
      console.log('🔑 Refreshed Google tokens for user:', userId);
      if (tokens.access_token) {
        // Update the access token in database
        await db
          .update(accounts)
          .set({ accessToken: tokens.access_token })
          .where(eq(accounts.userId, userId));
      }
    });

    return google.calendar({ version: 'v3', auth: oauth2Client });
  }

  async getEvents(userId: string, timeMin?: string, timeMax?: string) {
    try {
      const calendar = await this.getCalendarClient(userId);

      const queryParams = {
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax,
        // Google Calendar defaults to up to 250 events/page; fetch 250 and paginate
        maxResults: 250,
        singleEvents: true,
        orderBy: 'startTime' as const,
      };

      console.log('📅 Google Calendar API query params:', queryParams);

      // Paginate through all pages to avoid missing events within the range
      let pageToken: string | undefined = undefined;
      const allItems: any[] = [];
      let pageIndex = 0;
      do {
        const response: any = await calendar.events.list({ ...queryParams, pageToken });
        pageIndex += 1;
        const items = response.data.items ?? [];
        console.log(`📅 Google Calendar API response (page ${pageIndex}):`, {
          itemCount: items.length,
          nextPageToken: response.data.nextPageToken,
          accessRole: response.data.accessRole,
        });

        // Log each event summary and date for debugging
        items.forEach((item: any, index: number) => {
          console.log(`📅 Event ${allItems.length + index + 1}:`, {
            summary: item.summary,
            start: item.start,
            end: item.end,
            id: item.id,
            status: item.status,
          });
        });

        allItems.push(...items);
        pageToken = response.data.nextPageToken ?? undefined;
      } while (pageToken);

      console.log('📅 Total events collected from Google Calendar:', allItems.length);
      return allItems;
    } catch (error: any) {
      console.error('📅 Google Calendar API error:', error);
      
      // Handle specific Google API errors
      if (error.code === 401 || error.status === 401) {
        throw new Error('Google Calendar authentication expired. Please sign in again.');
      }
      
      if (error.code === 403 || error.status === 403) {
        throw new Error('Google Calendar access denied. Check your permissions.');
      }
      
      if (error.code === 429 || error.status === 429) {
        throw new Error('Google Calendar API rate limit exceeded. Please try again later.');
      }
      
      // Generic error fallback
      throw new Error(`Failed to fetch calendar events: ${error.message}`);
    }
  }

  async createEvent(userId: string, event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    attendees?: { email: string }[];
  }) {
    const calendar = await this.getCalendarClient(userId);

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return response.data;
  }

  async updateEvent(userId: string, eventId: string, event: {
    summary?: string;
    description?: string;
    start?: { dateTime: string; timeZone?: string };
    end?: { dateTime: string; timeZone?: string };
    attendees?: { email: string }[];
  }) {
    const calendar = await this.getCalendarClient(userId);

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: event,
    });

    return response.data;
  }

  async deleteEvent(userId: string, eventId: string) {
    const calendar = await this.getCalendarClient(userId);

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    return { success: true };
  }
}