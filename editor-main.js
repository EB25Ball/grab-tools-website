highlightTextEditor();
refreshScene();

function getLevel() {
    return JSON.parse(document.getElementById('edit-input').innerText);
}
function setLevel(level) {
    document.getElementById('edit-input').innerText = JSON.stringify(level, null, 4);
    highlightTextEditor();
    refreshScene();
}
function refreshScene() {
    var levelData = getLevel();
}