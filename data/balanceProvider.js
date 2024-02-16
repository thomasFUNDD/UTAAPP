// BalanceProvider.js
import React, { useState, useEffect } from 'react';
import BalanceContext from './balancesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BalanceProvider = ({ children }) => {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const loadBalance = async () => {
      const storedBalance = await AsyncStorage.getItem('currentBalance');
      if (storedBalance) {
        setCurrentBalance(JSON.parse(storedBalance));
      }
    };

    loadBalance();
  }, []);

  // You might want to add a similar effect for loading transactions if they are stored

  return (
    <BalanceContext.Provider value={{ currentBalance, setCurrentBalance, transactions, setTransactions }}>
      {children}
    </BalanceContext.Provider>
  );
};

export default BalanceProvider;