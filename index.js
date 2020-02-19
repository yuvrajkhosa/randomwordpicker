let localWords = [];//Declare object that contains a single key. Key's value is an array with words.
let isSubmitMode;
let lastWord = undefined;
let stringJSON;//Declare StringJSON so we could use it is submitWord();
const INPUT_BAR = document.getElementById("addWordInput");//Add Words input bar Object.
const CLEAR_WORDS_BAR = document.getElementById("clearWordInput");
const CLEAR_PASSWORD = "yuvy";//I can use a better way, like getting this password from another database so the password isn't with the client.
const URL = "https://api.myjson.com/bins/vy0qi";//ID of the database in a variable for readability. 
const ENTER_KEY = 13;
const INPUT_BAR_SUCCESS_DURATION = 1400;
const BUTTON_COLOUR_DURATION = 3000;
let currentButton;
let currentButtonDOMID;
const TYPE_OF_REQUESTS = {
    clear : "clear",
    submitWord : "submitWord",
    submitMode: "submitMode",
    copyWords: "copyWords",
    removeLastWord: "removeLastWord"
}
window.onload = async () => {
    let wordsPromise = await retrieveWords();
    updateDatabase(wordsPromise);
    if(isSubmitMode){
        document.getElementById("submitModeButton").classList.add("greenButtonClass");
    } 
    
}   

INPUT_BAR.addEventListener("keyup", (event) => {//Check for when 'Enter' key is pressed and submit word to database
    if (event.keyCode === ENTER_KEY) {
     event.preventDefault();
     if(INPUT_BAR.value.trim().length == 0){//If empty value given. Trim removes trailing whitespace and leading whitespace. So if nothing is there then length will be 0.
         return;//If empty value recieved
     }
     submitWord(TYPE_OF_REQUESTS.submitWord, INPUT_BAR.value.trim());//Submit the word to database. remove trailing/leading whitespace
     INPUT_BAR.value = "";//Clear the input bar
    }
});

function retrieveWords(){//Call this function to fetch database words
    return (new Promise(async(resolve) => {
        let wordsPromise = await fetch(URL, {method: 'GET'});//Get the words object, if promise resolves...
        let json = await wordsPromise.json();//Turn it into json, which gives a promise, once promise resolves...
        resolve(json);
    }));
   
   
}

function pickWord(){//When Pick Word button is clicked
    if(localWords.length == 0){//If words array is empty then print no words added
        document.getElementById("word").innerHTML = "No Words Added";
    }
    else{//Otherwise, pick a random word from the words array or display SUBMIT MODE
        if(isSubmitMode){//If submit mode is on. Client can only submit and not see words
            document.getElementById("word").innerHTML = "Submit Mode is on"
        }
        else{//If submit mode is off and array has words then display a random one
            document.getElementById("word").innerHTML = localWords[Math.floor(Math.random() * localWords.length)]
        }
        
    }
}

function removeLastWord(){
    if(!lastWord){
        return;
    }
    submitWord(TYPE_OF_REQUESTS.removeLastWord);
}

async function submitWord(typeOfRequest, word){//This function sends to database with a put method. If a boolean value is given, means to enable disable submit mode OR remove all words from database. If string, then submit new word
    let currentDatabaseObj = await retrieveWords();//Must fetch current words from database, otherwise each client have different local databasese and they OVERWRITE the database with their old and not-updated local databases
    updateDatabase(currentDatabaseObj);//Update local Datatbase
    let inputBarText;
    switch(typeOfRequest){
        case(TYPE_OF_REQUESTS.submitWord):
            if(!localWords.map(x => x.toLowerCase()).includes(word.toLowerCase())){//Make both input and local words lowercase, to make sure no duplicates
                localWords.push(word);//Add the word to the local database now, which is a object
                inputBarText = "Added Word: " + word;//Make bar say word that we added
                lastWord = word;
                document.getElementById("lastWordHeading").innerHTML = "Last Word: " + lastWord;
            }
            else{
                return;
            }
        break;

        case(TYPE_OF_REQUESTS.submitMode):
            isSubmitMode = !isSubmitMode;
            if(isSubmitMode){
                document.getElementById("submitModeButton").classList.add("greenButtonClass");
            } 
            else{
                document.getElementById("submitModeButton").classList.remove("greenButtonClass");
            }
            inputBarText = "Submit Mode Toggled";
        break;

        case(TYPE_OF_REQUESTS.clear):
            localWords = []
            inputBarText = "Words Clear!";
        break;

        case(TYPE_OF_REQUESTS.removeLastWord):
            localWords.splice(localWords.indexOf(lastWord), 1);
            inputBarText = "Removed: " + lastWord;
            document.getElementById("lastWordHeading").innerHTML = "";
        break;
    }
    let stringJSON = JSON.stringify( { 'words' : localWords, 'isSubmitMode' : isSubmitMode});
    
    
    let sendWord = await fetch(URL, //Fetch to do a 'PUT' request
    {
        method:'PUT',//PUT request to update
        headers:{//Must add this, otherwise API doesn't know we sent JSON
            'Content-type': 'application/json'
        },    
        body: stringJSON//Send the new object, which is stringified
    });

    if(sendWord.status == 200){//If word added succesfuly
        INPUT_BAR.placeholder = inputBarText;//Make the INPUT_BAR say word is added or cleared
        setTimeout(() => INPUT_BAR.placeholder = "Add Word", INPUT_BAR_SUCCESS_DURATION);//After 1400ms make it to say 'Add Word' again
    }
   
}

