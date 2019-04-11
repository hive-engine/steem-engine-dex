import { CallingAction } from 'aurelia-store';
import { State } from 'store/state';
import { usdFormat } from 'common/functions';

export const BalancesMiddleware = (state: State, originalState: State, {}, action: CallingAction) => {
    if (action.name === 'loadBalances') {
        state.user.balances = state.user.balances.map(d => {
            const token = state.tokens.find(t => t.symbol === d.symbol);
    
            return Object.assign(d, { 
                name: token.name, 
                lastPrice: token.lastPrice, 
                priceChangePercent: token.priceChangePercent,
                usdValue: usdFormat(d.balance * token.lastPrice, 2)
            });
        });
    
        let totalInUsd = 0.00;
        state.user.balances.forEach(function(o) {
            const amount = parseFloat(o.usdValue.replace('$', '').replace(',', ''));
            totalInUsd += amount;
        });
    
        state.user.totalUsdValue = totalInUsd;
    }

    return state;
};
