const dotenv = require('dotenv').config();
const express = require('express');

const eBirdKey = process.env.EBIRD_API_KEY;
const MIN_SPECIES = 10;

const app = express();
const port = 3000;

const fetchChecklistsByDate = async (region, y, m, d) => {
    let results = await fetch(`https://api.ebird.org/v2/product/lists/${region}/${y}/${m}/${d}?key=${eBirdKey}&maxResults=200`);
    return await results.json();
};

const fetchChecklist = async (checklistId) => {
    let results = await fetch(`https://api.ebird.org/v2/product/checklist/view/${checklistId}?key=${eBirdKey}`);
    return await results.json();
};

app.get('/getRandomChecklist/:regionCode', async (req, res) => {
    let checklists = [];
    while (checklists.length < 1) {
        let year = Math.floor(Math.random() * 5 + 2016);
        let month = Math.floor(Math.random() * 12 + 1);
        let day = Math.floor(Math.random() * 28 + 1);    
        checklists = await fetchChecklistsByDate(req.params.regionCode, year, month, day)
        checklists = checklists.filter(checklist => checklist.numSpecies >= MIN_SPECIES);
        console.log("checklists fetched");
    }  
    
    randomChecklist = checklists[Math.floor(Math.random() * checklists.length)]
    fetchChecklist(randomChecklist.subId).then(checklist => {
        res.send(checklist);
    });
});

app.listen(port, () => {
    console.log("App listening");
});

