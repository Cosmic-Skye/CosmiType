/**
 * Typing Practice Application
 * 
 * This application is designed to help users improve their typing speed and accuracy.
 * It focuses on practicing with commonly used English words and tracks user performance.
 * The app dynamically adjusts to user performance, presenting more challenging words
 * as the user improves.
 * 
 * Key Features:
 * - Presents words for typing practice
 * - Tracks typing speed and accuracy for each word
 * - Focuses on slower words to improve overall typing performance
 * - Displays statistics on typing performance
 * - Stores user progress locally
 * 
 * The application uses localStorage to persist user data between sessions.
 */

// Load words from LocalStorage or initialize with default word list
// This array contains a list of common English words
let wordArray = ["able", "about", "above", "add", "after", "again", "air", "all", "almost", "along", "also", "always", "an", "and", "animal", "another", "answer", "any", "are", "around", "at", "away", "back", "be", "because", "become", "been", "before", "began", "begin", "below", "between", "big", "book", "both", "boy", "bring", "build", "but", "button", "buy", "by", "cable", "call", "came", "can", "car", "carry", "change", "CharaChorder", "child", "children", "city", "close", "code", "come", "computer", "con", "consider", "could", "country", "course", "cut", "day", "develop", "did", "difference", "different", "do", "does", "don't", "down", "download", "each", "early", "earth", "eat", "end", "engineer", "enough", "even", "ever", "every", "example", "eye", "face", "fact", "family", "far", "fast", "father", "feel", "feet", "few", "fill", "find", "fine", "fire", "first", "follow", "food", "for", "form", "found", "four", "from", "general", "get", "girl", "give", "go", "gone", "good", "got", "govern", "great", "group", "grow", "had", "hand", "happen", "hard", "has", "have", "he", "head", "hear", "hello", "help", "her", "here", "hi", "high", "him", "his", "hit", "hold", "home", "hope", "house", "how", "however", "I'll", "I'm", "idea", "if", "important", "in", "increase", "interest", "into", "is", "isn't", "issue", "it", "it's", "just", "keep", "kind", "know", "land", "large", "last", "late", "later", "lead", "learn", "leave", "left", "let", "letter", "life", "light", "like", "line", "list", "little", "live", "load", "long", "look", "lose", "lot", "made", "make", "man", "many", "may", "me", "mean", "men", "menu", "might", "mile", "mind", "miss", "more", "most", "mother", "mountain", "move", "much", "must", "my", "name", "nation", "near", "need", "never", "new", "next", "nice", "night", "no", "not", "note", "nothing", "now", "number", "of", "off", "often", "oil", "old", "on", "once", "one", "only", "open", "or", "order", "other", "our", "out", "over", "own", "page", "paper", "part", "past", "people", "person", "picture", "place", "plan", "plant", "play", "point", "possible", "present", "print", "problem", "probably", "program", "public", "put", "question", "quick", "quickly", "quite", "read", "real", "really", "review", "right", "river", "run", "said", "same", "saw", "say", "school", "screen", "sea", "second", "see", "seem", "seen", "sentence", "set", "she", "should", "show", "side", "sin", "since", "site", "small", "so", "some", "something", "sometime", "song", "soon", "sound", "spell", "stand", "start", "state", "still", "stop", "store", "story", "study", "such", "super", "sure", "system", "take", "talk", "team", "tell", "than", "thank", "that", "the", "their", "them", "then", "there", "these", "they", "thing", "think", "this", "those", "though", "thought", "three", "through", "time", "tip", "to", "together", "too", "took", "top", "tree", "try", "turn", "two", "type", "under", "until", "up", "us", "use", "used", "very", "walk", "want", "was", "watch", "water", "way", "we", "week", "well", "went", "were", "what", "when", "where", "which", "while", "white", "who", "why", "wide", "will", "with", "without", "won't", "word", "work", "world", "would", "write", "year", "you", "young", "your"];

// Initialize an object to store word statistics
let words = {};
wordArray.forEach(word => {
    words[word] = {times: [], correct: 0, total: 0};
});

// Retrieve stored word data from localStorage, if available
let storedWords = localStorage.getItem('words');
words = storedWords ? JSON.parse(storedWords) : words;

// Load removedWords from localStorage
let storedRemovedWords = localStorage.getItem('removedWords');
let removedWords = storedRemovedWords ? JSON.parse(storedRemovedWords) : {};

// Constants for application settings
let slowWordsNum = parseInt(localStorage.getItem('slowWordsNum')) || 5;  // Default to 5 if not set
const weightedWords = false;  // Flag to determine if word length should affect WPM calculation
const wordsPerLine = 6;

