// src/controllers/translationController.js

const puppeteer = require('puppeteer');
const { connectToMongoDB } = require('../utils/database.js');  // Import the database connection function
const { translateText } = require('../services/translationService');  // Import the translation service
const PORT = 5000;  // Define the PORT variable

const extractText_and_Translate = async (url, language, res) => {
  if (!url || !language) {
    return res.status(400).json({ success: false, message: 'Invalid URL or language' });
  }

  let browser;
  let dbClient;  // To store the MongoDB client reference
  try {
    const collection = await connectToMongoDB();
    dbClient = collection.s.db.s.client; // Access the MongoDB client reference directly

    // Check if the translated HTML for this URL is already in the database
    const existingEntry = await collection.findOne({ url: url, language: language });

    if (existingEntry) {
      console.log('URL found in database, returning cached translation.');
      return res.json({ success: true, content: existingEntry.translatedHTML });
    }

    // If not found in database, proceed with translation
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extract text nodes from the webpage
    const { textNodesData, hrefLinks } = await page.evaluate((baseUrl) => {
      const textNodes = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

      while (walker.nextNode()) {
        if (walker.currentNode.nodeValue.trim()) {
          textNodes.push(walker.currentNode.nodeValue.trim());
        }
      }

      const hrefLinks = [];
      const links = document.querySelectorAll('a[href]');
      links.forEach((link) => {
        const resolvedHref = new URL(link.getAttribute('href'), baseUrl).href;

        // Use regex to filter out unwanted links
        const unwantedLinkPattern = /(google\.[a-z.]+|facebook\.com|twitter\.com|linkedin\.com|instagram\.com|goo\.gl)/i;
        if (!unwantedLinkPattern.test(new URL(resolvedHref).hostname)) {
          link.href = resolvedHref; // Set the absolute URL to the link
          link.target = '_self';
          hrefLinks.push(resolvedHref);
        }
      });

      return {
        textNodesData: textNodes,
        hrefLinks: hrefLinks
      };
    }, url); // Pass the base URL to the evaluate function

    // Apply regex to remove unwanted patterns from the textNodesData
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const ignoreRegexPatterns = [
      /<iframe[^>]*src="https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-NXK9CJ"[^>]*><\/iframe>/g,
      /→/g,
      /©/g,
    ];

    const filteredTextNodes = textNodesData.map(text => {
      // Remove emails and phone numbers
      let filteredText = text.replace(emailRegex, '').replace(phoneRegex, '');

      // Remove additional unwanted patterns
      ignoreRegexPatterns.forEach(pattern => {
        filteredText = filteredText.replace(pattern, '');
      });

      return filteredText.trim();  // Trim after filtering to remove any leftover spaces
    }).filter(text => text.length > 0); // Filter out empty strings

    // Translate the filtered text using the NMT API
    const translatedTexts = await translateText(filteredTextNodes, language);

    // Inject the translated text back into the page
    await page.evaluate((translatedTexts, serverPort, language) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      let index = 0;

      while (walker.nextNode()) {
        if (walker.currentNode.nodeValue.trim() && index < translatedTexts.length) {
          walker.currentNode.nodeValue = translatedTexts[index];
          index++;
        }
      }

      // Re-inject the script to handle link clicks and navigate using translated content
      const script = `
        // Initialize a counter to track the number of times the script runs
        let clickHandlerCounter = 0;

        document.addEventListener('click', function(event) {
          const link = event.target.closest('a');
          if (link) {
            event.preventDefault(); // Prevent default navigation
            const clickedLink = link.href;
            console.log('Last clicked link:', clickedLink);
            // Increment the counter and log it
            clickHandlerCounter++;
            console.log('Click handler triggered:', clickHandlerCounter, 'times');

            // Send the clicked link back to the server
            fetch('http://localhost:${serverPort}/api/localize', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ url: clickedLink, language: '${language}' }), // Send the language along with the clicked link
            }).then(response => response.json()).then(data => {
              const newDoc = document.open();
              newDoc.write(data.content);
              newDoc.close();
            });
          }
        });
      `;

      const scriptElement = document.createElement('script');
      scriptElement.id = 'click-handler-script';  // Ensure the script runs only once
      scriptElement.textContent = script;
      document.body.appendChild(scriptElement);

    }, translatedTexts, PORT, language);

    // Get the translated HTML content
    const translatedHTML = await page.content();

    // Log the translated HTML to the console
    console.log('Translated HTML:', translatedHTML);

    // Store the translated HTML in the MongoDB database
    await collection.insertOne({ url: url, language: language, translatedHTML: translatedHTML });
    console.log('Translated HTML stored in MongoDB');

    // Log all href links on the page
    console.log('All href links on the page:', hrefLinks);

    // Send the translated HTML back to the frontend
    res.json({ success: true, content: translatedHTML });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ success: false, message: 'Failed to process the webpage' });
  } finally {
    if (browser) {
      await browser.close(); // Ensure the browser is closed even if an error occurs
    }
    if (dbClient) {
      await dbClient.close(); // Ensure the MongoDB client is closed
    }
  }
};

module.exports = { extractText_and_Translate };


