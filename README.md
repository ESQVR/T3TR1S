
# Welcome to My Tetris

## Task

This project is an implementation of the classic computer game Tetris - using only Javascript, CSS, and HTML.

This project is intended to stick as close to the Official Tetris Guidelines (2009) documentation as is practical and to build the game with only vanilla CSS and Javascript without any external frameworks or libraries.

## Description

This project was made as part of the Qwasar SV Full Stack Developer curriculum - and is my first attempt at making a browser based game, using CSS in an interactive/responsive manner, or really anything like this.

Not having any idea where to start, I based this project on a simple FreeCodeCamp tutorial available at: https://www.freecodecamp.org/news/learn-javascript-by-creating-a-tetris-game/

The fundamental approach taken from this tutorial is to create a single array of 230 divs and use JS/CSS to style and manipulate the divs in this array using time intervals and keyboard inputs - rather than using canvas and requestAnimationFrame.  Building on this my project uses a single javascript file (not ideal) and is quite a kludge, hacked together in an inelegant and (in retrospect) poorly planned fashion.

I wanted to replicate the look of a retro Windows 3.1 game, running in a windowed desktop environment, and feature some fun interactive aspects common to retro-game design:

 - Selectable, animated characters who respond to user inputs
 - Moving backgrounds that dynamically respond to player performance / game progress
 - Player statistics that keep track of the number of pieces successfully placed.

I kept this game compliant with as many of the Official Guideline specifications as I could. This includes:

 - "SevenBag" piece generator: a queue of each of the 7 possible tetromino is generated and sent to to the player in that order, when the queue is empty it refills, ensuring uniform appearance of each shape and preventing long runs of single shapes.
 - Scoring methodology: 1, 2, 3, 4 lines cleared -> 100/300/500/800 x level = score
 - Speed scales with level progress: (0.8 - (level x 0.007)) ^ level

There remain a few bugs with the rotation (blocks in tight spaces can be rotated, causing errors in the display) that are artifacts of using a one-dimensional array as the basis of the game engine. There are also performance issues with the animations (a result of relying on setInterval method), and features that could be improved

## Installation

To running the program from the Docode host:
1. Navigate to the root directory
2. In a terminal window run the HTML Server using Node.js `node html_server.js`
3. The server should respond with: `Server running at http://0.0.0.0:8080/`
4. In a new browser window navigate to: https://web-u7d8220b8-ecbd.docode.us.qwasar.io/

To run locally:
5. Use the same steps 1-3 as above
6. Navigate to http://0.0.0.0:8080/

The HTML server may be shut down using SIGINT command: [Ctrl-C]

This game runs best on Chrome and has been tested on Firefox.
Playing it in Safari can produce graphical display issues (text wrapping) and no Audio.

## Usage

Like classic Tetris the object of the game is to completely fill rows with falling blocks (tetrominos). When a row is filled, the row is cleared, and the remaining blocks above fall downwards.
If the blocks stack above the top of the play field, the game ends.

 - [ ] 1 point is awarded for each row a block falls down in the play
       field.

 - [ ] Points are awarded for clearing rows of blocks, with
       multipliers applied for more than one row being cleared at a
       time, and for the current difficulty level.

The object of the game is to get as high a score as possible.

Pressing Shift will store the current tetromino in the hold box, and after a new one is generated, you may swap the held one with the current tetromino.

The ghost display will highlight the position the current tetromino will fall into.
***
CONTROLS: (viewable by clicking "Help" in the menu bar)
|Action|Key|
|--|--|
|Move Left | Left Arrow |
|Move Right | Right Arrow |
|Rotate (clockwise) | Up Arrow |
|Soft Drop (single) | Down Arrow |
|Hard Drop (locks in place) | Space Bar |
|Hold/Swap | Shift Key |

The start button (in the bottom right window) may be used to start/pause the game.

Reset the game by choosing File>New Game from the menu Bar
***
OPTIONS (click "Options" in the menu bar)
The current status of options is viewable in the window at the bottom right.

 - Music / Sound Effects - toggles all sounds on/off
 - Ghost Display - toggles "ghost" display on/off
 - Wallpaper Scroll - toggles moving backgrounds (these change speed if blocks stack too high)
 - Character Select - There are three characters to choose from. They react to player inputs, pushing, rotating, and jumping as blocks are moved. (Also they will get "stressed" if the blocks are too close to the top of the screen)

***




### The Core Team
Christopher A. Deetz


<span><i>Made at <a  href='https://qwasar.io'>Qwasar SV -- Software Engineering School</a></i></span>

<span><img  alt='Qwasar SV -- Software Engineering School's  Logo' src='https://storage.googleapis.com/qwasar-public/qwasar-logo_50x50.png'  width='20px'  /></span>