// Global variables
let slowestWords = [];  // Array to store the slowest words
let previousWord = "";  // Variable to store the previously typed word
let wordStart;  // Timestamp for when the current word started
let currentWords = [];  // Array of words currently displayed
let nextWords = [];  // Array of words to be displayed next
let futureWords = [];  // Array of words to be displayed after nextWords
let lineIndex = 0; // Keep track of which line we're on
let wordIndex = 0; // Keep track of which word we're on in the current line
let selectedSlowWords = []; // New global variable to store the selected slow words
let width = 200;

let originalWordArray = [...wordArray];

// Add this global variable at the top of the file
let isDefaultWordList = localStorage.getItem('isDefaultWordList') !== 'false';

// If we have stored words and we're not using the default list, update wordArray
if (!isDefaultWordList && storedWords) {
    wordArray = Object.keys(words);
}

const defaultLongestUntypedWordChance = 10;
let longestUntypedWordChance = parseInt(localStorage.getItem('longestUntypedWordChance')) || defaultLongestUntypedWordChance;

// Initialize wordBuffer with all words from wordArray (which may have been updated from stored words)
let wordBuffer = [...wordArray];

// Load any saved buffer from localStorage
let storedBuffer = localStorage.getItem('wordBuffer');
if (storedBuffer) {
    wordBuffer = JSON.parse(storedBuffer);
} else {
    // If no stored buffer, create a new one based on typing frequency
    wordBuffer = sortWordsByTypingFrequency();
}

function sortWordsByTypingFrequency() {
    return Object.keys(words).sort((a, b) => {
        const freqA = words[a].total;
        const freqB = words[b].total;
        if (freqA === freqB) {
            // Tie-breaker: random order
            return Math.random() - 0.5;
        }
        return freqA - freqB; // Sort from least typed to most typed
    });
}

function getLongestUntypedWords(count = 10) {
    return wordBuffer.slice(0, count);
}

// Add this helper function at the beginning of your file
function getFirstAndLastN(arr, n) {
    return {
        first: arr.slice(0, n),
        last: arr.slice(-n)
    };
}

// Modify the updateWordBuffer function
function updateWordBuffer(typedWord) {
    // Find the index of the typed word in the buffer
    const index = wordBuffer.indexOf(typedWord);
    
    // If the word is found, remove it from its current position
    if (index !== -1) {
        wordBuffer.splice(index, 1);
    }
    
    // Add the typed word to the end of the buffer
    wordBuffer.push(typedWord);
    
    // Save the updated buffer to localStorage
    localStorage.setItem('wordBuffer', JSON.stringify(wordBuffer));

    // Log the first and last ten words of the buffer
    const { first, last } = getFirstAndLastN(wordBuffer, 10);
    console.log('Word Buffer Updated:');
    console.log('First 10 words:', first);
    console.log('Last 10 words:', last);
}

// Add this function to check if the current word set is default
function checkIfDefaultWordSet() {
    const currentWords = new Set(Object.keys(words));
    const originalWords = new Set(originalWordArray);
    
    // Check if the current word set is exactly the same as the original
    const isDefault = currentWords.size === originalWords.size && 
        [...currentWords].every(word => originalWords.has(word));
    
    isDefaultWordList = isDefault;
    localStorage.setItem('isDefaultWordList', isDefault.toString());
    updateRestoreButton();
}

/**
 * Function to display words on the screen
 * This function generates and displays three lines of words,
 * with each line containing a mix of slow words and random words.
 */
function displayWords() {
    let wordsContainer = document.getElementById('wordsContainer');
    wordsContainer.innerHTML = ''; // Clear the words container
    
    // Reset container width before adding new content
    wordsContainer.style.width = '';
    
    // Get the slowest words
    selectedSlowWords = getSlowestWords(slowWordsNum);
    
    // Generate three lines of words, each containing 8 words chosen from the 5 slow words
    let lines = [
        getRandomWords(selectedSlowWords, wordsPerLine),
        getRandomWords(selectedSlowWords, wordsPerLine),
        getRandomWords(selectedSlowWords, wordsPerLine)
    ];
    
    // Set the current, next, and future words
    currentWords = lines[0];
    nextWords = lines[1];
    futureWords = lines[2];

    // Create and display the three lines
    lines.forEach((lineWords, index) => {
        let wordLine = document.createElement('p');
        lineWords.forEach((word, wordIndex) => {
            let wordSpan = document.createElement('span');
            wordSpan.textContent = word;
            wordSpan.id = `line${index}word${wordIndex}`;
            wordSpan.className = ''; // Reset the class
            wordLine.appendChild(wordSpan);
        });
        wordsContainer.appendChild(wordLine);
    });

    // Adjust container size after a short delay to allow browser to calculate layout
    setTimeout(() => {
        adjustContainerSize(wordsContainer);
    }, 0);

    // Set the start time for the first word
    wordStart = Date.now();
    lineIndex = 0;
    wordIndex = 0;
}

