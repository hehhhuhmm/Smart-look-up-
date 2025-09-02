var input = document.getElementById("word");
var list = document.getElementById("list");
var theme = document.getElementById("theme");
const words = new Set(); // word list =  word : link
const links = new Set();
let listName = "wordsList";
let currentWordIndexName = "currentWordIndex";
var cw = window;
var currentWordIndex = 0; // current word index
let popupName = "wordLink";

if (localStorage.getItem("mode") != null) {
	var mode = localStorage.getItem("mode");
	if (mode === "light") theme.setAttribute("href", "light.css");
	else theme.setAttribute("href", "dark.css");
}

function saveWords() {
	let wordArr = Array.from(words);
	localStorage.setItem(listName, JSON.stringify(wordArr));
}

function loadWord() {
	let wordArr = JSON.parse(localStorage.getItem(listName));
	if (wordArr != null) wordArr.forEach((word) => appendIntoList(word));
	currentWordIndex =
		localStorage.getItem(currentWordIndexName) === null
			? 0
			: localStorage.getItem(currentWordIndexName);
	updateLength();
	updateSubmittedWord();
	if (currentWordIndex > 0) {
		for (let i = 0; i < currentWordIndex; i++) crossOutWord(wordArr[i]);
	}
}

function deleteWord(val, link) {
	links.delete(link);
	words.delete(val);
	saveWords();
	updateLength();
	updateSubmittedWord();
}

function addword(val, link) {
	links.add(link);
	words.add(val);
	saveWords();
	updateLength();
	updateSubmittedWord();
}

function appendIntoList(val) {
	// ic = new div for a word
	var ic = document.createElement("div");
	ic.setAttribute("id", val);
	ic.setAttribute("class", "item");
	// a tag for link
	var a = document.createElement("a");
	var word = val.slice(0);
	var searchLink = "https://www.google.com/search?q=";
	var link;
	if (word.indexOf(" ") >= 0 && word.indexOf(" ") < word.length - 1)
		word = word.replace(/\s/g, "+");
	link = searchLink.concat(word) + "+meaning";
	a.setAttribute("id", val + "_link");
	a.setAttribute("href", link);
	a.setAttribute("target", "_blank");
	a.innerHTML = val;
	// add word and append to the new div
	addword(val, link);
	ic.appendChild(a);
	// add into the list in main page
	list.appendChild(ic);
	// function to delete or edit the word
	ic.addEventListener("contextmenu", function () {
		if (confirm("Do you want to delete this item?") == true) {
			// delete the word
			const element = document.getElementById(val);
			element.classList.add("removing");
			setTimeout(() => {
				element.remove();
				deleteWord(val, link);
			}, 400); // matches CSS transition duration
		} else {
			// edit the word
			let newVal = prompt("Type the new value of this item: ", a.text);
			if (newVal != null && newVal != "") {
				deleteWord(val, link);
				a.innerHTML = newVal;
				var searchLink = "https://www.google.com/search?q=";
				var newLink;
				let word = newVal.slice(0);
				if (word.indexOf(" ") >= 0 && word.indexOf(" ") < word.length - 1)
					word = word.replace(/\s/g, "+");
				newLink = searchLink.concat(word) + "+meaning";
				a.setAttribute("href", newLink);
				a.setAttribute("id", newVal + "_link");
				addword(newVal, newLink);
			} else alert("The word didn't change!");
		}
	});
	// function to cross out word when the link is clicked
	ic.addEventListener("click", function () {
		ic.classList.add("wordSubmitted");
	});
}

function updateLength() {
	var twc = document.getElementById("twc");
	twc.innerHTML = words.size;
}

function updateSubmittedWord() {
	var wordSubmitCount = document.getElementById("wsc");
	wordSubmitCount.innerHTML = currentWordIndex;
	var pctWordSubmitted = document.getElementById("pctwsc");
	pctWordSubmitted.innerHTML =
		(words.size != 0 ? Math.ceil((parseInt(currentWordIndex, 10) / words.size) * 100) : 0) +
		"%";
}

function crossOutWord(crossWord) {
	var word_link = document.getElementById(crossWord);
	word_link.classList.add("wordSubmitted");
}

function reset() {
	words.clear();
	links.clear();
	$("#list").empty();
	localStorage.removeItem(listName);
	localStorage.removeItem(currentWordIndexName);
	currentWordIndex = 0;
	updateLength();
	updateSubmittedWord();
}

function resizeInput() {
	if (input.value) {
		input.style.width = input.value.length + 10 + "ch";
		input.style.backgroundColor = "rgba(226, 214, 126, 0.7)";
	} else {
		input.style.width = 20 + "ch";
		input.style.backgroundColor = "rgba(226, 214, 126, 0.311)";
	}
}

function switchMode() {
	if (theme.getAttribute("href") == "light.css") {
		theme.setAttribute("href", "dark.css");
		localStorage.setItem("mode", "dark");
	} else {
		theme.setAttribute("href", "light.css");
		localStorage.setItem("mode", "light");
	}
}

function submit() {
	if (words.size == 0) {
		alert("You have no word to search!");
		return;
	}
	const linkArray = Array.from(links);
	const wordArray = Array.from(words);
	if (currentWordIndex >= links.size) {
		if (confirm("You've reached the end of the words list. Do you want to start over again?"))
			currentWordIndex = 0;
		else return;
	}

	var currentLink = linkArray[currentWordIndex].toString();
	window.open(currentLink, "", "popup");

	crossOutWord(wordArray[currentWordIndex]);

	currentWordIndex++;
	updateSubmittedWord();
	localStorage.setItem(currentWordIndexName, currentWordIndex.toString());
}

input.addEventListener("keydown", function (event) {
	if (event.key === "Enter") {
		var val = input.value;
		event.preventDefault();
		if (!words.has(val)) {
			if (val) {
				appendIntoList(val);
			} else {
				alert("You can't submit a space!");
			}
			input.value = "";
		} else {
			alert("You have already entered that word!");
		}
		resizeInput();
	}
});

window.addEventListener("keydown", function (event) {
	if (event.altKey) {
		if (event.key === "s" || event.key === "S") {
			isSubmitted = true;
			submit();
		} else if (event.key === "r" || event.key === "R") {
			if (event.shiftKey) {
				reset();
			} else {
				if (this.confirm("Are you sure?")) reset();
			}
		}
	} else if (event.shiftKey) {
		if (event.key === "I" || event.key === "i") {
			input.focus();
		} else if (event.key === "m" || event.key === "M") {
			switchMode();
		}
	}
});

document.addEventListener("DOMContentLoaded", loadWord());
