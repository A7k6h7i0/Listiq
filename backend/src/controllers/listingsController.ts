import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../types/express';

export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { title, description, price, currency, categoryId, subcategoryId, locationId, images } = req.body;

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price,
        currency,
        categoryId,
        subcategoryId,
        locationId,
        userId: userId!,
        status: 'APPROVED',
        images: {
          create: images.map((url: string, index: number) => ({ url, position: index })),
        },
      },
      include: {
        images: true,
        category: true,
        subcategory: true,
        location: true,
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: 'asc' } },
        category: true,
        subcategory: true,
        location: true,
        user: {
          select: { id: true, name: true, avatar: true, createdAt: true },
        },
      },
    });

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    res.json(listing);
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { q, categoryId, subcategoryId, locationId, minPrice, maxPrice, sortBy, page, limit } = req.query;

    const where: any = {
      status: 'APPROVED',
    };

    if (q) {
      where.OR = [
        { title: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    if (locationId) where.locationId = locationId;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_low') orderBy = { price: 'asc' };
    if (sortBy === 'price_high') orderBy = { price: 'desc' };
    if (sortBy === 'relevance') orderBy = [{ isBoosted: 'desc' }, { createdAt: 'desc' }];

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: parseInt(limit as string),
        include: {
          images: { take: 1, orderBy: { position: 'asc' } },
          category: true,
          location: true,
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      listings,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Search listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        include: {
          images: { orderBy: { position: 'asc' } },
          category: true,
          location: true,
        },
      }),
      prisma.listing.count({ where: { userId } }),
    ]);

    res.json({
      listings,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, description, price, categoryId, subcategoryId, locationId, images } = req.body;

    const existing = await prisma.listing.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Listing not found or unauthorized' });
      return;
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        title,
        description,
        price,
        categoryId,
        subcategoryId,
        locationId,
        status: 'APPROVED',
        ...(images && {
          images: {
            deleteMany: {},
            create: images.map((url: string, index: number) => ({ url, position: index })),
          },
        }),
      },
      include: {
        images: { orderBy: { position: 'asc' } },
        category: true,
        location: true,
      },
    });

    res.json(listing);
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const existing = await prisma.listing.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Listing not found or unauthorized' });
      return;
    }

    await prisma.listing.delete({ where: { id } });

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFeaturedListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: 'APPROVED', isBoosted: true, boostExpiry: { gt: new Date() } },
      orderBy: { boostExpiry: 'asc' },
      take: 10,
      include: {
        images: { take: 1, orderBy: { position: 'asc' } },
        category: true,
        location: true,
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.json(listings);
  } catch (error) {
    console.error('Get featured listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
