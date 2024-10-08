// src/controllers/translationController.js

const puppeteer = require('puppeteer');
const { connectToMongoDB } = require('../utils/database.js');  // Import the database connection function
const { translateText } = require('../services/translationService');  // Import the translation service
const PORT = 5000;  // Define the PORT variable

const extractText_and_Translate = async (url, language, res) => {
  _language = language;

  if (!url || !language) {
    return res.status(400).json({ success: false, message: 'Invalid URL or language' });
  }

  let browser;
  try {
    const collection = await connectToMongoDB();

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

      // Update stylesheet links
      const allLinks = document.querySelectorAll('link[href]');
      allLinks.forEach((link) => {
        link.href = new URL(link.href, baseUrl).href; // Update href directly to its absolute URL
      });

      // Update image sources
      const images = document.querySelectorAll('img[src]');
      images.forEach((img) => {
        img.src = new URL(img.src, baseUrl).href; // Update src directly to its absolute URL
      });

      // Update image sources with 'data-src' attribute (commonly used for lazy loading)
      const lazyLoadImages = document.querySelectorAll('img[data-src]');
      lazyLoadImages.forEach((img) => {
        img.setAttribute('data-src', new URL(img.getAttribute('data-src'), baseUrl).href); // Update data-src to its absolute URL
      });

      // Update image sources with 'data-active-img' attribute
      const activeImgElements = document.querySelectorAll('img[data-active-img]');
      activeImgElements.forEach((img) => {
        img.setAttribute('data-active-img', new URL(img.getAttribute('data-active-img'), baseUrl).href); // Update data-active-img to its absolute URL
      });
      // Update image sources with 'data-inactive-img' attribute
      const inactiveImgElements = document.querySelectorAll('img[data-inactive-img]');
      inactiveImgElements.forEach((img) => {
        img.setAttribute('data-inactive-img', new URL(img.getAttribute('data-inactive-img'), baseUrl).href); // Update data-inactive-img to its absolute URL
      });

      // Update image sources with 'data-mobile-img' attribute
      const mobileImgElements = document.querySelectorAll('img[data-mobile-img]');
      mobileImgElements.forEach((img) => {
        img.setAttribute('data-mobile-img', new URL(img.getAttribute('data-mobile-img'), baseUrl).href); // Update data-mobile-img to its absolute URL
      });
      // Update elements with 'data-background-image' attribute
      const backgroundImgElements = document.querySelectorAll('[data-background-image]');
      backgroundImgElements.forEach((element) => {
        element.setAttribute('data-background-image', new URL(element.getAttribute('data-background-image'), baseUrl).href); // Update data-background-image to its absolute URL
      });
      // Update script sources
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach((script) => {
        script.src = new URL(script.src, baseUrl).href; // Update src directly to its absolute URL
      });



      // Select all elements that might have a background-image style
const elementsWithBackgroundImage = document.querySelectorAll('*');

elementsWithBackgroundImage.forEach((element) => {
  const backgroundImage = window.getComputedStyle(element).getPropertyValue('background-image');

  if (backgroundImage && backgroundImage !== 'none') {
    // Extract the URL from the background-image property using regex
    const urlMatch = backgroundImage.match(/url\(["']?(\/[^"']+)["']?\)/);

    if (urlMatch && urlMatch[1]) {
      const relativeUrl = urlMatch[1];
      const absoluteUrl = new URL(relativeUrl, baseUrl).href; // Convert to absolute URL
      element.style.backgroundImage = `url('${absoluteUrl}')`; // Update the background-image with the absolute URL
    }
  }

  // Check if the element has a data-background-image attribute and update it
  if (element.hasAttribute('data-background-image')) {
    const dataBackgroundImage = element.getAttribute('data-background-image');
    const resolvedDataBackgroundImage = new URL(dataBackgroundImage, baseUrl).href; // Convert to absolute URL
    element.setAttribute('data-background-image', resolvedDataBackgroundImage); // Update the attribute with the absolute URL
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
        document.addEventListener('click', function(event) {
          const link = event.target.closest('a');
          if (link) {
            event.preventDefault(); // Prevent default navigation
            const clickedLink = link.href;
            console.log('Last clicked link:', clickedLink);

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
  }
};

module.exports = { extractText_and_Translate };
