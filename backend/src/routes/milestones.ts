import { Router, Response } from 'express';
import prisma from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all milestone types
router.get('/types', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const types = await prisma.milestoneType.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get milestone types' });
  }
});

// Add milestone to candidate
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { candidateId, milestoneTypeId, customName, milestoneDate, notes } = req.body;

    // Verify candidate belongs to admin
    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, adminId: req.user!.id }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const milestone = await prisma.candidateMilestone.create({
      data: {
        candidateId,
        milestoneTypeId,
        customName,
        milestoneDate: new Date(milestoneDate),
        notes,
        createdById: req.user!.id
      },
      include: { milestoneType: true }
    });

    res.status(201).json(milestone);
  } catch (error) {
    console.error('Add milestone error:', error);
    res.status(500).json({ error: 'Failed to add milestone' });
  }
});

// Delete milestone
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const milestone = await prisma.candidateMilestone.findUnique({
      where: { id: req.params.id },
      include: { candidate: true }
    });

    if (!milestone || milestone.candidate.adminId !== req.user!.id) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    await prisma.candidateMilestone.delete({ where: { id: req.params.id } });
    res.json({ message: 'Milestone deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete milestone' });
  }
});

// Get candidate timeline
router.get('/candidate/:candidateId/timeline', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.candidateId, adminId: req.user!.id }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const timeline = await prisma.candidateMilestone.findMany({
      where: { candidateId: req.params.candidateId },
      include: { milestoneType: true },
      orderBy: { milestoneDate: 'asc' }
    });

    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get timeline' });
  }
});

export default router;
