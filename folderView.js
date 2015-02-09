function makeFolderView (library, queue) {
	var _root = document.createElement("ul");
	document.getElementById("library").appendChild(_root);

	library.listenReplicated(_onReplicate);
	var _domItems = {}; // id -> elem

	function _populate(ul, objs) {
		_.each(objs, function (v) {
			var e = document.createElement("li");
			_domItems[v.id] = e;
			e.childList = null;

			if (v.isDir) {
				e.innerText = v.label;
				e.object = v;
				e.onclick = _onClick;
			}
			else {
				e.className += " song";
				var a = document.createElement("a");
				a.href = "#" + v.id;
				a.innerText = v.label;
				a.object = v;
				e.appendChild(a);
				a.onclick = _onClick;
			}

			ul.appendChild(e);
		});
	};

	function _onReplicate(libItem) {
		var e = _domItems[libItem.id];
		// finished loading
		e.childList = document.createElement("ul");
		e.appendChild(e.childList);
		_populate(e.childList, e.object.children);
	}

	function _onClick(ev) {
		ev.cancelBubble = true;
		ev.preventDefault();

		var e = ev.toElement;
		if (!e.object) { return; }

		if (e.object.isDir && !e.object.replicated) {
			// display loading...
			library.replicate(e.object);
		}
		else
		{
			if (e.object.isDir) {
				e.childList.hidden = !e.childList.hidden;
			}
			else {
				queue.playNow(e.object.id);
			}
		}
	};

	library.init(function (err) {
		if (err) throw err;
		_populate(_root, library.getFolders());
	});
};

