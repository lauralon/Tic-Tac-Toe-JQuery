
var hints = document.getElementById('hints'),
		hintText = document.getElementById('hintText'),
		bubbles = document.querySelectorAll('.bubble'),
		displaySidesContainer = document.getElementById('displaySidesContainer'),
		displaySidesHead = document.getElementById('displaySidesHead'),
		dots = document.querySelectorAll('.dot'),
		displaySidesPart = document.querySelectorAll('.displaySidesPart'),
		nameMessage = document.getElementById('nameMessage'),
		drawDisplay = document.getElementById('drawDisplay'),
		drawNum = document.querySelector('#drawDisplay span'),
		startBtn = document.querySelector('#startBtn'),
		roundDisplay = document.querySelector('#roundDisplay'),
		resetBtn = document.getElementById('resetBtn'),		
		settings = document.querySelectorAll('#settings div span'),
		inputEmphasis = document.querySelectorAll('.inputEmphasis'),
		inputs = document.querySelectorAll('input'),
		playerImg = document.querySelectorAll('.playerImg'),
		intimDivs = document.querySelectorAll('.playerImgContain div:nth-of-type(1)'),
		winEmphasis = document.querySelectorAll('.winEmphasis'),
		winner = document.querySelectorAll('.winner'),		
		playingLabels = document.querySelectorAll('.playingContain div:nth-child(1)'),
		playingSides = document.querySelectorAll('.playingSide'),
		winNums = document.querySelectorAll('.winNum'),
		taunt = document.querySelectorAll('.taunt'),
		tauntName = document.querySelectorAll('.tauntName'),
		cells = document.querySelectorAll('.cell'),
		cellLetters = document.querySelectorAll('.cellLetter'),
		drawEmphasis = document.getElementById('drawEmphasis');

// Game States
var p2Setting = "comp",
		gameStarted = false,
		roundOver = false,
		endRoundStatus,
		winningLetter,
		roundCount = 1,
		drawCount = 0;
		playableCells = [];

// Human/Comp Setting
var selectedBox = settings[0].textContent,
		unselectedBox = settings[1].textContent;

// Variety of Taunts
var taunts = ["You're a Fool", "Scalleywag!", "You're so Lame",
							"Loser!", "You Won't Win", "Puppet!", "You're Smelly",
							"Knave!", "I'm smarter", "Slubberdegullion!"];

// Grouping cellsLetters in winning groups for checking wins of round
var winRows = [ [cellLetters[0], cellLetters[1], cellLetters[2]],
							  [cellLetters[3], cellLetters[4], cellLetters[5]],
							  [cellLetters[6], cellLetters[7], cellLetters[8]] ];

var winCols = [ [cellLetters[0], cellLetters[3], cellLetters[6]],
							  [cellLetters[1], cellLetters[4], cellLetters[7]],
							  [cellLetters[2], cellLetters[5], cellLetters[8]] ];

var winDiags = [ [cellLetters[0], cellLetters[4], cellLetters[8]],
							   [cellLetters[2], cellLetters[4], cellLetters[6]] ];

// Stores both player win counts
var playerWins = [0, 0];

// For preventing players taunting twice in a turn
var tauntTurnCount = 0;

// The cellLetters to inspect for the computer to decide which cell to play
var cellInspectCodes = [ [0, 1, 2, 3, 6, 4, 8],
											   [1, 0, 2, 4, 7],
											   [2, 0, 1, 5, 8, 4, 6],
											   [3, 4, 5, 0, 6],
											   [4, 3, 5, 1, 7, 0, 8, 2, 6],
											   [5, 2, 8, 3, 4],
											   [6, 0, 3, 7, 8, 4, 2],
											   [7, 1, 4, 6, 8],
											   [8, 2, 5, 6, 7, 0, 4] ];
// List of corner cells for computer
var cornerPlays = [0, 2, 6, 8];	

// For computer to declare when it has played for its turn
var compPlayedTurn;

// For computer player to identify correct letters
var p1Letter, p2Letter;

// Common Functions
function getRandom(min, max) {
	return (Math.floor(Math.random() * (max - min + 1)) + min);
}

function makeVisible() {
	for (var i = 0; i < arguments.length; i++) {		
		arguments[i].style.visibility = "visible";		
	}
}

function makeHidden() {
	for (var i = 0; i < arguments.length; i++) {
		arguments[i].style.visibility = "hidden";			
	}
}

