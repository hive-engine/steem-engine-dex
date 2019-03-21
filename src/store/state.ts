export interface State {
    loggedIn: boolean;
    user: {
        id: number;
        name: string;
        balance: string;
        sbd_balance: string;
        can_vote: boolean;
        post_count: number;
        voting_power: number;
        json_metadata?: any;
        voting_manabar: {
          current_mana: string;
          last_update_time: number;
        };
        reputation: any;
        valueInUsd: number;
    };
}

export const initialState: State = {
    loggedIn: false,
    user: {
        id: null,
        name: '',
        balance: '',
        sbd_balance: '',
        can_vote: false,
        post_count: 0,
        voting_power: 0,
        json_metadata: {},
        voting_manabar: {
          current_mana: '',
          last_update_time: 0
        },
        reputation: 0,
        valueInUsd: 0
    }
};
