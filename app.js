require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const logger = require('./logger'); // Import the logger module
const cors = require('cors'); // Require the 'cors' middleware

// Enable CORS for all routes
app.use(cors());

app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from this specific origin
    methods: 'GET', // Allow only GET requests
    allowedHeaders: 'Content-Type',
}));

const app = express();
const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL;
const cookieName1 = process.env.COOKIE_NAME_1;
const cookieName2 = process.env.COOKIE_NAME_2;

app.get('/fetch-data', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        logger.error('URL parameter is required');
        return res.status(400).send('URL parameter is required');
    }

    try {
        logger.info('Starting the data retrieval process');
        const browser = await puppeteer.launch({
            headless: 'new',
            // `headless: true` (default) enables old Headless;
            // `headless: 'new'` enables new Headless;
            // `headless: false` enables “headful” mode.
        });
        const page = await browser.newPage();

        // Your Puppeteer code to capture cookies here
        await page.goto(baseUrl);

        // Capture all cookies
        const allCookies = await page.cookies();

        // Close the browser
        await browser.close();

        // Filter specific cookies
        const filteredCookies = allCookies.filter(
            (cookie) =>
                cookie.name === cookieName1 || cookie.name === cookieName2
        );

        // Create request headers with filtered cookies
        const cookieHeader = filteredCookies
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join('; ');

        // Define the request configuration
        const config = {
            method: 'post',
            url: 'https://fastdl.app/c/',
            headers: {
                // ... (headers as before)
            },
            data: `url=${encodeURIComponent(url)}&lang_code=en&token=`,
        };

        // Make the request
        const response = await axios(config);

        // Read the response data as a string
        const htmlContent = response.data.toString();

        // Load the HTML content using Cheerio
        const $ = cheerio.load(htmlContent);

        // Find the button with id="download-btn" and extract its href attribute
        const downloadButtonHref = $('#download-btn').attr('href');

        // Find the image with class "w-full" and extract its src attribute
        const imageSrc = $('img.w-full').attr('src');

        logger.info('Data retrieval completed successfully');

        // Respond with the extracted data
        res.json({ downloadLink: downloadButtonHref, imgSrc: imageSrc });

        logger.info('Request finished successfully');
    } catch (error) {
        logger.error(`An error occurred: ${error}`);
        res.status(500).send('An error occurred');
    }
});

app.listen(port, () => {
    logger.info(`App listening on port ${port}`);
});
