const translateText = async (texts, targetLanguage) => {
    const requestBody = {
      data: texts
    };
  
    try {
      const fetch = (await import('node-fetch')).default;
  
      // Log the text being sent to the NMT API
      console.log('Text being sent to NMT API:', requestBody.data);
  
      const response = await fetch('https://revapi.reverieinc.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'REV-API-KEY': '99425a49d90bbc4829af2934e823ce27b5b46a55',
          'REV-APP-ID': 'rev.interntesting',
          'src_lang': 'en',
          'tgt_lang': targetLanguage,
          'domain': '1',
          'REV-APPNAME': 'localization'
        },
        body: JSON.stringify(requestBody)
      });
  
      // Check if response is ok (status code 2xx)
      if (!response.ok) {
        throw new Error(`NMT API request failed with status ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
  
      // Check if the response contains a valid responseList
      if (!data.responseList || !Array.isArray(data.responseList)) {
        throw new Error('Invalid response format from NMT API');
      }
  
      return data.responseList.map(item => item.outString);
    } catch (error) {
      console.error('Error translating text:', error.message || error);
      return texts; // Return original texts if translation fails
    }
  };
  
  module.exports = { translateText };  // Correctly export the function
  