import * as admin from 'firebase-admin';
import * as express from 'express';

export const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authToken = req.body.authToken;

    if (authToken) {
        // Verify token and decode if the token is valid
        const decodedToken = await admin.auth().verifyIdToken(authToken);

        if (decodedToken) {
            return next();
        } else {
            return res.status(401).send('ERR_INVALID_TOKEN');
        }
    }
}
