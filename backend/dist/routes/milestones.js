"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all milestone types
router.get('/types', auth_1.authenticate, async (req, res) => {
    try {
        const types = await db_1.default.milestoneType.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(types);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get milestone types' });
    }
});
// Add milestone to candidate
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { candidateId, milestoneTypeId, customName, milestoneDate, notes } = req.body;
        // Verify candidate belongs to admin
        const candidate = await db_1.default.candidate.findFirst({
            where: { id: candidateId, adminId: req.user.id }
        });
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        const milestone = await db_1.default.candidateMilestone.create({
            data: {
                candidateId,
                milestoneTypeId,
                customName,
                milestoneDate: new Date(milestoneDate),
                notes,
                createdById: req.user.id
            },
            include: { milestoneType: true }
        });
        res.status(201).json(milestone);
    }
    catch (error) {
        console.error('Add milestone error:', error);
        res.status(500).json({ error: 'Failed to add milestone' });
    }
});
// Delete milestone
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const milestone = await db_1.default.candidateMilestone.findUnique({
            where: { id: req.params.id },
            include: { candidate: true }
        });
        if (!milestone || milestone.candidate.adminId !== req.user.id) {
            return res.status(404).json({ error: 'Milestone not found' });
        }
        await db_1.default.candidateMilestone.delete({ where: { id: req.params.id } });
        res.json({ message: 'Milestone deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete milestone' });
    }
});
// Get candidate timeline
router.get('/candidate/:candidateId/timeline', auth_1.authenticate, async (req, res) => {
    try {
        const candidate = await db_1.default.candidate.findFirst({
            where: { id: req.params.candidateId, adminId: req.user.id }
        });
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        const timeline = await db_1.default.candidateMilestone.findMany({
            where: { candidateId: req.params.candidateId },
            include: { milestoneType: true },
            orderBy: { milestoneDate: 'asc' }
        });
        res.json(timeline);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get timeline' });
    }
});
exports.default = router;
//# sourceMappingURL=milestones.js.map