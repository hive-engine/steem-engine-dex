'use strict';

const firebase: any = jest.genMockFromModule('firebase/app'); 

firebase.auth = jest.fn().mockImplementation(() => {
    return {
        currentUser: {
            getIdToken: jest.fn().mockImplementation(() => '989duiu787u')
        }
    }
});

export default firebase;
