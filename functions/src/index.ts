import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const serviceAccount = require('steem-engine-dex-firebase-adminsdk-qldnz-94f36e5f75.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://steem-engine-dex.firebaseio.com"
});

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
