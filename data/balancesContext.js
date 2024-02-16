// data/balancesContext.js
import React from 'react';

const BalanceContext = React.createContext({
  currentBalance: 0,
  setCurrentBalance: () => {},
  transactions: [],
  setTransactions: () => {},
  cardDetails: [], // Add this line for card details
  setCardDetails: () => {},
});

export default BalanceContext;