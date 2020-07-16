
// An integer value, in pixels, indicating the X coordinate at which the mouse pointer was located when the event occurred. 
let mouseDown = false, pageX = 0;
let gGroup = null;

function rotateScene(deltax, group) {
    group.rotation.y += deltax / 100;
    $("#rotation").html("rotation: 0," + group.rotation.y.toFixed(1) + ",0");
}

function scaleScene(scale, group) {
    group.scale.set(scale, scale, scale);
    $("#scale").html("scale: " + scale);
}

function onMouseMove(evt) {
    if (!mouseDown)
        return;

    // The preventDefault() method cancels the event if it is cancelable, meaning that the default action that belongs to the event will not occur.
    evt.preventDefault();

    let deltax = evt.pageX - pageX;
    pageX = evt.pageX;
    rotateScene(deltax, gGroup);
}

function onMouseDown(evt) {
    evt.preventDefault();

    mouseDown = true;
    pageX = evt.pageX;
}

function onMouseUp(evt) {
    evt.preventDefault();

    mouseDown = false;
}

function addMouseHandler(canvas, group) {

    gGroup = group

    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);


    $("#slider").on("slide", (e, u) => scaleScene(u.value, group));

}

// Removes handlers created
function removeHandler(canvas) {

    $("#rotation").html("rotation: 0, 0 ,0");
    canvas.removeEventListener('mousemove', onMouseMove, false)
    canvas.removeEventListener('mousedown', onMouseDown, false)
    canvas.removeEventListener('mouseup', onMouseUp, false)

}