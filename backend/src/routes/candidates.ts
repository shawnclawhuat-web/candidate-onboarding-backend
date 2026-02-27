import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendOnboardingEmail } from '../services/email';

const getOnboardingLink = (token: string) => {
  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${frontendBaseUrl.replace(/\/$/, '')}/candidate/form/${token}`;
};

const router = Router();

// Get all candidates for admin
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    
    const candidates = await prisma.candidate.findMany({
      where: { 
        adminId: req.user!.id,
        ...(search ? { 
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { profile: { fullName: { contains: search, mode: 'insensitive' } } }
          ]
        } : {})
      },
      include: {
        profile: true,
        _count: { select: { milestones: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(candidates);
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to get candidates' });
  }
});

// Create candidate and send onboarding email
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { email, fullName } = req.body;

    const existingCandidate = await prisma.candidate.findFirst({
      where: { adminId: req.user!.id, email }
    });
    if (existingCandidate) {
      return res.status(400).json({ error: 'Candidate with this email already exists' });
    }

    const token = uuidv4();
    const tokenExpires = new Date();
    tokenExpires.setDate(tokenExpires.getDate() + 7);

    const admin = await prisma.user.findUnique({ where: { id: req.user!.id } });

    const candidate = await prisma.candidate.create({
      data: {
        adminId: req.user!.id,
        email,
        onboardingToken: token,
        tokenExpiresAt: tokenExpires,
        profile: {
          create: {
            fullName: fullName || ''
          }
        }
      },
      include: { profile: true }
    });

    const onboardingLink = getOnboardingLink(token);

    try {
      const result = await sendOnboardingEmail(email, fullName || '', admin?.fullName || 'Admin', onboardingLink);
      console.log('Email send result:', JSON.stringify(result));
    } catch (emailError) {
      console.error('Create candidate email send failed (candidate still created):', emailError);
    }

    res.status(201).json(candidate);
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

// Get single candidate with profile and milestones
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, adminId: req.user!.id },
      include: {
        profile: true,
        milestones: {
          include: { milestoneType: true },
          orderBy: { milestoneDate: 'asc' }
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get candidate' });
  }
});

// Update candidate
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;

    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, adminId: req.user!.id }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const updated = await prisma.candidate.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// Delete candidate
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, adminId: req.user!.id }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    await prisma.candidate.delete({ where: { id: req.params.id } });
    res.json({ message: 'Candidate deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

// Resend onboarding email
router.post('/:id/resend-email', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, adminId: req.user!.id },
      include: { profile: true }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    if (candidate.status === 'profile_completed' || candidate.status === 'active') {
      return res.status(400).json({ error: 'Profile already completed' });
    }

    const token = uuidv4();
    const tokenExpires = new Date();
    tokenExpires.setDate(tokenExpires.getDate() + 7);

    await prisma.candidate.update({
      where: { id: candidate.id },
      data: { onboardingToken: token, tokenExpiresAt: tokenExpires }
    });

    const admin = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const onboardingLink = getOnboardingLink(token);

    try {
      await sendOnboardingEmail(candidate.email, candidate.profile?.fullName || '', admin?.fullName || 'Admin', onboardingLink);
      res.json({ message: 'Email resent' });
    } catch (emailError) {
      console.error('Resend candidate email failed:', emailError);
      res.status(502).json({ error: 'Candidate updated, but failed to send onboarding email' });
    }
  } catch (error) {
    console.error('Resend email error:', error);
    res.status(500).json({ error: 'Failed to resend email' });
  }
});

export default router;
