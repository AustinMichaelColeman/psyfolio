# Psyfolio

Automated financial analysis and budgeting project for Google Sheets

## Features

- Custom transaction categorization and subcategorization
- Custom budget values for each subcategory
- Amazon transaction description replacement
- Spending insight on budget page
- Automatically generated monthly budget pages
- Quickly gain insights into your financial data for free

## Why Psyfolio?

Why pay for a financial analysis and budgeting service when you could do it yourself for free? Psyfolio is an automated financial analysis and budgeting project for Google Sheets.

Most banks have a way of providing your transaction history data in the form of a csv. This project converts the data in the csvs into spending insights in a Google Sheets page. And with the help of another extension I made, you can quickly automatically update the data in your budget and see exactly how much of your shopping or fast food budget you have left for example.

Also, have you ever looked at your bank statement what all those Amazon purchases were? This also will help with that. Use DescriptionReplacement.js to replace the keys with your own description of what you bought. They can also be used in categorization to categorize your Amazon spending.

## How to use

1. Create a Google Apps scripts project: https://script.google.com/home
2. Create a .gs script for each of the .js files here
3. Get your bank data in a csv format with the file name in the form of "toDate_fromDate_accountName 1234.csv", where the dates are in the form YYYY-MM-DD. I made a chrome extension to automate this for Wells Fargo here: https://github.com/AustinMichaelColeman/transactionDownloader
4. Make sure the bank data csvs are in the form date,amount,_,_,description and do not have a header row. You can customize the column indexes by modifying bankColumnIndices in TransactionsPage.js. There are some assumptions in there about what names will show up too. Also it withdrawals are negative and income is positive, for both cash and credit cards.
5. Put your bank data csvs in a folder named "BankData" at the root of your Google Drive
6. Add the Google Sheets API to the Services in your Apps Script project
7. Open Psyfolio.gs in your Apps Script Project
8. You will need to connect the Apps Script to a new Google Sheets document. I'd suggest calling the document "Automated Budget"
9. In the dropdown at the top, select Psyfolio and click Run

You may notice some logs print about categories. Go to the Transactions page in Google Sheets and look at the uncategorized transaction descriptions. Add some keywords or categories to Categorization.gs. defaultValue is the default budget value of that subcategory. Check out the budget page that is generated too. It generates a budget for each month of data. All months share the same budget, defined in categorization.gs.