function adjustContainerSize(container) {
    const containerRect = container.getBoundingClientRect();
    
    const computedStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingRight = parseFloat(computedStyle.paddingRight);
    const containerScrollWidth = container.scrollWidth - paddingRight - paddingLeft;
    const contentWidth = containerRect.width - (paddingLeft + paddingRight);
    width = Math.max(contentWidth, width, containerScrollWidth);
    if(contentWidth < containerScrollWidth - 1){
        container.style.width = `${width + paddingRight}px`;
    }
    else{
        container.style.width = `${width}px`;
    }
    
}

let lastWord = '';

/**
 * Function to get random words from an array
 * @param {Array} wordsArray - The array of words to choose from
 * @param {number} count - The number of words to return
 * @returns {Array} An array of randomly selected words
 */
function getRandomWords(wordsArray, count) {
    let randomWords = [];
    let lastWord = '';
    const longestUntypedWords = getLongestUntypedWords();

    for (let i = 0; i < count; i++) {
        let selectedWord;
        do {
            if (Math.random() * 100 < longestUntypedWordChance && longestUntypedWords.length > 0) {
                selectedWord = longestUntypedWords[Math.floor(Math.random() * longestUntypedWords.length)];
            } else {
                let randomIndex = Math.floor(Math.random() * wordsArray.length);
                selectedWord = wordsArray[randomIndex];
            }
        } while (selectedWord === lastWord && wordsArray.length > 1);

        randomWords.push(selectedWord);
        lastWord = selectedWord;
    }
    return randomWords;
}

/**
 * Function to show incorrect word display
 * @param {string} typedWord - The word the user typed
 */
function showErrorWord(typedWord) {
    const errorDisplay = document.getElementById('errorDisplay');
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-word';
    errorElement.textContent = typedWord;
    
    // Push existing errors down BEFORE adding the new one
    const existingErrors = errorDisplay.querySelectorAll('.error-word');
    existingErrors.forEach((error, index) => {
        const currentTop = parseInt(error.style.top || '0');
        error.style.top = `${currentTop + 25}px`;
        // Adjust z-index so older errors are behind newer ones
        error.style.zIndex = 100 - index;
    });
    
    // Add new error at the top with highest z-index
    errorElement.style.top = '0px';
    errorElement.style.zIndex = '101';
    errorDisplay.appendChild(errorElement);
    
    
    // Remove the element after animation completes
    setTimeout(() => {
        errorElement.remove();
    }, 2400);
    
    // Clean up old errors that might have accumulated
    if (errorDisplay.children.length > 5) {
        errorDisplay.removeChild(errorDisplay.firstChild);
    }
}

/**
 * Function to check user input and update statistics
 * This function is called every time the user types in the input field.
 * It checks if the typed word is correct, updates statistics, and manages the display of words.
 * @param {string} value - The current value of the input field
 */
function checkInput(value) {
    if (value.endsWith(' ')) {
        let typedWord = value.trim();
        
        // Ignore if no actual characters were typed
        if (typedWord.length === 0) {
            // Clear the input and return without processing
            document.getElementById('wordInput').value = '';
            return;
        }
        
        let correctWord = currentWords[wordIndex];

        let wordEnd = Date.now();
        let wordTime = wordEnd - wordStart;

        // Update word statistics
        words[correctWord].times.push(wordTime);
        words[correctWord].total++;

        // Update the word buffer
        updateWordBuffer(correctWord);

        // Check if the typed word is correct and apply appropriate highlighting
        let isCorrect = typedWord === correctWord;
        if (isCorrect) {
            words[correctWord].correct++;
            document.getElementById(`line${lineIndex}word${wordIndex}`).classList.add('correct');
        } else {
            document.getElementById(`line${lineIndex}word${wordIndex}`).classList.add('incorrect');
            // Show the error display only if there was actual content
            if (typedWord.length > 0) {
                showErrorWord(typedWord);
            }
        }

        // Update last ten correct attempts
        if (!words[correctWord].lastTenCorrect) {
            words[correctWord].lastTenCorrect = [];
        }
        if (words[correctWord].lastTenCorrect.length >= 10) {
            words[correctWord].lastTenCorrect.shift();
        }
        words[correctWord].lastTenCorrect.push(isCorrect ? 1 : 0);

        // Save updated word data to localStorage
        localStorage.setItem('words', JSON.stringify(words));
        
        // Reset word start time for the next word
        wordStart = wordEnd;

        // Move to the next word
        wordIndex++;

        // Check if we've reached the end of a line
        if (wordIndex === wordsPerLine) {
            wordIndex = 0;  // Reset word index for the new line
            lineIndex++;    // Move to the next line

            // Update currentWords when moving to the second line
            if (lineIndex === 1) {
                currentWords = nextWords;
            }

            // Check if we've completed the second line
            if (lineIndex === 2) {
                shiftWords();         // Update word arrays
                updateWordDisplay();  // Update the display
                lineIndex = 1;        // Set to the middle line
                currentWords = nextWords; // Update currentWords to the new middle line
                wordStart = Date.now(); // Reset timing for the new line
            }
        }

        // Clear input field and update statistics display
        document.getElementById('wordInput').value = '';
        document.getElementById('wordInput').focus();
        displayStats();
    }
}

