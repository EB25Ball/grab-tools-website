function highlightTextEditor() {
    var textEditor = document.getElementById('edit-input');

    const editText = textEditor.innerText;

    var highlightedText = editText.replace(/([bruf]*)(\"""|'''|"|')(?:(?!\2)(?:\\.|[^\\]))*\2:?/gs, (match) => {
    if (match.endsWith(":")) {
        return `<span style="color: #dd612e">${match.slice(0,-1)}</span><span style="color: #007acc">:</span>`;
    } else {
        return `<span style="color: #487e02">${match}</span>`;
    }
    });

    highlightedText = highlightedText.replace(/(?<=<span style="color: #dd612e">"material"<\/span><span style="color: #007acc">:<\/span> ?)[0-9]+(?=(,|\n))/gsi, (match) => {
        switch (match) {
            case "0":
                return `<span style="background-image: url(textures/default.png); background-size: contain">${match}</span>`;
            case "1":
                return `<span style="background-image: url(textures/grabbable.png); background-size: contain">${match}</span>`;
            case "2":
                return `<span style="background-image: url(textures/ice.png); background-size: contain">${match}</span>`;
            case "3":
                return `<span style="background-image: url(textures/lava.png); background-size: contain">${match}</span>`;
            case "4":
                return `<span style="background-image: url(textures/wood.png); background-size: contain">${match}</span>`;
            case "5":
                return `<span style="background-image: url(textures/grapplable.png); background-size: contain">${match}</span>`;
            case "6":
                return `<span style="background-image: url(textures/grapplable_lava.png); background-size: contain">${match}</span>`;
            case "7":
                return `<span style="background-image: url(textures/grabbable_crumbling.png); background-size: contain">${match}</span>`;
            case "8":
                return `<span style="background-image: url(textures/default_colored.png); background-size: contain">${match}</span>`;
            case "9":
                return `<span style="background-image: url(textures/bouncing.png); background-size: contain">${match}</span>`;
            default:
                break;
        }
        return match;
    });

    textEditor.innerHTML = highlightedText;
}
var textEditor = document.getElementById('edit-input').addEventListener('blur', () => {highlightTextEditor(); refreshScene();});

var textEditor = document.getElementById('edit-input').addEventListener('keydown', (e) => {
    if (e.which === 9) {
        e.preventDefault();
        let selection = window.getSelection();
        selection.collapseToStart();
        let range = selection.getRangeAt(0);
        range.insertNode(document.createTextNode("    "));
        selection.collapseToEnd();
    }
});