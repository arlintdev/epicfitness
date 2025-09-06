import { Request, Response, NextFunction } from 'express';
import { KudosType } from '@prisma/client';
import { kudosService } from '../services/kudos.service';
import { AppError } from '../middleware/errorHandler';

export const getRandomKudos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;

    if (!type || !Object.values(KudosType).includes(type as KudosType)) {
      throw new AppError('Invalid or missing kudos type', 400);
    }

    const phrase = await kudosService.getRandomKudos(type as KudosType);

    res.json({
      success: true,
      data: {
        phrase,
        type,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMultipleKudos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;
    const count = parseInt(req.query.count as string) || 5;

    if (!type || !Object.values(KudosType).includes(type as KudosType)) {
      throw new AppError('Invalid or missing kudos type', 400);
    }

    const phrases = await kudosService.getMultipleRandomKudos(type as KudosType, count);

    res.json({
      success: true,
      data: {
        phrases,
        type,
        count: phrases.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllKudosTypes = async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: Object.values(KudosType),
  });
};