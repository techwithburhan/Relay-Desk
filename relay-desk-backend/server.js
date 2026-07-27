import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
import customersRoutes from './routes/customers.routes.js';
import agentsRoutes from './routes/agents.routes.js';
import knowledgeBaseRoutes from './routes/knowledgeBase.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import logsRoutes from './routes/logs.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import downloadsRoutes from './routes/downloads.routes.js';
import slidesRoutes from './routes/slides.routes.js';
import licenseRoutes from './routes/license.routes.js';
import departmentsRoutes from './routes/departments.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import branchesRoutes from './routes/branches.routes.js';
import transfersRoutes from './routes/transfers.routes.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
// Raised from the default 100kb — logo/slide uploads are sent as base64
// data URIs in the JSON body.
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/downloads', downloadsRoutes);
app.use('/api/slides', slidesRoutes);
app.use('/api/license', licenseRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/transfers', transfersRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Relay Desk API running on http://localhost:${PORT}`);
});
