document.addEventListener('DOMContentLoaded', () => {

	const grid = document.querySelector('.grid')
	let squares = Array.from(document.querySelectorAll('.grid div'))
	let tetriminoActual = []
	let ghostActual = []

	// DEBUG LABEL ALL SQUARES WITH INDEX NUMBERS
	// squares.forEach((square, index) => {
	// 	square.textContent = index.toString();
	// });


	const scoreDisplay = document.querySelector('#score')
	const startBtn = document.querySelector('#StartButton')
	const countdownText = document.querySelector('#countdown')
	const c1 = document.querySelector('#c1') 				// DEBUG BUTTON
	const c2 = document.querySelector('#c2') 				// DEBUG BUTTON
	const c3 = document.querySelector('#c3') 				// DEBUG BUTTON
	const c4 = document.querySelector('#c4') 				// DEBUG BUTTON
	const stressbtn = document.querySelector('#stressBTN') 	// DEBUG BUTTON
	const wipeBTN = document.querySelector('#wipeBTN') 		// DEBUG BUTTON
	const shuffleBtn = document.querySelector('#shuffleBtn') // DEBUG BUTTON
	const holdBtn = document.querySelector('#holdBtn') 		// DEBUG BUTTON

	const musicPlayer = document.getElementById("musicPlayer");
	const canvas = document.getElementById("frequencyVisualizer");
	const canvasContext = canvas.getContext("2d");
	const audioSource = 'korobeiniki_remix.mp3';

	musicPlayer.src = audioSource;
	musicPlayer.volume = .3;

	function visualize() {
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();
		const analyser = audioContext.createAnalyser();
		const source = audioContext.createMediaElementSource(musicPlayer);
		source.connect(analyser);
		analyser.connect(audioContext.destination);
		analyser.fftSize = 256;
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);

		function drawVisualizer() {
			analyser.getByteFrequencyData(dataArray);
			canvasContext.clearRect(0, 0, canvas.width, canvas.height);

			const barWidth = (canvas.width / bufferLength) * 2;
			let x = 0;

			for (let i = 0; i < bufferLength; i++) {
				// Map frequency value to a hue in the HSL color space
				const hue = (i / bufferLength) * 360;

				// Map the amplitude to the lightness in HSL color space
				const lightness = (dataArray[i] / 255) * 50 + 50;

				// Set the fill style using HSL color representation
				canvasContext.fillStyle = `hsl(${hue}, 100%, ${lightness}%)`;

				// Draw the bar
				const barHeight = (dataArray[i] / 255) * canvas.height;
				canvasContext.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
				x += barWidth + 1;
			}

			requestAnimationFrame(drawVisualizer);
		}


		source.connect(analyser);
		analyser.connect(audioContext.destination);
		drawVisualizer();

	}

	// Load audio files for sound effects + set volumes
	// TODO: NEED backups for Safari browser (not compatible with OGG format)
	const moveSFX = new Audio('audio/click_003.ogg')
	moveSFX.volume = 0.9
	const collideSFX = new Audio('audio/click_005.ogg')
	collideSFX.volume = 0.6
	const freezeSFX = new Audio('audio/click_001.ogg')
	freezeSFX.volume = 0.8
	const rotateSFX = new Audio('audio/switch_002.ogg')
	rotateSFX.volume = 0.3
	const clear1SFX = new Audio('audio/confirmation_001.ogg')
	clear1SFX.volume = 0.3
	const clear2SFX = new Audio('audio/confirmation_002.ogg')
	clear2SFX.volume = 0.3
	const clear3SFX = new Audio('audio/confirmation_003.ogg')
	clear3SFX.volume = 0.3
	const laserSFX = new Audio('audio/laser1.ogg')
	laserSFX.volume = 0.4
	const stressSFX = new Audio('audio/error_008.ogg')
	stressSFX.volume = .5
	const beep = new Audio("audio/")

	const width = 10

	let timerID
	let score = 0
	let stopMove = false
	let allowHold = true
	let frozen = false
	let soundsOff = false
	let ghostOn = true
	var dead = false
	console.log("Show Ghost= " + ghostOn) // DEBUG LOGGING

	let lineCount = 0
	const lineDisplay = document.querySelector("#lines")
	let level = 1
	const levelDisplay = document.querySelector("#level")

	let scaleTime = ((0.8 - ((level - 1) * 0.007)) ** (level - 1)) * 1000

	const colors = [
		'cyan',
		'yellow',
		'magenta',
		'lime',
		'red',
		'blue',
		'orange'
	]

	// Allows Statistics Window to update Tetromino counts (Verifies that 7bag is working correctly)
	var tetCounts = [0, 0, 0, 0, 0, 0, 0]
	const icount = document.querySelector('#icount')
	const ocount = document.querySelector('#ocount')
	const tcount = document.querySelector('#tcount')
	const scount = document.querySelector('#scount')
	const zcount = document.querySelector('#zcount')
	const jcount = document.querySelector('#jcount')
	const lcount = document.querySelector('#lcount')
	function countUpdate() {
		icount.innerHTML = tetCounts[0]
		ocount.innerHTML = tetCounts[1]
		tcount.innerHTML = tetCounts[2]
		scount.innerHTML = tetCounts[3]
		zcount.innerHTML = tetCounts[4]
		jcount.innerHTML = tetCounts[5]
		lcount.innerHTML = tetCounts[6]
	}


	// Defines Tetromino configurations and rotations, collects all into tetArray for referece
	const iTet = [
		[width, width + 1, width + 2, width + 3],
		[1, width + 1, width * 2 + 1, width * 3 + 1],
		[width, width + 1, width + 2, width + 3],
		[1, width + 1, width * 2 + 1, width * 3 + 1]
	]
	const oTet = [
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
		[0, 1, width, width + 1]
	]
	const tTet = [
		[1, width, width + 1, width + 2],
		[1, width + 1, width + 2, width * 2 + 1],
		[width, width + 1, width + 2, width * 2 + 1],
		[1, width, width + 1, width * 2 + 1]
	]
	const sTet = [
		[1, 2, width, width + 1],
		[0, width, width + 1, width * 2 + 1],
		[1, 2, width, width + 1],
		[0, width, width + 1, width * 2 + 1]
	]
	const zTet = [
		[0, 1, width + 1, width + 2],
		[1, width, width + 1, width * 2],
		[0, 1, width + 1, width + 2],
		[1, width, width + 1, width * 2]
	]
	const jTet = [
		[0, width, width + 1, width + 2],
		[1, 2, width + 1, width * 2 + 1],
		[width, width + 1, width + 2, width * 2 + 2],
		[1, width + 1, width * 2, width * 2 + 1],
	]
	const lTet = [
		[width, width + 1, width + 2, 2],
		[1, width + 1, width * 2 + 1, width * 2 + 2],
		[width, width + 1, width + 2, width * 2],
		[0, 1, width + 1, width * 2 + 1]
	]
	const tetArray = [iTet, oTet, tTet, sTet, zTet, jTet, lTet]

	/* Guideline-compliant Tetromino randomizer (BPS 7Bag ssytem)
		Uses Knuth algo to give unbaised shuffle of all 7 pieces, then fills queue
		Queue is refilled when empty, ensuring never more than 12 Tetrominos occur inbetween any specific Tetromino
	*/
	let queue = []
	function sevenBag() {

		let currentGrab = null
		let array = [0, 1, 2, 3, 4, 5, 6]

		if (queue.length === 0) {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				let temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
			queue = Array.from(array);
			console.log("Queue: " + queue)
		}

		currentGrab = queue.shift()
		return currentGrab
	}
	let randTet = sevenBag()
	let nextRandom = sevenBag()


	// Sets initial spawn location and orientation for Tetrominos and ghostTet display
	let currentPosition = 4
	let currentRotation = 0
	let currentTet = tetArray[randTet][currentRotation]
	let ghostTet = currentTet
	let ghostPosition = 200 + (currentPosition % 10) // Places ghost at bottom of field, below current Tetromino

	// Dropdown menu item for toggling Ghost Display on and off
	const toggleGhostButton = document.querySelector("#toggleGhostButton");
	const ghostDisplay = document.querySelector("#ghost-display");
	toggleGhostButton.addEventListener("click", () => {
		ghostOn = !ghostOn
		if (!ghostOn) {
			ghostUnDraw()
			toggleGhostButton.innerHTML = "Enable Ghost"
			ghostDisplay.style.color = "red"
			ghostDisplay.innerHTML = "Ghost: OFF"
		} else {
			ghostDraw()
			toggleGhostButton.innerHTML = "Disable Ghost"
			ghostDisplay.style.color = "lime"
			ghostDisplay.innerHTML = "Ghost: ON"
		}
		console.log("Show Ghost= " + ghostOn) // DEBUG LOGGING
	});


	// Dropdown menu item for muting all sounds - toggles playSound() behavior using soundOff boolean
	const toggleSoundButton = document.querySelector("#toggleSoundButton");
	const audioDisplay = document.querySelector("#audio-display");
	toggleSoundButton.addEventListener("click", () => {
		soundsOff = !soundsOff
		if (soundsOff) {
			toggleSoundButton.innerHTML = "Turn On Sounds"
			audioDisplay.style.color = "red"
			audioDisplay.innerHTML = "Audio: OFF"
			musicPlayer.volume = 0
		} else {
			toggleSoundButton.innerHTML = "Mute All Sounds"
			audioDisplay.style.color = "lime"
			audioDisplay.innerHTML = "Audio: ON"
			musicPlayer.volume = .3
		}
		console.log("Audio Muted = " + soundsOff) // DEBUG LOGGING
	});

	// Ensures sound is played from the beginning, allows muting + calling audio by name
	function playSound(sound) {
		if (soundsOff) {
			sound.volume = 0
		}
		sound.currentTime = 0
		sound.play()
	}

	let dangerInterval; // Declare a variable to store the interval ID

	/* Renders current tetromino using CSS styling of grid squares
		If ghost is enabled, calls for ghost rendering as well
	*/
	function draw() {
		gameOver()
		if (ghostOn) {
			ghostDraw()
		}
		currentTet.forEach(index => {
			squares[currentPosition + index].classList.remove('ghost')
			squares[currentPosition + index].classList.add('tetromino')
			squares[currentPosition + index].style.background = colors[randTet]
			tetriminoActual.push(index + currentPosition) // Builds array of actual tetrimino location
		})
		// console.log("Tetrimino is actually here: " + tetriminoActual) // DEBUG: Actual tetrimino location loggin


	}
	function unDraw() {
		if (ghostOn) {
			ghostUnDraw()
		}
		currentTet.forEach(index => {
			squares[currentPosition + index].style = ''
			squares[currentPosition + index].classList.remove('tetromino')

		})
		tetriminoActual = [] // Clears Actual position array between moves
	}

	// Renders ghost tetromino using CSS styling of grid squares only called by draw()/unDraw if enabled
	function ghostDraw() {
		ghostTet = currentTet
		ghostPosition = 200 + (currentPosition % 10)

		let takenIndexes = squares
			.map((div, index) => div.classList.contains('taken') ? index : null)
			.filter(index => index !== null);

		takenIndexes.sort((a, b) => a - b);
		takenIndexes = takenIndexes.filter((element) => element >= currentPosition);

		for (let i = 0; i < takenIndexes.length; i++) {
			for (let j = takenIndexes[i]; j < 210; j += 10) {
				if (!takenIndexes.includes(j + 10)) {
					takenIndexes.push(j + 10);
				}
			}
		}

		takenIndexes.sort((a, b) => a - b);
		takenIndexes = takenIndexes.filter((element) => element >= currentPosition);

		// console.log("Taken Indexes = " + takenIndexes)
		function hasCollision(ghostTet, ghostPosition, takenIndexes) { // MAYBE USE THIS FOR ROTO COLLIDE CHECK

			for (let i = 0; i < ghostTet.length; i++) {
				const ghostElement = ghostTet[i];

				for (let j = 0; j < takenIndexes.length; j++) {
					const takenIndex = takenIndexes[j];
					// Check if the sum of ghostElement and ghostPosition is equal to takenIndex
					if (ghostElement + ghostPosition === takenIndex) {
						console.log("COLLISION = TRUE")
						return true; // Collision detected
					}
				}
			}
			return false; // No collision found
		}

		while (hasCollision(ghostTet, ghostPosition, takenIndexes)) {
			ghostPosition -= width
		}
		if (ghostPosition < currentPosition) {
			return;
		}
		ghostTet.forEach(index => {
			squares[ghostPosition + index].style.color = colors[randTet]
			squares[ghostPosition + index].classList.add('ghost')
			ghostActual.push(index + ghostPosition)
		})
	}


	function ghostUnDraw() {
		ghostTet.forEach(index => {
			squares[ghostPosition + index].classList.remove('ghost')
		})

		ghostActual = [] // Clears Ghost position log
	}

	// Keyboard mapping of input controls for gameplay
	document.addEventListener('keydown', control)
	function control(e) {
		if (!timerID) {
			return
		}
		if (e.keyCode === 37) {
			moveLeft()
			// console.log("Current Position = " + currentPosition)
			animationSwitch("pushL")
		} else if (e.keyCode === 38) {
			rotate()
			// console.log("Current Position = " + currentPosition)
			animationSwitch("throw")
		} else if (e.keyCode === 39) {
			moveRight()
			// console.log("Current Position = " + currentPosition)
			animationSwitch("push")
		} else if (e.keyCode === 40 && !stopMove) {
			moveDown()
			animationSwitch("run")
			// stress()
		} else if (e.keyCode === 32) {
			frozen = false
			animationSwitch("jump")
			hardDrop()
		} else if (e.keyCode === 16) {
			holdDisplay()
		}
	}

	function hardDrop() {
		while (frozen === false) {
			moveDown()
		}
		frozen = true
	}

	const characterList = ["Dude", "Owlet", "Pink"]
	let charID = 0
	const characterPane = document.querySelector(".character-pane");


	/* Alters character animations - args selected by inputs from control function
		Runs stress check function to default to "in danger" status when lines on field
		are above a pre-defined level.
	*/
	function animationSwitch(animate) {
		let characterSelect = characterList[charID]



		switch (animate) {
			case "run":
				characterPane.style.animation = "newAnimation 300ms steps(6) 1";
				characterPane.style.animationFillMode = "forwards";
				characterPane.style.backgroundImage = `url("images/sprites/${characterSelect}/${characterSelect}_Monster_Run_6.png")`;

				// Define a new keyframe animation named "newAnimation"
				var newAnimationKeyframes = `
				@keyframes newAnimation {
					0% {
						background-position: 0 0;
					}
					100% {
						background-position: -192px 0;
					}
				}`;
				break;
			case "jump":
				characterPane.style.animation = "newAnimation 400ms steps(8) 1";
				characterPane.style.animationFillMode = "forwards";
				characterPane.style.backgroundImage = `url("images/sprites/${characterSelect}/${characterSelect}_Monster_Jump_8.png")`;

				// Define a new keyframe animation named "newAnimation"
				var newAnimationKeyframes = `
				@keyframes newAnimation {
					0% {
						background-position: 0 0;
					}
					100% {
						background-position: -256px 0;
					}
				}`;
				break;
			case "climb":
				characterPane.style.animation = "newAnimation 300ms steps(4) 2";
				characterPane.style.animationFillMode = "forwards";
				characterPane.style.backgroundImage = `url("images/sprites/${characterSelect}/${characterSelect}_Monster_Climb_4.png")`;

				// Define a new keyframe animation named "newAnimation"
				var newAnimationKeyframes = `
					@keyframes newAnimation {
						0% {
							background-position: 0 0;
						}
						100% {
							background-position: -128px 0;
						}
				}`;
				break;
			case "push":
				characterPane.style.animation = "newAnimation 200ms steps(6) 1";
				characterPane.style.animationFillMode = "backwards";
				characterPane.style.backgroundImage = `url("images/sprites/${characterSelect}/${characterSelect}_Monster_Push_6.png")`;
				characterPane.style.transform = "scaleX(1)"

				// Define a new keyframe animation named "newAnimation"
				var newAnimationKeyframes = `
					@keyframes newAnimation {
						0% {
							background-position: 0 0;
						}
						100% {
							background-position: -192px 0;
						}
				}`;
				break;
			case "pushL":
				characterPane.style.animation = "newAnimation 200ms steps(6) 1";
				characterPane.style.animationFillMode = "backwards";
				characterPane.style.backgroundImage = `url("images/sprites/${characterSelect}/${characterSelect}_Monster_Push_6.png")`;
				characterPane.style.transform = "scaleX(-1)"
				// Define a new keyframe animation named "newAnimation"
				var newAnimationKeyframes = `
						@keyframes newAnimation {
							0% {
								background-position: 0 0;
							}
							100% {
								background-position: -192px 0;
							}
					}`;
				break;
			case "throw":
				characterPane.style.animation = "newAnimation 200ms steps(4) 1";
				characterPane.style.animationFillMode = "backwards";
				characterPane.style.backgroundImage = `url("images/sprites/${characterSelect}/${characterSelect}_Monster_Throw_4.png")`;

				// Define a new keyframe animation named "newAnimation"
				var newAnimationKeyframes = `
						@keyframes newAnimation {
							0% {
								background-position: 0 0;
							}
							100% {
								background-position: -128px 0;
							}
					}`;
				break;
			case "dead":
				characterPane.style.animation = "newAnimation 800ms steps(8) 1";
				characterPane.style.animationFillMode = "backwards";
				characterPane.style.backgroundImage = `url("images/sprites/${characterSelect}/${characterSelect}_Monster_Death_8.png")`;

				// Define a new keyframe animation named "newAnimation"
				var newAnimationKeyframes = `
						@keyframes newAnimation {
							0% {
								background-position: 0 0;
							}
							100% {
								background-position: -256px 0;
							}
					}`;
				console.log("dead = " + dead)

				break;
			default:
				console.log("Bad Input")

		}

		if (stress() && !dead) {

			// Create a style element to insert the new keyframes
			var styleSheet = document.styleSheets[0]; // Use the appropriate style sheet index
			styleSheet.insertRule(newAnimationKeyframes, styleSheet.cssRules.length);

			// Add an event listener to reset the animation to the original after it completes
			characterPane.addEventListener("animationend", function () {
				characterPane.style.animation = "idle 300ms steps(4) infinite";
				characterPane.style.backgroundImage = `url("images/sprites/${characterSelect}/${characterSelect}_Monster_Hurt_4.png")`;
				characterPane.style.animationFillMode = "none";

			});

		} else {
			// Create a style element to insert the new keyframes
			var styleSheet = document.styleSheets[0]; // Use the appropriate style sheet index
			styleSheet.insertRule(newAnimationKeyframes, styleSheet.cssRules.length);

			// Add an event listener to reset the animation to the original after it completes
			characterPane.addEventListener("animationend", function () {
				characterPane.style.animation = "idle 500ms steps(4) infinite";
				characterPane.style.backgroundImage = `url("images/sprites/${characterSelect}/${characterSelect}_Monster_Idle_4.png")`;
				characterPane.style.animationFillMode = "none";

			});
		}
	}
	// "Stress check" selects alternate "in trouble" animation for character idle when tets above specific line number
	function stress() {
		console.log("running stress check...")
		const startIndex = 90
		const endIndex = 101
		let stressed = squares.slice(startIndex, endIndex).some(element => element.classList.contains('taken'));
		if (stressed) {
			console.log("FEELING STRESSED")
			console.log('Danger mode activated!');
			const styleSheet = document.styleSheets[0]; // Assuming it's the first style sheet

			// Find the keyframes rule with name "scrollBackground"
			const keyframesRule = [...styleSheet.cssRules].find(rule => rule.name === "scrollBackground");

			// Modify the 100% keyframe
			keyframesRule.appendRule('100% { background-position: -1400px -1400px; }');
			musicPlayer.playbackRate = 1.5;


		} else {
			console.log("feeling chill")
			console.log('Danger mode deactivated.');
			const styleSheet = document.styleSheets[0]; // Assuming it's the first style sheet

			// Find the keyframes rule with name "scrollBackground"
			const keyframesRule = [...styleSheet.cssRules].find(rule => rule.name === "scrollBackground");

			// Modify the 100% keyframe
			keyframesRule.appendRule('100% { background-position: 400px 400px; }');
			musicPlayer.playbackRate = 1;
		}
		return stressed
	}



	// Movement functions to control current Tetromino
	function moveDown() {
		moveSFX.volume = 0.8;
		setTimeout(() => playSound(moveSFX), 100)
		score += 1;
		scoreDisplay.innerHTML = score;
		freeze();
		unDraw();
		currentPosition += width;
		draw();
		// console.log("Current Position = " + currentPosition)
		stress()

	}
	function freeze() {
		if (currentTet.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
			console.log("Tets Frozen ...")

			tetCounts[randTet] += 1
			countUpdate()
			currentTet.forEach(index => squares[currentPosition + index].classList.add('taken'))
			playSound(freezeSFX)

			randTet = nextRandom
			nextRandom = sevenBag()
			addScore()
			currentRotation = 0
			currentTet = tetArray[randTet][currentRotation]
			currentPosition = 4
			draw()
			nextDisplay()
			gameOver()
			allowHold = true
			frozen = true
		}
	}
	function moveLeft() {
		unDraw()
		const isAtLeftEdge = currentTet.some(index => (currentPosition + index) % width === 0)
		if (!isAtLeftEdge) {
			currentPosition -= 1
			playSound(moveSFX)
		}
		if (isAtLeftEdge) {
			playSound(collideSFX)
		}
		if (currentTet.some(index => squares[currentPosition + index].classList.contains('taken'))) {
			playSound(collideSFX)
			currentPosition += 1


		}
		draw()

	}
	function moveRight() {
		unDraw()
		const isAtRightEdge = currentTet.some(index => (currentPosition + index) % width === width - 1)
		if (!isAtRightEdge) {
			currentPosition += 1
			playSound(moveSFX)

		}
		if (isAtRightEdge) {
			playSound(collideSFX)
		}
		if (currentTet.some(index => squares[currentPosition + index].classList.contains('taken'))) {
			playSound(collideSFX)
			currentPosition -= 1

		}
		draw()

	}

	// FIX ROTATION AT THE EDGE
	//
	function isAtRight() {
		currentTet.forEach(index => console.log("is right index: " + index))
		return currentTet.some(index => (currentPosition + index + 1) % width === 0)

	}
	function isAtLeft() {
		return currentTet.some(index => (currentPosition + index) % width === 0)
	}
	function checkRotatedPosition(P) {
		P = P || currentPosition       		//get current position.  Then, check if the piece is near the left side.
		if ((P + 1) % width < 4) {         	//add 1 because the position index can be 1 less than where the piece is (with how they are indexed).
			if (isAtRight()) {            	//use actual position to check if it's flipped over to right side
				currentPosition += 1    	//if so, add one to wrap it back around
				checkRotatedPosition(P)		//check again.  Pass position from start, since long block might need to move more.
			}
		}
		else if (P % width > 5) {
			if (isAtLeft()) {
				currentPosition -= 1
				checkRotatedPosition(P)
			}
		}
	}
	function rotate() {
		rotateSFX.volume = 0.2
		playSound(rotateSFX)
		unDraw()
		currentRotation++
		if (currentRotation === currentTet.length) {
			currentRotation = 0
		}
		currentTet = tetArray[randTet][currentRotation]
		ghostTet = currentTet
		checkRotatedPosition()
		proxRotate()
		draw()

	}
	function proxRotate() {
		var counter = 0
		while (currentTet.some(index => squares[currentPosition + index].classList.contains('taken'))) {
			currentPosition -= 1
		}
		while (currentTet.some(index => squares[currentPosition + index].classList.contains('taken'))) {
			currentPosition += 1
		}
	}

	/* 4x4 mini-grid displays next-up Tetromino (drawn from 7Bag)
		defines Tetromino configurations based on smaller window/grid size
		nextDisplay uses upNext (of initial rotations) to render Tetrominos in CSS
	*/
	const nextWindow = document.querySelectorAll('.mini-grid div')
	const nextWidth = 4
	let nextIndex = 0
	const upNext = [
		[nextWidth, nextWidth + 1, nextWidth + 2, nextWidth + 3],
		[1, 2, nextWidth + 1, nextWidth + 2],
		[1, nextWidth, nextWidth + 1, nextWidth + 2],
		[1, 2, nextWidth, nextWidth + 1],
		[0, 1, nextWidth + 1, nextWidth + 2],
		[0, nextWidth, nextWidth + 1, nextWidth + 2],
		[nextWidth, nextWidth + 1, nextWidth + 2, 2]
	]
	function nextDisplay() {
		console.log("NextDisplay Refreshed")		// DEBUG LOGGING
		nextWindow.forEach(square => {
			square.classList.remove('tetromino')
			square.style.background = ''
		})
		upNext[nextRandom].forEach(index => {
			nextWindow[nextIndex + index + 4].classList.add('tetromino')
			nextWindow[nextIndex + index + 4].style.background = colors[nextRandom]
		})
	}

	/* 4x4 hold-grid (similar to mini-grid) displays held Tetromino taken from current tetromino
		HoldDisplay triggered by input
			If hold window is empty displays current tetromino and fields next up from queue
			If hold window has been triggered, hold input is disabled until a Tetromino has been frozen
	*/
	let holding = false
	const holdWindow = document.querySelectorAll('.hold-grid div')
	let holdIndex = 0
	var heldTet
	function holdDisplay() {
		if (allowHold === true) {

			// Clears Hold Window
			holdWindow.forEach(square => {
				square.classList.remove('tetromino')
				square.style.background = ''
			})

			// Clones currentTet into hold window
			upNext[randTet].forEach(index => {
				holdWindow[holdIndex + index + 4].classList.add('tetromino')
				holdWindow[holdIndex + index + 4].style.background = colors[randTet]
			})


			if (holding) {
				unDraw()
				let replaceTet = heldTet
				heldTet = randTet
				randTet = replaceTet
				currentRotation = 0
				currentTet = tetArray[randTet][currentRotation]
				currentPosition = 4
				draw()
			} else {
				holding = true
				heldTet = randTet
				unDraw()
				randTet = nextRandom
				nextRandom = sevenBag()
				currentRotation = 0
				currentTet = tetArray[randTet][currentRotation]
				currentPosition = 4
				draw()
				nextDisplay()
			}
			allowHold = false
		}
	}

	const pauseLayer = document.getElementById("pauseLayer")
	pauseLayer.style.display = "none"
	let countdownInProgress = false;

	startBtn.addEventListener('click', () => {
		if (countdownInProgress) {
			return;
		}

		countdownInProgress = true;

		if (timerID) {
			clearInterval(timerID);
			timerID = null;
			startBtn.innerHTML = "START GAME";
			countdownText.innerHTML = "PAUSED";
			pauseLayer.style.display = "flex";
			countdownInProgress = false;
			musicPlayer.pause();
		} else {
			countdownText.innerHTML = "3";
			pauseLayer.style.display = "flex";
			setTimeout(() => countdownText.innerHTML = "2", 1000);
			setTimeout(() => countdownText.innerHTML = "1", 2000);
			setTimeout(() => {
				draw();
				timerID = setInterval(moveDown, scaleTime);
				nextDisplay();
				startBtn.innerHTML = "PAUSE GAME";
				pauseLayer.style.display = "none";
				countdownInProgress = false;
				musicPlayer.play();
				visualize();
			}, 3000);
		}
	});

	/* Clears lines, updates line count display and runs scoreing calculator
		Loop through array of grid<div>s in sets of 10 squares (rows)
		If all 10 have "taken" class (added by freeze())
			row is spliced from array and replaced at the top of the play field (after hidden square above visible grid)
			clearTotal (counter for cleared lines) is incremented for score multiplier calculation
			Runs score calculator and updates line count display
	*/
	function addScore() {
		console.log("addScore Triggered")			// DEBUG LOGGING
		var clearTotal = 0
		for (let i = 0; i < 219; i += width) {
			const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9]

			if (row.every(index => squares[index].classList.contains('taken'))) {
				clearTotal += 1
				row.forEach(index => {
					squares[index].classList.remove('taken')
					squares[index].classList.remove('tetromino')
					squares[index].style.background = ''
				})
				const squaresRemoved = squares.splice(i, width)
				const hiddenDivCount = 20;
				const squaresBeforeHidden = squares.slice(0, hiddenDivCount);
				const squaresAfterHidden = squares.slice(hiddenDivCount);
				squares = squaresBeforeHidden.concat(squaresRemoved, squaresAfterHidden);
				squares.forEach(cell => grid.appendChild(cell))
			}
		}
		if (clearTotal > 0) {
			lineCount += clearTotal
			calcScore(clearTotal)
			lineDisplay.innerHTML = lineCount
		}

	}

	/* levelUp calculates current level based on modern guideline system (fixed-goal: 10lines)
		If level is advanced after update, speed scale is increased
	*/
	const backgroundList = [
		"0.png",
		"1.png",
		"2.png",
		"3.png",
		"4.png",
		"5.png",
		"6.png",
		"7.png",
		"8.png",
		"9.png"
	]

	const backgroundDisplay = document.querySelector('.container')

	function levelUp() {
		console.log("LevelUp Triggered")				// DEBUG LOGGING
		let currentLevel = level
		level = Math.floor((lineCount) / 10)
		levelDisplay.innerHTML = level
		scaleTime = ((0.8 - ((level - 1) * 0.007)) ** (level - 1)) * 1000
		console.log("Fall speed is now: " + scaleTime)

		console.log("Level: " + level)					// DEBUG LOGGING
		console.log("Current Level: " + currentLevel)	// DEBUG LOGGING
		if (currentLevel < level) {

			clearInterval(timerID)
			timerID = null
			timerID = setInterval(moveDown, scaleTime)
			console.log("Timer Speed: " + scaleTime)	// DEBUG LOGGING
			animationSwitch("climb")

			backgroundDisplay.style.backgroundImage = `url(backgrounds/${backgroundList[level]})`
		}

	}

	/* Calculates line clear scoring bonuses based on clearTotal from addScore + triggers SFX
		Uses guideline(2009) compliant scoring system
		SFX are cascaded for more lines cleared
		Updates scoreDisplay after score bonus is calculated
	*/
	function calcScore(clearTotal) {
		console.log("Clear Total: " + clearTotal) // DEBUG LOGGING
		switch (clearTotal) {
			case 1:
				score += (100 * (level + 1))
				setTimeout(() => playSound(clear1SFX), 100)
				break
			case 2:
				score += (300 * (level + 1))
				setTimeout(() => playSound(clear2SFX), 100)
				break
			case 3:
				score += (500 * (level + 1))
				setTimeout(() => playSound(clear2SFX), 100)
				setTimeout(() => playSound(clear3SFX), 400)
				break
			case 4:
				score += (800 * (level + 1))
				playSound(laserSFX)
				setTimeout(() => playSound(clear1SFX), 100)
				setTimeout(() => playSound(clear2SFX), 300)
				setTimeout(() => playSound(clear3SFX), 600)
				break
		}
		scoreDisplay.innerHTML = score
		levelUp()
	}

	const endGame = document.getElementById("popup-score");
	endGame.style.display = "none"
	// If Tetrimino spawns within a square market as taken (thus within hidden div rows) - GAME OVER
	// TODO: This 1) does not work correctly, 2) is not guidleline spec
	function gameOver() {
		const endscore = document.getElementById("endscore")
		const endlevel = document.getElementById("endlevel")
		if (currentTet.some(index => squares[currentPosition + index].classList.contains('taken'))) {
			dead = true
			animationSwitch("dead")
			endGame.style.display = "flex"
			endGame.addEventListener("click", () => {
				endGame.style.display = "none"
				resetGrid()
			})
			endscore.innerHTML = score
			endlevel.innerHTML = level
			clearInterval(timerID)
			timerID = null
			musicPlayer.pause();
			musicPlayer.currentTime = 0;
			clearInterval(dangerInterval)
			dangerInterval = null
		}

	}

	function resetGrid() {
		window.location.reload();
		// dead = false
		// queue = []
		// randTet = sevenBag()
		// nextRandom = sevenBag()
		// tetCounts = [0, 0, 0, 0, 0, 0, 0]
		// currentPosition = 4
		// currentRotation = 0
		// currentTet = tetArray[randTet][currentRotation]
		// ghostTet = currentTet
		// score = 0
		// level = 0
		// lineCount = 0
		// lineDisplay.innerHTML = lineCount
		// scoreDisplay.innerHTML = score
		// levelDisplay.innerHTML = level
		// countUpdate()
		// heldTet = null
		// holdWindow.forEach(square => {
		// 	square.classList.remove('tetromino')
		// 	square.style.background = ''
		// })
		// backgroundDisplay.style.backgroundImage = `url(backgrounds/${backgroundList[level]})`
		// scaleTime = ((0.8 - ((level - 1) * 0.007)) ** (level - 1)) * 1000
		// nextDisplay()
		// startBtn.innerHTML = "START GAME";
		// squares.forEach((div, index) => {
		// 	div.classList.remove('taken')
		// 	div.classList.remove('tetromino')
		// 	div.style.background = ''
		// 	if (index >= 220 && index <= 229) {
		// 		div.classList.add('taken');
		// 	}
		// 	stress()
		// 	animationSwitch("run")

		// });

	}


	const menuItems = document.querySelectorAll(".menu-item");
	menuItems.forEach((menuItem) => {
		menuItem.addEventListener("mouseover", () => {
			const file_dropdown = menuItem.querySelector(".file-dropdown")
			const edit_dropdown = menuItem.querySelector(".edit-dropdown")
			if (file_dropdown) {
				file_dropdown.style.display = "block"
			} else if (edit_dropdown) {
				edit_dropdown.style.display = "block"
			}
		});

		menuItem.addEventListener("mouseout", () => {
			const file_dropdown = menuItem.querySelector(".file-dropdown")
			const edit_dropdown = menuItem.querySelector(".edit-dropdown")
			if (file_dropdown) {
				file_dropdown.style.display = "none"
			} else if (edit_dropdown) {
				edit_dropdown.style.display = "none"
			}
		});
	});

	const helpContainer = document.querySelector(".help-popup");
	const helpButton = document.getElementById("help-menu");
	helpContainer.style.display = "none"
	helpButton.addEventListener("click", () => {
		helpContainer.style.display = "flex"
	});
	helpContainer.addEventListener("click", () => {
		helpContainer.style.display = "none"
	})

	const newGameBtn = document.querySelector("#newgamebutton");
	newGameBtn.addEventListener("click", () => {
		console.log("Refreshing the page..."); // DEBUG LOGGING
		window.location.reload();
	});

	let scroll = true
	const toggleScrollButton = document.querySelector("#toggleScrollButton");
	const scrollDisplay = document.querySelector("#scroll-display");
	const container = document.querySelector(".container");
	toggleScrollButton.addEventListener("click", () => {
		scroll = !scroll;
		if (!scroll) {
			toggleScrollButton.innerHTML = "Start Wallpaper Scroll";
			scrollDisplay.style.color = "red";
			scrollDisplay.innerHTML = "Scroll Wallpaper: OFF";
			container.style.animation = "none";
		} else {
			toggleScrollButton.innerHTML = "Stop Wallpaper Scroll";
			scrollDisplay.style.color = "lime";
			scrollDisplay.innerHTML = "Scroll Wallpaper: ON";
			container.style.animation = "scrollBackground 10s linear infinite";
		}

		console.log("Animation Scroll = " + scroll); // DEBUG LOGGING
	});


	// POP UP WINDOW SCRIPT
	const popupContainer = document.querySelector(".hidden-popup");
	const charSelectButton = document.getElementById("charSelect");
	const dudeBtn = document.querySelector("#dudebtn")
	const owletBtn = document.querySelector("#owletbtn")
	const pinkBtn = document.querySelector("#pinkbtn")

	popupContainer.style.display = "none";


	function showPopup() {
		popupContainer.style.display = "flex";
	}

	function hidePopup() {
		popupContainer.style.display = "none";
	}

	// Open the pop-up when needed, e.g., when a button is clicked
	charSelectButton.addEventListener("click", () => {
		showPopup();
	});

	// Close the pop-up when the close button is clicked
	dudeBtn.addEventListener("click", () => {
		characterPane.style.backgroundImage = 'url("images/sprites/Dude/Dude_Monster_Idle_4.png")'
		charID = 0
		hidePopup();
	});
	owletBtn.addEventListener("click", () => {
		characterPane.style.backgroundImage = 'url("images/sprites/Owlet/Owlet_Monster_Idle_4.png")'
		charID = 1
		hidePopup();
	});
	pinkBtn.addEventListener("click", () => {
		characterPane.style.backgroundImage = 'url("images/sprites/Pink/Pink_Monster_Idle_4.png")'
		charID = 2
		hidePopup();
	});


	// DEBUG: DEVELOPER MODE BUTTONS

	// c1.addEventListener('click', () => {
	// 	testButton(1)
	// })
	// c2.addEventListener('click', () => {
	// 	testButton(2)
	// })
	// c3.addEventListener('click', () => {
	// 	testButton(3)
	// })
	// c4.addEventListener('click', () => {
	// 	testButton(4)
	// })
	// stressbtn.addEventListener('click', () => {
	// 	console.log("Stress = " + stress())
	// 	animationSwitch('push')
	// })
	// wipeBTN.addEventListener('click', () => {
	// 	let rowWipe = [210, 211, 212, 213, 214, 215, 216, 217, 218, 219]
	// 	console.log("wipe clicked")
	// 	rowWipe.forEach(index => {
	// 		squares[index].classList.remove('taken')
	// 		squares[index].classList.remove('tetromino')
	// 		squares[index].style.background = ''
	// 	})
	// 	//WIPE bottom row
	// 	var squaresRemoved = squares.splice(210, 10)
	// 	unDraw()

	// 	var hiddenDivCount = 20;
	// 	var squaresBeforeHidden = squares.slice(0, hiddenDivCount);
	// 	var squaresAfterHidden = squares.slice(hiddenDivCount);
	// 	squares = squaresBeforeHidden.concat(squaresRemoved, squaresAfterHidden);
	// 	squares.forEach(cell => grid.appendChild(cell))

	// 	// DEBUG LABEL ALL SQUARES
	// 	squares.forEach((square, index) => {
	// 		square.textContent = index.toString();
	// 	});

	// 	draw()
	// 	animationSwitch("jump")

	// })
	// shuffleBtn.addEventListener('click', () => {
	// 	let tetindex = sevenBag()
	// 	console.log("Shuffle button says tetindex =" + tetindex)
	// })
	// holdBtn.addEventListener('click', () => {
	// 	holdDisplay()
	// })

	// function testButton(num) {
	// 	lineCount += num
	// 	lineDisplay.innerHTML = lineCount
	// 	calcScore(num)
	// 	console.log("testButton says scaleTime is =" + scaleTime)
	// }


})



