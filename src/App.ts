import { App } from './helpers/Functions';
import { join } from 'path';
import { config } from 'dotenv';
import { merchantRoutes } from './routes/routes';


config({ path: join(__dirname, '../.env') });
const authRoutes = merchantRoutes.map((r) => r.path).slice(3);
const app: App = new App(merchantRoutes, process.env.PORT, authRoutes)


export default app;
