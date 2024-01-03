const createTransactionPage = () => {
  importCSVs();
}

const HEADER_ROW = ['Date', 'Description', 'Amount', 'Category', 'Subcategory', 'Account Type', 'Account Name'];

const bankColumnIndices = {
  WellsFargo: {
    date: 0,
    amount: 1,
    description: 4,
    hasHeaders: false,
  },
  Chase: {
    date: 0,
    amount: 5,
    description: 2,
    hasHeaders: true,
  }
};

const importCSVs = () => {
  const sheet = getOrCreateSheetTransactions();
  sheet.clear();
  
  const files = getFilesFromFolderByDateDescended('BankData');
  let transactions = [];

  const oldestProcessedDate = new Map()
  for (const file of files) {    
    const toDate = extractToDate(file.getName());
    const fromDate = extractFromDate(file.getName());
    const accountName = extractAccountName(file.getName())
    const bank = extractBank(file.getName())
    const indices = bankColumnIndices[bank];
    const csvData = parseCsvData(file);
    let hasSkippedFirstRow = false;
    const fileName = file.getName().toLowerCase();
    let expenseType = getExpenseType(fileName);
    
    for(const row of csvData) {
      if(!hasSkippedFirstRow) {
        if(indices.hasHeaders) {
          hasSkippedFirstRow = true;
          continue;
        }
      }
      const [rowDateRaw] = row
      const [month, day, year] = rowDateRaw.split('/')
      const rowDate = new Date(year, month - 1, day);
      const oldestAccountDateProcessed = oldestProcessedDate.get(accountName)
      // skip dates already processed
      if(rowDate >= oldestAccountDateProcessed) 
        continue;
      const processedTransaction = processRowToTransaction(row, indices, expenseType, accountName);
      transactions.push(processedTransaction);
    };
    oldestProcessedDate.set(accountName, fromDate)
  }
  transactions = sortTransactions(transactions);
  appendDataToSheet(sheet, transactions);
};

const getExpenseType = (fileName) => {
  let expenseType = ''
  if (fileName.includes('checking') || fileName.includes('savings')) {
    expenseType = 'Checking';
  } else if (fileName.includes('visa')) {
    expenseType = 'Credit Card';
  }
  return expenseType;
}

const extractBank = (fileName) => {
  return identifyBank(extractAccountName(fileName));
}

function identifyBank(text) {
  const bankKeywords = [
      { bank: 'Chase', keywords: ['chase'] },
      // key words that appear in the bank account name (the csv file name)
      { bank: 'WellsFargo', keywords: ['wells fargo', 'checking', 'save'] },
  ];

  text = text.toLowerCase();

  for (const {bank, keywords} of bankKeywords) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return bank;
    }
  }

  return null;
}


const getFilesFromFolderByDateDescended = (folderName) => {
  const folder = DriveApp.getFoldersByName(folderName).next();
  const filesIterator = folder.getFiles();
  let files = []

  while (filesIterator.hasNext()) {
    files.push(filesIterator.next())
  }

  files.sort((fileA, fileB) => {
    const accountNameA = extractAccountName(fileA.getName());
    const accountNameB = extractAccountName(fileB.getName());

    if(accountNameA < accountNameB) return -1;
    if(accountNameA > accountNameB) return 1;

    const toDateA = extractToDate(fileA.getName())
    const toDateB = extractToDate(fileB.getName())
    return toDateB - toDateA;
  })
  return files;
};

const extractToDate = (filename) => {
  const [toDate] = filename.split('_');
  const [year, month, day] = toDate.split('-')
  const zeroIndexedMonth = month - 1
  return new Date(year, zeroIndexedMonth, day)
}

const extractFromDate = (filename) => {
  const [,toDate] = filename.split('_');
  const [year, month, day] = toDate.split('-')
  const zeroIndexedMonth = month - 1
  return new Date(year, zeroIndexedMonth, day)
}

const extractAccountName = (filename) => {
  return removeExtension(filename.split('_')[2])
}

const removeExtension = (filename) => {
  return filename.split('.')[0];
}

const parseCsvData = (file) => {
  return Utilities.parseCsv(file.getBlob().getDataAsString());
};

const processRowToTransaction = (row, indices, expenseType, accountName) => {
  const date = new Date(row[indices.date]);
  const description = descriptionReplacement(row[indices.description]);
  const amount = parseFloat(row[indices.amount]);
  const { category, subcategory } = categorize(description);
  return {date, description, amount, category, subcategory, expenseType, accountName};
};

function sortTransactions(transactions) {
  transactions.sort(function (a, b) {
    // Combine the year and month into a single number for each date
    const yearMonthA = a.date.getFullYear() * 12 + a.date.getMonth();
    const yearMonthB = b.date.getFullYear() * 12 + b.date.getMonth();

    // Compare the combined year and month numbers
    if (yearMonthA !== yearMonthB) return yearMonthB - yearMonthA;  // Sort in descending order

    // Compare categories
    const categoryComparison = a.category.localeCompare(b.category);
    if (categoryComparison !== 0) return categoryComparison;

    // Compare subcategories
    const subcategoryComparison = a.subcategory.localeCompare(b.subcategory);
    if (subcategoryComparison !== 0) return subcategoryComparison

    // Compare dates
    const dateComparison = b.date - a.date;
    if (dateComparison !== 0) return dateComparison;

    // Compare amounts
    const amountComparison = a.amount - b.amount;
    if (amountComparison !== 0) return amountComparison;

  });
  return transactions;
}

const appendDataToSheet = (sheet, allData) => {
  const dataArray = allData.map(item => [item.date, item.description, item.amount, item.category, item.subcategory, item.expenseType, item.accountName]);
  dataArray.unshift(HEADER_ROW);
  
  const startRow = sheet.getLastRow() + 1;
  if (dataArray.length > 0) {
    const range = sheet.getRange(startRow, 1, dataArray.length, dataArray[0].length);
    range.setValues(dataArray);
  }
};