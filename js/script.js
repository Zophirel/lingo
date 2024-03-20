const GameModule = (async () => {

    // Initialize
    let lingoTable = document.getElementById("lingo-table");
    let words = [];
    let hasUserAnswered = false;

    const GameState = {
        Running: "Running",
        End: "End"
    };
    let timeInterval;

    // Game settings set by the user
    let gameTimer;
    let gameDifficulty;

    // Word choosen by the game
    let defaultWord;
    let answer_occurencies_index = new Map();
    let defaultWord_occurencies_index = new Map();
    let charStateIndex = new Map();

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    // Fetch data
    let response = await fetch("words.txt");
    let text = await response.text();
    words = text.split(/\r?\n|\r|\n/g);

    // Layout initialization fucntions
    function setTableRowsAndColumns() {
        defaultWordChars = defaultWord.split("");

        lingoTable.style.gridTemplateColumns = `repeat(${defaultWord.length}, minmax(30px, 60px))`;
        if (defaultWord.length == 8) {
            lingoTable.style.gridTemplateRows = `repeat(6, minmax(30px, 60px))`;
        } else {
            lingoTable.style.gridTemplateRows = `repeat(${defaultWord.length}, minmax(30px, 60px))`;
        }
    }


    // Set the gameboard UI
    function initGameBoard() {
        lingoTable.innerHTML = "";
        let rows = defaultWord.length == 8 ? 6 : defaultWord.length;
        for (i = 0; i < rows; i++) {
            for (j = 0; j < defaultWord.length; j++) {
                let letterBox = document.createElement('div');
                letterBox.className = "default-letter-box";;
                lingoTable.append(letterBox);

                if (i == 0 && j == 0) {
                    lingoTable.children[0].innerHTML = `<p>${defaultWord[0].toUpperCase()}</p>`;
                    lingoTable.children[0].classList.add("valid");
                } else if (i == 0 && j < defaultWord.length) {
                    lingoTable.children[i + j].innerHTML = `<p>.</p>`;
                }
            }
        }
    }

    // Char comparison algorithm
    const CharState = {
        Valid: "Valid",
        NotPresent: "NotPresent",
        WrongPlace: "WrongPlace"
    };

    function checkWord(word) {
        console.log(`CHECK WORD: ${word}`);
        let arr = [];
        arr.push(defaultWord.split(''));
        if (word == defaultWord) {
            return true;
        }

        if (arr[0].length != word.length) {
            return false;

        } else {
            arr.push(word.split(""));

            // Fetch the index of the occurencies of each char of both words              
            for (i = 0; i < arr[0].length; i++) {

                let char_index = defaultWord_occurencies_index.get(arr[0][i]);
                if (char_index == undefined) {
                    defaultWord_occurencies_index.set(arr[0][i], [i]);
                } else {
                    char_index.push(i);
                    defaultWord_occurencies_index.set(arr[0][i], char_index);
                }

                char_index = answer_occurencies_index.get(arr[1][i]);
                if (char_index == undefined) {
                    answer_occurencies_index.set(arr[1][i], [i]);
                } else {
                    char_index.push(i);
                    answer_occurencies_index.set(arr[1][i], char_index);
                }
            }

            // for each index of each char in the answer check the 
            // occurencies index of the default word
            for (char_index of answer_occurencies_index.entries()) {

                let dfw_index = defaultWord_occurencies_index.get(char_index[0]);

                for (i = 0; i < char_index[1].length; i++) {

                    // means that the current char is not included in the defaultWord  
                    if (dfw_index == undefined) {
                        charStateIndex.set(char_index[1][i], CharState.NotPresent);
                    }

                    //if defaultWord has equal or more occurencies of the current loop char than the answer 
                    else if (dfw_index.length >= char_index[1].length) {

                        if (dfw_index.includes(char_index[1][i])) {
                            ;
                            charStateIndex.set(char_index[1][i], CharState.Valid);
                        } else {
                            charStateIndex.set(char_index[1][i], CharState.WrongPlace);
                        }
                    }
                    //if defaultWord has less occurencies of the current loop char than the answer 
                    else if (dfw_index.length < char_index[1].length) {

                        if (dfw_index.includes(char_index[1][i])) {
                            charStateIndex.set(char_index[1][i], CharState.Valid);
                        }
                        // Set it wrong place until the occurencies of the asnwer surpass the occurencies of defaultWord
                        else if (i < dfw_index.length) {
                            charStateIndex.set(char_index[1][i], CharState.WrongPlace);
                        } else {
                            charStateIndex.set(char_index[1][i], CharState.NotPresent);
                        }
                    }
                }
            }
        }
    }

    // Set the correct status color for each "wrong" char
    function setCharColor(row) {

        for (i = 0; i < defaultWord.length; i++) {
            if (charStateIndex.get(i) == CharState.Valid) {
                lingoTable.children[row + i].classList.add("valid");
            } else if (charStateIndex.get(i) == CharState.WrongPlace) {
                lingoTable.children[row + i].classList.add("wrong-place");
            } else {
                lingoTable.children[row + i].classList.add("not-present");
            }
        }

        answer_occurencies_index.clear();
        defaultWord_occurencies_index.clear();
        charStateIndex.clear();
    }


    function setRowColor(answer, row, className) {
        //set same class for all the cell in a row
        for (i = 0; i < defaultWord.length; i++) {
            if (className != undefined) {
                lingoTable.children[row + i].classList.remove("valid");
                lingoTable.children[row + i].classList.remove("not-valid");
                lingoTable.children[row + i].classList.add(className);
            }
            lingoTable.children[row + i].innerHTML = `<p>${answer[i] != undefined ? answer[i].toUpperCase() : ""}</p>`;
        }

    }

    function setCorrectAnswer(defaultWord) {
        for (i = 0; i < defaultWord.length; i++) {
            let letterBox = document.createElement('div');
            letterBox.className = "default-letter-box";
            letterBox.innerHTML = `<p>${defaultWord[i].toUpperCase()}</p>`
            lingoTable.append(letterBox);
        }
        if (defaultWord.length == 8) {
            lingoTable.style.gridTemplateRows = `repeat(7, minmax(30px, 60px))`;
        } else {
            lingoTable.style.gridTemplateRows = `repeat(${defaultWord.length + 1}, minmax(30px, 60px))`;
        }
    }

    let lastAnswer = "";
    let isLastRow = false;
    let gameState = GameState.Running;

    function setAnswer(answer) {
        lastAnswer = answer;
        clearInterval(timeInterval);
        if (!hasUserAnswered) {
            let checkedWord = checkWord(answer);
            //write the answer in the first row of the grid
            for (i = 0; i < defaultWord.length; i++) {
                lingoTable.children[i].innerHTML = `<p>${answer[i] != undefined ? answer[i].toUpperCase() : ""}</p>`;
            }

            if (checkedWord == true && gameState != GameState.End) {
                console.log("WIN");
                setRowColor(answer, 0, "valid");
                terminateGame();
                return;    
            } 

            for (i = 0; i + defaultWord.length < defaultWord.length * 2; i++) {
                if (lingoTable.children[i].innerHTML == `<p>${defaultWord[i].toUpperCase()}</p>`) {
                    lingoTable.children[defaultWord.length + i].innerHTML = `<p>${defaultWord[i].toUpperCase()}</p>`;
                } else {
                    lingoTable.children[defaultWord.length + i].innerHTML = "<p>.</p>";
                }
            }

    
            if (checkedWord == true) {
                // Correct word
                setRowColor(answer, 0, "valid");
                terminateGame();
                return;

            } else if (checkedWord == false) {
                // Wrong word length
                setRowColor(answer, 0, "not-valid");
            } else {
                // Correct length worng chars
                setCharColor(0);
            }
            hasUserAnswered = true;
        } else {

            // Check which row is empty 
            let row = defaultWord.length;
            while (lingoTable.children[row].innerHTML != "") {
                if (row + defaultWord.length < lingoTable.children.length) {
                    row += defaultWord.length;
                } else {
                    row += defaultWord.length;
                    break;
                }
            }

            isLastRow = row + defaultWord.length == lingoTable.children.length + defaultWord.length;
            row = row == isLastRow ? lingoTable.children.length - defaultWord.length : row;


            if (isLastRow || lingoTable.children[row].innerHTML == "") {
                var checkedWord = checkWord(answer);
                
                if (!isLastRow) {
                    if (checkedWord == true && gameState != GameState.End) {
                        console.log("WIN");
                        setRowColor(answer, row - defaultWord.length, "valid");
                        terminateGame();
                        return;    
                    } 

                    // fill the row with the answer
                    for (i = 0; i < defaultWord.length; i++) {
                        lingoTable.children[row - defaultWord.length + i].innerHTML = `<p>${answer[i] != undefined ? answer[i].toUpperCase() : ""}</p>`;
                    }

                    for (i = 0; i < defaultWord.length; i++) {
                        // check if the answer has correct chars and then write it in the current cell
                        if (lingoTable.children[row - defaultWord.length + i].innerHTML == `<p>${defaultWord[i].toUpperCase()}</p>`) {
                            lingoTable.children[row + i].innerHTML = `<p>${defaultWord[i].toUpperCase()}</p>`;
                        } else {
                            lingoTable.children[row + i].innerHTML = "<p>.</p>";
                        }
                    }
                }

           
                if (checkedWord == true && gameState != GameState.End) {
                    console.log("WIN");
                    setRowColor(answer, row - defaultWord.length, "valid");
                    terminateGame();
                    return;

                } else if (checkedWord == false && gameState != GameState.End) {
                    setRowColor(answer, row - defaultWord.length, "not-valid");
                    if (isLastRow) {
                        setCorrectAnswer(defaultWord);
                    }

                } else if (checkedWord == null && gameState != GameState.End) {
                    setCharColor(row - defaultWord.length);
                    if (isLastRow) {
                        setCorrectAnswer(defaultWord);
                    }
                }
            }
        }

        // reset timer   
        console.log(`isLastRow: ${isLastRow}`);
        let timerBar = document.getElementsByClassName("start-timer")[0];

        if (isLastRow && gameState == GameState.Running) {
            terminateGame();
        } else if (!isLastRow) {
            timerBar.classList.remove("start-timer");
            timerBar.offsetWidth;
            timerBar.classList.add("start-timer");
            console.log("reset interval")
            timeInterval = setInterval(() => setAnswer(lastAnswer), gameTimer * 1000);
        }

    }

    function terminateGame() {
        // Game Finished
        console.log("last reset interval");
        let timerBar = document.getElementsByClassName("start-timer")[0];
        timerBar.classList.remove("start-timer");
        gameState = GameState.End;
        clearInterval(timeInterval);

        let playAgainBtn = document.getElementById("play-again");
        let changeSettingBtn = document.getElementById("change-settings")
        playAgainBtn.style.display = "block";
        changeSettingBtn.style.display = "block";

        playAgainBtn.addEventListener("click", () => {
            // restart game
            startGame(gameDifficulty, gameTimer);
            playAgainBtn.style.display = "none";
            changeSettingBtn.style.display = "none";
        });

        changeSettingBtn.addEventListener("click", async () => {
            // open settings menu
            (await SettingsModule).showSettings();
            playAgainBtn.style.display = "none";
            changeSettingBtn.style.display = "none";
        });
    }

    //button listener
    let submitBtn = document.getElementById("submit-btn");
    submitBtn.addEventListener("click", () => setAnswer(document.getElementById("word-input").value.toLowerCase()));

    function reset(){
        gameState = GameState.Running;
        isLastRow = false;
        hasUserAnswered = false;
        answer_occurencies_index.clear();
        defaultWord_occurencies_index.clear();
        charStateIndex.clear();
        clearInterval(timeInterval);
    }

    function startGame(difficulty, timer) {
        reset();

        if (difficulty == 9) {
            defaultWord = words[getRandomInt(words.length)];
            lastAnswer = defaultWord[0] + '.'.repeat(defaultWord.length - 1);
            setTableRowsAndColumns(defaultWord);
            initGameBoard(defaultWord);
        } else {
            let filteredWords = words.filter((e) => e.length == difficulty);
            defaultWord = filteredWords[getRandomInt(filteredWords.length)];
            lastAnswer = defaultWord[0] + '.'.repeat(defaultWord.length - 1);
            setTableRowsAndColumns(defaultWord);
            initGameBoard(defaultWord);
        }

        console.log(defaultWord);

        // if user dose not answer in time it will be used last answer provided
        timeInterval = setInterval(() => setAnswer(lastAnswer), timer * 1000);
        gameTimer = timer;
        gameDifficulty = difficulty;

        // set timer
        let timeBar = document.getElementsByClassName('start-timer')[0];
        if (timeBar == undefined) {
            lingoTable.children.rem
            timeBar = document.createElement('div');
            timeBar.classList.add("start-timer");
            document.getElementById("timer").append(timeBar);

        }
        timeBar.style.animationDuration = `${timer}s`;
    }

    return {
        startGame: (difficulty, timer) => startGame(difficulty, timer)
    };
})();