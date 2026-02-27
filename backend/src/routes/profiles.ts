import { Router, Response } from 'express';
import prisma from '../db';

const router = Router();

// Get candidate profile by token (public)
router.get('/profile/:token', async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;

    const candidate = await prisma.candidate.findUnique({
      where: { onboardingToken: token },
      include: { profile: true, admin: { select: { fullName: true } } }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Invalid token' });
    }

    if (candidate.tokenExpiresAt && new Date() > candidate.tokenExpiresAt) {
      return res.status(400).json({ error: 'Token expired' });
    }

    res.json({
      email: candidate.email,
      profile: candidate.profile,
      adminName: candidate.admin.fullName,
      status: candidate.status
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Submit/update candidate profile (public)
router.put('/profile/:token', async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;
    const { fullName, phone, educationLevel, address, birthday, emergencyContactName, emergencyContactPhone } = req.body;

    const candidate = await prisma.candidate.findUnique({
      where: { onboardingToken: token }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Invalid token' });
    }

    if (candidate.tokenExpiresAt && new Date() > candidate.tokenExpiresAt) {
      return res.status(400).json({ error: 'Token expired' });
    }

    const profile = await prisma.candidateProfile.upsert({
      where: { candidateId: candidate.id },
      create: {
        candidateId: candidate.id,
        fullName,
        phone,
        educationLevel,
        address,
        birthday: birthday ? new Date(birthday) : null,
        emergencyContactName,
        emergencyContactPhone,
        profileCompletedAt: new Date()
      },
      update: {
        fullName,
        phone,
        educationLevel,
        address,
        birthday: birthday ? new Date(birthday) : null,
        emergencyContactName,
        emergencyContactPhone,
        profileCompletedAt: new Date()
      }
    });

    await prisma.candidate.update({
      where: { id: candidate.id },
      data: { status: 'profile_completed' }
    });

    res.json({ message: 'Profile updated', profile });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Need to import AuthRequest type
import { AuthRequest } from '../middleware/auth';

export default router;
