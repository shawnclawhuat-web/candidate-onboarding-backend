"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// Get candidate profile by token (public)
router.get('/profile/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const candidate = await db_1.default.candidate.findUnique({
            where: { onboardingToken: token },
            include: {
                profile: true,
                admin: { select: { fullName: true } }
            }
        });
        if (!candidate || !candidate.profile) {
            return res.status(404).json({ error: 'Invalid token' });
        }
        if (candidate.tokenExpiresAt && new Date() > candidate.tokenExpiresAt) {
            return res.status(400).json({ error: 'Token expired' });
        }
        res.json({
            email: candidate.email,
            profile: candidate.profile,
            adminName: candidate.admin?.fullName || 'Admin',
            status: candidate.status
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get profile' });
    }
});
// Submit/update candidate profile (public)
router.put('/profile/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { fullName, phone, educationLevel, address, birthday, emergencyContactName, emergencyContactPhone } = req.body;
        const candidate = await db_1.default.candidate.findUnique({
            where: { onboardingToken: token }
        });
        if (!candidate) {
            return res.status(404).json({ error: 'Invalid token' });
        }
        if (candidate.tokenExpiresAt && new Date() > candidate.tokenExpiresAt) {
            return res.status(400).json({ error: 'Token expired' });
        }
        const profile = await db_1.default.candidateProfile.upsert({
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
        await db_1.default.candidate.update({
            where: { id: candidate.id },
            data: { status: 'profile_completed' }
        });
        res.json({ message: 'Profile updated', profile });
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
exports.default = router;
//# sourceMappingURL=profiles.js.map