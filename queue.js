function makeQueue(library, subsonic) {
	var _queue = [];
	var _shuffle = false;
	var _curIdx = 0;
	var _root = document.getElementById("queue").children[0];
	var _audio = document.getElementsByTagName("audio")[0];

	function _onClick(ev) {
		ev.cancelBubble = true;
		ev.preventDefault();

		var li = ev.toElement.parentNode;
		var allLi = li.parentNode.childNodes;
		var idx = Array.prototype.indexOf.call(allLi, li);

		_curIdx = idx;
		restart();
	}

	function _render() {
		if (_queue.length === 0) { return; }
		while (_root.firstChild) { _root.removeChild(_root.firstChild); }
		var curId = _queue[_curIdx];

		_.each(_queue, function (id) {
			var item = library.getItem(id);
			var li = document.createElement("li");
			var a = document.createElement("a");
			a.innerText = item.label;
			a.href = "#";
			a.onclick = _onClick;
			li.appendChild(a);
			if (id === curId) { li.className = "playing"; }
			_root.appendChild(li);
		});
	}

	function addAtEnd(id) {
		_queue[_queue.length] = id;
	}

	function addNext(id) {
		if (_queue.length === 0) {
			_queue[0] = id;
		}
		else {
			_queue.splice(_curIdx + 1, 0, id);
		}

		_render();
	}

	function playNow(id) {
		addNext(id);
		playNext();
	}

	function playNext() {
		if (_queue.length === 0) { return; }
		_curIdx = (_curIdx + 1) % _queue.length;
		restart();
	}

	function playPrev() {
		if (_queue.length === 0) { return; }
		_curIdx = (_curIdx - 1 < 0) ? _queue.length - 1 : _curIdx - 1;
		restart();
	}

	function restart() {
		if (_queue.length === 0) { return; }
		subsonic.stream(_queue[_curIdx], _audio);
		_render();
	}

	function playPause() {}

	function _onPlayFinish(id) {
		playNext();
	}

	function _onPlayStart(id) {

	}
	
	return {
		addAtEnd : addAtEnd,
		addNext : addNext,
		playNow : playNow,
		playNext : playNext,
		playPrev : playPrev,
		playPause : playPause,
		restart : restart,
	};
}

