import { describe, it, expect } from 'vitest';
import { getRequest } from './setup/global';
import { TEST_IDS } from './setup/seed';

describe('GET /api/services', () => {
  it('returns 200 with an array of active services', async () => {
    const res = await getRequest().get('/api/services');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns services with the expected shape', async () => {
    const res = await getRequest().get('/api/services');

    expect(res.status).toBe(200);
    const service = res.body.data[0];
    expect(service).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      price: expect.any(Number),
      durationMinutes: expect.any(Number),
      isActive: true,
    });
  });

  it('includes the seeded Haircut service', async () => {
    const res = await getRequest().get('/api/services');

    expect(res.status).toBe(200);
    const haircut = res.body.data.find(
      (s: { id: string }) => s.id === TEST_IDS.HAIRCUT_SERVICE
    );
    expect(haircut).toBeDefined();
    expect(haircut).toMatchObject({
      name: 'Haircut',
      price: 25,
      durationMinutes: 30,
    });
  });

  it('only returns active services', async () => {
    const res = await getRequest().get('/api/services');

    expect(res.status).toBe(200);
    const allActive = res.body.data.every(
      (s: { isActive: boolean }) => s.isActive === true
    );
    expect(allActive).toBe(true);
  });
});
