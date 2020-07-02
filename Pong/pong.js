let ctx = null
let canvas = null
// Score object
let score = {
    player1: 0,
    player2: 0,
    scoreLimit: 5
}

/**
 * Main function
 * Called when paged loads, initializes the main components of the game
 */
function main() {

    canvas = document.getElementById("ballCanvas")
    ctx = canvas.getContext("2d")

    const height = canvas.height
    const width = canvas.width

    let pong = new Sphere(width / 2, height / 2, 10, 'white')

    let player1 = new Player(3, (height / 2) - (75 / 2), 10, 50, 'blue')
    let player2 = new Player(width - 10 - 3, (height / 2) - (75 / 2), 10, 50, 'red')

    ctx.fillStyle = 'white'
    ctx.font = "60px Arial"
    ctx.fillText('PONG', (width / 2) - 60, height / 3 - 50, 120)
    ctx.font = "25px Arial"
    ctx.fillText('Press enter to start', (width / 2) - 100, height / 3, 200)
    ctx.font = "20px Arial"
    ctx.fillText(`Score Limit: ${score.scoreLimit}`, (width / 2) - 60, (height / 3) + 50, 120)

    document.addEventListener('keydown', function start(event) {
        if (event.which === 13) {
            update(pong, player1, player2)
        } else if (event.which != 13) {

        } else {
            document.removeEventListener('keydown', start)
        }
    })

}

/**
 * Main game loop 
 * Updates canvas with game information
 */
function update(ball, player1, player2) {

    requestAnimationFrame(() => update(ball, player1, player2))

    const height = canvas.height
    const width = canvas.width

    ctx.clearRect(0, 0, width, height)

    // Score text 
    let player1Score = score.player1
    let player2Score = score.player2

    if (player1Score == score.scoreLimit) {
        ctx.fillStyle = 'blue'
        ctx.font = "50px Arial"
        ctx.fillText('Player 1 Wins!', (width / 2) - 75, height / 3, 150)
        ctx.fillText('Press F5 to restart', (width / 2) - 100, height / 2, 200)
        return
    } else if (player2Score == score.scoreLimit) {
        ctx.fillStyle = 'red'
        ctx.font = "50px Arial"
        ctx.fillText('Player 2 Wins!', (width / 2) - 75, height / 3, 150)
        ctx.fillText('Press F5 to restart', (width / 2) - 100, height / 2, 200)
        return
    }


    ctx.fillStyle = 'white'
    ctx.font = "50px Arial"
    ctx.fillText(player1Score.toString(), (width / 4), 50, 50)
    ctx.fillText(player2Score.toString(), (width * 3) / 4, 50, 50)

    // Middle line
    ctx.fillStyle = 'white'
    ctx.fillRect(width / 2, 0, 1, height)

    // If ball is being placed again in the center
    if (!ball.isResetting) {
        ball.draw()
        ball.update(width, height)
    } else {
        ctx.fillStyle = 'white'
        ctx.font = "35px Arial"
        ctx.fillText('Loading...', (width / 2) - 75, height / 2, 150)
    }



    player1.draw()
    player2.draw()

    player1.move()
    player2.move()

    player1.input(true)
    player2.input(false)

    // Collisions
    if (collision(ball, player1)) {
        ball.isRight = true
        ball.color = 'white'
        ball.x = player1.x + player1.width
        ball.speed += 0.05
    } else if (collision(ball, player2)) {
        ball.isRight = false
        ball.color = 'white'
        ball.x = player2.x - player2.width
        ball.speed += 0.05
    }

}

/**
 * Axis-Aligned Bounding Box Collision
 * Compares the position of two objects
 * Adapted from: https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
 */
function collision(ball, player) {

    if (ball.x < (player.x + player.width) &&
        ball.x + (ball.radius * 2) > player.x &&
        ball.y < player.y + player.height &&
        ball.y + (ball.radius * 2) > player.y) {
        return true
    }

}

/**
 *  Sphere class for the ping-pong ball
 */
class Sphere {

    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color

        this.isRight = true
        this.isUp = true
        this.isResetting = false

        this.speed = 2
    }

    draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        ctx.fill()
    }

    update(xLimit, yLimit) {
        if ((this.x - this.radius <= 0 || this.x >= xLimit - this.radius) && !this.isResetting) {
            if (this.x - this.radius <= 0) {
                score.player2 += 1
            } else if (this.x >= xLimit - this.radius) {
                score.player1 += 1
            }
            this.isResetting = true
            this.reset()
        }

        if (this.x + this.radius >= xLimit) {
            this.isRight = false
            this.color = 'red'
        }
        if (this.x <= this.radius) {
            this.isRight = true
            this.color = 'blue'
        }

        if (this.y + this.radius > yLimit) {
            this.isUp = true
            this.speed += 0.18
        }
        if (this.y < this.radius) {
            this.isUp = false
            this.speed += 0.18
        }

        this.isRight ? this.x += this.speed : this.x -= this.speed
        this.isUp ? this.y -= this.speed : this.y += this.speed
    }

    reset() {
        setTimeout(() => {

            const rand = Math.floor(Math.random() * 2)
            this.isRight = rand == 0 ? true : false
            this.isUp = rand == 0 ? false : true

            this.isResetting = false

            this.speed = 2
            this.x = canvas.width / 2
            this.y = canvas.height / 2
            this.color = 'white'

        }, 1500)
    }

}

/**
 *  Player class for the user-controlled paddle 
 */
class Player {

    constructor(x, y, width, height, color) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color

        this.score = 0
        this.speed = 0
    }

    // Draws the paddle
    draw() {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }

    // Moves the paddle and checks if it hits the boundaries of the canvas
    move() {
        const maxY = canvas.height - this.height

        this.y += this.speed

        if ((this.y + length) <= 0) {
            this.y = 0
        } else if (this.y > maxY) {
            this.y = maxY
        }
    }

    // Handles inputs for the player object
    input(isPlayer1) {
        const speed = 4

        document.addEventListener('keydown', (event) => {
            if (isPlayer1) {
                if (event.which === 83) { // S key, down
                    this.speed = speed
                } else if (event.which === 87) { // W key, up
                    this.speed = -speed
                }
            } else {
                if (event.which === 40) { // Arrow Down
                    this.speed = speed
                } else if (event.which === 38) { // Arrow Up
                    this.speed = -speed
                }
            }
        })

        document.addEventListener('keyup', (event) => {
            if (isPlayer1) {
                if (event.which === 83 || event.which === 87) this.y += 0
            } else {
                if (event.which === 38 || event.which === 40) this.y += 0
            }
        })
    }

}