import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDDPjgEMwAD1PU3PG5Dinci2QjRmQ5Pi4k",
    authDomain: "steem-engine-dex.firebaseapp.com",
    databaseURL: "https://steem-engine-dex.firebaseio.com",
    projectId: "steem-engine-dex",
    storageBucket: "steem-engine-dex.appspot.com",
    messagingSenderId: "947796838950",
    appId: "1:947796838950:web:af5b8ba241cc4910"
};

firebase.initializeApp(firebaseConfig);