/**
 * Function to calculate word statistics
 * This function processes the stored word data and calculates various statistics,
 * including average WPM for each word.
 * @returns {Array} An array of objects containing statistics for each word
 */
function calculateWordStats() {
    return Object.keys(words).map((word) => {
        let wordWeight = weightedWords ? word.length / 5 : 1;
        let {times, correct, total, lastTenCorrect} = words[word];
        let lastTenTimes = times.slice(-10);
        let totalLastTenTimeInMinutes = lastTenTimes.reduce((a, b) => a + b, 0) / 60000;

        let lastTenCorrectAttempts = lastTenCorrect ? lastTenCorrect.reduce((a, b) => a + b, 0) : 0;
        let attemptsLastTen = lastTenTimes.length;
        let errorsInLastTenAttempts = attemptsLastTen - lastTenCorrectAttempts;
        let averageWPM = totalLastTenTimeInMinutes > 0
            ? Math.max(0, ((wordWeight * attemptsLastTen) / totalLastTenTimeInMinutes) - (errorsInLastTenAttempts / totalLastTenTimeInMinutes))
            : Infinity;

        return { word, count: lastTenTimes.length, correct, total, averageWPM };
    });
}

/**
 * Function to get the slowest words
 * This function identifies the slowest words based on average WPM and typing frequency.
 * It ensures a mix of untyped and slow typed words.
 * Words in selectedSlowWords are not replaced until they have been typed at least once.
 * @param {number} count - The number of slow words to return
 * @returns {Array} An array of the slowest words
 */
function getSlowestWords(count) {
    console.log(`Starting getSlowestWords function with count: ${count}`);
    
    // Calculate and sort word statistics
    let wordStats = calculateWordStats();
    wordStats.sort((a, b) => a.averageWPM - b.averageWPM);
    console.log('Word stats calculated and sorted:', wordStats);

    let slowestWords = [];
    // Separate untyped words (Infinity WPM) from typed words
    let untypedWords = wordStats.filter(w => w.averageWPM === Infinity).map(w => w.word);
    let typedWords = wordStats.filter(w => w.averageWPM !== Infinity).map(w => w.word);
    console.log('Untyped words:', untypedWords);
    console.log('Typed words:', typedWords);

    // Step 1: Include words from selectedSlowWords that haven't been typed yet
    selectedSlowWords.forEach(word => {
        if (untypedWords.includes(word) && slowestWords.length < count) {
            slowestWords.push(word);
            untypedWords = untypedWords.filter(w => w !== word);
            console.log(`Added untyped selectedSlowWord: ${word}`);
        }
    });

    // Step 2: Fill with other untyped words
    while (slowestWords.length < count && untypedWords.length > 0) {
        let randomIndex = Math.floor(Math.random() * untypedWords.length);
        let selectedWord = untypedWords[randomIndex];
        slowestWords.push(selectedWord);
        untypedWords.splice(randomIndex, 1);
        console.log(`Added random untyped word: ${selectedWord}`);
    }

    // Step 3: Fill with the slowest typed words
    while (slowestWords.length < count && typedWords.length > 0) {
        let nextWord = typedWords.shift();
        // Include the word if it's not in selectedSlowWords or if it has been typed at least once
        if (!selectedSlowWords.includes(nextWord) || wordStats.find(w => w.word === nextWord).count > 0) {
            slowestWords.push(nextWord);
            console.log(`Added slow typed word: ${nextWord}`);
        } else {
            console.log(`Skipped selectedSlowWord that hasn't been typed: ${nextWord}`);
        }
    }

    // Step 4: If we still don't have enough words, add random words from the original wordArray
    while (slowestWords.length < count) {
        let randomWord = wordArray[Math.floor(Math.random() * wordArray.length)];
        // Include the word if it's not already in slowestWords and
        // if it's not in selectedSlowWords or if it has been typed at least once
        if (!slowestWords.includes(randomWord) && 
            (!selectedSlowWords.includes(randomWord) || wordStats.find(w => w.word === randomWord).count > 0)) {
            slowestWords.push(randomWord);
            console.log(`Added random word from wordArray: ${randomWord}`);
        } else {
            console.log(`Skipped random word: ${randomWord}`);
        }
    }

    console.log('Final list of slowest words:', slowestWords);
    return slowestWords;
}

