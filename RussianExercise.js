const russianList = document.getElementById("russian");
const englishList = document.getElementById("english");
const messageContainer = document.createElement("div");
messageContainer.classList.add("message");
document.body.appendChild(messageContainer);

let selectedRussian = null;
let selectedEnglish = null;
let remainingPairs = 0;

// Mélanger un tableau
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Sélectionner un sous-ensemble aléatoire
function getRandomSubset(array, size) {
    const shuffled = shuffle([...array]);
    return shuffled.slice(0, size);
}

// Créer des éléments de liste
function createList(listElement, items, key, type) {
    listElement.innerHTML = ""; // Réinitialiser la liste
    items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item[key];
        li.classList.add("word");

        // Gestion des clics sur les mots
        li.addEventListener("click", () => {
            if (type === "russian") playRussianWord(item.word);
            handleSelection(li, type);
        });

        listElement.appendChild(li);
    });
}

// Lecture d'un mot russe
function playRussianWord(word) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "ru-RU"; // Langue russe
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn("La synthèse vocale n'est pas prise en charge par ce navigateur.");
    }
}

// Gestion de la sélection
function handleSelection(element, type) {
    if (element.classList.contains("found")) return; // Ignorer si déjà trouvé

    if (type === "russian") {
        if (selectedRussian) selectedRussian.classList.remove("selected");
        selectedRussian = element;
        selectedRussian.classList.add("selected");
    } else {
        if (selectedEnglish) selectedEnglish.classList.remove("selected");
        selectedEnglish = element;
        selectedEnglish.classList.add("selected");
    }

    // Vérifier la correspondance
    if (selectedRussian && selectedEnglish) {
        const russianWord = selectedRussian.textContent;
        const englishWord = selectedEnglish.textContent;

        const isCorrect = currentWords.some(
            pair => pair.word === russianWord && pair.translation === englishWord
        );

        if (isCorrect) {
            selectedRussian.classList.add("found");
            selectedEnglish.classList.add("found");
            remainingPairs--;

            // Réinitialiser la sélection
            selectedRussian.classList.remove("selected");
            selectedEnglish.classList.remove("selected");
            selectedRussian = null;
            selectedEnglish = null;

            // Vérifier si la manche est terminée
            if (remainingPairs === 0) {
                showMessage("Bravo ! Une nouvelle manche commence...");
                setTimeout(startNewRound, 2000);
            }
        } else {
            selectedRussian.classList.add("incorrect");
            selectedEnglish.classList.add("incorrect");

            setTimeout(() => {
                selectedRussian.classList.remove("selected", "incorrect");
                selectedEnglish.classList.remove("selected", "incorrect");
                selectedRussian = null;
                selectedEnglish = null;
            }, 1000);
        }
    }
}

// Afficher un message
function showMessage(message) {
    messageContainer.textContent = message;
    setTimeout(() => {
        messageContainer.textContent = "";
    }, 2000);
}

// Démarrer une nouvelle manche
let currentWords = [];
function startNewRound() {
    fetch("rusian_vocab.json")
        .then(response => response.json())
        .then(data => {
            currentWords = getRandomSubset(data.words, 5); // Sélectionner 5 mots aléatoires
            const shuffledEnglish = shuffle([...currentWords]);

            remainingPairs = currentWords.length;

            createList(russianList, currentWords, "word", "russian");
            createList(englishList, shuffledEnglish, "translation", "english");
        })
        .catch(error => console.error("Erreur lors du chargement du fichier JSON :", error));
}

// Lancer la première manche
startNewRound();
