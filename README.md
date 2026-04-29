# BoschBulletHell

## Game Instructions

- The yellow rectangle is your Player Element
- Control the player, by moving the mouse over the Game Window
- All other elements are enemies, that will kill you on touch. So try your best to avoid them
- If you survive until the end of the wave of enemies, you win the game

#

## Code Explanation

The Code can be split into a few different segments, as follows:

### Player Object

The Player class holds all information partaining to the player character, such as hitbox size, speed etc.
In addition, it includes a draw and an update function, to draw the chracater on screen and update its game logic respectively.

### Enemy Objects

Enemy Objects are structured in a parent Enemy class and various sub-classes.
The only purpose of the parent class is holding hitbox information, to allow for uniform collision detection with the player.

Each sub-class defines their own draw and update functions and their necessary properties.

### LevelManager Object

The Level Manager is responsible for spawning new enemies at the right times.
It is set up with a list of Objects to spawn and timestamps, when to spawn them.

### Game Loop

The Game Loop is the centerpiece, making the program run. It consists of 4 steps:
1. Calculating the time passed since the last frame (deltatime).
2. Updating Game Logic (i.e. calling all update functions player/enemies)
3. Drawing a Frame (i.e. calling all draw functions)
4. recursively calling the game loop again

### Input Handling

The Input is received through the HTML onmousemove event. Each time this event is triggered, the mouse x- and y-position are updated in the mousePos variable.
This variable is then used by the player and other objects in their update function to calculate their trajectory.

### Graph

The Graph was implemeted using the open source chart.js library. (https://www.chartjs.org)

Every 0.25 seconds a new data point is tracked. The graph displays the last 10 seconds of this data.




## Future Work

Short Term:
- Add Sprites, Animations and Sound
- Make the surrounding website prettier
- Add more levels


Longer-Term:
- Character Abilities (e.g. Sprint, Dash, TP)
- Add more enemies

