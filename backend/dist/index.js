"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./db"));
const auth_1 = __importDefault(require("./routes/auth"));
const candidates_1 = __importDefault(require("./routes/candidates"));
const milestones_1 = __importDefault(require("./routes/milestones"));
const profiles_1 = __importDefault(require("./routes/profiles"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/admin/candidates', candidates_1.default);
app.use('/api/admin/milestones', milestones_1.default);
app.use('/api/candidate', profiles_1.default);
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
        await db_1.default.milestoneType.upsert({
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
//# sourceMappingURL=index.js.map