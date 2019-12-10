import * as admin from 'firebase-admin';
import * as express from 'express';

import { uploadMiddleware } from '../upload-middleware';

export const documentRouter = express.Router();

import { Storage } from '@google-cloud/storage';
const storage = new Storage();

const userDocs = storage.bucket('steem-engine-dex.appspot.com', {
    userProject: 'steem-engine-dex'
});

const firestore = admin.firestore();

// @ts-ignore
const uploadUserFile = async (filename: string, mimetype: string, buffer: Buffer) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        const formatedFilename = `user-uploads/${filename}`;
        
        const file = userDocs.file(formatedFilename);
        const stream = file.createWriteStream({
            metadata: {
                contentType: mimetype
            },
            resumable: false
        });

        stream.on('error', (err) => reject(err));
        stream.on('finish', async () => {
            //const publicUrl = format(`https://storage.googleapis.com/${userDocs.name}/${file.name}`);

            resolve(file.name);
        });
        stream.end(buffer);
    });
};

documentRouter.post('/upload', uploadMiddleware, async (req: express.Request, res: express.Response) => {
    const authToken = req.headers.authorization || '';
    const type = req.body.type;
    const uploadFields = ['selfie', 'passport', 'document1', 'document2'];
    const allowedMimeTypes = ['image/jpeg', 'application/pdf', 'image/png'];

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
                        throw new Error('Invalid mimetype. Only JPG, PNG and PDF files are supported.');
                    }

                    const url = await uploadUserFile(`${username.toString().toLowerCase()}/${originalname}`, mimetype, buffer);

                    const usersRef = firestore.collection('users');
                    const user = await usersRef.doc(username).get();
                    const userData: any = user.data();

                    if (!userData?.residency) {
                        userData.residency = {
                            document1Rejected: false,
                            document2Rejected: false,
                            document1RejectionReason: '',
                            document2RejectionReason: '',
                            document1Verified: false,
                            document2Verified: false,
                            document1Pending: false,
                            document2Pending: false
                        };
                    }

                    const data: any = {
                        kyc: {
                            ...userData.kyc
                        },
                        residency: {
                            ...userData.residency
                        },
                        [type]: {
                            dateUploaded: new Date(),
                            filename: originalname,
                            url
                        }
                    };

                    if (uploadFields.includes(type)) {
                        if (type === 'selfie') {
                            data.kyc.selfiePending = true;
                            data.kyc.selfieVerified = false;
                            data.kyc.passportRejected = false;
                            data.kyc.passportRejectionReason = '';
                        } else if (type === 'passport') {
                            data.kyc.passportPending = true;
                            data.kyc.passportVerified = false;
                            data.kyc.selfieRejected = false;
                            data.kyc.selfieRejectionReason = '';
                        } else if (type === 'document1') {
                            data.residency.document1Pending = true;
                            data.residency.document1Verified = false;
                            data.residency.document1Rejected = false;
                            data.residency.document1RejectionReason = '';
                        } else if (type === 'document2') {
                            data.residency.document2Pending = true;
                            data.residency.document2Verified = false;
                            data.residency.document2Rejected = false;
                            data.residency.document2RejectionReason = '';
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