function resetCommonElements() {
	for (var i = 0; i < 9; i++) {
		makeHidden(cellLetters[i]);		
		cellLetters[i].textContent = "V";
		if (cellLetters[i].classList.contains('winCellLetter')) {
			cellLetters[i].classList.remove('winCellLetter');
		}
		if (i < 2) {
			makeHidden(intimDivs[i], playingSides[i], winEmphasis[i], winner[i]);
		}
	}
}

// ===============
// ==== Hints ====
// ===============
hints.addEventListener("mouseover", function() {	
	hintText.style.display = "block";		
});

hints.addEventListener("mouseout", function() {	
	hintText.style.display = "none";			
});

// ================
// ==== Inputs ====
// ================
inputs.forEach(function(item) {
	item.addEventListener("focus", function() {

		// Hide input emphasis
		var inputIndex = Number(this === inputs[1]);
		inputEmphasis[inputIndex].style.visibility = "hidden";		

	});
});

// ============================
// ==== Human/Comp Setting ====
// ============================
settings.forEach(function(item) {
	item.addEventListener("click", function() {
		if (!gameStarted) {

			if (this.id === "compSetting") {
				if (p2Setting === "human") {
					p2Setting = "comp";
					toggleSetting();
				}
			} else {
				if (p2Setting === "comp") {
					p2Setting = "human";
					toggleSetting();
				}
			}			
		}
	});
});

function toggleSetting() {
	if (p2Setting === "human") {
		settings[1].textContent = selectedBox;
		settings[0].textContent = unselectedBox;
		playerImg[1].src = './assets/images/Brain2.png';				
	} else {
		settings[0].textContent = selectedBox;
		settings[1].textContent = unselectedBox;
		playerImg[1].src = './assets/images/Comp.png';		
	}	
}

// ======================
// ===== Start Game =====
// ======================
startBtn.addEventListener("click", function() {
	// All cells are playable
	playableCells = [0, 1, 2, 3, 4, 5, 6, 7, 8];

	if (!gameStarted) {		

		// If both players have been named
		if (inputs[0].value && inputs[1].value) {	

			// Hide the start game button, change its text				
			makeHidden(this);				
			this.textContent = "Play Again";						
			
			// update player names and disable inputs
			initializeNameDisplays(inputs[0].value, inputs[1].value);
			for (var i = 0; i < inputs.length; i++) {
				inputs[i].disabled = true;
			}

			choosePlayerSides();
			showSides();
			startRound();

		} else { // both players have not been named
			displayNameMessage();
		}		
	}

	if (gameStarted && roundOver) {
			makeHidden(this);
			initializeNewRound();
			showSides();
			startRound();			
		}	
});

function displayNameMessage() {
	makeHidden(startBtn);
	nameMessage.style.opacity = "1";
	
	setTimeout(function() {
		nameMessage.style.opacity = 0;
		makeVisible(startBtn);
	}, 3000);

	for (var i = 0; i < 2; i++) {
		if (!inputs[i].value) {
			inputEmphasis[i].style.visibility = "visible";
		}						
	}	
}	

function initializeNameDisplays(p1Name, p2Name) {
	tauntName[0].textContent = p2Name;
	tauntName[1].textContent = p1Name;
	displaySidesPart[0].textContent = p1Name + " is:";
	displaySidesPart[1].textContent = p2Name + " is:";
}

function choosePlayerSides() {	
	// Default sides assigned
	var a = "X",
			b = "O";
	
	// Implement random sides
	if (getRandom(1, 2) === 2) {
		a = "O";
		b = "X";
	}

	updateSideDisplays(a, b);	
}

function updateSideDisplays(a, b) {
	// Playing displays below player images
	playingSides[0].textContent = a;
	playingSides[1].textContent = b;
	// Side displays in display sides container
	displaySidesPart[2].textContent = a;
	displaySidesPart[3].textContent = b;
	// Store sides for computer to use in its play
	p1Letter = a;
	p2Letter = b; 
}

function showSides() {
	// Display the display sides container
	makeVisible(displaySidesContainer);

	// var sBegin = -2000;
	var sBegin = -1500;		

	if (!gameStarted) {
		// Display the dots
		sBegin = 0;
		for (var i = 0, s = sBegin; i < 3; i++, s+=500) {
			delayVisible(dots[i], s);		
		}
	}

	// Display first player label and side
	for (var i = 0, s = sBegin + 1500; i < 3; i+=2, s+=500) {
		delayVisible(displaySidesPart[i], s);		
	}

	// Display second player label and side
	for (var i = 1, s = sBegin + 2500; i < 4; i+=2, s+=500) {
		delayVisible(displaySidesPart[i], s);				
	}		
}	

