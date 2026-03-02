import { Router } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const where: Prisma.LocationWhereInput = typeof search === 'string' && search.trim().length > 0
      ? {
          country: 'India',
          OR: [
            { city: { contains: search, mode: 'insensitive' } },
            { state: { contains: search, mode: 'insensitive' } },
          ],
        }
      : { country: 'India' };

    const locations = await prisma.location.findMany({
      where,
      orderBy: [{ state: 'asc' }, { city: 'asc' }],
      take: 1000,
    });
    res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const location = await prisma.location.findUnique({
      where: { id },
    });
    if (!location) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }
    res.json(location);
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
