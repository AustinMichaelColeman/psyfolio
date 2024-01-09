// customize these categories in your Google Apps Scripts project
const DEFAULT_CATEGORIES = [
  {
    name: "Income",
    subcategories: [
      {
        name: "General",
        // budget value
        defaultValue: 9001,
        // if a keyword appears in a transaction description, it will be categorized as this category
        // earlier matching categories take precident
        keywords: ["deposit", "payroll"],
      },
    ],
  },
  {
    name: "Housing",
    subcategories: [
      {
        name: "Rent",
        defaultValue: 4200,
        keywords: ["rent"],
      },
      {
        name: "Utilities",
        defaultValue: 420,
        keywords: ["pg&e", "utilities", "water", "electric"],
      },
    ],
  },
  {
    name: "Transportation",
    subcategories: [
      {
        name: "Fuel",
        defaultValue: 150,
        keywords: ["shell oil", "fuel", "chevron"],
      },
      {
        name: "Rideshare",
        defaultValue: 0,
        keywords: ["uber"],
      },
      {
        name: "Parking",
        defaultValue: 0,
        keywords: ["impark"],
      },
    ],
  },
  {
    name: "Food",
    subcategories: [
      {
        name: "Groceries",
        defaultValue: 420,
        keywords: ["grocery", "market", "supermarket", "safeway"],
      },
      {
        name: "Eating Out",
        defaultValue: 100,
        keywords: ["mcdonalds", "mcdonald's", "taco bell"],
      },
    ],
  },
  {
    name: "Leisure",
    subcategories: [
      {
        name: "Entertainment",
        defaultValue: 100,
        keywords: [
          "steamgames.com",
          "netflix.com",
          "hulu",
          "audible",
          "youtube",
          "zoom.us",
          "netflix",
          "disney plus",
        ],
      },
      {
        name: "Vacation",
        defaultValue: 100,
        keywords: ["vacation", "airbnb", "hotel", "flight"],
      },
    ],
  },
  {
    name: "Financial",
    subcategories: [
      {
        // a transfer is is a negative amount
        name: "Credit Card Transfer",
        defaultValue: 0,
        keywords: ["to wells fargo", "credit crd autopay"],
      },
      {
        // a credit card payment is a positive amount
        name: "Credit Card Payment",
        defaultValue: 0,
        keywords: ["online payment", "adjustment-purchases"],
      },
      // other categories here are assumed negative
      {
        name: "Cash Payment",
        defaultValue: 10,
        keywords: ["zelle to", "venmo"],
      },
      {
        name: "Loan Payment",
        defaultValue: 100,
        keywords: ["loan payment"],
      },
    ],
  },
  {
    name: "Insurance",
    subcategories: [
      {
        name: "Auto Insurance",
        defaultValue: 100,
        keywords: ["geico"],
      },
      {
        name: "Other Insurance",
        defaultValue: 10,
        keywords: ["insurance"],
      },
    ],
  },
  {
    name: "Communication",
    subcategories: [
      {
        name: "Internet",
        defaultValue: 50,
        keywords: ["internet"],
      },
      {
        name: "Phone",
        defaultValue: 100,
        keywords: ["phone"],
      },
    ],
  },
  {
    name: "Pets",
    subcategories: [
      {
        name: "Vet",
        defaultValue: 100,
        keywords: ["vet"],
      },
      {
        name: "Shopping",
        defaultValue: 100,
        keywords: ["abc123"],
      },
    ],
  },
  {
    name: "Shopping",
    subcategories: [
      {
        name: "Household",
        defaultValue: 100,
        keywords: ["someAmazonCode123"],
      },
      {
        name: "Discretionary",
        defaultValue: 200,
        keywords: ["amazon"],
      },
    ],
  },
];

function getOrCreateCategoriesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Categories");

  if (!sheet) {
    // Sheet doesn't exist, create and populate with default categories
    sheet = ss.insertSheet("Categories");
    const values = DEFAULT_CATEGORIES.flatMap((category) =>
      category.subcategories.map((sub) => [
        category.name,
        sub.name,
        sub.defaultValue,
        sub.keywords.join(", "),
      ])
    );
    const categoryRows = [
      ["Category", "Subcategory", "DefaultValue", "Keywords"],
      ...values,
    ];
    sheet
      .getRange(1, 1, categoryRows.length, categoryRows[0].length)
      .setValues(categoryRows);
  }

  return sheet;
}

function readCategoriesFromSheet(sheet) {
  const values = sheet.getDataRange().getValues();
  const categories = {};

  values.slice(1).forEach((row) => {
    const [categoryName, subcategoryName, defaultValue, keywords] = row;
    if (!categories[categoryName]) {
      categories[categoryName] = { name: categoryName, subcategories: [] };
    }
    categories[categoryName].subcategories.push({
      name: subcategoryName,
      defaultValue: defaultValue,
      keywords: keywords.split(",").map((k) => k.trim()),
    });
  });

  return Object.values(categories);
}

let cachedCategories = null;
function categorize(description) {
  if (!cachedCategories) {
    const sheet = getOrCreateCategoriesSheet();
    cachedCategories = readCategoriesFromSheet(sheet);
  }

  for (const categoryObject of cachedCategories) {
    const category = categoryObject.name;
    for (const subcategoryObject of categoryObject.subcategories) {
      const subcategory = subcategoryObject.name;
      if (
        subcategoryObject.keywords.some((keyword) =>
          description.toLowerCase().includes(keyword.toLowerCase())
        )
      ) {
        return { category, subcategory };
      }
    }
  }
  return { category: "Uncategorized", subcategory: "Uncategorized" }; // Default category if no keywords are matched
}
