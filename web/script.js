//const checklistUrl = "http://cicindela.net/getRandomChecklist/CA-ON";
const checklistUrl = "http://localHost:80/getRandomChecklist/CA-ON";

const getNewChecklist = async () => {
    let data = await fetch(checklistUrl);
    return await data.json();
}

const months = ["January", "February", "March", "April", 
                "May", "June", "July", "August",
                "September", "October", "November", "December"];

const createElement = (eleType, eleId, textContent, cssClass) => {
    let newEle = document.createElement(eleType);
    newEle.id = eleId
    if (textContent) newEle.textContent = textContent;
    if (cssClass) newEle.setAttribute("class", cssClass);
    return newEle;
}

const generateMonthConfig = checklist => {
    console.log(checklist);
    let answerMonth = parseInt(checklist.day.split("-")[1] - 1);

    let answers = [];
    answers.push({val: answerMonth, correct:true});

    let valInAnswers = val => {
        for (let answer of answers) {
            if (answer.val == val) return true;
        }
        return false;
    };

    for (let i = 0; i < 3; i++) {
        let val;
        do {
            val = Math.floor(Math.random() * 12);
        } while (valInAnswers(val))
        answers.push({val: val, correct: false});
    }

    answers.sort((a, b) => a.val - b.val);
    textAnswers = [];
    answers.forEach(answer => {
        textAnswers.push({text: months[answer.val], correct: answer.correct});
    });

    return {
        hidden: [{field: "month"}],
        answers: textAnswers
    }
}

const generateAnswers = (data, quizType) => {
    
    let quizAnswers = createElement("section", "answers");
    let config = generateMonthConfig(data);

    config.answers.forEach(answer => {
        let button = createElement("button", answer.correct ? "right-answer" : "wrong-answer", answer.text, "answer");
        button.classList.add("answer-unknown");
        quizAnswers.appendChild(button);
        button.addEventListener("click", answerHandler);
    });
    return quizAnswers;
};

const answerHandler = e => {
    e.target.classList.add("selected");
    answerUpdate();
};

const generateQuestion = (data, quizType) => {
    let quizQuestion = createElement("section", "question-data");

    let locationDiv = createElement("div", "location-data");
    quizQuestion.appendChild(locationDiv);

    locationDiv.appendChild(createElement("div", "hotspot", data.location));
    locationDiv.appendChild(createElement("div", "county", data.county));
    locationDiv.appendChild(createElement("div", "province", data.province));

    quizQuestion.appendChild(createElement("div", "observer", data.observer));

    let dateTimeDiv = createElement("div", "date-time-data");
    quizQuestion.appendChild(dateTimeDiv);

    dateTimeDiv.appendChild(createElement("div", "day", data.day));
    dateTimeDiv.appendChild(createElement("div", "month", months[data.month]));
    dateTimeDiv.appendChild(createElement("div", "year", data.year));
    dateTimeDiv.appendChild(createElement("div", "time", data.time));
    quizQuestion.appendChild(dateTimeDiv);

    let checklistLink = "https://ebird.org/checklist/" + data.id;
    let linkDiv = createElement('a', "checklist-link", checklistLink);
    linkDiv.href = checklistLink;
    quizQuestion.appendChild(linkDiv);    

    let speciesDiv = createElement('ul', "species-list");
    quizQuestion.appendChild(speciesDiv);

    let species = data.species;
    species.forEach(obs => {
        let obsElement = document.createElement('li');
        obsElement.classList.add("obs-species");
        let speciesEle = document.createElement('span');
        speciesEle.classList.add("species");
        speciesEle.innerText = obs.species;
        let abundanceEle = document.createElement('span');
        abundanceEle.classList.add("abundance");
        abundanceEle.innerText = obs.count;

        obsElement.appendChild(abundanceEle);
        obsElement.appendChild(speciesEle);
        speciesDiv.appendChild(obsElement);
    });    
    
    return quizQuestion;
};

const answerUpdate = () => {
    for (answer of document.querySelector("#answers").children) {
        answer.classList.add(answer.id == "wrong-answer" ? "answer-wrong" : "answer-correct")
        answer.classList.remove("answer-unknown");
        answer.removeEventListener("click", answerHandler);
    }
}

getNewChecklist().then(data => {
    document.querySelector("#question-area").appendChild(generateQuestion(data));
    document.querySelector("#answers-area").appendChild(generateAnswers(data));
});

document.querySelector('#next-question').addEventListener('click', async e => {
    data = await getNewChecklist()
    document.querySelector("#question-area").replaceChildren(generateQuestion(data));
    document.querySelector("#answers-area").replaceChildren(generateAnswers(data));
});
    


