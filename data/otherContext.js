// data/otherContext.js
import React from 'react';

const OtherContext = React.createContext({
  charities: [],
  setCharities: () => {},
  statements: [],
  setStatements: () => {}, 
  standingOrders: [], // Add this line
  setStandingOrders: () => {}, // Add this line
  transactions: [], // Add this line for transactions
  setTransactions: () => {}, // Add this line for the setter function
  cardDetails: [], // Add this line for transactions
  setCardDetails: () => {}, // Add this line for the setter function
  voucherDetails: [], // Add this line for transactions
  setVoucherDetails: () => {}, // Add this line for the setter function
  accountDetails: {}, // Add this line for account details
  setAccountDetails: () => {}, // Add this line for account details
});


export default OtherContext;