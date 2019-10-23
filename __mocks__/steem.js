module.exports = {
    default: jest.fn().mockImplementation(() => {
        return {
            api: {
                getAccountsAsync: jest.fn(usernames).mockImplementation(() => Promise.resolve(usernames[0]))
            }
        }
    })
}
