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
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }
  
  const status = err.status || 500;
  const response = {
    error: {
      message: process.env.NODE_ENV === 'production' && status === 500
        ? 'Internal Server Error'
        : err.message,
      code: err.code || 'INTERNAL_ERROR'
    }
  };
  
  res.status(status).json(response);
});

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
