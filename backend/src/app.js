import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
app.use(express.json());
import morgan from 'morgan';
import routes from './routes/index.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ message: 'API PideON funcionando correctamente' });
});

app.use('/api', routes);
app.use(errorMiddleware);

export default app;