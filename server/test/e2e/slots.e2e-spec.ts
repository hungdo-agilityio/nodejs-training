import { describe, it, expect } from 'vitest';
import { getRequest } from './setup/global';
import { TEST_IDS, getFutureMonday } from './setup/seed';

describe('GET /api/slots', () => {
  const futureMonday = getFutureMonday();

  it('returns 400 when date query param is missing', async () => {
    const res = await getRequest().get('/api/slots');
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid date format', async () => {
    const res = await getRequest().get('/api/slots?date=15-01-2099');
    expect(res.status).toBe(400);
  });

  it('returns 400 for a past date', async () => {
    const res = await getRequest().get('/api/slots?date=2020-01-01');
    expect(res.status).toBe(400);
  });

  it('returns 200 with slot data for a valid future weekday', async () => {
    const res = await getRequest().get(`/api/slots?date=${futureMonday}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      date: futureMonday,
      dayName: 'Monday',
      businessHours: {
        openTime: '09:00',
        closeTime: '18:00',
      },
      slots: expect.any(Array),
    });
  });

  it('returns non-empty slots array for an open weekday', async () => {
    const res = await getRequest().get(`/api/slots?date=${futureMonday}`);

    expect(res.status).toBe(200);
    expect(res.body.data.slots.length).toBeGreaterThan(0);
  });

  it('every slot has the expected shape', async () => {
    const res = await getRequest().get(`/api/slots?date=${futureMonday}`);

    expect(res.status).toBe(200);
    for (const slot of res.body.data.slots) {
      expect(slot).toMatchObject({
        startTime: expect.stringMatching(/^\d{2}:\d{2}$/),
        capacity: expect.any(Number),
        occupied: expect.any(Number),
        available: expect.any(Boolean),
      });
    }
  });

  it('filters slots by service duration when service_ids is provided', async () => {
    const res = await getRequest().get(
      `/api/slots?date=${futureMonday}&service_ids=${TEST_IDS.COLORING_SERVICE}`
    );

    expect(res.status).toBe(200);
    // With 90-minute coloring service, requiredDuration should be present
    expect(res.body.data.requiredDuration).toBe(90);
    // Each slot should have endsAt calculated
    for (const slot of res.body.data.slots) {
      expect(slot).toHaveProperty('endsAt');
    }
  });

  it('returns 404 or error for a closed day (Sunday)', async () => {
    // Find the next Sunday
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    const daysUntilSunday = (7 - date.getDay()) % 7 || 7;
    date.setDate(date.getDate() + daysUntilSunday);
    const sunday = date.toISOString().split('T')[0];

    const res = await getRequest().get(`/api/slots?date=${sunday}`);
    // Salon is closed on Sunday — expect 400 (validation error)
    expect(res.status).toBe(400);
  });
});
