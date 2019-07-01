import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


export const createUserReference = functions.auth.user().onCreate((user) => {
    const displayName = user.displayName;
    const email = user.email;
    const uid = user.uid;
});