/**
 * Function to display statistics
 * This function creates and updates the statistics table shown to the user.
 * It displays overall typing speed and individual word statistics.
 */
function displayStats() {
    let stats = calculateWordStats();
    
    // Separate current slow words from other words
    let slowWordStats = stats.filter(stat => selectedSlowWords.includes(stat.word));
    let otherWordStats = stats.filter(stat => !selectedSlowWords.includes(stat.word));
    
    // Sort slow words: never-typed first, then by averageWPM
    slowWordStats.sort((a, b) => {
        if (a.averageWPM === Infinity && b.averageWPM === Infinity) {
            return a.word.localeCompare(b.word);
        }
        if (a.averageWPM === Infinity) return -1;
        if (b.averageWPM === Infinity) return 1;
        return a.averageWPM - b.averageWPM;
    });
    
    // Sort other words: never-typed first, then by averageWPM
    otherWordStats.sort((a, b) => {
        if (a.averageWPM === Infinity && b.averageWPM === Infinity) {
            return a.word.localeCompare(b.word);
        }
        if (a.averageWPM === Infinity) return -1;
        if (b.averageWPM === Infinity) return 1;
        return a.averageWPM - b.averageWPM;
    });
    
    // Combine sorted arrays: slow words first, then other words
    stats = [...slowWordStats, ...otherWordStats];

    // Calculate overall average WPM and total attempts
    let overallAverageWPM = 0;
    let validWPMCount = 0;
    let totalAttempts = 0;
    stats.forEach(({averageWPM, total}) => {
        if (averageWPM !== Infinity) {
            overallAverageWPM += averageWPM;
            validWPMCount++;
        }
        totalAttempts += total;
    });
    overallAverageWPM /= validWPMCount;

    // Create statistics table
    let statsTable = document.createElement('table');
    statsTable.className = 'statsTable';

    // Create table header
    let tableHeader = document.createElement('thead');
    let headerRow = document.createElement('tr');
    ['Word', 'Total', 'AWPM', ''].forEach(text => {
        let th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    tableHeader.appendChild(headerRow);
    statsTable.appendChild(tableHeader);

    // Create overall statistics row
    let overallRow = document.createElement('tr');
    overallRow.classList.add('overall-row');
    ['Overall', totalAttempts, overallAverageWPM.toFixed(2), ''].forEach(text => {
        let td = document.createElement('td');
        td.textContent = text;
        overallRow.appendChild(td);
    });
    statsTable.appendChild(overallRow);

    // Create divider row
    let dividerRow = document.createElement('tr');
    dividerRow.classList.add('divider-row');
    let dividerCell = document.createElement('td');
    dividerCell.colSpan = 4;
    dividerRow.appendChild(dividerCell);
    statsTable.appendChild(dividerRow);

    // Create table body with individual word statistics
    let tableBody = document.createElement('tbody');
    stats.forEach(({ word, total, averageWPM }) => {
        let row = document.createElement('tr');
        if (selectedSlowWords.includes(word)) {
            row.classList.add('slow');
        }
        [
            word, 
            total, 
            averageWPM === Infinity ? '-' : averageWPM.toFixed(2)
        ].forEach(text => {
            let td = document.createElement('td');
            td.textContent = text;
            row.appendChild(td);
        });
        
        // Add trash icon cell
        let trashCell = document.createElement('td');
        let trashIcon = document.createElement('i');
        trashIcon.className = 'fa-solid fa-trash trash-icon';
        trashIcon.style.display = 'none';
        trashIcon.onclick = () => removeWord(word);
        trashCell.appendChild(trashIcon);
        row.appendChild(trashCell);
        
        // Add hover effect
        row.onmouseover = () => trashIcon.style.display = 'inline';
        row.onmouseout = () => trashIcon.style.display = 'none';
        
        tableBody.appendChild(row);
    });

    statsTable.appendChild(tableBody);

    // Update the DOM with the new statistics table
    let wordStatsContainer = document.getElementById('wordStats');
    wordStatsContainer.innerHTML = '';
    let tableContainer = document.createElement('div');
    tableContainer.id = 'wordStatsContainer';
    tableContainer.appendChild(statsTable);
    wordStatsContainer.appendChild(tableContainer);
}

// Modify the removeWord function
function removeWord(word) {
    if (confirm(`Are you sure you want to remove "${word}" from the word set?`)) {
        // Remove the word from the wordArray and words object
        wordArray = wordArray.filter(w => w !== word);
        removedWords[word] = words[word];
        delete words[word];
        
        // Update localStorage
        localStorage.setItem('words', JSON.stringify(words));
        localStorage.setItem('removedWords', JSON.stringify(removedWords));
        
        // Set isDefaultWordList to false and enable the restore button
        isDefaultWordList = false;
        localStorage.setItem('isDefaultWordList', 'false');
        updateRestoreButton();
        
        // Refresh the display
        displayWords();
        displayStats();
    }
}

function shiftWords() {
    // Update the current slow words
    selectedSlowWords = getSlowestWords(slowWordsNum);

    // Shift word arrays: current becomes next
    currentWords = nextWords;
    
    // Move future words to next
    nextWords = futureWords;
    // Generate new future words from the updated slow words
    futureWords = getRandomWords(selectedSlowWords, wordsPerLine);

}

function updateWordDisplay() {
    let wordsContainer = document.getElementById('wordsContainer');
    
    // Remove the first (top) line
    wordsContainer.removeChild(wordsContainer.firstChild);
    
    // Update IDs and content of remaining lines
    for (let i = 0; i < 2; i++) {
        let words = wordsContainer.children[i].children;
        let wordArray = i === 0 ? currentWords : nextWords;
        for (let j = 0; j < words.length; j++) {
            // Update the ID to reflect the new line position
            words[j].id = `line${i}word${j}`;
            // Update the word text
            words[j].textContent = wordArray[j];
            // No class clearing here
        }
    }
    
    // Add new line at the bottom
    let newLine = document.createElement('p');
    futureWords.forEach((word, index) => {
        let wordSpan = document.createElement('span');
        wordSpan.textContent = word;
        wordSpan.id = `line2word${index}`;
        newLine.appendChild(wordSpan);
    });
    wordsContainer.appendChild(newLine);


    // Adjust container size after shifting words
    adjustContainerSize(document.getElementById('wordsContainer'));
}

function updateSlowWordsNum() {
    const input = document.getElementById('slowWordsInput');
    const newValue = parseInt(input.value);
    if (newValue > 0) {
        slowWordsNum = newValue;
        localStorage.setItem('slowWordsNum', newValue.toString());
        displayWords();  // Refresh the word display
        displayStats();  // Refresh the stats display
        
        // Focus on the word input field
        document.getElementById('wordInput').focus();
    } else {
        input.value = slowWordsNum;  // Reset to previous valid value
    }
}

function filterWords(words) {
    return words.filter(word => {
        // Filter out words containing asterisks
        if (word.includes('*')) return false;
        
        // Filter out words with repeating capital letters (2 or more)
        if (/([A-Z])\1{1,}/.test(word)) return false;
        
        // Filter out words containing "DEL"
        if (word.includes('DEL')) return false;
        
        // Additional filters:
        // Remove words shorter than 2 characters or longer than 15 characters
        if (word.length < 2 || word.length > 15) return false;
        
        // Remove words that are all uppercase (likely abbreviations)
        if (word === word.toUpperCase() && word.length > 1) return false;
        
        // Remove words with non-alphabetic characters (except apostrophes)
        if (!/^[a-zA-Z']+$/.test(word)) return false;
        
        return true;
    });
}

// Function to show custom modal
function showCustomModal(newWordSet) {
    const modal = document.getElementById('customModal');
    const yesBtn = document.getElementById('modalYes');
    const noBtn = document.getElementById('modalNo');
    
    // Show the modal
    modal.classList.add('show');
    
    // Handle Yes button
    yesBtn.onclick = function() {
        modal.classList.remove('show');
        // Only keep words from the uploaded set
        updateWordSet(newWordSet, true);
    };
    
    // Handle No button
    noBtn.onclick = function() {
        modal.classList.remove('show');
        // Merge with existing words
        updateWordSet(newWordSet, false);
    };
    
    // Close modal when clicking outside
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.classList.remove('show');
            // Default to merge if user closes modal
            updateWordSet(newWordSet, false);
        }
    };
}

// Modify the handleFileUpload function
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            try {
                const jsonContent = JSON.parse(content);
                let words = [];

                if (jsonContent.type === "backup" && Array.isArray(jsonContent.history) && jsonContent.history.length > 0) {
                    // Handle the previous format
                    const chords = jsonContent.history[0][0].chords;
                    words = chords.map(chord => {
                        return String.fromCharCode(...chord[1].filter(code => code !== 0 && code < 128));
                    }).filter(word => word.length > 0);
                } else if (jsonContent.type === "chords" && Array.isArray(jsonContent.chords)) {
                    // Handle the new format
                    words = jsonContent.chords.map(chord => {
                        return String.fromCharCode(...chord[1].filter(code => code !== 0 && code < 128));
                    }).filter(word => word.length > 0);
                } else {
                    throw new Error("Invalid file format");
                }

                // Apply the filter
                words = filterWords(words);
                
                const newWordSet = Array.from(new Set(words)); // Remove duplicates
                
                // Check if this is the first custom upload (still using default word list)
                if (isDefaultWordList) {
                    // First upload - show custom modal
                    showCustomModal(newWordSet);
                } else {
                    // Subsequent upload - just add new words without asking
                    updateWordSet(newWordSet, false);
                }
                
                // Set isDefaultWordList to false and enable the restore button
                isDefaultWordList = false;
                localStorage.setItem('isDefaultWordList', 'false');
                updateRestoreButton();
            } catch (error) {
                console.error('Error parsing file:', error);
                alert('Invalid file format. Please upload a valid backup or chords file.');
            }
        };
        reader.readAsText(file);
    }
    // Reset the file input so the same file can be selected again
    event.target.value = '';
}

