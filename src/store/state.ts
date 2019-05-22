export interface State {
    account: string;
    loggedIn: boolean;
    loading: boolean;
}

export const initialState: State = {
    account: '',
    loggedIn: false,
    loading: false
};
