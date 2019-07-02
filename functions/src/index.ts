import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import { authMiddleware } from './auth-middleware';

const serviceAccount = require('steem-engine-dex-firebase-adminsdk-qldnz-94f36e5f75.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://steem-engine-dex.firebaseio.com"
});

const app = express();

app.use(cors({ origin: true }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cacheMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    next();
};

app.use(cacheMiddleware);
app.use(authMiddleware);

// @ts-ignore
const getUser = async (token: string) => {
    if (token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);

            return decodedToken;
        } catch (err) {
            return err;
        }
    }
};

const firestore = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


export const createUserReference = functions.auth.user().onCreate(async (user) => {
    const usersRef = firestore.collection('users');

    const created = await usersRef.doc(user.displayName as string).create(user);
});

export const removeUserReference = functions.auth.user().onDelete((user) => {

});

app.get('getUserAuthMemo/:username', (req: express.Request, res: express.Response, next: express.NextFunction) => {

});

app.post('verifyUserAuthMemo', (req: express.Request, res: express.Response, next: express.NextFunction) => {

});

app.post('verifyAuthToken', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.body.username && req.body.signedKey) {
        admin.auth().createCustomToken(req.body.username)
            .then(function(customToken: any) {
                // Send token back to client
            })
            .catch(function(error) {
                console.log('Error creating custom token:', error);
            });
    }
});

export const api = functions.https.onRequest(app);
