import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db.js';

import contactsRouter from './routes/contacts.js';
import inboxRouter from './routes/inbox.js';
import campaignRouter from './routes/campaign.js';
import templatesRouter from './routes/templates.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/contacts', contactsRouter);
app.use('/api/inbox', inboxRouter);
app.use('/api/campaign', campaignRouter);
app.use('/api/templates', templatesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;
  res.status(status).json({ error: message });
});

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
