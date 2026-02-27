import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db';
import authRoutes from './routes/auth';
import candidateRoutes from './routes/candidates';
import milestoneRoutes from './routes/milestones';
import profileRoutes from './routes/profiles';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/candidates', candidateRoutes);
app.use('/api/admin/milestones', milestoneRoutes);
app.use('/api/candidate', profileRoutes);

// Seed milestone types on startup
const seedMilestones = async () => {
  const milestones = [
    { name: 'date_started', displayName: 'Date Started', icon: 'calendar', color: '#10B981' },
    { name: 'm9', displayName: 'Passed M9', icon: 'award', color: '#3B82F6' },
    { name: 'm9a', displayName: 'Passed M9A', icon: 'award', color: '#8B5CF6' },
    { name: 'hi', displayName: 'Passed HI', icon: 'trophy', color: '#F59E0B' },
    { name: 'res5', displayName: 'Passed RES5', icon: 'star', color: '#EF4444' },
    { name: 'comgi', displayName: 'Passed ComGI', icon: 'medal', color: '#EC4899' },
    { name: 'event', displayName: 'Event', icon: 'map-pin', color: '#06B6D4' },
  ];

  for (const m of milestones) {
    await prisma.milestoneType.upsert({
      where: { name: m.name },
      update: {},
      create: m
    });
  }
  console.log('Milestone types seeded');
};

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  seedMilestones();
});