function delayVisible(element, seconds) {
	setTimeout(function() {
		makeVisible(element);		
	}, seconds);
}

function initializeNewRound() {
	// Reset cellLetters, hide intimiDivs, player sides,
	// winEmphasis, and winner text
	resetCommonElements();
	// Change display side container heading
	displaySidesHead.textContent = "Round " + roundCount;
	// Reset the player pics so they are no longer red
	playerImg[0].src = "./assets/images/Brain1.png";
	if (p2Setting === "comp") { playerImg[1].src = "./assets/images/Comp.png" }
	else { playerImg[1].src = "./assets/images/Brain2.png" }

	if (endRoundStatus === "win") { // a player won
		updateWinnerDisplays();
	} else { // last round ended with draw
		makeHidden(drawEmphasis);
		choosePlayerSides();
	}
}

function updateWinnerDisplays() {
	// The player that won the last round goes first
	// in the next round
	if (playingSides[0].textContent === winningLetter) {
		updateSideDisplays("X","O");
		displaySidesPart[0].textContent = inputs[0].value + " (Winner!)";		
		displaySidesPart[1].textContent = inputs[1].value;		
	} else if (playingSides[1].textContent === winningLetter) {
		updateSideDisplays("O", "X");
		displaySidesPart[1].textContent = inputs[1].value + " (Winner!)";
		displaySidesPart[0].textContent = inputs[0].value;
	}	
}

function startRound() {
	// if game has started and a new round is starting 
	// there are shorter delays for the display sides container
	var s = 3500;
	if (!gameStarted) { s = 5000 }

	var labelToClick;

	// Delay a few seconds so the random choices
	// can be read before game officially starts
	setTimeout(function() {
		makeHidden(displaySidesContainer);		
		
		// Hide the display sides container and parts
		for (var i = 0; i < 4; i++) {			
			makeHidden(displaySidesPart[i]);			

			// Show the playing sides below player images
			if (i < 2) {
				makeVisible(playingSides[i]);				
				// If current player is X they go first
				if (playingSides[i].textContent === "X") {
					playingLabels[i].classList.add('playing');
					// If player 2 is X and set to computer
					// store its label to click after loop
					labelToClick = playingLabels[i];					
				}
			}

			// There are three dots, only displayed for first round
			if (!gameStarted) {
				if (i < 3) {
					makeHidden(dots[i]);				
				}		
			}				
		}

		// Update and show the round number display		
		roundDisplay.textContent = "Round " + roundCount;
		makeVisible(roundDisplay);
		gameStarted = true;
		roundOver = false;
		// activate computer play
		if (labelToClick) {
			labelToClick.click();
		}				
	}, s);
}

// ====================
// ===== Taunting =====
// ====================
taunt.forEach(function(item) {
	item.addEventListener("click", function() {
		if (gameStarted && !roundOver) {		

			var taunterIndex = Number(this === taunt[1]);

			// If it is the taunter's turn and they are not 
			// intimidated and haven't aleady taunted
			if (playingLabels[taunterIndex].classList.contains('playing') &&
				!(intimDivs[taunterIndex].style.visibility === "visible") &&
				tauntTurnCount === 0) {

				tauntPlayer(bubbles[taunterIndex]);
				intimidated(taunterIndex)
			}			
		}
	});
});

function tauntPlayer(bubble) {
	// get random taunt from array
	var randomTaunt = getRandom(0, taunts.length - 1);

	// apply a random taunt, reveal bubble, increment turn count
		bubble.textContent = taunts[randomTaunt];
		bubble.style.opacity = "1";
		tauntTurnCount++;		
		// hide the bubble after delay
		setTimeout(function() {
			bubble.style.opacity = "0";
		}, 1300);
}

function intimidated(taunterIndex) {
	// 50% chance opponent will be intimidated
	if (getRandom(1, 2) === 2) {		
		setTimeout(function() {
			// if player 1 was the taunter
			if (taunterIndex === 0) {				
				makeVisible(intimDivs[1]);
				// Change p2 red image depending on setting
				if (p2Setting === "comp") {
					playerImg[1].src = './assets/images/Compred.png';					
				} else {
					playerImg[1].src = './assets/images/Brain2red.png';					
				}				

			} else {	// player 2 was the taunter			
				makeVisible(intimDivs[0]);
				// Change p1 red image
				playerImg[0].src = './assets/images/Brain1red.png';				
			}
		}, 1000)
	}
}

