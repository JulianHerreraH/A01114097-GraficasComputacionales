/*
    Julian Herrera, A01114097
    Graficas Computacionales
*/

/*
 * Checks that canvas exists and declares main context variables
 * Then calls initial triangle's points caculation 
*/
function draw() {
    let canvas = document.getElementById('htmlCanvas')
    if (!canvas) {
        alert('Error: canvas no fue cargado')
        return
    }

    let context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)

    const step = document.getElementById("slider").value
    const width = canvas.width
    const height = canvas.height
    const triangleSize = 600
    calculateInitialPoints(context, width, height, triangleSize, step)


    document.addEventListener("mousemove", event => {
        let mouseText = document.getElementById("mousePosition");
        mouseText.innerHTML = `Posición en canvas: (${event.clientX - 10}, ${event.clientY - 82})`;
    })

}

/*
 * Called after user presses button and enters step input
 * Validates input and calls the main draw function
*/
function validateInput(input) {

    if (input < 0 || input >= 10) {
        alert('Numero de ser entre 0 y 9!')
    } else {
        draw()
        document.getElementById("sliderValue").innerText = "Valor: " + input
    }

}

/*
 * Calculate the initial triangle points dynamically based on canvas dimentions 
 * and calls recursive function with step input
 * Formulas from: https://en.wikipedia.org/wiki/Equilateral_triangle#Principal_properties
*/
function calculateInitialPoints(context, width, height, size, step) {

    var midPointCanvasX = width / 2
    var midPointCanvasY = height / 2

    var radiusInscribedCircle = (size / 6) * Math.sqrt(3)
    var radiusCircumscribedCircle = (size / 3) * Math.sqrt(3)

    var x0 = midPointCanvasX - (size / 2)
    var y0 = midPointCanvasY + radiusInscribedCircle

    var x1 = midPointCanvasX + (size / 2)
    var y1 = midPointCanvasY + radiusInscribedCircle

    var x2 = midPointCanvasX
    var y2 = midPointCanvasY - radiusCircumscribedCircle

    sierpinskiRecursive(context, x0, y0, x1, y1, x2, y2, step)

}

/*
 * Recursive function to calculate the middle points
 * Base case when recursive steps are completed
*/
function sierpinskiRecursive(context, x0, y0, x1, y1, x2, y2, step) {

    // When the recursive step is 0, paint the triangle
    if (step == 0) {
        context.fillStyle = '#fff200'
        context.beginPath()
        context.moveTo(x0, y0)
        context.lineTo(x1, y1)
        context.lineTo(x2, y2)
        context.fill()
    } else {
        // Calculate the middle points for each side of the triangle
        var midX0 = (x1 + x2) / 2
        var midY0 = (y1 + y2) / 2
        var midX1 = (x0 + x2) / 2
        var midY1 = (y0 + y2) / 2
        var midX2 = (x0 + x1) / 2
        var midY2 = (y0 + y1) / 2

        // Reduce the recursive step by one  
        var stepR = step - 1

        // Recursive calls for the new triangles
        sierpinskiRecursive(context, x0, y0, midX1, midY1, midX2, midY2, stepR) // Lower left
        sierpinskiRecursive(context, midX2, midY2, midX0, midY0, x1, y1, stepR) // Lower Right
        sierpinskiRecursive(context, midX1, midY1, x2, y2, midX0, midY0, stepR) // Top
    }

}




