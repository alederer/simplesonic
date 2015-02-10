function makeQueue(library, subsonic) {
	var _queue = []; // ids, can include directories which will be expanded on demand
	var _shuffle = false;
	var _curIdx = 0;
	var _root = document.getElementById("queue");
	var _audio = document.getElementsByTagName("audio")[0];
	var _replicationWaitingId = -1;

	library.listenReplicated(_onReplicate);
	_audio.onended = _onPlayFinish;

	function _onClickPlay(ev) {
		ev.cancelBubble = true;
		ev.preventDefault();
		var node = ev.toElement;
		while (node.tagName != "A") { node = node.parentNode; }

		var all = node.parentNode.children;
		var idx = Array.prototype.indexOf.call(all, node);

		_curIdx = idx;
		restart();
	}

	function _onClickRemove(ev) {
		ev.cancelBubble = true;
		ev.preventDefault();
		var node = ev.toElement;
		while (node.tagName != "A") { node = node.parentNode; }

		var all = node.parentNode.children;
		var idx = Array.prototype.indexOf.call(all, node);

		remove(idx);
	}

	function _onReplicate(item) {
		if (_replicationWaitingId === item.id) {
			_replicationWaitingId = -1;
			restart();
		}
	}

	function _scrollToPlaying() {
		var node = _root.children[_curIdx];
		var nodeRect = node.getBoundingClientRect();
		var rootRect = _root.getBoundingClientRect();

		if (nodeRect.right > rootRect.right) {
			_root.scrollLeft += nodeRect.left * 0.5;
		}
		else if (nodeRect.left < rootRect.left) {
			_root.scrollLeft += nodeRect.left - rootRect.width * 0.5;
		}
	}

	function _render() {
		var scroll = _root.scrollLeft;
		while (_root.firstChild) { _root.removeChild(_root.firstChild); }
		if (_queue.length === 0) { return; }

		_.each(_queue, function (id, i) {
			var item = library.getItem(id);
			var node = document.createElement("a");
			node.href = "#";
			node.onclick = _onClickPlay;

			var title = document.createElement("h1");
			title.innerText = item.label;
			node.appendChild(title);

			if (i === _curIdx) { node.className += " playing"; }
			if (item.isDir) {
				node.className += " folder";
			}
			else {
				var artist = document.createElement("h2");
				artist.innerText = item.artist;
				node.appendChild(artist);
			}

			var remove = document.createElement("div");
			remove.innerText = "X";
			remove.className += " hoveronly";
			remove.onclick = _onClickRemove;
			node.appendChild(remove);

			_root.appendChild(node);
		});

		_root.scrollLeft = scroll;
	}

	function _addAtIdx(id, idx, dontrender) {
		if (arguments.length === 2) { dontrender = false; }
		_queue.splice(idx, 0, id);
		_render();
	}

	function addAtEnd(id) {
		_addAtIdx(id, _queue.length);
	}

	function addNext(id) {
		_addAtIdx(id, _queue.length === 0 ? _curIdx : _curIdx + 1);
	}

	function playNow(id) {
		// @TODO: is it ever good behavior to skip to the song? example of bad case:
		// i forget, but it happened - try to remember/keep an eye out
		
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
		_replicationWaitingId = -1;

		var item = library.getItem(_queue[_curIdx]);

		if (!item.isDir) {
			subsonic.stream(_queue[_curIdx], _audio);
		}
		else {
			// expand directories on demand
			if (item.replicated) {
				var origIdx = _curIdx;
				_.each(item.children, function (item) {
					_curIdx++;
					_addAtIdx(item.id, _curIdx, false);
				});
				_curIdx = origIdx;
				remove(_curIdx);
			}
			else {
				// wait til it's replicated
				pause();
				_replicationWaitingId = item.id;
				library.replicate(item);
			}
		}

		_scrollToPlaying();
		_render();
	}

	function remove(idx) {
		if (idx >= queue.length ) { return; }

		var mustRestart = idx === _curIdx;
		if (_curIdx > idx) { _curIdx--; }
		_queue.splice(idx, 1);

		if (mustRestart) {
			restart();
		}
		else {
			_render();
		}

	}

	function playPause() {}

	function pause() {
		_audio.pause();
	}

	function _onPlayFinish(id) {
		playNext();
	}

	function _onPlayStart(id) {

	}

	function clear() {
		_audio.pause();
		_queue = []
		_curIdx = 0;
		_replicationWaitingId = -1;
		_render();
	}
	
	return {
		addAtEnd : addAtEnd,
		addNext : addNext,
		playNow : playNow,
		playNext : playNext,
		playPrev : playPrev,
		playPause : playPause,
		restart : restart,
		getQueue : function () { return _queue; },
		clear : clear,
	};
}

