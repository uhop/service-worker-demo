const LINES = 10;

function log (msg) {
	console.log(msg);

	const container = document.getElementById('log');
	if (!container) return;

	const div = document.createElement('div'),
		code = document.createElement('code'),
		text = document.createTextNode(msg);

	code.appendChild(text);
	div.appendChild(code);
	container.appendChild(div);

	while (container.childNodes.length > LINES) {
		container.removeChild(container.firstChild);
	}
};
