import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDailyQuote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get today's date string (YYYY-MM-DD) to use as seed for consistency throughout the day
    const today = new Date().toISOString().split('T')[0];
    
    // Get total count of active quotes
    const totalQuotes = await prisma.motivationalQuote.count({
      where: { isActive: true }
    });

    if (totalQuotes === 0) {
      throw new AppError('No motivational quotes available', 404);
    }

    // Use date as seed to get consistent quote for the day
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const quoteIndex = dayOfYear % totalQuotes;

    // Get the quote for today
    const quote = await prisma.motivationalQuote.findMany({
      where: { isActive: true },
      skip: quoteIndex,
      take: 1
    });

    res.json({
      success: true,
      data: quote[0]
    });
  } catch (error) {
    next(error);
  }
};

export const getRandomQuotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = parseInt(req.query.count as string) || 5;
    const excludeId = req.query.excludeId as string;

    // Get total count of active quotes
    const totalQuotes = await prisma.motivationalQuote.count({
      where: { 
        isActive: true,
        ...(excludeId && { id: { not: excludeId } })
      }
    });

    if (totalQuotes === 0) {
      throw new AppError('No motivational quotes available', 404);
    }

    // Generate random indices
    const randomIndices = new Set<number>();
    const maxQuotes = Math.min(count, totalQuotes);
    
    while (randomIndices.size < maxQuotes) {
      randomIndices.add(Math.floor(Math.random() * totalQuotes));
    }

    // Fetch quotes at random indices
    const quotes = await Promise.all(
      Array.from(randomIndices).map(async (index) => {
        const quote = await prisma.motivationalQuote.findMany({
          where: { 
            isActive: true,
            ...(excludeId && { id: { not: excludeId } })
          },
          skip: index,
          take: 1
        });
        return quote[0];
      })
    );

    res.json({
      success: true,
      data: quotes.filter(Boolean)
    });
  } catch (error) {
    next(error);
  }
};

export const getQuotesByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const quotes = await prisma.motivationalQuote.findMany({
      where: {
        isActive: true,
        category: category
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    next(error);
  }
};

export const getAllQuotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [quotes, total] = await Promise.all([
      prisma.motivationalQuote.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.motivationalQuote.count({
        where: { isActive: true }
      })
    ]);

    res.json({
      success: true,
      data: quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};