window.onload = init;

// make the individual components available at global scope for debugging/scripting
var SUBSONIC, LIBRARY, FOLDERVIEW, QUEUE;

function init() {
	initConfig();

	SUBSONIC = makeConnection(CONFIG);
	LIBRARY = makeLibrary(SUBSONIC);
	QUEUE = makeQueue(LIBRARY, SUBSONIC);
	FOLDERVIEW = makeFolderView(LIBRARY, QUEUE);
};

