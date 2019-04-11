export interface State {
  user: {
      name: string;
      balances: any[];
      buyBook: any[];
      sellBook: any[];
      tokenBalance: any[];
      totalUsdValue: number;
      loggedIn: boolean;
  };
  loading: boolean;
  steemPrice: number;
  buyBook: any[];
  sellBook: any[];
  tradesHistory: any[];
  token: any;
  tokens: any[];
}

export const initialState: State = {
  user: {
      name: '',
      balances: [],
      buyBook: [],
      sellBook: [],
      tokenBalance: [],
      totalUsdValue: 0.00,
      loggedIn: false
  },
  loading: false,
  steemPrice: 0,
  buyBook: [],
  sellBook: [],
  tradesHistory: [],
  token: 0,
  tokens: []
};
