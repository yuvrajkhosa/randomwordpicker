let dataObject;//Declare object that contains a single key. Key's value is an array with words.
let stringJSON;//Declare StringJSON so we could use it is submitWord();
const inputBar = document.getElementById("addWordInput");//Add Words input bar Object.
const clearWordsBar = document.getElementById("clearWordInput");
const clearPassword = "yuvy";//I can use a better way, like getting this password from another database so the password isn't with the client.
const url = "https://api.myjson.com/bins/vy0qi";//ID of the database in a variable for readability. 
let currentButton;
let currentButtonDOMID;
window.onload = async function(){//Once the window loads, fetch the words from the database. Make async function beacause retrieveWords is a promise
    let dbObj = await retrieveWords();//Get the words from the database, and whether submit mode is enabled or not
    dataObject = dbObj;//Make the database we just fetched into local database
    
}

inputBar.addEventListener("keyup", (event) => {//Check for when 'Enter' key is pressed and submit word to database
    if (event.keyCode === 13) {
     event.preventDefault();
     submitWord(inputBar.value);//Submit the word to database
     inputBar.value = "";//Clear the input bar
    }
});

function retrieveWords(){//Call this function to fetch database words
    return new Promise(async(resolve) => {//Return a promise when they are fetched
        let wordsPromise = await fetch(url, {method: 'GET'});//Get the words object, if promise resolves...
        let json = await wordsPromise.json();//Turn it into json, which gives a promise, once promise resolves...
        if(json.isSubmitMode){//Check if submit mode is on
            document.getElementById("submitModeButton").classList.add("greenButtonClass");//If yes, make submitmode button green
        }
        resolve(json);//Send back the json data from the api as promise is resolved.
    });
}

function pickWord(){//When Pick Word button is clicked
    if(dataObject.words.length == 0){//If words array is empty then print no words added
        document.getElementById("word").innerHTML = "No Words Added";
    }
    else{//Otherwise, pick a random word from the words array or display SUBMIT MODE
        if(dataObject.isSubmitMode){//If submit mode is on. Client can only submit and not see words
            document.getElementById("word").innerHTML = "Submit Mode is on"
        }
        else{//If submit mode is off and array has words then display a random one
            document.getElementById("word").innerHTML = dataObject.words[Math.floor(Math.random() * dataObject.words.length)]
        }
        
    }
}

async function submitWord(word){//This function sends to database with a put method. If a boolean value is given, means to enable disable submit mode OR remove all words from database. If string, then submit new word
    let currentDatabaseObj = await retrieveWords();//Must fetch current words from database, otherwise each client have different local databasese and they OVERWRITE the database with their old and not-updated local databases
    dataObject = currentDatabaseObj;//Make local database updated with online database
    let inputBarText;
    if(typeof(word) != "boolean"){//If parameter is not a boolean, then we want to submit a word.
        if(word == ""){//Make sure no empty strings come. If it does, just leave function, Mistake enter clicked while inputbar was focused
            return;//Exit submitWord() if enter clicked by mistake on input bar
        }
        else{//If normal word
            dataObject.words.push(word);//Add the word to the local database now, which is a object
            stringJSON = JSON.stringify(dataObject);//Turn the json into string for the API
            inputBarText = "Added Word";//Make bar say word that we added
        }
    }
    else{//If we got a boolean, we either want to turn on submit mode, or clear the database
        if(word == true){//Submit Mode
            dataObject.isSubmitMode = !dataObject.isSubmitMode;//We have updated database from line 50. So just change isSubmitMode in local database then that will be sent to API
        }
        else{//Clear All
            dataObject.words = [];//Updated local database so just clear it and send a cleared one
            inputBarText = "CLEARED";
        }
        stringJSON = JSON.stringify(dataObject);//Stringify the local database so we can send it to API
    }
    
    
    let sendWord = await fetch(url, //Fetch to do a 'PUT' request
    {
        method:'PUT',//PUT request to update
        headers:{//Must add this, otherwise API doesn't know we sent JSON
            'Content-type': 'application/json'
        },    
        body: stringJSON//Send the new object, which is stringified
    });

    if(sendWord.status == 200){//If word added succesfuly
        inputBar.placeholder = inputBarText;//Make the inputbar say word is added or cleared
        setTimeout(() => inputBar.placeholder = "Add Word", 1400);//After 1400ms make it to say 'Add Word' again
    }
   
}

function buttonPressed(button){//Parameter 'button' tells which button pressed. SubmitMode = 0, Clear = 1;
    clearWordsBar.classList.add("passwordGrow");//Add the animation class so it grows
    clearWordsBar.focus();//Focus on it to type
    switch(button){//Switch between which button is pressed.
        case(0):
            currentButton = 0;//Set current button to this so when we click enter in input bar then we know which button was clicked
            currentButtonDOMID = "submitModeButton";//Change DOM id button to this
        break;
        case(1)://Same as top but for clear button
            currentButton = 1;
            currentButtonDOMID = "clearButton";
        break;
    }
    

}

clearWordsBar.addEventListener("keyup", (event) => {//Check for when 'Enter' key is pressed and submit word to database
    if (event.keyCode === 13) {
        event.preventDefault();
        if(clearWordsBar.value == clearPassword){//If the password matches
            switch(currentButton){//Go through the current buttons
                case(0)://Submit Mode | Currently, submit mode can only be triggered by a page reload or by submitting a word and updating everything
                    submitWord(true);//Send to disable picking words
                    if(dataObject.isSubmitMode){//If submit mode is on then make submitmode button green
                        document.getElementById("submitModeButton").classList.remove("greenButtonClass");
                    }
                    else{//Otherwise remove green button class
                        document.getElementById("submitModeButton").classList.add("greenButtonClass");
                    }
                    
                break;

                case(1)://Clear Database
                    submitWord(false);//Submit word with false to remove everything
                    document.getElementById("clearButton").classList.add("greenButtonClass");
                    setTimeout(() =>  document.getElementById("clearButton").classList.remove("greenButtonClass"), 3000);
                break;
            }
            
        
        }
        else{
            document.getElementById(currentButtonDOMID).classList.add("redButtonClass");//If password was wrong, make button red and remove redButtonClass after 3 seconds
            setTimeout(() =>  document.getElementById(currentButtonDOMID).classList.remove("redButtonClass"), 3000);
        }
        clearWordsBar.classList.remove("passwordGrow");//Once Enter is pressed remove growing class to shrink input bar
        clearWordsBar.value = "";//Make the input bar empty
    }
});

function clearWordsBarBlur(){//When we click off input bar clear it and remove the grow class
    clearWordsBar.classList.remove("passwordGrow");
    clearWordsBar.value = "";
}



/* .then() version. Really bad. Never use. Chaining promises is too messy
function retrieveWords(){
     fetch("https://api.myjson.com/bins/tt14q", {method: 'GET'}).then((wordsPromise) =>{
        wordsPromise.json().then((json) => {
            dataObject = json;
            console.log(dataObject);
        })
    }).catch((err) => console.error(err));
 }
*/

