function ExCell(options) {
	if (this instanceof ExCell) {
		this.initialize(options);
	}
	else {
		return ExCell.create(options);
	}
}

Object.assign(ExCell, {
	create: function(options) {
		var instance = new ExCell(options);
		return instance;
	},
});

if (!Object.assign) {
	Object.assign = function(orig) {
		// FIXME
		throw new Error('Object.assign is not implemented.');
	};
}

Object.assign(ExCell.prototype, {
	KEY: {
		tab: 9,
		enter: 13,
		escape: 27,
		pageup: 33,
		pagedown: 34,
		end: 35,
		home: 36,
		left: 37,
		up: 38,
		right: 39,
		down: 40,
		delete: 46,
	},

	/**
	 * @param {HTMLElement} options.el
	 */
	initialize: function(options) {
		this.el = options.el;

		this.el.classList.add('excell-table');

		this._bind();
	},

	/**
	 * @see #initialize
	 */
	_bind: function() {
		var el = this.el;
		el.addEventListener('click', this.el_click.bind(this));
		el.addEventListener('dblclick', this.el_dblclick.bind(this));
		document.addEventListener('click', this.document_click.bind(this));
		document.addEventListener('keypress', this.document_keypress.bind(this));
	},

	/**
	 */
	destroy: function() {
		// TODO: implement here
	},

	/**
	 * @returns {string}
	 */
	status: function() {
		var status;
		if (this.elInput) {
			status = 'editing';
		}
		else if (this.elActiveCell) {
			status = 'active';
		}
		else {
			status = 'ready';
		}
		return status;
	},

	/**
	 * @param {HTMLElement} elCell
	 */
	select: function(elCell) {
		if (this.elActiveCell) {
			this.elActiveCell.classList.remove('excell-active');
		}

		if (elCell) {
			elCell.classList.add('excell-active');
		}

		this.elActiveCell = elCell;
	},

	/**
	 * @param {HTMLElement} elCell
	 */
	edit: function(elCell) {
		if (!elCell) {
			elCell = this.elActiveCell;

			if (!elCell) {
				return;
			}
		}

		var elInput = this._createElInput(elCell);
		elCell.innerHTML = '';
		elCell.appendChild(elInput);
		elCell.classList.add('excell-editing');
		elInput.select();

		this.elEditingCell = elCell;
		this.elInput = elInput;
	},

	/**
	 * @param {HTMLElement} elCell
	 * @returns {HTMLElement}
	 */
	_createElInput: function(elCell) {
		var settings = {
			className: 'excell-input',
			height: elCell.clientHeight,
			textContent: this.getText(elCell),
			width: elCell.clientWidth,
		};

		var elInput = document.createElement('input');

		elInput.value = settings.textContent;
		elInput.originalValue = settings.textContent;
		elInput.className = settings.className;
		elInput.style.width = settings.width + 'px';
		elInput.style.height = settings.height + 'px';

		this._listener_input_blur = function(event) {
			this.finishEditing();
		}.bind(this);
		elInput.addEventListener('blur', this._listener_input_blue);

		return elInput;
	},

	/**
	 */
	finishEditing: function() {
		var elCell = this.elEditingCell;
		var elInput = this.elInput;

		if (elCell) {
			elCell.classList.remove('excell-editing');
		}

		if (elInput) {
			elInput.removeEventListener('blur', this._listener_input_blue);

			this.setText(elCell, elInput.value);
		}

		this.elEditingCell = null;
		this.elInput = null;
	},

	/**
	 */
	cancelEditing: function() {
		if (!this.elInput) {
			return;
		}

		this.elInput.value = this.elInput.originalValue;
		this.finishEditing();
	},

	/**
	 * @param {HTMLElement} [elCell] Default is a current active cell.
	 */
	deleteText: function(elCell) {
		if (!elCell) {
			elCell = this.elActiveCell;

			if (!elCell) {
				return;
			}
		}

		elCell.textContent = '';
	},

	/**
	 */
	left: function() {
		this._moveHorizontally(-1);
	},

	leftEnd: function() {
		this._moveHorizontally(-Infinity);
	},

	/**
	 */
	right: function() {
		this._moveHorizontally(+1);
	},

	/**
	 */
	rightEnd: function() {
		this._moveHorizontally(Infinity);
	},

	/**
	 * @param {number} direction `1`, `-1`, `Infinity` or `-Infinity`.
	 */
	_moveHorizontally: function(direction) {
		if (this.status() !== 'active') {
			return;
		}

		var elCur = this.elActiveCell;
		if (!elCur) {
			return;
		}

		var index;
		var elRow = elCur.parentElement;
		if (direction === Infinity) {
			index = elRow.children.length - 1;
		}
		else if (direction === -Infinity) {
			index = 0;
		}
			else {
			var curIndex = Array.from(elRow.children).indexOf(elCur);
			index = curIndex + direction;
		}

		var elNext = elRow.children[index];
		if (elNext) {
			this.select(elNext);
		}
	},

	/**
	 */
	up: function() {
		this._moveVertically(-1);
	},

	/**
	 */
	top: function() {
		this._moveVertically(-Infinity);
	},

	/**
	 */
	down: function(options) {
		this._moveVertically(+1);
	},

	/**
	 */
	bottom: function(options) {
		this._moveVertically(Infinity);
	},

	/**
	 * @param {number} direction
	 */
	_moveVertically: function(direction) {
		if (this.status() !== 'active') {
			return;
		}

		var elCur = this.elActiveCell;
		if (!elCur) {
			return;
		}

		var vIndex;
		var elRow = elCur.parentElement;
		var elTable = elRow.parentElement;
		var hIndex = Array.from(elRow.children).indexOf(elCur);
		if (direction === Infinity) {
			vIndex = elTable.children.length - 1;
		}
		else if (direction === -Infinity) {
			vIndex = 0;
		}
			else {
			var vCurIndex = Array.from(elTable.children).indexOf(elRow);
			vIndex = vCurIndex + direction;
		}

		var elNextRow = elTable.children[vIndex];
		if (elNextRow) {
			var elNext = elNextRow.children[hIndex];
			if (elNext) {
				this.select(elNext);
			}
		}
	},

	/**
	 * @param {HTMLElement} [elCell] Default is a current active cell
	 * @param {string} text
	 */
	setText: function(elCell, text) {
		if (elCell && text === undefined) {
			text = elCell;
			elCell = null;
		}

		if (!elCell) {
			elCell = this.elActiveCell;
			if (!elCell) {
				return;
			}
		}

		elCell.textContent = text;
	},

	/**
	 * @param {HTMLElement} [elCell] Default is a current active cell
	 * @returns {string}
	 */
	getText: function(elCell) {
		if (!elCell) {
			elCell = this.elActiveCell;
			if (!elCell) {
				return;
			}
		}

		return elCell.textContent;
	},

	/**
	 * @param {Event} event
	 * @returns {HTMLElement}
	 */
	_findEventCell: function(event) {
		var elTarget = event.target;
		var elCell = elTarget.closest('td,th');
		return elCell;
	},

	/**
	 * @param {Event} event
	 */
	el_click: function(event) {
		var elCell = this._findEventCell(event);
		if (elCell) {
			this.select(elCell);
		}
	},

	/**
	 * @param {Event} event
	 */
	el_dblclick: function(event) {
		var elCell = this._findEventCell(event);
		if (elCell) {
			this.edit(elCell);
		}
	},

	/**
	 * @param {Event} event
	 */
	document_click: function(event) {
		var elCell = this._findEventCell(event);
		if (elCell !== this.elActiveCell) {
			this.select();
		}
	},

	/**
	 * @param {Event} event
	 */
	document_keypress: function(event) {
		var keyCode = event.keyCode;
		var options = {
			alt: event.altKey,
			ctrl: event.ctrlKey,
			meta: event.metaKey,
			shift: event.shiftKey,
		};

		var KEY = this.KEY;
		for (var keyName in this.KEY) {
			if (keyCode === KEY[keyName]) {
				event.preventDefault();
				var functionName = 'document_keypress_' + keyName;
				if (this[functionName]) {
					this[functionName](options);
				}
				break;
			}
		}
	},

	/**
	 * @param {object} options
	 * @see #document_keypress
	 */
	document_keypress_tab: function(options) {
		if (this.status() === 'editing') {
			this.finishEditing();
			if (options.shift) {
				this.left();
			}
			else {
				this.right();
			}
			this.edit();
		}
	},

	/**
	 * @param {object} options
	 * @see #document_keypress
	 */
	document_keypress_enter: function(options) {
		var status = this.status();
		if (status === 'active') {
			this.edit();
		}
		else if (status == 'editing') {
			this.finishEditing();
		}
	},

	/**
	 * @param {object} options
	 * @see #document_keypress
	 */
	document_keypress_escape: function(options) {
		this.cancelEditing();
	},

	/**
	 * @param {object} options
	 * @see #document_keypress
	 */
	document_keypress_end: function(options) {
		if (options.ctrl) {
			this.bottom();
		}
		this.rightEnd();
	},

	/**
	 * @param {object} options
	 * @see #document_keypress
	 */
	document_keypress_home: function(options) {
		if (options.ctrl) {
			this.top();
		}
		this.leftEnd();
	},

	/**
	 * @param {object} options
	 * @see #document_keypress
	 */
	document_keypress_left: function(options) {
		if (options.ctrl) {
			this.leftEnd();
		}
		else {
			this.left();
		}
	},

	/**
	 * @param {object} options
	 * @see #document_keypress
	 */
	document_keypress_up: function(options) {
		if (options.ctrl) {
			this.top();
		}
		else {
			this.up();
		}
	},

	/**
	 * @param {object} options
	 * @see #document_keypress
	 */
	document_keypress_right: function(options) {
		if (options.ctrl) {
			this.rightEnd();
		}
		else {
			this.right();
		}
	},

	/**
	 * @param {object} options
	 * @see #document_keypress
	 */
	document_keypress_down: function(options) {
		if (options.ctrl) {
			this.bottom();
		}
		else {
			this.down();
		}
	},

	/**
	 * @param {object} options
	 * @see #document_keypress
	 */
	document_keypress_delete: function(options) {
		this.deleteText();
	},
});
