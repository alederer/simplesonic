function makeFolderView (library, queue) {
	var _root = document.createElement("ul");
	document.getElementById("folderView").appendChild(_root);

	library.listenReplicated(_onReplicate);
	var _domItems = {}; // id -> elem

	function _populate(ul, objs) {
		_.each(objs, function (v) {
			var li = document.createElement("li");
			_domItems[v.id] = li;
			li.childList = null;
			li.object = v;

			if (!v.isDir) {
				li.className += " song";
			}

			var play = document.createElement("a");
			var queue = document.createElement("a");
			var label = document.createElement("a");

			play.href = "#";
			play.innerHTML = "&#9658;";
			play.object = v;
			play.onclick = _onClickPlay;

			queue.href = "#";
			queue.innerHTML = "&#8594";
			queue.object = v;
			queue.onclick = _onClickQueue;

			label.href = "#";
			label.innerText = v.label;
			label.object = v;
			label.onclick = v.isDir ? _onClickDir : _onClickSong;

			li.appendChild(play);
			li.appendChild(queue);
			li.appendChild(label);
			ul.appendChild(li);
		});
	};

	function _onReplicate(libItem) {
		var li = _domItems[libItem.id];

		// finished loading
		li.childList = document.createElement("ul");
		li.appendChild(li.childList);
		_populate(li.childList, li.object.children);
	}

	function _onClickPlay(ev) {
		ev.cancelBubble = true;
		ev.preventDefault();
		queue.playNow(ev.currentTarget.object.id);
	}

	function _onClickQueue(ev) {
		ev.cancelBubble = true;
		ev.preventDefault();
		queue.addAtEnd(ev.currentTarget.object.id);
	}

	function _onClickDir(ev) {
		ev.cancelBubble = true;
		ev.preventDefault();

		var a = ev.currentTarget;

		if (!a.object.replicated) {
			// display loading...
			library.replicate(a.object);
		}
		else
		{
			var li = a.parentNode;
			li.childList.hidden = !li.childList.hidden;
		}
	};

	function _onClickSong(ev) {
		ev.cancelBubble = true;
		ev.preventDefault();
		queue.playNow(ev.currentTarget.object.id);
	}

	library.init(function (err) {
		if (err) throw err;
		_populate(_root, library.getFolders());
	});
};