// ================================
// ==== Cells and Turn Playing ====
// ================================

cells.forEach(function(item) {
	item.addEventListener('click', function(e) {				

		if (gameStarted && !roundOver) {

			// If it's player 2's turn and computer setting and screenXY are 0
			// or
			// If it's player 2's turn and human setting			
			// or
			// If it's player 1's turn

			if ((playingLabels[1].classList.contains('playing') &&
						 !(e.screenX && e.screenY)) ||						 
				  (playingLabels[1].classList.contains('playing') && 
				  	 p2Setting === "human") ||				  	 
				  (playingLabels[0].classList.contains('playing'))) {			

				// Check that cell has not already been chosen using
				// .children to identifiy specific span
				if (!(this.children[0].style.visibility === "visible")) {
					
					turnEngine(this);					
				}
			}
		}
	});
});


function turnEngine(currCell) {	
	var currentPlayer = utilizeLetter(currCell);				
				
	if (currentPlayer === 1) {

		endTurn(0, 1, "./assets/images/Brain1.png");			

	} else {

		if (p2Setting === 'comp') { endTurn(1, 0, "./assets/images/Comp.png") } 
		else { endTurn(1, 0, "./assets/images/Brain2.png") }		
	}	
	
	endRoundStatus = checkRoundStatus(currCell.children[0]);
	
	if (endRoundStatus === "win") {

		winningLetter = currCell.children[0].textContent;		

		// The player whose playerSide matches the winning
		// letter will get the winner emphasis and have 1
		// added to their winning counts.
		for (var i = 0; i < 2; i++) {
			if (playingSides[i].textContent === winningLetter) {
				makeVisible(winEmphasis[i], winner[i]);							
				playerWins[i]++;
				winNums[i].textContent = playerWins[i];							
			}
		}
		endRound();
		
	} else if (endRoundStatus === "draw") {		
		makeVisible(drawEmphasis, drawDisplay);
		drawCount++;					
		drawNum.textContent = drawCount;										
		endRound();

	} else {
		// Apply a click to the next player's turn display
		for (var i = 0; i < 2; i++) {
			if (playingLabels[i].classList.contains('playing')) {
				playingLabels[i].click();
			}
		}
	}	
}

function utilizeLetter(cell) {
	
	// Designate which letter to play and identify player
	if (playingLabels[0].classList.contains('playing')) {
		var letterToPlay = playingSides[0].textContent;
		var playerId = 1;
	} else {
		var letterToPlay = playingSides[1].textContent;
		var playerId = 2;
	}

	// Select the right span, update its text content with
	// appropriate letter and display it	
	cell.children[0].textContent = letterToPlay;
	makeVisible(cell.children[0]);

	// Remove played cell from playableCells
	// Get cell number	
	var cellNum = Number(cell.id.slice(4));	
	// Get it's index in playableCells array 
	var cellNumIndex = playableCells.indexOf(cellNum);
	// Remove it using that index
	playableCells.splice(cellNumIndex, 1);

	return playerId;
}

function endTurn(a, b, pic) {

	// Remove intimidation
	if (intimDivs[a].style.visibility === "visible") {
		makeHidden(intimDivs[a]);
		playerImg[a].src = pic;
	}	

	// Switch yellow background for current player's turn
	playingLabels[a].classList.remove('playing');
	playingLabels[b].classList.add('playing');

	// Set tauntCount back to 0 so next player can taunt once
	tauntTurnCount = 0;	
}

function checkRoundStatus(currCellLetter) {
	// If the current cell is in a row, col, or diag that can win
	// count occurrence of same letter, if there are 3 it is a win
	if (playableCells.length < 5) {
		for (var i = 0; i < 3; i++) {				

			if (winRows[i].indexOf(currCellLetter) > -1) {			
				if (countOccurrences(winRows[i], currCellLetter) === 3) {
					emphasizeWinningCells(winRows[i]);
					return "win";
				}					
			}

			if (winCols[i].indexOf(currCellLetter) > -1) {
				if (countOccurrences(winCols[i], currCellLetter) === 3) {
					emphasizeWinningCells(winCols[i]);
					return "win";
				}			
			}

			if (i === 0 && (winDiags[i].indexOf(currCellLetter) > -1)) {
				if (countOccurrences(winDiags[i], currCellLetter) === 3) {
					emphasizeWinningCells(winDiags[i]);
					return "win";
				}			
			}

			if (i === 1 && (winDiags[i].indexOf(currCellLetter) > -1)) {
				if (countOccurrences(winDiags[i], currCellLetter) === 3) {
					emphasizeWinningCells(winDiags[i]);
					return "win";
				}
			}
		}		

		// If all cells have been played and there is no win, it's a draw
		if (playableCells.length === 0) {
			return "draw";
		}		
	}
	// If no draw and no win continue the round 
	return "continue";
}