function updateWordSet(newWordSet, removeDefaultWords = false) {
    if (newWordSet.length === 0) {
        alert("No valid words found in the file. The word set will not be updated.");
        return;
    }

    let tempWords = {...words, ...removedWords};
    let newWordsAdded = 0;
    
    if (removeDefaultWords) {
        // Only keep words from the new set
        removedWords = {};
        
        // Move all existing words that aren't in the new set to removedWords
        Object.keys(tempWords).forEach(word => {
            if (!newWordSet.includes(word)) {
                removedWords[word] = tempWords[word];
            }
        });
        
        // Set wordArray to only the new words
        wordArray = newWordSet;
        
        // Create words object with only the uploaded words
        words = {};
        wordArray.forEach(word => {
            words[word] = tempWords[word] || {times: [], correct: 0, total: 0, lastTenCorrect: []};
        });
        
        // Update wordBuffer to only include new words
        wordBuffer = [...wordArray];
        
        // Calculate new words added
        newWordsAdded = newWordSet.filter(word => !tempWords[word]).length;
    } else {
        // Merge with existing words
        removedWords = {};
        
        // Track which words are actually new
        const existingWords = new Set(wordArray);
        newWordsAdded = newWordSet.filter(word => !existingWords.has(word)).length;
        
        // Add new words to existing wordArray
        const mergedSet = Array.from(new Set([...wordArray, ...newWordSet]));
        wordArray = mergedSet;
        
        // Update words object to include all words
        words = {};
        wordArray.forEach(word => {
            words[word] = tempWords[word] || {times: [], correct: 0, total: 0, lastTenCorrect: []};
        });
        
        // Update wordBuffer with merged set
        wordBuffer = [...wordArray];
    }
    
    localStorage.setItem('words', JSON.stringify(words));
    localStorage.setItem('removedWords', JSON.stringify(removedWords));
    localStorage.setItem('wordBuffer', JSON.stringify(wordBuffer));
    
    displayWords();
    displayStats();
    checkIfDefaultWordSet();
    
    // Show alert after all operations are complete
    if (removeDefaultWords) {
        alert(`Word set replaced with ${newWordSet.length} words.`);
    } else {
        if (newWordsAdded > 0) {
            alert(`Added ${newWordsAdded} new words.`);
        } else {
            alert(`No new words added. All words in the file already exist.`);
        }
    }
}

