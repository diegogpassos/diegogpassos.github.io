function hoverIn(img, file) {
    img.setAttribute('src', file);
}
function hoverOut(img, file) {
    img.setAttribute('src', file);
}
function playSound(file) {
    var audio = document.getElementById(file);
    console.log('here' + audio);
    audio.play();
}
