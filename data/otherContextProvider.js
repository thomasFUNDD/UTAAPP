// otherContextProvider.js
import React, { useState } from 'react';
import OtherContext from './otherContext'; // No need to specify the extension, just ensure the file name is correct

const OtherContextProvider = ({ children }) => {
  const [charities, setCharities] = useState([]);
  const [statements, setStatements] = useState([]); // Add this line
  const [standingOrders, setStandingOrders] = useState([]); // Add this line
  const [transactions, setTransactions] = useState([]); // Add this line for transactions state
  const [cardDetails, setCardDetails] = useState([]); // Add this line for card details state
  const [voucherDetails, setVoucherDetails] = useState([]); // Add this line for card details state

  const [accountDetails, setAccountDetails] = useState([]); // Add this line for card details state


  // Add more state as needed

  // Create a value object that holds all state and setters
  const value = {
    charities,
    setCharities,
    statements, // Add this line
    setStatements, // Add this line
    standingOrders, // Add this line
    setStandingOrders, // Add this line
    transactions, // Add this line to include transactions in the context value
    setTransactions,
    cardDetails, // Add this line to include card details in the context value
    setCardDetails, // Add this line to include the setter function
    voucherDetails,
    setVoucherDetails,
    accountDetails,
    setAccountDetails
    // Add more pairs of data and setters here
  };

  return (
    <OtherContext.Provider value={value}>
      {children}
    </OtherContext.Provider>
  );
};

export default OtherContextProvider;