import { uploadMiddleware } from './upload-middleware';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { format } from 'util';
import * as uuidv4 from 'uuid/v4';
//import * as Multer from 'multer';

import { Auth } from './auth';

import * as serviceAccount from './steem-engine-dex-firebase-adminsdk-qldnz-94f36e5f75.json';

import { Storage } from '@google-cloud/storage';
const storage = new Storage();

// const multer = Multer({
//     storage: Multer.memoryStorage(),
//     limits: {
//       fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
//     },
//   });

const userDocs = storage.bucket('steem-engine-dex.appspot.com', {
    userProject: 'steem-engine-dex'
});

// @ts-ignore
const uploadFile = async (filename: string, mimetype: string, buffer: Buffer) => {
    return new Promise((resolve, reject) => {
        const formatedFilename = `user-uploads/${filename}`;
        
        const file = userDocs.file(formatedFilename);
        const stream = file.createWriteStream({
            metadata: {
                contentType: mimetype
            },
            resumable: false
        });

        stream.on('error', (err) => reject(err));
        stream.on('finish', () => {
            const publicUrl = format(`https://storage.googleapis.com/${userDocs.name}/${file.name}`);

            resolve(publicUrl);
        });
        stream.end(buffer);
    });
};

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

app.get('/test', (req: express.Request, res: express.Response) => { 
    res.send('HELLO WORLD');
});

app.post('/uploadDocument', uploadMiddleware, async (req: express.Request, res: express.Response) => {
    const authToken = req.headers.authorization || '';
    const type = req.body.type;

    try {
        const decodedToken = await admin.auth().verifyIdToken(authToken);

        // User checks out
        if (decodedToken && decodedToken.aud === 'steem-engine-dex') {
            // Username from token
            const username = decodedToken.uid;

            try {
                // @ts-ignore
                const file = req.files[0];

                if (file) {
                    const { buffer, mimetype, originalname } = file;

                    const upload = await uploadFile(`${username.toString().toLowerCase()}/${originalname}`, mimetype, buffer);

                    const usersRef = firestore.collection('users');
                    const user = await usersRef.doc(username).get();

                    if (user.exists) {
                        usersRef.doc(username).set({
                            [type]: {
                                filename: originalname
                            }
                        }, { merge: true });
                    }

                    res.status(200).json(upload);
                }
            } catch (e) {
                res.status(400).json({ success: false, message: e });
            }
        }
    } catch (e) {
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }

    // // @ts-ignore
    // console.log(req.files);

    // // @ts-ignore
    // res.json(req.files);
});

app.post('/verifyToken', async (req: express.Request, res: express.Response) => {
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
app.get('/getUserAuthMemo/:username', async (req: express.Request, res: express.Response) => {
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
app.post('/verifyUserAuthMemo', async (req: express.Request, res: express.Response) => {
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
                // Create new user reference
                usersRef.doc(username).set({
                    favourites: [],
                    hiddenTokens: [],
                    kyc: {
                        dateSubmitted: '',
                        passportPending: false,
                        passportVerified: false,
                        selfiePending: false,
                        selfieVerified: false,
                        token: uuidv4(),
                        verified: false
                    },
                    tabPreference: 'favorites'
                });
            } else {
                const userData = user.data();

                // User hasn't got a KYC object
                if (userData && !userData.kyc) {
                    user.ref.update({
                        kyc: {
                            dateSubmitted: '',
                            passportPending: false,
                            passportVerified: false,
                            selfiePending: false,
                            selfieVerified: false,
                            token: uuidv4(),
                            verified: false
                        }
                    });
                }
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

export const api = functions
    .runWith({ memory: '1GB', timeoutSeconds: 120 })
    .https
    .onRequest(app);
