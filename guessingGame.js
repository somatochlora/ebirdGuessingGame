const dotenv = require('dotenv').config();
const express = require('express');
const fs = require('fs');
const cors = require('cors');

const eBirdKey = process.env.EBIRD_API_KEY;

const app = express();
const port = 80;

const taxonomy = JSON.parse(fs.readFileSync('taxonomy.json'));
const months = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");

const fetchChecklistsByDate = async (region, y, m, d) => {
    let results = await fetch(`https://api.ebird.org/v2/product/lists/${region}/${y}/${m}/${d}?key=${eBirdKey}&maxResults=200`);
    return await results.json();
};

const fetchChecklist = async (checklistId) => {
    let results = await fetch(`https://api.ebird.org/v2/product/checklist/view/${checklistId}?key=${eBirdKey}`);
    return await results.json();
};

app.use(express.static('web'));

app.get('/getRandomChecklist/:regionCode', cors(), async (req, res) => {
    let checklists = [];
    let fetchAttemptsLeft = 5
    while (checklists.length < 1 && fetchAttemptsLeft > 0) {
        let year = Math.floor(Math.random() * 5 + 2016);
        let month = Math.floor(Math.random() * 12 + 1);
        let day = Math.floor(Math.random() * 28 + 1);    
        checklists = await fetchChecklistsByDate(req.params.regionCode, year, month, day)
        avgSpecies = checklists.reduce((prev, curr) => prev + curr.numSpecies, 0) / checklists.length;
        checklists = checklists.filter(checklist => checklist.numSpecies >= avgSpecies);
        fetchAttemptsLeft--;
        console.log("checklists fetched");
        
    } 
    if (checklists.length == 0) {
        res.send({status:"failed"});
        return;
    }
    randomChecklist = checklists[Math.floor(Math.random() * checklists.length)]
    fetchChecklist(randomChecklist.subId).then(checklist => {
        checklistForQuiz = {}
        checklistForQuiz.species = checklist.obs.map(observation => {
            return {
                species: taxonomy.find(taxon => taxon.speciesCode == observation.speciesCode).comName,
                count: observation.howManyAtleast,
            }
        }); 
        checklistForQuiz.location = randomChecklist.loc.name
        checklistForQuiz.county = randomChecklist.loc.subnational2Name
        checklistForQuiz.province = randomChecklist.loc.subnational1Name
        checklistForQuiz.id = checklist.subId
        checklistForQuiz.observer = checklist.userDisplayName 
        let date = checklist.obsDt.split(" ");
        checklistForQuiz.day = date[0];
        checklistForQuiz.month = months.indexOf(date[1]);
        checklistForQuiz.month = date[2];
        checklistForQuiz.date = randomChecklist.obsDt
        checklistForQuiz.time = randomChecklist.obsTime

        res.send(checklistForQuiz);
    });
});

app.listen(port, () => {
    console.log("App listening");
});

