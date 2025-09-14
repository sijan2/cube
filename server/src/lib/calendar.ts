import { google } from 'googleapis';
import { db } from '../db';
import { accounts } from '../db/schema';
import { eq } from 'drizzle-orm';

export class GoogleCalendarService {
  async getCalendarClient(userId: string) {
    const userAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .limit(1);

    if (!userAccount.length) {
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

    return google.calendar({ version: 'v3', auth: oauth2Client });
  }

  async getEvents(userId: string, timeMin?: string, timeMax?: string) {
    const calendar = await this.getCalendarClient(userId);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax,
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
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