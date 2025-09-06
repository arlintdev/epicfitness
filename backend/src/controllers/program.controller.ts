import { Request, Response } from 'express';
import programService from '../services/program.service';
import { AuthRequest } from '../types/auth';

export class ProgramController {
  async getAllPrograms(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const programs = await programService.getAllPrograms(userId);
      res.json({ success: true, data: programs });
    } catch (error) {
      console.error('Error fetching programs:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch programs' });
    }
  }

  async getUserPrograms(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const programs = await programService.getUserPrograms(userId);
      res.json({ success: true, data: programs });
    } catch (error) {
      console.error('Error fetching user programs:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch user programs' });
    }
  }

  async enrollInProgram(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { programId } = req.params;
      const enrollment = await programService.enrollInProgram(userId, programId);
      res.json({ success: true, data: enrollment });
    } catch (error: any) {
      console.error('Error enrolling in program:', error);
      if (error.message === 'Already enrolled in this program') {
        res.status(400).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Failed to enroll in program' });
      }
    }
  }

  async unenrollFromProgram(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { programId } = req.params;
      await programService.unenrollFromProgram(userId, programId);
      res.json({ success: true, message: 'Successfully unenrolled from program' });
    } catch (error) {
      console.error('Error unenrolling from program:', error);
      res.status(500).json({ success: false, error: 'Failed to unenroll from program' });
    }
  }

  async getProgramProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { programId } = req.params;
      const progress = await programService.getProgramProgress(userId, programId);
      res.json({ success: true, data: progress });
    } catch (error: any) {
      console.error('Error fetching program progress:', error);
      if (error.message === 'Not enrolled in this program') {
        res.status(404).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: 'Failed to fetch program progress' });
      }
    }
  }

  async createProgram(req: AuthRequest, res: Response) {
    try {
      const creatorId = req.user!.id;
      const program = await programService.createProgram(creatorId, req.body);
      res.json({ success: true, data: program });
    } catch (error) {
      console.error('Error creating program:', error);
      res.status(500).json({ success: false, error: 'Failed to create program' });
    }
  }
}

export default new ProgramController();