const { Scraper } = new(require('@neoxr/wb'))
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const axios = require('axios'),
   cheerio = require('cheerio'),
   FormData = require('form-data')
