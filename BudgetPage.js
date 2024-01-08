function createBudgetPage() {
    const sheet = getOrCreateSheetBudget();
    sheet.clear();
    const transactions = getTransactions();
    const budget = generateBudget(transactions);
    updateBudgetSheet(sheet, budget);
  }
  
  function getTransactions() {
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
  
  function generateBudget(transactions) {
      let budget = {};
  
      transactions.forEach(transaction => {
          const yearMonth = `${transaction.Date.getFullYear()} ${transaction.Date.toLocaleString('default', { month: 'long' })}`;
          if (!budget[yearMonth]) {
              budget[yearMonth] = {
                categories: initializeBudgetCategories(),
                TotalCashIncome: 0,
                TotalCashExpenses: 0,
                CashFlow: 0,
                TotalCreditCardPayments: 0,
                TotalCreditCardCharges: 0,
                DebtReduction: 0,
                DebtPayoffCapacity: 0,
              }
          }
          const category = transaction.Category;
          const subcategory = transaction.Subcategory;
          const amount = transaction.Amount;
  
          if (budget[yearMonth].categories[category] && budget[yearMonth].categories[category][subcategory]) {  // Check if category and subcategory exist
              budget[yearMonth].categories[category][subcategory].actual += amount;
          } else {
              console.warn(`Skipped "${transaction.Description}" from budget. Add a matching keyword to a subcateogry in Categorization.gs`);
          }
  
          // Track cash metrics
          if (transaction['Account Type'] === 'Checking') {
            if (amount < 0) {
              budget[yearMonth].TotalCashExpenses -= amount; // Convert to positive number for tracking
            } else {
              budget[yearMonth].TotalCashIncome += amount;
            }
          }
  
          // Track credit card metrics
          if (transaction['Account Type'] === 'Credit Card') {
              if (amount < 0) {  // A negative amount indicates a charge
                  budget[yearMonth].TotalCreditCardCharges -= amount;  // Convert to positive number for tracking
              } else {  // A positive amount indicates a payment
                  budget[yearMonth].TotalCreditCardPayments += amount;
              }
          }
      });
  
      for (const yearMonth in budget) {
          const monthlyBudget = budget[yearMonth];
          monthlyBudget.CashFlow = monthlyBudget.TotalCashIncome - monthlyBudget.TotalCashExpenses;
          monthlyBudget.DebtReduction = monthlyBudget.TotalCreditCardPayments - monthlyBudget.TotalCreditCardCharges;
          monthlyBudget.DebtPayoffCapacity = monthlyBudget.CashFlow + monthlyBudget.DebtReduction;
          budget[yearMonth].categories = sortCategoriesByTotalActual(budget[yearMonth].categories);
      }
  
      return budget;
  }
  
  function sortCategoriesByTotalActual(categoriesObj) {
      // Convert categories object to array
      let categoriesArray = Object.entries(categoriesObj).map(([categoryName, subcategories]) => {
          // Calculate total 'actual' for each category
          const totalActual = Object.values(subcategories).reduce((sum, subcategory) => sum + subcategory.actual, 0);
          return {
              name: categoryName,
              subcategories: subcategories,
              totalActual: totalActual,
          };
      });
  
      // Sort categories array by total 'actual' value in descending order
      categoriesArray.sort((a, b) => a.totalActual - b.totalActual);
  
      // Convert categories array back to object
      let sortedCategoriesObj = {};
      categoriesArray.forEach(category => {
          sortedCategoriesObj[category.name] = category.subcategories;
      });
  
      return sortedCategoriesObj;
  }
  
  function initializeBudgetCategories() {
      let categoryMap = {};
      for (const categoryObject of CATEGORIES) {
          const categoryName = categoryObject.name;
          categoryMap[categoryName] = {};
          for (const subcategoryObject of categoryObject.subcategories) {
              const subcategoryName = subcategoryObject.name;
              const defaultValue = subcategoryObject.defaultValue;
              categoryMap[categoryName][subcategoryName] = { budgeted: defaultValue, actual: 0 };
          }
      }
      return categoryMap;
  }
  
  function updateBudgetSheet(sheet, budget) {
      const data = [];
      let rowCounter = 1;
  
      for (const [yearMonth, yearMonthBudget] of Object.entries(budget)) {
          const monthBudgetArray = buildMonthBudgetArray(yearMonth, yearMonthBudget);
          const range = `Budget!A${rowCounter}:E${rowCounter + monthBudgetArray.length - 1}`;
          data.push({ range, values: monthBudgetArray });
          rowCounter += monthBudgetArray.length + 1;
      }
  
      const resource = {
          data: data,
          valueInputOption: 'USER_ENTERED'
      };
  
      const sheetId = sheet.getParent().getId();
      Sheets.Spreadsheets.Values.batchUpdate(resource, sheetId);
  }
  
  function buildMonthBudgetArray(yearMonth, yearMonthBudget) {
      const [year, month] = yearMonth.split(' ');
      const {categories} = yearMonthBudget;
  
      // Extract values before sanitizing categories
      const income = categories.Income?.General?.actual || categories.Income?.General?.budgeted || 0;
      sanitizeCategories(categories);
  
      let monthBudgetArray = [
          [year, month],
      ];
  
      fillSummaryData(monthBudgetArray, yearMonthBudget, income);
      fillCategorySummaryData(monthBudgetArray, categories);
      fillDetailedBreakdownData(monthBudgetArray, categories);
  
      return monthBudgetArray;
  }
  
  function fillSummaryData(monthBudgetArray, yearMonthBudget, income) {
      const summaryData = [
          ['Income:', income],
          ['Total Cash Income:', yearMonthBudget.TotalCashIncome],
          ['Total Cash Expenses:', yearMonthBudget.TotalCashExpenses],
          ['Total Cash Flow:', yearMonthBudget.CashFlow],
          ['Total Credit Card Payments:', yearMonthBudget.TotalCreditCardPayments],
          ['Total Credit Card Charges:', yearMonthBudget.TotalCreditCardCharges],
          ['Debt Reduction:', yearMonthBudget.DebtReduction],
          ['Debt Payoff Capacity:', yearMonthBudget.DebtPayoffCapacity],
          [], // blank space to space data out
      ];
      monthBudgetArray.push(...summaryData);
  }
  
  function fillCategorySummaryData(monthBudgetArray, categories) {
      monthBudgetArray.push(['Category', 'Budgeted', 'Actual', 'Remaining Budget']);
      // Loop through each category to sum up the budgeted, actual, and remaining budget amounts
      for (const [category, subcategories] of Object.entries(categories)) {
          let budgetedTotal = 0;
          let actualTotal = 0;
          for (const subcategory of Object.values(subcategories)) {
              budgetedTotal += subcategory.budgeted || 0;
              actualTotal += subcategory.actual || 0;
          }
          // It is + because actual is negative for expenses
          const remainingBudgetTotal = budgetedTotal + actualTotal;
          monthBudgetArray.push([category, budgetedTotal, actualTotal, remainingBudgetTotal]);
      }
      monthBudgetArray.push([]);  // Adds an empty row as a spacer
  }
  
  function fillDetailedBreakdownData(monthBudgetArray, categories) {
      monthBudgetArray.push(['Category', 'Subcategory', 'Budgeted', 'Actual', 'Remaining Budget']);
      for (const [category, subcategories] of Object.entries(categories)) {
          for (const [subcategory, values] of Object.entries(subcategories)) {
              const { budgeted, actual } = values;
              // It is + because actual is negative for expenses
              const remainingBudget = budgeted + actual;
              monthBudgetArray.push([category, subcategory, budgeted, actual, remainingBudget]);
          }
      }
  }
  
  function sanitizeCategories(categories) {
      delete categories.Income;
      const financialCategoriesToDelete = ['Credit Card Payment', 'Credit Card Transfer', 'Savings Transfer'];
      const financial = categories.Financial;
      financialCategoriesToDelete.forEach(category => {
          if (financial && financial[category]) delete financial[category];
      });
  }
  