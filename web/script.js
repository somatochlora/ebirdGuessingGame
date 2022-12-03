const getNewChecklist = async () => {
    let data = await fetch("http://localhost:3000/getRandomChecklist/CA-ON");
    return await data.json();
}

const months = [  ["January", "Jan", 0],
  ["February", "Feb", 1],
  ["March", "Mar", 2],
  ["April", "Apr", 3],
  ["May", "May", 4],
  ["June", "Jun", 5],
  ["July", "Jul", 6],
  ["August", "Aug", 7],
  ["September", "Sep", 8],
  ["October", "Oct", 9],
  ["November", "Nov", 10],
  ["December", "Dec", 11]
];

const loadNewQuiz = async quizType => {



    data = await getNewChecklist();
    let species = data.species;
    let speciesDiv = document.querySelector('#species');
    speciesDiv.replaceChildren();
    species.forEach(obs => {
        let obsElement = document.createElement('li');
        obsElement.innerText = obs.species + " " + obs.count;
        speciesDiv.appendChild(obsElement);
    })
    document.querySelector('#hotspot').innerText = data.location;
    document.querySelector('#county').innerText = data.county;
    document.querySelector('#province').innerText = data.province;
    document.querySelector('#observer').innerText = data.observer;
    let date = data.date.split(" ");
    document.querySelector('#day').innerText = date[0];
    document.querySelector('#month').innerText = date[1];
    document.querySelector('#year').innerText = date[2];
    document.querySelector('#time').innerText = data.time;
    let checklistLink = document.createElement('a');
    checklistLink.href = "https://ebird.org/checklist/" + data.id
    checklistLink.innerText = checklistLink.href;
    document.querySelector('#link').replaceChildren(checklistLink);

    let monthsTemp = months.filter(month => month[1] != date[1])
                            .sort((a, b) => 0.5 - Math.random())
                            .slice(0,3);
    monthsTemp.push(months.find(month => month[1] == date[1]));
    monthsTemp.sort((a, b) => a[2] - b[2]);
    option1.innerText = monthsTemp[0][0];
    option2.innerText = monthsTemp[1][0];
    option3.innerText = monthsTemp[2][0];
    option4.innerText = monthsTemp[3][0];
}

loadNewQuiz();

document.querySelector('#next').addEventListener('click', e => loadNewQuiz());