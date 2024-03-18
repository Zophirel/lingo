
( async () => {

    // initialize

    let lingoTable = document.getElementById("lingo-table");
    let words = [];
    let hasUserAnswered = false;
    let response = await fetch("words.txt");
    let text = await response.text();


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    words = text.split(/\r?\n|\r|\n/g);
    let choosenWord = words[getRandomInt(words.length)];

    function setTableRowsAndColumns(){
        lingoTable.style.gridTemplateColumns = `repeat(${choosenWord.length}, minmax(30px, 60px))`;
        if(choosenWord.length == 8){
            lingoTable.style.gridTemplateRows = `repeat(6, minmax(30px, 60px))`;
        }else{
            lingoTable.style.gridTemplateRows = `repeat(${choosenWord.length}, minmax(30px, 60px))`;
        }
    }

    setTableRowsAndColumns();

    function initGameBoard(){
        
        let rows = choosenWord.length == 8 ? 6 : choosenWord.length;
        
        for(i = 0; i < rows; i++){
            for(j = 0; j < choosenWord.length; j++){
                let letterBox = document.createElement('div');
                letterBox.className = "default-letter-box";;
                lingoTable.append(letterBox);
                
                if(i == 0 && j == 0){
                    lingoTable.children[0].innerHTML = `<p>${choosenWord[0].toUpperCase()}</p>`;
                    lingoTable.children[0].classList.add("valid");
                }else if(i == 0 && j < choosenWord.length){
                    lingoTable.children[i + j].innerHTML = `<p>.</p>`;
                }
                
            }
        }
    }

    initGameBoard();

    let choosenWordChars = choosenWord.split("");
    let choosenWordCharsSet = new Set(choosenWordChars);
    let wrong_char_index = new Map();
 

    function checkWord(word){
        console.log(`word to check: ${word}`);
        let arr = [];
        arr.push(choosenWordChars);

        if(choosenWord.length != word.length){
            return false;
        } else {
            arr.push(word.split(""));
            for(i = 0; i < arr[0].length; i++){
                if(arr[0][i] != arr[1][i]){
                    wrong_char_index.set(i, arr[1][i]);
                }
            }
            if(wrong_char_index.size == 0){
                return true;
            }
      
            return JSON.stringify(Array.from(wrong_char_index.entries())); 
        }
    }

    function getGridRow(row){
        let rowElements = [];
        for(i = 0; i < choosenWord.length; i++){
            rowElements.push(lingoTable.children[row + i]);
        }
        return rowElements;
    }
    
    
    let charOccurencies = [];
    function setCharColor(answer, row){
        let wrongCharSet = new Set(wrong_char_index.values());         
       console.log(choosenWord);

        for(i = 0; i < choosenWord.length; i++){

            let regex = new RegExp(answer[i], "g");
            let charOccurenciesInChoosenWord = (choosenWord.match(regex) || []).length;
            let charOccurenciesInAnswer = (answer.match(regex) || []).length;

            if(wrongCharSet.has(answer[i])){   
                if(choosenWordCharsSet.has(answer[i]) && choosenWord[i] != answer[i]){

                    // check if current wrong char is the last one
                    if((answer.substring(0, i+1).match(regex) || []).length < charOccurenciesInAnswer){
                        lingoTable.children[row+i].classList.add("not-present");

                    }else if((answer.substring(0, i+1).match(regex) || []).length == charOccurenciesInAnswer){
                        lingoTable.children[row+i].classList.add("wrong-place");
                    }
                
                }else if(choosenWordCharsSet.has(answer[i]) && choosenWord[i] == answer[i]){
                    lingoTable.children[row+i].classList.add("valid");
                } else if(!choosenWordCharsSet.has(answer[i])) {
                    lingoTable.children[row+i].classList.add("not-present");
                }
            }else{
                lingoTable.children[row+i].classList.add("valid");
            }
        }
        wrong_char_index.clear();
    }


    function setRowColor(answer, row, className ){
        //set same class for all the cell in a row
        console.log(choosenWord);
        for(i = 0; i < choosenWord.length; i++){
            if(className != undefined){
                lingoTable.children[row+i].classList.remove("valid");
                lingoTable.children[row+i].classList.remove("not-valid");
                lingoTable.children[row+i].classList.add(className);
            } 
            lingoTable.children[row+i].innerHTML =  `<p>${answer[i] != undefined ? answer[i].toUpperCase() : ""}</p>`;
        } 
    }

    function setCorrectAnswer(){
        for(i = 0; i < choosenWord.length; i++){
            let letterBox = document.createElement('div');
            letterBox.className = "default-letter-box";
            letterBox.innerHTML = `<p>${choosenWord[i].toUpperCase()}</p>`
            lingoTable.append(letterBox);
        }
        if(choosenWord.length == 8){
            lingoTable.style.gridTemplateRows = `repeat(7, minmax(30px, 60px))`;
        }else{
            lingoTable.style.gridTemplateRows = `repeat(${choosenWord.length + 1}, minmax(30px, 60px))`;
        }
    }

    function setAnswer(answer){
        
        if(!hasUserAnswered){
            let standardWord = getGridRow(0);

            //write the answer in the first row of the grid
            for(i = 0; i < choosenWord.length; i++){
                lingoTable.children[i].innerHTML =  `<p>${answer[i] != undefined ? answer[i].toUpperCase() : ""}</p>`;
            }

            for(i = 0; i + choosenWord.length < choosenWord.length * 2; i++){
                if(lingoTable.children[i].innerHTML == `<p>${choosenWord[i].toUpperCase()}</p>`){
                    lingoTable.children[choosenWord.length + i].innerHTML = `<p>${choosenWord[i].toUpperCase()}</p>`;  
                }else{
                    lingoTable.children[choosenWord.length + i].innerHTML = "<p>.</p>";  
                }            
            }
  
            let checkedWord = checkWord(answer, 0); 
            if(checkedWord == true){
                //correct word
                setRowColor(answer, 0, "valid");
                
            }else if(checkedWord == false){
                //wrong word length
                setRowColor(answer, 0, "not-valid");
            }else{
                //correct length worng chars
                setCharColor(answer,0);
            }
            
            hasUserAnswered = true;
        }else{

            //check which row is empty 
            let row = choosenWord.length;
            while(lingoTable.children[row].innerHTML != ""){
                if(row + choosenWord.length < lingoTable.children.length){
                    row += choosenWord.length;
                }else{
                    row += choosenWord.length;
                    break;
                }
            }
            
            let isLastRow = row + choosenWord.length == lingoTable.children.length + choosenWord.length;

            console.log(`let isLastRow = ${row + choosenWord.length} == ${lingoTable.children.length + choosenWord.length};`);
            row = row == isLastRow ? lingoTable.children.length - choosenWord.length : row;


            if(isLastRow || lingoTable.children[row].innerHTML == ""){

                if(!isLastRow){
                    // fill the row with the answer
                    for(i = 0; i < choosenWord.length; i++){
                        lingoTable.children[row - choosenWord.length + i].innerHTML =  `<p>${answer[i] != undefined ? answer[i].toUpperCase() : ""}</p>`;
                    }

                
                    for(i = 0; i < choosenWord.length; i++){              
                        // check if the answer has correct chars and then write it in the current cell
                        if(lingoTable.children[row - choosenWord.length + i].innerHTML == `<p>${choosenWord[i].toUpperCase()}</p>`){
                            lingoTable.children[row + i].innerHTML = `<p>${choosenWord[i].toUpperCase()}</p>`;  
                        }else{
                            lingoTable.children[row + i].innerHTML = "<p>.</p>";  
                        }            
                    }
                }
  
                var checkedWord = checkWord(answer, row - choosenWord.length); 
                if(checkedWord == true){
                    setRowColor(answer, row - choosenWord.length, "valid");
                
                }else if(checkedWord == false){
                    setRowColor(answer, row - choosenWord.length, "not-valid");
                    if(isLastRow){  
                        setCorrectAnswer();
                    }
                
                }else{        
                    setCharColor(answer, row - choosenWord.length);
                    if(isLastRow){
                        setCorrectAnswer();
                    }
                }
            }
        }
    }

    //button listener
    let submitBtn = document.getElementById("submit-btn");
    submitBtn.addEventListener("click", () => setAnswer(document.getElementById("word-input").value));
})();
