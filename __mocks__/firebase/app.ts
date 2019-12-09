'use strict';

const firebase: any = jest.genMockFromModule('firebase/app'); 

firebase.auth = jest.fn().mockImplementation(() => {
    return {
        currentUser: {
            getIdToken: jest.fn().mockImplementation(() => '989duiu787u'),
            getIdTokenResult: jest.fn().mockResolvedValue({ token: 'skdjfkfsdf3' })
        },
        onAuthStateChanged: jest.fn((callback) => {
            callback({ uid: 'beggars' });
        })
    }
});

export default firebase;
