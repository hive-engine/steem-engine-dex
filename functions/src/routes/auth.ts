import * as admin from 'firebase-admin';
import * as express from 'express';
import * as shortid from 'shortid';

// Only generate alphanumeric strings
// without confusion characters such as; 1, i, l, 0, o
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

import { Auth } from '../auth';

export const authRouter = express.Router();

const createUserToken = (username: string) => admin.auth().createCustomToken(username);

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

authRouter.post('/verifyToken', async (req: express.Request, res: express.Response) => {
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
authRouter.get('/getUserAuthMemo/:username', async (req: express.Request, res: express.Response) => {
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
authRouter.post('/verifyUserAuthMemo', async (req: express.Request, res: express.Response) => {
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
                await admin.auth().createUser({ uid: username });

                // Create new user reference
                usersRef.doc(username).set({
                    country: '',
                    email: '',
                    firstName: '',
                    lastName: '',
                    addressLine1: '',
                    addressLine2: '',
                    state: '',
                    zipCode: '',
                    favourites: [],
                    hiddenTokens: [],
                    notifications: [],
                    kyc: {
                        passportPending: false,
                        passportVerified: false,
                        passportRejected: false,
                        passportRejectionReason: '',
                        selfiePending: false,
                        selfieVerified: false,
                        selfieRejected: false,
                        selfieRejectionReason: '',
                        token: shortid.generate(),
                        verified: false
                    },
                    wallet: {
                        hideZeroBalances: false,
                        onlyShowFavourites: false
                    },
                    tabPreference: 'profile',
                    admin: false,
                    super: false,
                    kycAuditor: false
                });
            } else {
                // const userData = user.data();

                // // eslint-disable-next-line no-undef
                // if (userData && userData.kyc?.passportRejected === undefined) {
                //     user.ref.update({
                //         kyc: {
                //             passportRejected: false,
                //             passportRejectionReason: '',
                //             selfieRejected: false,
                //             selfieRejectionReason: ''
                //         }
                //     });
                // }
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
