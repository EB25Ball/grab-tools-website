var lastRan = '';
document
    .getElementById('terminal-input')
    .addEventListener('keydown', (e) => {
        if (e.which === 13 && e.shiftKey === false) {
            e.preventDefault();
            var input = document
                .getElementById('terminal-input')
                .value;
            var level = getLevel();
            var success = fail = 0;
            level.levelNodes.forEach(node => {
                try {
                    eval(input);
                    success++;
                } catch (e) {
                    console.error(e)
                    fail++;
                }
                document.getElementById("terminal-input").placeholder = `[Enter] to run JS code\n[Alt] & [UpArrow] for last ran\nvar level.levelNodes.forEach(node => {})\n\n${success} success | ${fail} error${fail != 0 ? "\n[ctrl]+[shift]+[i] for details" : ""}`;
            });
            setLevel(level);
            lastRan = input
            document
                .getElementById('terminal-input')
                .value = '';
        } else if (e.which === 38 && e.altKey === true) {
            e.preventDefault();
            document
                .getElementById('terminal-input')
                .value = lastRan;
        }
    });