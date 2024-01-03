function createDebtPage() {
    const sheet = getOrCreateSheetDebt();
    sheet.clear();
    const transactions = getDebtTransactions();
    const yearMonths = generateYearMonths(transactions)
    const debt = generateDebt(yearMonths, transactions);
    updateDebtSheet(sheet, debt);
  }
  
  function getDebtTransactions() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Transactions');
    const data = sheet.getDataRange().getValues();
    // Assuming header is in the first row
    const header = data.shift();
    const transactions = data.map(row => {
      let transaction = {};
      header.forEach((col, index) => {
        transaction[col] = row[index];
      });
      return transaction;
    });
    return transactions;
  }
  
  function generateYearMonths(transactions) {
    // return dummy data for now
    return ['2023November', '2023October', '2023September']
  }
  
  function generateDebt(yearMonths, transactions) {
    // hard coded example debt for now
  
    const debts = [
      {
        name: "Student loans",
        balance: 10000,
        interestRate: 0.05,
        minPayment: 100,
        additionalPaymentsPlanned: 0,
      },
      {
        name: "Credit card 1234",
        balance: 2000,
        promoInterestRate: 0,
        promoInterestRateDateEnd: new Date(2024, 3, 14),
        interestRate: 0.05,
        minPayment: 150,
        additionalPaymentsPlanned: 0,
      }
    ]
  
    // calculate debts
  
    return [
      {
        yearMonth: '2023November',
        debts: [
          {
            name: 'Student loans',
            interestAccrued: 41.67,
            paymentsMade: 150,
            remaining: 9891.67,
            projectedPayoffDate: new Date(2028,4,1)
          },
          {
            name: 'Credit card 1234',
            interestAccrued: 0,
            paymentsMade: 1000,
            remaining: 2000,
            projectedPayoffDate: new Date(2024,0,1)
          }
        ]
      }
      
    ]
    
  }
  
  function updateDebtSheet(sheet, debt) {
      
  }
  
  