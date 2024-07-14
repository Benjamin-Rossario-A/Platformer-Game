const startBtn = document.getElementById("start-btn"); //used tt start the game.
const canvas = document.getElementById("canvas"); // canvas for the game to be played.
const startScreen = document.querySelector(".start-screen");
const checkpointScreen = document.querySelector(".checkpoint-screen"); // used to display the message about the checkpoint.
const checkpointMessage = document.querySelector(".checkpoint-screen > p"); // used to display the message about the checkpoint.
const ctx = canvas.getContext("2d"); // returns a drawing context on the canvas.
canvas.width = innerWidth; //sets the canvas width to the full width of the browser window.
canvas.height = innerHeight; //sets the canvas height to the full height of the browser window.
/*innerWidth and innerHeight are properties of the window object that return the width and height of the content area of the browser window, respectively. This does not include the browser's toolbar or scrollbar.*/
const gravity = 0.5; //sets the gravity for the player to come down after a jump or a fall.
let isCheckpointCollisionDetectionActive = true;
//used to check for collision.

/*function is used to adjust the size of game elements relative to the height of the browser window. This ensures that the game elements scale appropriately on different screen sizes, maintaining a consistent gameplay experience.*/
const proportionalSize = (size) => {
  return innerHeight < 500 ? Math.ceil((size / 500) * innerHeight) : size;
};

class Player {
  // class declaration
  constructor() {
    this.position = {
      //intitial position of  player
      x: proportionalSize(10),
      y: proportionalSize(400),
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = proportionalSize(40); //width of player.
    this.height = proportionalSize(40); //height of player.
  }
  draw() {
    ctx.fillStyle = "#99c9ff"; //colour of the player.
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height); // shape of the player.
    //The fillRect() method draws a filled rectangle whose starting point is at (x, y) and whose size is specified by width and height. The fill style is determined by the current fillStyle attribute.
  }

  update() {
    this.draw();
    //velocity is added to repective axis.
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    //if the player is within the canvas. the following loop will be run.
    // the position of increases from top to bottom i.e., it is 0 at the top and increases while going down.
    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      if (this.position.y < 0) {
        // this is for the case when the player is on top of the canvas. when the player tries to go out the position is reset to zero inorder to keep the player within the canvas. and the gravity is added to veocity to give a free fall effect to the player.
        this.position.y = 0;
        this.velocity.y = gravity;
      }
      this.velocity.y += gravity; //this is for the normal cases.
    } else {
      // If the player is at or below the bottom of the canvas,the downward movement must be stopped.
      // Set the vertical velocity to 0, indicating that the player has landed.
      this.velocity.y = 0;
    }

    if (this.position.x < this.width) {
      this.position.x = this.width;
      //this is done so that there exists a gap between a gap b/w the user and the canvas edge. This is for the left side of the canvas.
    }

    if (this.position.x >= canvas.width - 2 * this.width) {
      this.position.x = canvas.width - 2 * this.width;
      //this is done so that there exists a gap between a gap b/w the user and the canvas edge. This is for the right side of the canvas.
    }
  }
}