// Modify the restoreOriginalSet function
function restoreOriginalSet() {
    if (confirm("Are you sure you want to restore the original word set? This will remove all custom words.")) {
        let tempWords = {...words, ...removedWords};
        
        wordArray = [...originalWordArray];
        words = {};
        
        wordArray.forEach(word => {
            if (tempWords[word]) {
                words[word] = tempWords[word];
            } else {
                words[word] = {times: [], correct: 0, total: 0, lastTenCorrect: []};
            }
        });
        
        // Instead of clearing removedWords, update it with words not in the original set
        removedWords = {};
        Object.keys(tempWords).forEach(word => {
            if (!wordArray.includes(word)) {
                removedWords[word] = tempWords[word];
            }
        });

        localStorage.setItem('words', JSON.stringify(words));
        localStorage.setItem('removedWords', JSON.stringify(removedWords));
        
        // Set isDefaultWordList to true and disable the restore button
        isDefaultWordList = true;
        localStorage.setItem('isDefaultWordList', 'true');
        updateRestoreButton();

        displayWords();
        displayStats();
        alert(`Original word set restored. ${wordArray.length} words in the current set.`);
    }
}

// Add this new function to update the restore button state
function updateRestoreButton() {
    const restoreButton = document.getElementById('restoreOriginalSet');
    if (isDefaultWordList) {
        restoreButton.disabled = true;
        restoreButton.classList.add('disabled');
    } else {
        restoreButton.disabled = false;
        restoreButton.classList.remove('disabled');
    }
}

