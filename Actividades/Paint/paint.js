/*
    Julian Herrera, A01114097
    Graficas Computacionales
*/


let ctx = null
let canvas = null


/**
 * Called once the page loads, handles all actions
 */
function main() {

    canvas = document.getElementById("paintCanvas")
    ctx = canvas.getContext("2d")

    let brushXPos = 0
    let brushYPos = 0
    let isDrawing = false

    ctx.lineWidth = 1
    ctx.strokeStyle = 'black'

    // Colors for the brush
    let colors = document.querySelectorAll('.colorButton')
    for (const color of colors) {
        color.addEventListener('click', event => {
            ctx.strokeStyle = event.target.value
        })
    }

    // Background colors for the canvas
    let colorsBackground = document.querySelectorAll('.colorButtonB')
    for (const color of colorsBackground) {
        color.addEventListener('click', event => {
            canvas.style.backgroundColor = event.target.value
        })
    }

    // Handling of the slider input
    let sizeSlider = document.getElementById('width-slider')
    sizeSlider.oninput = (event) => {
        let sliderText = document.getElementById("line-width-text")
        sliderText.innerHTML = `Ancho de Linea: (${event.target.value})`
        ctx.lineWidth = event.target.value
    }

    // Event when the user click down on the canvas
    canvas.addEventListener('mousedown', event => {
        if (event.clientX < canvas.width && event.clientY < canvas.height) {
            isDrawing = true

            brushXPos = event.clientX
            brushYPos = event.clientY

            ctx.beginPath()
            ctx.moveTo(brushXPos, brushYPos)
        }
    })

    // Even when the user moves the mouse on the canvas
    canvas.addEventListener('mousemove', event => {
        let mouseText = document.getElementById("mousePosition")
        mouseText.innerText = `Posición en canvas: (${event.clientX}, ${event.clientY})`

        if (event.clientX < canvas.width && event.clientY < canvas.height) {
            brushXPos = event.clientX
            brushYPos = event.clientY

            if (isDrawing) {
                ctx.lineTo(brushXPos, brushYPos)
                ctx.stroke()
            }
        } else {
            isDrawing = false
        }
    })

    // Event when user stops clicking the mouse, reads all the screen
    document.addEventListener('mouseup', event => {
        isDrawing = false
        if (event.clientX < canvas.width && event.clientY < canvas.height) {
            brushXPos = event.clientX
            brushYPos = event.clientY
        }
    })

}

/**
 * Clears the canvas
 */
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}



