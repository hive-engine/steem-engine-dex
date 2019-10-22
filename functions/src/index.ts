import { uploadMiddleware } from './upload-middleware';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import * as AWS from 'aws-sdk';

import { Auth } from './auth';

import * as serviceAccount from './steem-engine-dex-firebase-adminsdk-qldnz-94f36e5f75.json';

const env = functions.config();

AWS.config.update({
    accessKeyId: env.aws.access_key,
    secretAccessKey: env.aws.secret_key,
    region: 'ap-southeast-2'
});

const s3 = new AWS.S3();

// @ts-ignore
const uploadFile = async (mimetype, buffer) => {
    return new Promise((resolve, reject) => {
        const config = {
            Bucket: '',
            ContentType: mimetype,
            ACL: 'public-read',
            Key: Date.now().toString(),
            Body: buffer
        };
    
        s3.upload(config, (err: any, data: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

// const s3PresignedParams = {
//     Bucket: '',
//     Key: '',
//     Expires: 600, // 10 minutes
//     ContentType: '',
//     ACL: 'public-read',
//     ServerSideEncryption: 'AES256'
// };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
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
//app.use(authMiddleware);

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

const createUserToken = (username: string) => admin.auth().createCustomToken(username);

const firestore = admin.firestore();

app.get('/test', (req: express.Request, res: express.Response, next: express.NextFunction) => { 
    res.send('HELLO WORLD');
});

app.post('/uploadDocument', uploadMiddleware, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // @ts-ignore
    console.log(req.files);

    // @ts-ignore
    res.json(req.files);
});

app.post('/verifyToken', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authToken = req.body.authToken;

    try {
        const decodedToken = await admin.auth().verifyIdToken(authToken);

        res.status(200).json({ success: true, decodedToken });
    } catch (e) {
        console.error(e);
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
});

// Gets an encrypted memo to send to the user
// They use their private key to decode it and send back the AES string
app.get('/getUserAuthMemo/:username', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const username = req.params.username;

    try {
        const memo = await Auth.generateMemo(username);

        res.status(201).json({ success: true, memo });
    } catch (e) {
        console.log(e);
        res.status(500).json({ success: false, message: 'Could not load account' });
    }
});

// This should be an AES encryption string containing their username
app.post('/verifyUserAuthMemo', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const username = req.body.username;
    const signedKey = req.body.signedKey;

    const decoded = Auth.decryptAes(signedKey);

    const usersRef = firestore.collection('users');

    if (decoded[0] === username) {
        try {
            // User is legit
            const token = await createUserToken(username);

            const user = await usersRef.doc(username).get();

            if (!user.exists) {
                usersRef.doc(username).set({
                    favourites: [],
                    hiddenTokens: []
                });
            }

            return res.status(200).json({ success: true, token });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ success: false, message: e });
        }
    } else {
        return res.status(401).json({ success: false, message: 'Username not found in payload' })
    }
});

export const api = functions.https.onRequest(app);
