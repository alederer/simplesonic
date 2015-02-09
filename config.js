var SERVER_FORM;
var CONFIG = {};

function initConfig() {
	SERVER_FORM = {};
	SERVER_FORM.server = document.getElementById("serverInput"); 
	SERVER_FORM.username = document.getElementById("usernameInput"); 
	SERVER_FORM.password = document.getElementById("passwordInput"); 
	SERVER_FORM.submit = document.getElementById("submitInput"); 

	loadConfig();

	document.getElementById("config").hidden = true;
}

function hexEncode (s) { return _.map(s, function (c) { return c.charCodeAt(0).toString(16); }).join(""); }
function hexDecode (s) { return _.map(s.match(/.{2}/g), function (x) { return unescape("%"+x); }).join(""); }

function showHideConfig() {
	document.getElementById("config").hidden = !document.getElementById("config").hidden;
}

function onConfigChanged() {
	SERVER_FORM.submit.disabled = false;
}

function loadConfig() {
	var configStr = localStorage["config"];
	CONFIG = configStr ? JSON.parse(configStr) : {};

	SERVER_FORM.server.value = CONFIG.server;
	SERVER_FORM.username.value = CONFIG.username;
	SERVER_FORM.password.value = hexDecode(CONFIG.passwordEnc);
	SERVER_FORM.submit.disabled = true;
} 

function saveConfig() {
	CONFIG = CONFIG || {}
	localStorage["config"] = JSON.stringify(CONFIG);
}

function submitConfig() {
	CONFIG = CONFIG || {};
	CONFIG.server = SERVER_FORM.server.value;
	CONFIG.username = SERVER_FORM.username.value;
	CONFIG.passwordEnc = hexEncode(SERVER_FORM.password.value);
	saveConfig();
	SERVER_FORM.submit.disabled = true;
}

