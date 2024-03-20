const SettingsModule = (
    async () => {

        let main = document.getElementsByTagName("main");
        let body = document.getElementsByTagName("body");
        let gameModule = await GameModule;
        main[0].style.display = "none";

        let divOptions = document.createElement("div");
        divOptions.classList.add("option-ctn");

        // Start game button
        let startGameBtn = document.createElement("button");
        startGameBtn.classList.add("start-game-btn");
        startGameBtn.innerHTML = "Avvia Lingo!";
        startGameBtn.disabled = true;

        startGameBtn.addEventListener("click", async () => {
            divOptions.style.display = "none";
            main[0].style.display = "block";
            gameModule.startGame(isDifficultySet, isTimerSet);
        });

        // Generic option button
        let option;

        // First options title
        let firstTitle = document.createElement("h1");
        firstTitle.innerHTML = "Scegli difficolta";
        divOptions.append(firstTitle);

        // First options container
        let firstOptionCtn = document.createElement("div");
        firstOptionCtn.classList.add("difficulty");

        // Difficulties array to manage checkbox functionality
        let difficulties = new Array();

        let isDifficultySet = null;

        for (i = 0; i < 5; i++) {
            // Add the difficulty option
            let value = i + 5;
            option = document.createElement("div");
            option.classList.add("option");
            option.innerHTML = `<p>${i < 4 ? value : "Mix" }</p>`;

            difficulties[i] = option;

            option.addEventListener("click", (event) => {
                // Check if event is triggered from the <p> (value) tag or the <div> (button)
                isDifficultySet = value;
                if (event.target.classList.contains("option")) {
                    event.target.classList.add("active-option");
                    resetOption(event.target, "difficulty");
                } else {
                    event.target.parentNode.classList.add("active-option");
                    resetOption(event.target.parentNode, "difficulty");
                }
            });

            firstOptionCtn.append(option);
        }

        divOptions.append(firstOptionCtn);

        // Second options titles
        let secondTitle = document.createElement("h1");
        secondTitle.innerHTML = "Scegli il timer";
        divOptions.append(secondTitle);

        let secondOptionCtn = document.createElement("div");
        secondOptionCtn.style.display = "flex";
        secondOptionCtn.style.gridArea = "timer";
        secondOptionCtn.classList.add("timer");

        let timers = new Array();
        let isTimerSet = null;

        function resetOption(clickedOption, setting) {
            // Reset CSS styles of not selected buttons
            if (setting == "difficulty") {
                for (difficulty of difficulties) {
                    if (difficulty != clickedOption) {
                        difficulty.classList.remove("active-option");
                    }
                }
            } else if (setting == "time") {
                for (timer of timers) {
                    if (timer != clickedOption) {
                        timer.classList.remove("active-option");
                    }
                }
            }

            if (isDifficultySet != null && isTimerSet != null) {
                startGameBtn.disabled = false;
            }
        }

        for (i = 0; i < 3; i++) {
            //add the timer options
            let value = i == 0 ? 10 : i == 1 ? 30 : i == 2 ? 60 : null;
            option = document.createElement("div");
            option.classList.add("option");
            option.innerHTML = `<p>${value}s</p>`;

            timers[i] = option;

            option.addEventListener("click", (event) => {
                //check if event is triggered from the <p> (value) tag or the <div> (button)
                isTimerSet = value;
                if (event.target.classList.contains("option")) {
                    event.target.classList.add("active-option");
                    resetOption(event.target, "time");
                } else {
                    event.target.parentNode.classList.add("active-option");
                    resetOption(event.target.parentNode, "time");
                }

            });

            secondOptionCtn.append(option);
        }

        divOptions.append(secondOptionCtn);
        divOptions.append(startGameBtn);

        body[0].append(divOptions);

        return {
            showSettings: () => {
                divOptions.style.display = "block";
                main[0].style.display = "none";
            }
        }
    })();