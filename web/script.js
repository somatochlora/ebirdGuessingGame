//const checklistUrl = "http://cicindela.net/getRandomChecklist/CA-ON";
const checklistUrl = "http://localHost:80/getRandomChecklist/CA-ON";

const getNewChecklist = async () => {
    let data = await fetch(checklistUrl);
    return await data.json();
}

const getNRandomFromArray = (arr, n) => {
    let newArr = [];
    for (let i = 0; i < n; i++) {
        let index;
        do {
            index = Math.floor(Math.random() * arr.length);
        } while (newArr.includes(arr[index]));
        newArr.push(arr[index]);
    }
    return newArr;
}

const createGame = (rounds) => {
    let score = 0;
    let curRound = 1
    let answerHandler;

    const winRound = won => {
        score += won ? 1 : 0;
        curRound++;
    }

    const doneGame = () => {
        return curRound > rounds;
    }

    const getScore = () => {
        return score;
    }

    const getRound = () => {
        return curRound;
    }

    const getRoundCount = () => {
        return rounds;
    }

    return {winRound, doneGame, getScore, getRound, getRoundCount};
}

const MONTHS = ["January", "February", "March", "April", 
                "May", "June", "July", "August",
                "September", "October", "November", "December"];

/*const createElement = (eleType, eleId, textContent, cssClass) => {
    let newEle = document.createElement(eleType);
    newEle.id = eleId
    if (textContent) newEle.textContent = textContent;
    if (cssClass) newEle.setAttribute("class", cssClass);
    return newEle;
}*/

const createElement = (options) => {
    let newEle = document.createElement(options.type);
    if (options.id) newEle.id = options.id
    if (options.textContent) newEle.textContent = options.textContent;
    if (options.cssClass) {
        options.cssClass.forEach(cssClass => {
            newEle.classList.add(cssClass);
        });
    }
    if (options.href) newEle.href = options.href;   
    return newEle;
}

const getFourMonths = (month) => {
    let monthsOutput = [];
    monthsOutput.push({month: month, correct: true});
    let otherMonths = MONTHS.filter(m => m != month);
    otherMonths = getNRandomFromArray(otherMonths, 3);
    otherMonths.forEach(m => {
        monthsOutput.push({month: m, correct: false});
    });
    monthsOutput.sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month));
    return monthsOutput;
}

const generateMonthConfig = checklist => {
    let answerMonth = parseInt(checklist.day.split("-")[1] - 1);
    let answers = getFourMonths(MONTHS[answerMonth]);
    return answers;
}

const generateAnswers = (data, quizType, game) => {
    
    let quizAnswers = createElement({type: "div", id: "answers"});
    let answers = generateMonthConfig(data);

    answers.forEach(answer => {
        let button = createElement({
            type: "button",
            textContent: answer.month,
            cssClass: ["answer", "answer-unknown"]
        });            
        button.dataset.correct = answer.correct;
        quizAnswers.appendChild(button);
        button.addEventListener("click", game.answerHandler);
    });
    return quizAnswers;
};

const answerHandler = (game, e) => {
    e.target.classList.add("selected");
    game.winRound(e.target.classList.contains("right-answer")); 
    answerUpdate(game);
};

const generateQuestion = (data, quizType) => {
    let quizQuestion = createElement({type: "section", id: "question-data"});

    let locationDiv = createElement({type: "div", id: "location-data"});
    locationDiv.appendChild(createElement({type: "div", id: "location", textContent: data.location}));
    locationDiv.appendChild(createElement({type: "div", id: "county", textContent: data.county}));
    locationDiv.appendChild(createElement({type: "div", id: "province", textContent: data.province}));
    quizQuestion.appendChild(locationDiv);

    quizQuestion.appendChild(createElement({type: "div", id: "observer", textContent: data.observer}));

    let dateTimeDiv = createElement({type: "div", id: "date-time-data"});
    let date = data.day.split("-");
    dateTimeDiv.appendChild(createElement({type: "span", id: "day", textContent: date[2]}));
    let month = createElement({type: "span", id: "month", textContent: MONTHS[parseInt(date[1]) - 1], cssClass: ["hidden"]});
    dateTimeDiv.appendChild(month);
    dateTimeDiv.appendChild(createElement({type: "span", id: "year", textContent: date[0]}));
    dateTimeDiv.appendChild(createElement({type: "span", id: "time", textContent: data.time}));
    quizQuestion.appendChild(dateTimeDiv);

    let linkDiv = createElement({
        type: "a",
        id: "checklist-link",
        textContent: "https://ebird.org/checklist/" + data.id,
        href: "https://ebird.org/checklist/" + data.id});
    quizQuestion.appendChild(linkDiv);    

    let speciesDiv = createElement({type: "div", id: "species-list"});
    let speciesTable = createElement({type: "table", id: "species-table"});
    speciesDiv.appendChild(speciesTable);
    quizQuestion.appendChild(speciesDiv);

    let species = data.species;
    species.forEach(obs => {
        let obsElement = createElement({type: "tr", cssClass: ["obs-species"]});
        let speciesEle = createElement({type: "td", cssClass: ["species"], textContent: obs.species});
        let abundanceEle = createElement({type: "td", cssClass: ["abundance"], textContent: obs.count});
        obsElement.appendChild(abundanceEle);
        obsElement.appendChild(speciesEle);
        speciesTable.appendChild(obsElement);
    });    
    
    return quizQuestion;
};

const answerUpdate = (game) => {
    for (answer of document.querySelector("#answers").children) {
        answer.classList.add(answer.dataset.correct == "false" ? "answer-wrong" : "answer-correct");
        answer.classList.remove("answer-unknown");
        answer.removeEventListener("click", game.answerHandler);
    }
    document.querySelector("#month").classList.remove("hidden");
    const nextButton = document.querySelector("#next-question");
    nextButton.addEventListener('click', nextHandler.bind(null, game));
    nextButton.classList.remove('disabled');
    updateScore(game);
}

const nextHandler = async (game) => {
    const nextButton = document.querySelector("#next-question");
    nextButton.classList.add('disabled');
    nextButton.parentNode.replaceChild(nextButton.cloneNode(true), nextButton);    

    data = await getNewChecklist()
    document.querySelector("#question-area").replaceChildren(generateQuestion(data));
    document.querySelector("#answers-area").replaceChildren(generateAnswers(data, "month", game));
}

const updateScore = (game) => {
    const score = document.querySelector('#score');
    const curRound = document.querySelector('#cur-round');
    const roundsLeft = document.querySelector('#rounds-left');
    score.innerText = game.getScore();
    curRound.innerText = game.getRound();
    roundsLeft.innerText = game.getRoundCount() - game.getRound();
};

let game = createGame(10);
game.answerHandler = answerHandler.bind(null, game);
updateScore(game);
nextHandler(game);


    


