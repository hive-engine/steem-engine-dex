import * as admin from 'firebase-admin';
import * as express from 'express';

import { uploadMiddleware } from '../upload-middleware';

export const nftRouter = express.Router();

import { Storage } from '@google-cloud/storage';
const storage = new Storage();

const bucket = storage.bucket('steem-engine-dex.appspot.com', {
    userProject: 'steem-engine-dex'
});

// @ts-ignore
import * as SSC from 'sscjs';

const firestore = admin.firestore();
const ssc = new SSC('https://api.steem-engine.com/rpc2');

async function loadNft(symbol: string) {
    const result = await ssc.findOne('nft', 'nfts', { symbol });

    return result;
}

// @ts-ignore
const uploadNftImage = async (filename: string, mimetype: string, buffer: Buffer) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        const formatedFilename = `nft-images/${filename}`;
        
        const file = bucket.file(formatedFilename);
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

nftRouter.post('/upload', uploadMiddleware, async (req: express.Request, res: express.Response) => {
    const authToken = req.headers.authorization || '';
    const symbol = req.body.symbol;
    const allowedMimeTypes = ['image/jpeg', 'image/png'];

    try {
        const decodedToken = await admin.auth().verifyIdToken(authToken);
        const token = await loadNft(symbol);

        // User checks out
        if (decodedToken && decodedToken.aud === 'steem-engine-dex') {
            try {
                const username = decodedToken.uid;

                // User has no permission
                if (token.issuer !== username || token.authorizedIssuingAccounts && !token.authorizedIssuingAccounts.includes(username)) {
                    throw new Error(`User does not have permission to set image`);
                }

                // @ts-ignore
                const file = req.files[0];

                if (file) {
                    const { buffer, mimetype, originalname } = file;

                    if (!allowedMimeTypes.includes(mimetype)) {
                        throw new Error('Invalid mimetype. Only JPG and PNG files are supported.');
                    }

                    const url = await uploadNftImage(`${symbol.toString().toLowerCase()}/${originalname}`, mimetype, buffer);

                    const nftsRef = firestore.collection('nfts');
                    const nft = await nftsRef.doc(symbol).get();

                    const data: any = {
                        image: {
                            dateUploaded: new Date(),
                            filename: originalname,
                            url
                        }
                    };

                    if (nft.exists) {
                        nftsRef.doc(symbol).set(data, { merge: true });
                    }

                    res.status(200).json({ success: true, message: 'Image uploaded successfully.' });
                }
            } catch (e) {
                res.status(400).json({ success: false, message: e });
            }
        }
    } catch (e) {
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
});
