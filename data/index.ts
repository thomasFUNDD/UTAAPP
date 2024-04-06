import React, { useContext } from 'react';
import BalanceContext from './balancesContext';
import OtherContext from './otherContext';

export const userCards = [
  {
    id: "1",
    number: `**** **** **** ${useContext(OtherContext).panNumber}`,
    balance: useContext(BalanceContext).currentBalance.toString(),
  },
];


console.log(useContext(BalanceContext).currentBalance);
console.log(useContext(OtherContext).panNumber);

export const allNotifications = [
 
    
]

export const unreadNotifications = [
   
    
]

export const requestMoneyData = [
   
]

export const onPressSavingsData = [
  
]

export const doneSavingsData = [

]

export const allHistoryData = [
  

]

export const sendHistoryData = [
   
]

export const requestHistoryData = [
   

];

export const helpData = [
    {
      id: "1",
      title: "How to Change Password",
      description: "Learn how to change your account password for added security.",
    },
    {
      id: "2",
      title: "Troubleshooting Connectivity Issues",
      description: "Find solutions for common connectivity problems and improve your experience.",
    },
   
    {
      id: "3",
      title: "Navigating the Dashboard",
      description: "Get familiar with the dashboard interface and efficiently navigate through features.",
    },

  ];
  