function submitModePressed(){
    CLEAR_WORDS_BAR.classList.add("passwordGrow");//Add the animation class so it grows
    CLEAR_WORDS_BAR.focus();//Focus on it to type
    //currentButton = 0;//Set current button to this so when we click enter in input bar then we know which button was clicked
    currentRequestType = TYPE_OF_REQUESTS.submitMode;
    currentButtonDOMID = "submitModeButton";//Change DOM id button to this
}

function clearWordsPressed(){
    CLEAR_WORDS_BAR.classList.add("passwordGrow");//Add the animation class so it grows
    CLEAR_WORDS_BAR.focus();//Focus on it to type
    //currentButton = 1;
    currentRequestType = TYPE_OF_REQUESTS.clear;
    currentButtonDOMID = "clearButton";
}

function copyWordsPressed(){
    CLEAR_WORDS_BAR.classList.add("passwordGrow");//Add the animation class so it grows
    CLEAR_WORDS_BAR.focus();//Focus on it to type
    //currentButton = 1;
    currentRequestType = TYPE_OF_REQUESTS.copyWords;
    currentButtonDOMID = "copyWordsButton";
}

CLEAR_WORDS_BAR.addEventListener("keyup", (event) => {//Check for when 'Enter' key is pressed and submit word to database
    if (event.keyCode === ENTER_KEY) {
        event.preventDefault();
        if(CLEAR_WORDS_BAR.value == CLEAR_PASSWORD){//If the password matches
            switch(currentRequestType){//Go through the current buttons
                case(TYPE_OF_REQUESTS.submitMode)://Submit Mode | Currently, submit mode can only be triggered by a page reload or by submitting a word and updating everything
                    submitWord(currentRequestType);//Send to disable picking words
                break;

                case(TYPE_OF_REQUESTS.clear)://Clear Database
                    submitWord(currentRequestType);//Submit word with false to remove everything
                    document.getElementById("clearButton").classList.add("greenButtonClass");
                    setTimeout(() =>  document.getElementById("clearButton").classList.remove("greenButtonClass"), BUTTON_COLOUR_DURATION);
                break;

                case(TYPE_OF_REQUESTS.copyWords):
                    retrieveWords().then((words) => {//Get the words updated
                        updateDatabase(words);
                        copyWords();
                    })
                
                break;
            }
        }
        else{
            document.getElementById(currentButtonDOMID).classList.add("redButtonClass");//If password was wrong, make button red and remove redButtonClass after 3 seconds
            setTimeout(() =>  document.getElementById(currentButtonDOMID).classList.remove("redButtonClass"), BUTTON_COLOUR_DURATION);
        }
        CLEAR_WORDS_BAR.classList.remove("passwordGrow");//Once Enter is pressed remove growing class to shrink input bar
        CLEAR_WORDS_BAR.value = "";//Make the input bar empty
    }
});

function updateDatabase(json){//Function to fetch database words and update local database
    localWords = json.words;
    isSubmitMode = json.isSubmitMode;
    if(isSubmitMode){
        document.getElementById("submitModeButton").classList.add("greenButtonClass");
    } 
    else{
        document.getElementById("submitModeButton").classList.remove("greenButtonClass");
    }
}

function clearWordsBarBlur(){//When we click off input bar clear it and remove the grow class
    CLEAR_WORDS_BAR.classList.remove("passwordGrow");
    CLEAR_WORDS_BAR.value = "";
}

function copyWords(){//Copy all words to clipboard as a list without quotes Eg. Horse, Animals, Sheep
    const wordsList = localWords.join(", ")
    //console.log(wordsList);
    if(!navigator.clipboard){
        document.getElementById(currentButtonDOMID).classList.add("redButtonClass");//If password was wrong, make button red and remove redButtonClass after 3 seconds
        setTimeout(() =>  document.getElementById(currentButtonDOMID).classList.remove("redButtonClass"), BUTTON_COLOUR_DURATION);
        return;
    }
    else{
        navigator.clipboard.writeText(wordsList).then(() => {//If copy to clipboard does not work
            //console.log("COPIED!");
            document.getElementById(currentButtonDOMID).classList.add("greenButtonClass");
            setTimeout(() =>  document.getElementById(currentButtonDOMID).classList.remove("greenButtonClass"), BUTTON_COLOUR_DURATION);
        }).catch(err => {
            document.getElementById(currentButtonDOMID).classList.add("redButtonClass");
            setTimeout(() =>  document.getElementById(currentButtonDOMID).classList.remove("redButtonClass"), BUTTON_COLOUR_DURATION);
        });
    }
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

