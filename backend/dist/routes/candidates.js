"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const email_1 = require("../services/email");
const router = (0, express_1.Router)();
// Get all candidates for admin
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search : undefined;
        const candidates = await db_1.default.candidate.findMany({
            where: {
                adminId: req.user.id,
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
    }
    catch (error) {
        console.error('Get candidates error:', error);
        res.status(500).json({ error: 'Failed to get candidates' });
    }
});
// Create candidate and send onboarding email
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { email, fullName } = req.body;
        const existingCandidate = await db_1.default.candidate.findFirst({
            where: { adminId: req.user.id, email }
        });
        if (existingCandidate) {
            return res.status(400).json({ error: 'Candidate with this email already exists' });
        }
        const token = (0, uuid_1.v4)();
        const tokenExpires = new Date();
        tokenExpires.setDate(tokenExpires.getDate() + 7);
        const admin = await db_1.default.user.findUnique({ where: { id: req.user.id } });
        const candidate = await db_1.default.candidate.create({
            data: {
                adminId: req.user.id,
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
        const onboardingLink = `http://localhost:3000/candidate/form/${token}`;
        await (0, email_1.sendOnboardingEmail)(email, fullName || '', admin?.fullName || 'Admin', onboardingLink);
        res.status(201).json(candidate);
    }
    catch (error) {
        console.error('Create candidate error:', error);
        res.status(500).json({ error: 'Failed to create candidate' });
    }
});
// Get single candidate with profile and milestones
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const candidate = await db_1.default.candidate.findFirst({
            where: { id: req.params.id, adminId: req.user.id },
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get candidate' });
    }
});
// Update candidate
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { status } = req.body;
        const candidate = await db_1.default.candidate.findFirst({
            where: { id: req.params.id, adminId: req.user.id }
        });
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        const updated = await db_1.default.candidate.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update candidate' });
    }
});
// Delete candidate
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const candidate = await db_1.default.candidate.findFirst({
            where: { id: req.params.id, adminId: req.user.id }
        });
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        await db_1.default.candidate.delete({ where: { id: req.params.id } });
        res.json({ message: 'Candidate deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete candidate' });
    }
});
// Resend onboarding email
router.post('/:id/resend-email', auth_1.authenticate, async (req, res) => {
    try {
        const candidate = await db_1.default.candidate.findFirst({
            where: { id: req.params.id, adminId: req.user.id },
            include: { profile: true }
        });
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        if (candidate.status === 'profile_completed' || candidate.status === 'active') {
            return res.status(400).json({ error: 'Profile already completed' });
        }
        const token = (0, uuid_1.v4)();
        const tokenExpires = new Date();
        tokenExpires.setDate(tokenExpires.getDate() + 7);
        await db_1.default.candidate.update({
            where: { id: candidate.id },
            data: { onboardingToken: token, tokenExpiresAt: tokenExpires }
        });
        const admin = await db_1.default.user.findUnique({ where: { id: req.user.id } });
        const onboardingLink = `http://localhost:3000/candidate/form/${token}`;
        await (0, email_1.sendOnboardingEmail)(candidate.email, candidate.profile?.fullName || '', admin?.fullName || 'Admin', onboardingLink);
        res.json({ message: 'Email resent' });
    }
    catch (error) {
        console.error('Resend email error:', error);
        res.status(500).json({ error: 'Failed to resend email' });
    }
});
exports.default = router;
//# sourceMappingURL=candidates.js.map