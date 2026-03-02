import { Router } from 'express';
import { Response } from 'express';
import prisma from '../config/prisma';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createReportSchema } from '../utils/validations';
import { AuthRequest } from '../types/express';

const router = Router();

router.post('/', authenticate, validate(createReportSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { listingId, reason, description } = req.body;

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    if (listing.userId === userId) {
      res.status(400).json({ error: 'Cannot report your own listing' });
      return;
    }

    const report = await prisma.report.create({
      data: {
        listingId,
        reporterId: userId!,
        reason,
        description,
      },
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
