# Psyfolio

Automated financial analysis and budgeting project for Google Sheets

## Features

- Custom transaction categorization and subcategorization
- Custom budget values for each subcategory
- Amazon transaction description replacement
- Spending insight on budget page
- Automatically generated monthly budget pages
- Quickly gain insights into your financial data for free

## How to use

1. Create a new Google Sheets document and name it something such as "Automated Budget"
2. Select Extensions -> Apps Script
3. Manually create a .gs script for each of the .js files here.
4. Get your bank data in a csv format with the file name in the form of "toDate_fromDate_accountName 1234.csv", where the dates are in the form YYYY-MM-DD. I made a chrome extension to automate this for Wells Fargo here: https://github.com/AustinMichaelColeman/transactionDownloader
5. Put your bank data csvs in a folder named "BankData" at the root of your Google Drive
6. Add the Google Sheets API to the Services in your Apps Script project
7. Open Psyfolio.gs in your Apps Script Project
8. In the dropdown at the top, select Psyfolio and click Run
9. Accept the permissions.
10. Change Categorization and DescriptionReplacement based on your criteria. Re-run the script as needed. Note - it will clear and recreate the sheet with every run.
11. The Categories page will not be cleared. Instead if it exists, it will be used to create the budget. Delete the Categories page and re-run Psyfolio and it will create the categories page for you with some default options.

You may notice some logs print about categories. Go to the Transactions page in Google Sheets and look at the uncategorized transaction descriptions. Add some keywords or categories to the Categorization sheet. defaultValue is the default budget value of that subcategory. Check out the budget page that is generated too. It generates a budget for each month of data. All months share the same budget, defined in the Categorization page.
