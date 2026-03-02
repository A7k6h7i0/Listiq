import { Response } from 'express';
import { Prisma, Role, ListingStatus, ReportStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { AuthRequest } from '../types/express';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalListings, activeListings, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'APPROVED' } }),
      prisma.payment.aggregate({
        where: { paymentStatus: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    const recentListings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: { select: { id: true, name: true, email: true } },
        category: true,
      },
    });

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.json({
      stats: {
        totalUsers,
        totalListings,
        activeListings,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
      recentListings,
      recentUsers,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const where: Prisma.UserWhereInput = {};
    if (role && typeof role === 'string' && ['USER', 'ADMIN', 'MODERATOR'].includes(role)) {
      where.role = role as Role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { listings: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    res.json(user);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const banUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const where: Prisma.ListingWhereInput = {};
    if (
      status &&
      typeof status === 'string' &&
      ['PENDING', 'APPROVED', 'REJECTED', 'SOLD', 'EXPIRED'].includes(status)
    ) {
      where.status = status as ListingStatus;
    }
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        include: {
          user: { select: { id: true, name: true, email: true } },
          category: true,
          location: true,
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
    console.error('Get all listings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateListingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const listing = await prisma.listing.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, email: true, name: true } },
        category: true,
      },
    });

    res.json(listing);
  } catch (error) {
    console.error('Update listing status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const where: Prisma.ReportWhereInput = {};
    if (
      status &&
      typeof status === 'string' &&
      ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'].includes(status)
    ) {
      where.status = status as ReportStatus;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        include: {
          listing: { select: { id: true, title: true } },
          reporter: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.report.count({ where }),
    ]);

    res.json({
      reports,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateReportStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });

    res.json(report);
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRevenueStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '30d') startDate.setDate(startDate.getDate() - 30);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else startDate.setFullYear(startDate.getFullYear() - 1);

    const payments = await prisma.payment.findMany({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const dailyRevenue: Record<string, number> = {};
    payments.forEach(p => {
      const date = p.createdAt.toISOString().split('T')[0];
      dailyRevenue[date] = (dailyRevenue[date] || 0) + p.amount;
    });

    res.json({
      totalRevenue,
      period,
      dailyRevenue,
      paymentsCount: payments.length,
    });
  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
