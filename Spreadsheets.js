const getOrCreateSheetTransactions = () => {
  return getOrCreateSheet('Transactions');
};

const getOrCreateSheetBudget = () => {
  return getOrCreateSheet('Budget');
};

const getOrCreateSheetDebt = () => {
  return getOrCreateSheet('Debt');
};

const getOrCreateSheet = (name) => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);

  // If the sheet exists, return it, otherwise create and return it
  return sheet ? sheet : ss.insertSheet(name);
};
