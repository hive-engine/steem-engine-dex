import * as admin from 'firebase-admin';
import * as express from 'express';
import { format } from 'util';

import { uploadMiddleware } from '../upload-middleware';

export let kycRouter = express.Router();

import { Storage } from '@google-cloud/storage';
const storage = new Storage();

const userDocs = storage.bucket('steem-engine-dex.appspot.com', {
    userProject: 'steem-engine-dex'
});

const firestore = admin.firestore();

// @ts-ignore
const uploadUserFile = async (filename: string, mimetype: string, buffer: Buffer) => {
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

kycRouter.post('/upload', uploadMiddleware, async (req: express.Request, res: express.Response) => {
    const authToken = req.headers.authorization || '';
    const type = req.body.type;
    const kycFields = ['selfie', 'passport'];
    const allowedMimeTypes = ['image/jpeg', 'application/pdf'];

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

                    if (!allowedMimeTypes.includes(mimetype)) {
                        throw new Error('Invalid mimetype. Only JPG and PDF files are supported.');
                    }

                    await uploadUserFile(`${username.toString().toLowerCase()}/${originalname}`, mimetype, buffer);

                    const usersRef = firestore.collection('users');
                    const user = await usersRef.doc(username).get();
                    const userData: any = user.data();

                    const data: any = {
                        kyc: {
                            ...userData.kyc,
                            passportPending: false,
                            passportVerified: false,
                            selfiePending: false,
                            selfieVerified: false
                        },
                        [type]: {
                            filename: originalname
                        }
                    };

                    // The type of upload is a KYC document
                    if (kycFields.includes(type)) {
                        if (type === 'selfie') {
                            data.kyc.selfiePending = true;
                            data.kyc.selfieVerified = false;
                        } else if (type === 'passport') {
                            data.kyc.passportPending = true;
                            data.kyc.passportVerified = false;
                        }
                    }

                    if (user.exists) {
                        usersRef.doc(username).set(data, { merge: true });
                    }

                    res.status(200).json({ success: true, message: 'Document uploaded successfully.' });
                }
            } catch (e) {
                res.status(400).json({ success: false, message: e });
            }
        }
    } catch (e) {
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
});
