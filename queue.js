function makeQueue(library, subsonic) {
	var _queue = []; // ids, can include directories which will be expanded on demand
	var _shuffle = false;
	var _curIdx = 0;
	var _div = document.getElementById("queue");
	var _ul = _div.children[0];
	var _audio = document.getElementsByTagName("audio")[0];
	var _replicationWaitingId = -1;

	library.listenReplicated(_onReplicate);
	_audio.onended = _onPlayFinish;

	function _onClick(ev) {
		ev.cancelBubble = true;
		ev.preventDefault();

		var li = ev.toElement.parentNode;
		var allLi = li.parentNode.childNodes;
		var idx = Array.prototype.indexOf.call(allLi, li);

		_curIdx = idx;
		restart();
	}

	function _onReplicate(item) {
		if (_replicationWaitingId === item.id) {
			_replicationWaitingId = -1;
			restart();
		}
	}

	function _scrollToPlaying() {
		var li = _ul.children[_curIdx];
		var liRect = li.getBoundingClientRect();
		var divRect = _div.getBoundingClientRect();

		if (liRect.right > divRect.right) {
			_div.scrollLeft += liRect.left * 0.5;
		}
	}

	function _render() {
		var scroll = _div.scrollLeft;
		while (_ul.firstChild) { _ul.removeChild(_ul.firstChild); }
		if (_queue.length === 0) { return; }

		_.each(_queue, function (id, i) {
			var item = library.getItem(id);
			var li = document.createElement("li");
			var a = document.createElement("a");
			a.innerText = item.label;
			a.href = "#";
			a.onclick = _onClick;
			li.appendChild(a);
			if (i === _curIdx) { li.className = "playing"; }

			if (item.isDir) {
				a.innerText = "..." + a.innerText + "...";
			}

			_ul.appendChild(li);
		});

		_div.scrollLeft = scroll;
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
		// var idx = _queue.indexOf(id);
		// if (idx === -1) {
			addNext(id);
			playNext();
		// }
		// else {
		// 	_curIdx = idx;
		// 	restart();
		// }
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
			_scrollToPlaying();
		}
		else {
			// expand directories on demand
			if (item.replicated) {
				remove(_curIdx);
				var origIdx = _curIdx;
				_.each(item.children, function (item) {
					_addAtIdx(item.id, _curIdx, false);
					_curIdx++;
				});
				_curIdx = origIdx;
				restart();
			}
			else {
				// wait til it's replicated
				pause();
				_replicationWaitingId = item.id;
				library.replicate(item);
			}
		}

		_render();
	}

	function remove(idx) {
		if (idx >= queue.length ) { return; }
		if (_curIdx > idx) { _curIdx--; }
		_queue.splice(idx, 1);
		if (_curIdx == idx) {
			restart();
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

