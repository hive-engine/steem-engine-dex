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

export const createUserRoles = functions.auth.user().onCreate((user) => {
    const customClaims: any = {
        member: true
    };

    const adminUsers = ['yabapmatt', 'aggroed', 'beggars'];

    if (adminUsers.includes(user.uid)) {
        customClaims.admin = true;
        customClaims.super = true;
    }

    return admin.auth().setCustomUserClaims(user.uid, customClaims);
});

export const auditAdminChanges = functions.firestore.document('admin/settings').onUpdate(async (change, context) => {
    const before = change.before.data();
    const after  = change.after.data();

    if (after) {
        const updatedBy = after.updatedBy;

        try {
            const ref = admin.firestore().collection('audit').doc();
            const id = ref.id;
            const createdAt = Date.now();
            const data = {updatedBy, before, after, id, createdAt, type: 'adminSettings'};

            await ref.set(data)
        } catch (e) {
            console.error('Error adding audit change', e);
        }
    }
});

export const api = functions
    .runWith({ memory: '1GB', timeoutSeconds: 120 })
    .https
    .onRequest(app);
