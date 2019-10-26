import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

//import * as Multer from 'multer';

import * as serviceAccount from './steem-engine-dex-firebase-adminsdk-qldnz-94f36e5f75.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    databaseURL: "https://steem-engine-dex.firebaseio.com"
});

// const multer = Multer({
//     storage: Multer.memoryStorage(),
//     limits: {
//       fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
//     },
//   });

import { authRouter } from './routes/auth';
import { kycRouter } from './routes/kyc';

const app = express();

app.disable('x-powered-by');

app.use(cors({ origin: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cacheMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    next();
};

app.use(cacheMiddleware);
//app.use(authMiddleware);

app.use('/', authRouter);
app.use('/kyc', kycRouter);

export const api = functions
    .runWith({ memory: '1GB', timeoutSeconds: 120 })
    .https
    .onRequest(app);
