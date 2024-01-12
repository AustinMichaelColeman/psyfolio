function descriptionReplacement(description) {
    return replaceAmazonDescriptions(description)
  }
  
  function replaceAmazonDescriptions(description) {
    const lowerCaseDescription = description.toLowerCase();
    if (!lowerCaseDescription.includes('amzn') && !lowerCaseDescription.includes('amazon')) {
      return description;
    }
    // replace the keys with the IDs that show in your statement's amazon transactions
    // replace the values with a better description of what you bought
    const amazonDescriptions = {
      'abc123': 'Cat toys',
      'someAmazonCode123': 'Laundry detergent',
    };
  
    for (const [amazonCode, codeDescription] of Object.entries(amazonDescriptions)) {
      if (description.includes(amazonCode)) {
        return `Amazon purchase - ${amazonCode} - ${codeDescription}`;
      }
    }
    return description;
  }