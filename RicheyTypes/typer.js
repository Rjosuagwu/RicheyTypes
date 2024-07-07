
const words = 'the cat and the dog nation hard ever cousin catch vision wreck cooperate cart pot receipt court embark wound worker aluminum overwhelm aware angle stand gene railroad referee experience expose'.split(' ');
const wordsCount = words.length-1;
const time = 30*1000;
window.timer = null;
window.gameStart = null

//to add word classes and letter classes
function addClass(element,className){

    element.className += ' ' + className;
}

//to remove them
function removeClass(element,className){

    element.className = element.className.replace(className,'');
}
function randomWord(){
    var randomIndex = Math.ceil(Math.random()*wordsCount);
    return words[randomIndex];
}

function formatWord(word){
    //console.log(word);
    return `<div class = "word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`
}

function newGame(){
    removeClass(document.getElementById('game'),'over');
    document.getElementById("words").innerHTML=''; // in case there is already words here

    for(var i=0;i<200;i++){
        document.getElementById("words").innerHTML +=formatWord(randomWord());
    }
    addClass(document.querySelector('.word'),'current'); // this will add the word 'current' to the end of the first word class name
    addClass(document.querySelector('.letter'),'current'); //this will do the same
    document.getElementById('info').innerHTML = (time/1000) + "";
    window.timer = null;
}

newGame();

function getWpm(){
    const words = [...document.querySelectorAll('.word')];
    const lastTypedWord = document.querySelector('.word.current');
    const lastTypedWordInt = words.indexOf(lastTypedWord);
    const typedWords = words.slice(0,lastTypedWordInt);
    const correctWords = typedWords.filter(word =>{
        const letters = [...word.children];
        const incorrectLetters = letters.filter(letter => letter.className.includes('incorrect'));
        const correctLetters = letters.filter(letter => letter.className.includes('correct'));
        return incorrectLetters.length===0 && correctLetters.length === letters.length;
    });
    console.log(time);
    console.log(correctWords.length);
    return correctWords.length/(time/60000);
}

function gameOver(){
    clearInterval(window.timer);
    addClass(document.getElementById('game'),'over');
    document.getElementById('info').innerHTML = `WPM: ${getWpm()}`;
}




document.getElementById('game').addEventListener('keyup', ev=>{
    const key = ev.key;
    const currentLetter = document.querySelector('.letter.current');
    const currentWord = document.querySelector('.word.current');
    const expected = currentLetter?.innerHTML || ' ';
    const isLetter = key.length===1 && key!==' ';
    const isSpace = key===' ';
    const isBack = key==='Backspace';
    const isFirstLetter = currentLetter==currentWord.firstChild;

    console.log({expected,key});

    if(document.querySelector('#game.over')){
        return;
    }

    if(!window.timer && isLetter){
        window.timer = setInterval(() =>{
            if(!window.gameStart){
                window.gameStart = (new Date()).getTime();
            }
            const currentTime = (new Date()).getTime();
            const msPassed = currentTime - window.gameStart;
            const sPassed = Math.round(msPassed/1000);
            const sLeft = (time/1000) - sPassed;
            if(sLeft<=0){
                gameOver();
                return;
            }
            document.getElementById('info').innerHTML = sLeft;
        }, 1000);
    }

    if(isLetter){
        if(currentLetter){
            addClass(currentLetter, key===expected ? 'correct':'incorrect');
            removeClass(currentLetter, 'current');
            if(currentLetter.nextSibling){
                addClass(currentLetter.nextSibling, 'current');
            }
        }
        else{
            const incorrectLetter = document.createElement('span');
            incorrectLetter.innerHTML = key;
            incorrectLetter.className = 'letter incorrect extra';
            currentWord.appendChild(incorrectLetter);
        }
    }


    if(isSpace){
        if(expected!==' '){
            const lettersToInvalidate = [...document.querySelectorAll('.word.current .letter:not(.correct)')];
            lettersToInvalidate.forEach(letter=>{
                addClass(letter, 'incorrect');
            })
        }

        removeClass(currentWord,'current');
        addClass(currentWord.nextSibling, 'current');

        if(currentLetter){
            removeClass(currentLetter, 'current');
        }
        addClass(currentWord.nextSibling.firstChild, 'current');
    }

    if(isBack){
        if(currentLetter && isFirstLetter){
            //make the previous word current and the last letter of that word current
            removeClass(currentWord, 'current');
            addClass(currentWord.previousSibling, 'current');
            removeClass(currentLetter, 'current');
            addClass(currentWord.previousSibling.lastChild, 'current');
            removeClass(currentWord.previousSibling.lastChild, 'incorrect');
            removeClass(currentWord.previousSibling.lastChild, 'correct');
        }

        if(currentLetter && !isFirstLetter){
            // move back one letter, invalidate letter
            removeClass(currentLetter, 'current');
            addClass(currentLetter.previousSibling,'current');
            removeClass(currentLetter.previousSibling, 'incorrect');
            removeClass(currentLetter.previousSibling, 'correct');
        }
        if(!currentLetter){
            // move back one letter, invalidate letter
            addClass(currentWord.lastChild,'current');
            removeClass(currentWord.lastChild, 'incorrect');
            removeClass(currentWord.lastChild, 'correct');
        }



    }
    //This code will be to move our cursor

    if(currentWord.getBoundingClientRect().top>290){
        const words = document.getElementById('words');
        const margin = parseInt(words.style.marginTop || '0px');
        words.style.marginTop = (margin - 40) + 'px';
    }

    const nextLetter = document.querySelector('.letter.current');
    const nextWord = document.querySelector('.word.current');
    const cursor = document.getElementById('cursor');
    cursor.style.top = (nextLetter||nextWord).getBoundingClientRect().top + 2 + 'px';
    cursor.style.left = (nextLetter||nextWord).getBoundingClientRect()[nextLetter ? 'left':'right'] +'px';
    //console.log(nextLetter.innerHTML);

});

document.getElementById('newGame').addEventListener('click',()=>{
    gameOver();
    newGame();
})