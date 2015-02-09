function makeConnection (config) {
	function _getRESTUrl(method, params) {
		var url = "http://" + config.server + "/rest/" + method + ".view";

		params = params || {};
		params.f = "json";
		params.v = "1.11.0";
		params.c = "test_app";
		params.u = config.username;
		params.p = "enc:" + config.passwordEnc;

		if (params && Object.keys(params).length) {
			function toQueryString(obj) {
			    var parts = [];
			    for (var i in obj) {
			        if (obj.hasOwnProperty(i)) {
			            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
			        }
			    }
			    return parts.join("&");
			}

			url += "?"
			url += toQueryString(params);
		}

		return url;
	}

	function download (id) {
		var url = _getRESTUrl("download", {"id": id});
		window.location.replace(url);
	}

	function stream (id, player) {
		var url = _getRESTUrl("stream", {"id": id, "format": "mp3"});
		player.src = url;
	}

	function getTopDirectories (cb) {
		request("getIndexes", function (r) {
			var dirs = [];
			_.each(r.indexes.index, function (index) {
				dirs.push.apply(dirs, index.artist);
			});
			cb(dirs);
		});
	}

	function getDirectory (id, cb) {
		request("getMusicDirectory", {id: id}, function (r) { cb(r.directory.child); });
	}

	function request (method, params, cb) {
		if (arguments.length === 2) { cb = params; params = {}; }
		var url = _getRESTUrl(method, params);

		var req = new XMLHttpRequest();
		req.onload = function () {
			cb(JSON.parse(this.responseText)["subsonic-response"]);
		};

		console.log(req);
		req.open("GET", url, true);
		req.send();
	};

	return {
		request : request,
		getTopDirectories : getTopDirectories,
		getDirectory : getDirectory,

		download : download,
		stream : stream,
	};
};