function countOccurrences(cellsContainer, cellLetter) {
	var winCount = 0;
	for (var i = 0; i < 3; i++) {
		if (cellsContainer[i].textContent === cellLetter.textContent) {
			winCount++;			
		}
	}
	return winCount;
}

function emphasizeWinningCells(cellsContainer) {
	for (var i = 0; i < 3; i++) {
		cellsContainer[i].classList.add('winCellLetter');
	}	
}

function endRound() {
	roundOver = true;
	roundCount++;
	makeVisible(startBtn);
	makeHidden(roundDisplay);

	for (var i = 0; i < 2; i++) {
		playingLabels[i].classList.remove('playing');
	}
}

// =======================
// ==== Computer Play ====
// =======================
playingLabels[1].addEventListener('click', function(e) {
	
	// If the setting is set to computer and a round is in progress		
	if (p2Setting === "comp" && !roundOver &&		 
		 !e.screenX && !e.screenY) { // must be script triggered click		 
		 
		compPlayedTurn = false;

		// If computer is intimidated, play a random cell,
		// else play strategically after possible taunt
		if (intimDivs[1].style.visibility === "visible") {			
			compPlayRandomCell();
		} else {
			compTaunt();
			prelimStrategicPlay();		
		}									
	}
});

function compPlayRandomCell() {	
	compPlayedTurn = true;
	setTimeout(function() {		
		var randomIndex = getRandom(0, playableCells.length - 1);						
		cells[playableCells[randomIndex]].click();					
	}, 1100);
}

function compTaunt() {
	// 50% chance computer will taunt
	if (getRandom(1, 2) === 2) {		
		taunt[1].click();
	}
}

function prelimStrategicPlay() {
	// Any less than 5 played cells will not allow a player
	// to win because there needs to be enough letters
	// played for there to be two in a row

 	// If no cells have been played the computer is playing
 	// first and should choose the center	 	
	if (playableCells.length === 9) {			
		compPlayCell(4);
	}

	// If one cell has been played the computer is playing
	// second. If the center cell is available play it, 
	// otherwise choose a corner.
	else if (playableCells.length === 8) {			
		if (playableCells.indexOf(4) > -1) {				
			compPlayCell(4);
		} 
		else {								
			var randomCornerPlay = getRandom(0, 3);								
			compPlayCell(cornerPlays[randomCornerPlay]);
		}
	} 

	// If length is 7 and if opponent has a corner, play 
	// opposite corner to try for a fork
	else if (playableCells.length === 7) {			

		var opponentCorner;

		// Determine if opponent has played a corner
		for (var i = 0; i < 4; i++) {				
			// if so, store it in opponentCorner
			if (cellLetters[cornerPlays[i]].textContent === p1Letter) {
				opponentCorner = cornerPlays[i];					

				// play the opposite corner
				for (var k = 0, j = 3; k < 4; k++, j--) {						
					if (opponentCorner === cornerPlays[k]) {							
						compPlayCell(cornerPlays[j]);
					}
				}
				break;
			}				
		}			
	}		

	// Else at least three cells have been played, check for
	// play to win or block opponent, special action at end
	// of iterations if exactly three cells have been played		
	else {			
		iteratePlayableCells();
	}	

	// For now, if there is not a winning option or blocking 
	// cell, play random
	if (!(compPlayedTurn)) {
		compPlayRandomCell();
	}
}

function compPlayCell(index) {
	compPlayedTurn = true;
	setTimeout(function() {		
		cells[index].click();		
	}, 1100);
}

