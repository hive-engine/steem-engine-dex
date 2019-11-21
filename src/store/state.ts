import { Step4Model } from './../routes/account/accredited-investor/step-4/step-4.model';
import { Step3Model } from './../routes/account/accredited-investor/step-3/step-3.model';
import { Step2Model } from './../routes/account/accredited-investor/step-2/step-2.model';
import { Step1Model } from './../routes/account/accredited-investor/step-1/step-1.model';

import { environment } from 'environment';
export interface AccountInterface {
    name: string;
    account: any;
    balances: any[];
    scotTokens: any[];
    pendingUnstakes: any[];
    token: any;
    notifications: any[];
    nfts: INftInstance[]
}

export interface ISettings {
    disableDeposits: boolean;
    disableWithdrawals: boolean;
    disabledTokens: string[];
    maintenanceMode: boolean;
    siteName: string;
    nativeToken: string;
}

export interface INftProperty {
    authorizedIssuingAccounts: string[] | null;
    authorizedIssuingContracts: string[] | null;
    isReadOnly: boolean;
    name: string;
    type: string;
}

export interface INft {
    symbol: string;
    issuer: string;
    name: string;
    supply: number;
    maxSupply: number;
    metadata: {
        url: string;
        icon: string;
        desc: string;
    };
    circulatingSupply: number;
    delegationEnabled: boolean;
    undelegationCooldown: number;
    authorizedIssuingAccounts: string[];
    authorizedIssuingContracts: string[];
    properties: INftProperty[];
}

export interface INftInstance {
    _id: number;
    account: string;
    ownedBy: string;
    lockedTokens: any;
    properties: any;
    delegatedTo: {
        account: string;
        ownedBy: string;
        undelegatedAt: number;
    }
}

export interface State {
    $action: any;
    account: AccountInterface;
    settings: ISettings;
    firebaseUser: any;
    loggedIn: boolean;
    loading: boolean;
    tokens: IToken[];
    tokensLoaded: boolean;
    buyBook: any[];
    sellBook: any[];
    tradeHistory: any[];
    buyTotal?: number;
    sellTotal?: number;
    pendingWithdrawals: any[];
    conversionHistory: any[];
    nft: INft;
    nfts: INft[];
    instances: INftInstance[];
    investorQuestionnaire: {
        currentStep: number;
        totalSteps: number;
        step1: Step1Model;
        step2: Step2Model;
        step3: Step3Model;
        step4: Step4Model;
    };
}

export const initialState: State = {
    $action: {
        name: '',
        params: {}
    },
    account: {
        name: '',
        token: {},
        account: {},
        balances: [],
        scotTokens: [],
        pendingUnstakes: [],
        notifications: [],
        nfts: []
    },
    settings: {
        disableDeposits: false,
        disableWithdrawals: false,
        disabledTokens: environment.disabledTokens,
        maintenanceMode: environment.maintenanceMode,
        siteName: 'Steem Engine',
        nativeToken: environment.nativeToken
    },
    firebaseUser: {},
    loggedIn: false,
    loading: false,
    tokens: [],
    buyBook: [],
    sellBook: [],
    tradeHistory: [],
    conversionHistory: [],
    buyTotal: 0,
    sellTotal: 0,
    pendingWithdrawals: [],
    nft: null,
    nfts: [],
    instances: [],
    tokensLoaded: false,
    investorQuestionnaire: {
        currentStep: 1,
        totalSteps: 1,
        step1: new Step1Model(),
        step2: new Step2Model(),
        step3: new Step3Model(),
        step4: new Step4Model()
    }
};
