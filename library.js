var makeLibrary = function (subsonic) {
	function _initItem(v) {
		if (v.title) { v.label = v.title; }
		else if (v.album) { v.label = v.album; }
		else if (v.artist) { v.label = v.artist; }
		else if (v.name) { v.label = v.name; }
		else { v.label = "unlabeled" };

		_items[v.id] = v;
	};

	function _updateChildren(parent) {
		subsonic.getDirectory(parent.id, function (children) {
			if (parent.replicated) { return; }

			parent.children = children;
			_.each(children, function (c) {
				c.replicated = false;
				_initItem(c);
			});
			parent.replicated = true;

			_.each(_replicateListeners, function (cb) {
				cb(parent);
			});
		});
	};

	function init(cb) {
		_folders = [];
		_items = [];

		subsonic.getTopDirectories(function (dirs) {
			_folders = dirs;

			_.each(dirs, function (v) {
				v.replicated = false;
				v.isDir = true;
				_initItem(v);
			});

			cb();
		});
	}

	function replicate(v) {
		_updateChildren(v);
	};

	var _replicateListeners = [];
	function listenReplicated(cb) { _replicateListeners.push(cb); } 

	autoload();

	return {
		init : init,
		getFolders : function () { return _folders; },
		getItem : function (id) { return _items[id]; },
		listenReplicated : listenReplicated,
		replicate : replicate,
	};
};

function autoload(library) {
}