class Platform {
  // platform class declaration.
  constructor(x, y) {
    //position,width,height of each platform.
    this.position = {
      x,
      y,
    };
    this.width = 200;
    this.height = proportionalSize(40);
  }
  draw() {
    //similar to playe class.
    ctx.fillStyle = "#acd157";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

class CheckPoint {
  constructor(x, y, z) {
    this.position = {
      x,
      y,
    };
    this.width = proportionalSize(40);
    this.height = proportionalSize(70);
    this.claimed = false;
  }

  draw() {
    ctx.fillStyle = "#f1be32";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  claim() {
    this.width = 0;
    this.height = 0;
    this.position.y = Infinity;
    this.claimed = true;
    //Infinity is a special numeric value that represents positive infinity. It is greater than any other number. Assigning Infinity to a variable means that the variable holds an infinitely large value.
  }
}

const player = new Player();

const platformPositions = [
  { x: 500, y: proportionalSize(450) },
  { x: 700, y: proportionalSize(400) },
  { x: 850, y: proportionalSize(350) },
  { x: 900, y: proportionalSize(350) },
  { x: 1050, y: proportionalSize(150) },
  { x: 2500, y: proportionalSize(450) },
  { x: 2900, y: proportionalSize(400) },
  { x: 3150, y: proportionalSize(350) },
  { x: 3900, y: proportionalSize(450) },
  { x: 4200, y: proportionalSize(400) },
  { x: 4400, y: proportionalSize(200) },
  { x: 4700, y: proportionalSize(150) },
];

//creating instance of the platform class.
const platforms = platformPositions.map(
  (platform) => new Platform(platform.x, platform.y)
);

const checkpointPositions = [
  { x: 1170, y: proportionalSize(80), z: 1 },
  { x: 2900, y: proportionalSize(330), z: 2 },
  { x: 4800, y: proportionalSize(80), z: 3 },
];

//creating instance of the Chekpoint class.
const checkpoints = checkpointPositions.map(
  (checkpoint) => new CheckPoint(checkpoint.x, checkpoint.y, checkpoint.z)
);

const animate = () => {
  requestAnimationFrame(animate);
  // tells the browser you wish to perform an animation. It requests the browser to call a user-supplied callback function before the next repaint.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //clears the entire canvas, ensuring that the previous frame's drawings are removed.

  platforms.forEach((platform) => {
    platform.draw();
  });

  checkpoints.forEach((checkpoint) => {
    checkpoint.draw();
  });

  player.update();

  if (keys.rightKey.pressed && player.position.x < proportionalSize(400)) {
    player.velocity.x = 5; //if the right arrow key is pressed then the velocity will be increased by 5 units.
  } else if (
    keys.leftKey.pressed && //if the left arrow key is pressed then the velocity will be decreased by 5 units.
    player.position.x > proportionalSize(100)
  ) {
    player.velocity.x = -5;
  } else {
    player.velocity.x = 0;

    if (keys.rightKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => {
        platform.position.x -= 5;
        // this is done inorder to make the user that the player is moving by moving the platforms.
      });
      //the checkpoints must also be moved.
      checkpoints.forEach((checkpoint) => {
        checkpoint.position.x -= 5;
      });
    } else if (keys.leftKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => {
        platform.position.x += 5;
        // this is done inorder to make the user that the player is moving by moving the platforms.
      });
      //the checkpoints must also be moved.
      checkpoints.forEach((checkpoint) => {
        checkpoint.position.x += 5;
      });
    }
  }

  platforms.forEach((platform) => {
    const collisionDetectionRules = [
      player.position.y + player.height <= platform.position.y,
      //This checks if the bottom of the player (player.position.y + player.height) is above or exactly at the top edge of the platform (platform.position.y).
      player.position.y + player.height + player.velocity.y >=
        platform.position.y,
      //This checks if the player's next position (player.position.y + player.height + player.velocity.y) is below or exactly at the top edge of the platform. This ensures that the player is moving downward and about to land on the platform.
      player.position.x >= platform.position.x - player.width / 2,
      // This provides a small buffer to make the collision detection a bit more lenient, ensuring the player can land on the platform even if they are slightly off-center.

      player.position.x <=
        platform.position.x + platform.width - player.width / 3,
      //provides a small buffer similar to the previous rule, making the collision detection more forgiving.
    ];

    if (collisionDetectionRules.every((rule) => rule)) {
      player.velocity.y = 0;
      return;
      //all the rules must be true inorder for the velocity to be changed to true.
    }

    const platformDetectionRules = [
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <=
        platform.position.x + platform.width - player.width / 3,
      player.position.y + player.height >= platform.position.y,
      player.position.y <= platform.position.y + platform.height,
    ];
    //this rules are used to handle horizontal alignment and the possibility of collisions from the sides as well as from above or below.

    if (platformDetectionRules.every((rule) => rule)) {
      player.position.y = platform.position.y + player.height;
      player.velocity.y = gravity;
      //this is done to give the player a falling effect.
    }
  });

  checkpoints.forEach((checkpoint, index, checkpoints) => {
    const checkpointDetectionRules = [
      //rules for checkpoint detections.
      player.position.x >= checkpoint.position.x,
      player.position.y >= checkpoint.position.y,
      player.position.y + player.height <=
        checkpoint.position.y + checkpoint.height,
      isCheckpointCollisionDetectionActive,
      player.position.x - player.width <=
        checkpoint.position.x - checkpoint.width + player.width * 0.9,
      //this is to consider checkpoint even if the player slightly touches the right side of the checkpoint.
      index === 0 || checkpoints[index - 1].claimed === true,
    ];

    if (checkpointDetectionRules.every((rule) => rule)) {
      checkpoint.claim();

      if (index === checkpoints.length - 1) {
        isCheckpointCollisionDetectionActive = false;
        showCheckpointScreen("You reached the final checkpoint!");
        movePlayer("ArrowRight", 0, false);
      } else if (
        player.position.x >= checkpoint.position.x &&
        player.position.x <= checkpoint.position.x + 40
      ) {
        showCheckpointScreen("You reached a checkpoint!");
      }
    }
  });
};

const keys = {
  rightKey: {
    pressed: false,
  },
  leftKey: {
    pressed: false,
  },
};

const movePlayer = (key, xVelocity, isPressed) => {
  if (!isCheckpointCollisionDetectionActive) {
    player.velocity.x = 0;
    player.velocity.y = 0;
    return;
  }

  switch (key) {
    case "ArrowLeft":
      keys.leftKey.pressed = isPressed;
      if (xVelocity === 0) {
        player.velocity.x = xVelocity;
      }
      player.velocity.x -= xVelocity;
      break;
    case "ArrowUp":
    case " ":
    case "Spacebar":
      player.velocity.y -= 8;
      break;
    case "ArrowRight":
      keys.rightKey.pressed = isPressed;
      if (xVelocity === 0) {
        player.velocity.x = xVelocity;
      }
      player.velocity.x += xVelocity;
  }
};

const startGame = () => {
  canvas.style.display = "block";
  startScreen.style.display = "none";
  animate();
};

const showCheckpointScreen = (msg) => {
  checkpointScreen.style.display = "block";
  checkpointMessage.textContent = msg;
  if (isCheckpointCollisionDetectionActive) {
    setTimeout(() => (checkpointScreen.style.display = "none"), 2000);
  }
};

startBtn.addEventListener("click", startGame);

window.addEventListener("keydown", ({ key }) => {
  movePlayer(key, 8, true);
});

window.addEventListener("keyup", ({ key }) => {
  movePlayer(key, 0, false);
});

/* 1) The HTMLCanvasElement.getContext() method returns a drawing context on the canvas, or null if the context identifier is not supported, or the canvas has already been set to a different context mode.

2)The CanvasRenderingContext2D.fillStyle property of the Canvas 2D API specifies the color, gradient, or pattern to use inside shapes. The default style is #000 (black).

3)The CanvasRenderingContext2D.fillRect() method of the Canvas 2D API draws a rectangle that is filled according to the current fillStyle.
This method draws directly to the canvas without modifying the current path, so any subsequent fill() or stroke() calls will have no effect on it.The fillRect() method draws a filled rectangle whose starting point is at (x, y) and whose size is specified by width and height. The fill style is determined by the current fillStyle attribute.
syntax: fillRect(x, y, width, height)
x--> The x-axis coordinate of the rectangle's starting point.
y--> The y-axis coordinate of the rectangle's starting point.
width --> The rectangle's width. Positive values are to the right, and negative to the left.
height --> The rectangle's height. Positive values are down, and negative are up.

4)The window.requestAnimationFrame() method tells the browser you wish to perform an animation. It requests the browser to call a user-supplied callback function before the next repaint.

5)The CanvasRenderingContext2D.clearRect() method of the Canvas 2D API erases the pixels in a rectangular area by setting them to transparent black. 
  The clearRect() method sets the pixels in a rectangular area to transparent black (rgb(0 0 0 / 0%)). The rectangle's top-left corner is at (x, y), and its size is specified by width and height.

6)Shorthand property
ex:
// using shorthand property name syntax
obj = {
  a, b, c
}
This is same as:
obj = {
  a: a,
  b: b,
  c: c
}*/
