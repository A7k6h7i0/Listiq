import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../types/express';

export const addFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { listingId } = req.params;

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    const favorite = await prisma.favorite.create({
      data: { userId: userId!, listingId },
      include: {
        listing: {
          include: {
            images: { take: 1 },
            category: true,
            location: true,
          },
        },
      },
    });

    res.status(201).json(favorite);
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { listingId } = req.params;

    await prisma.favorite.deleteMany({
      where: { userId, listingId },
    });

    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        include: {
          listing: {
            include: {
              images: { orderBy: { position: 'asc' } },
              category: true,
              location: true,
              user: { select: { id: true, name: true, avatar: true } },
            },
          },
        },
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);

    res.json({
      favorites,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { listingId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: userId!, listingId } },
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