function initializeFocusWordsContainer() {
    const container = document.querySelector('.focus-words-container');
    const input = document.getElementById('slowWordsInput');

    container.addEventListener('click', function(event) {
        // Prevent the click from propagating to parent elements
        event.stopPropagation();
        
        // Focus on the input
        input.focus();
        
        // Select all text in the input for easy editing
        input.select();
    });

    // Add click and focus events to the input itself
    input.addEventListener('click', function(event) {
        event.stopPropagation();
        this.select();
    });

    input.addEventListener('focus', function() {
        this.select();
    });
}

function initializeLongestUntypedChanceContainer() {
    const container = document.querySelector('.longest-untyped-chance-container');
    const input = document.getElementById('longestUntypedChanceInput');

    console.log('Container:', container);
    console.log('Input:', input);

    if (!container || !input) {
        console.error('Container or input not found');
        return;
    }

    container.addEventListener('click', function(event) {
        console.log('Container clicked');
        event.stopPropagation();
        input.focus();
        input.select();
    });

    input.addEventListener('click', function(event) {
        console.log('Input clicked');
        event.stopPropagation();
        this.select();
    });

    input.addEventListener('focus', function() {
        console.log('Input focused');
        this.select();
    });
}

// Modify the window.onload function
window.onload = function() {
    const wordInput = document.getElementById('wordInput');
    wordInput.focus();
    
    // Add input event listener with better error handling
    wordInput.addEventListener('input', function() {
        try {
            checkInput(this.value);
        } catch (error) {
            console.error('Error in checkInput:', error);
            // Ensure input remains functional even if there's an error
            this.focus();
        }
    });
    
    // Add keydown listener as backup for space key
    wordInput.addEventListener('keydown', function(event) {
        if (event.key === ' ') {
            // Prevent space if input is empty or only whitespace
            if (this.value.trim().length === 0) {
                event.preventDefault();
                return;
            }
            
            // Process the word if space is pressed and there's content
            setTimeout(() => {
                if (this.value.endsWith(' ')) {
                    checkInput(this.value);
                }
            }, 0);
        }
    });
    document.getElementById('slowWordsInput').addEventListener('change', updateSlowWordsNum);
    document.getElementById('slowWordsInput').value = slowWordsNum;  // Set initial value from localStorage
    document.getElementById('wordSetUpload').addEventListener('change', handleFileUpload);
    document.getElementById('restoreOriginalSet').addEventListener('click', restoreOriginalSet);

    initializeFocusWordsContainer();
    initializeLongestUntypedChanceContainer(); // Add this line
    
    checkIfDefaultWordSet();

    document.getElementById('longestUntypedChanceInput').value = longestUntypedWordChance;
    document.getElementById('longestUntypedChanceInput').addEventListener('change', function() {
        const newValue = parseInt(this.value);
        if (newValue >= 0 && newValue <= 100) {
            longestUntypedWordChance = newValue;
            localStorage.setItem('longestUntypedWordChance', newValue.toString());
            displayWords();  // Refresh the word display
            
            // Focus on the word input field
            document.getElementById('wordInput').focus();
        } else {
            this.value = longestUntypedWordChance;
        }
    });

    // Initialize wordBuffer
    let storedBuffer = localStorage.getItem('wordBuffer');
    if (storedBuffer) {
        wordBuffer = JSON.parse(storedBuffer);
    } else {
        // If no stored buffer, create a new one based on typing frequency
        wordBuffer = sortWordsByTypingFrequency();
    }

    // Log the initial state of the buffer
    const { first, last } = getFirstAndLastN(wordBuffer, 10);
    console.log('Initial Word Buffer:');
    console.log('First 10 words:', first);
    console.log('Last 10 words:', last);

    // ... (rest of the code)
};

// Initial display of words and statistics
displayWords();
displayStats();