function iteratePlayableCells() {
	var blockOppCell;	

	// Outer loop iterates the playableCells array, the length of 
	// which is reduced with each turn as cells are played
	for (var i = 0; i < playableCells.length && !compPlayedTurn; i++) {		
		
		// Inner loop iterates over nums 0-8 to inspect the cell if it
		// is a playble cell. If opponent needs to be blocked, the cell
		// to play to block is stored in blockOppCell and used after
		// the for loops end if no winning play could be identified
		for (var c = 0; c < 9 && !compPlayedTurn; c++) {
			if (playableCells[i] === c) {				
				if (inspectPlayableCell(cellInspectCodes[c])) {
					blockOppCell = c;
				}
			}			
		}		
	}

	// For loops have run through all playable cells and there was 
	// not a winning option. Check if there is a cell to play 
	// that will block the opponent from winning.			
	if (blockOppCell > -1 && !compPlayedTurn) {			
		compPlayCell(blockOppCell);			
	}

	// If playable cells length is 6 play a corner to prevent a fork
	if (playableCells.length === 6 && !compPlayedTurn) {
		// Iterate through corners to check if opponent has played one
		for (var i = 0; i < 4; i++) {				
			
			// if so, store it in opponentCorner
			if (cellLetters[cornerPlays[i]].textContent === p1Letter) {
				opponentCorner = cornerPlays[i];					

				// If opponent is at 0 or 8
				if (opponentCorner === 0 || opponentCorner === 8) {
					// The corners to play are 2 or 6
					chooseRandomCorner(2, 6);					
				}

				// Opponent must be at 2 or 6
				else {
					// The corners to play are 0 or 8
					chooseRandomCorner(0, 8);					
				}
				break;					
			}				
		}			
	}
}

function inspectPlayableCell(arr) {
	var action;

	action = checkTwoMatches(arr[1], arr[2], arr[3], arr[4], 
													 arr[5], arr[6], arr[7], arr[8]);
	if (action === "play for win") {		
		compPlayCell(arr[0]);		
	} else if (action === "block") {		
		return true;								
	}
}

function checkTwoMatches(i1, i2, i3, i4, i5=i1, i6=i2, i7=i3, i8=i4) {
	// The minimum amount of arguments will be 4, so the last 4
	// will be duplicates by default and the same cellLetters will 
	// just be checked again if arguments are not provided for those.
	
	// Check two matches for computer win
	if ((cellLetters[i1].textContent === p2Letter &&
		   cellLetters[i2].textContent === p2Letter) ||
		  (cellLetters[i3].textContent === p2Letter && 
		   cellLetters[i4].textContent === p2Letter) ||
		  (cellLetters[i5].textContent === p2Letter &&
		   cellLetters[i6].textContent === p2Letter) ||
		  (cellLetters[i7].textContent === p2Letter &&
		   cellLetters[i8].textContent === p2Letter)) {
			
		return "play for win";
	}

	// Check two matches for opposition
	if ((cellLetters[i1].textContent === p1Letter &&
		   cellLetters[i2].textContent === p1Letter) ||
		  (cellLetters[i3].textContent === p1Letter && 
		   cellLetters[i4].textContent === p1Letter) ||
		  (cellLetters[i5].textContent === p1Letter &&
		   cellLetters[i6].textContent === p1Letter) ||
		  (cellLetters[i7].textContent === p1Letter &&
		   cellLetters[i8].textContent === p1Letter)) {
				
		return "block";
	}
}

function chooseRandomCorner(corner1, corner2) {
	// For use when 6 cells are playable
	var cornersToChooseFrom = [corner1, corner2];
	// Randomly choose one of the corners to play
	var randCornerChoice = cornersToChooseFrom.splice(getRandom(0, 1), 1)[0];
	// Check if it is playable, if so, play it, else play the other
	if (playableCells.indexOf(randCornerChoice) > -1) {
		compPlayCell(randCornerChoice);
	} else if (playableCells.indexOf(cornersToChooseFrom[0] > -1)) {
		compPlayCell(cornersToChooseFrom[0]);
	}
}

// ===============
// ==== Reset ====
// ===============
resetBtn.addEventListener("click", function() {
	settings[0].textContent = selectedBox;
	settings[1].textContent = unselectedBox;
	tauntName[0].textContent = "Player 1";
	tauntName[1].textContent = "Player 2";
	playerImg[0].src = './assets/images/Brain1.png';
	playerImg[1].src = './assets/images/Comp.png';
	p2Setting = "comp";
	displaySidesHead.textContent = "Randomly Choosing Sides";
	startBtn.textContent = "Start Game";	
	makeVisible(startBtn);
	makeHidden(roundDisplay, drawEmphasis, drawDisplay);
	tauntTurnCount = 0;
	gameStarted = false;
	roundOver = false;
	roundCount = 1;	
	drawCount = 0;
	
	resetCommonElements();

	// Reset additional items
	for (var i = 0; i < 2; i++) {
		inputs[i].value = "";
		inputs[i].disabled = false;
		playerWins[i] = 0;
		winNums[i].textContent = 0;
		playingLabels[i].classList.remove('playing');		
	}
});