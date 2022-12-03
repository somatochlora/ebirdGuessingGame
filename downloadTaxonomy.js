fs = require('fs');
const dotenv = require('dotenv').config();
const eBirdKey = process.env.EBIRD_API_KEY;

const fetchTaxonomy = async (c) => {
    let results = await fetch(`https://api.ebird.org/v2/ref/taxonomy/ebird?key=${eBirdKey}&fmt=json`);
    return await results.json();
};

fetchTaxonomy().then(results => {
    fs.writeFileSync('taxonomy.json', JSON.stringify(results, null, 2));
});
