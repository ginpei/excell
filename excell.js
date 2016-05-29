function Excell(options) {
	if (this instanceof Excell) {
		this.initialize(options);
	}
	else {
		return Excell.create(options);
	}
}

Object.assign(Excell, {
	KEY_ENTER: 13,
	KEY_ESCAPE: 27,
	KEY_LEFT: 37,
	KEY_UP: 38,
	KEY_RIGHT: 39,
	KEY_DOWN: 40,
	KEY_DELETE: 46,

	create: function(options) {
		var instance = new Excell(options);
		return instance;
	},
});

if (!Object.assign) {
	Object.assign = function(orig) {
		// FIXME
		throw new Error('Object.assign is not implemented.');
	};
}

Object.assign(Excell.prototype, {
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

		elInput.removeEventListener('blur', this._listener_input_blue);

		this.setText(elCell, elInput.value);
		elCell.classList.remove('excell-editing');

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
		this.elInput.blur();
	},

	/**
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
	 * @param {boolean} options.alt
	 * @param {boolean} options.ctrl
	 * @param {boolean} options.meta
	 * @param {boolean} options.shift
	 */
	left: function(options) {
		if (this.status() === 'active') {
			this._moveHorizontally(-1, options);
		}
	},

	/**
	 * @param {boolean} options.alt
	 * @param {boolean} options.ctrl
	 * @param {boolean} options.meta
	 * @param {boolean} options.shift
	 */
	right: function(options) {
		if (this.status() === 'active') {
			this._moveHorizontally(+1, options);
		}
	},

	/**
	 * @param {number} direction
	 * @param {boolean} options.alt
	 * @param {boolean} options.ctrl
	 * @param {boolean} options.meta
	 * @param {boolean} options.shift
	 */
	_moveHorizontally: function(direction, options) {
		var elCur = this.elActiveCell;
		if (!elCur) {
			return;
		}

		if (options && options.ctrl) {
			direction *= Infinity;
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
	 * @param {boolean} options.alt
	 * @param {boolean} options.ctrl
	 * @param {boolean} options.meta
	 * @param {boolean} options.shift
	 */
	up: function(options) {
		if (this.status() === 'active') {
			this._moveVertically(-1, options);
		}
	},

	/**
	 * @param {boolean} options.alt
	 * @param {boolean} options.ctrl
	 * @param {boolean} options.meta
	 * @param {boolean} options.shift
	 */
	down: function(options) {
		if (this.status() === 'active') {
			this._moveVertically(+1, options);
		}
	},

	/**
	 * @param {number} direction
	 * @param {boolean} options.alt
	 * @paran {boolean} options.ctrl
	 * @param {boolean} options.meta
	 * @param {boolean} options.shift
	 */
	_moveVertically: function(direction, options) {
		var elCur = this.elActiveCell;
		if (!elCur) {
			return;
		}

		if (options && options.ctrl) {
			direction *= Infinity;
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
	 * @param {HTMLElement} elCell
	 * @param {string} text
	 */
	setText: function(elCell, text) {
		if (!elCell) {
			elCell = this.elActiveCell;
			if (!elCell) {
				return;
			}
		}

		elCell.textContent = text;
	},

	/**
	 * @param {HTMLElement} elCell
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
		var status = this.status();
		var options = {
			alt: event.altKey,
			ctrl: event.ctrlKey,
			meta: event.metaKey,
			shift: event.shiftKey,
		};

		if (keyCode === Excell.KEY_LEFT) {
			this.left(options);
		}
		else if (keyCode === Excell.KEY_UP) {
			this.up(options);
		}
		else if (keyCode === Excell.KEY_RIGHT) {
			this.right(options);
		}
		else if (keyCode === Excell.KEY_DOWN) {
			this.down(options);
		}
		else if (keyCode === Excell.KEY_ENTER) {
			if (status === 'active') {
				this.edit();
			}
			else if (status == 'editing') {
				this.finishEditing();
			}
		}
		else if (keyCode === Excell.KEY_ESCAPE) {
			this.cancelEditing();
		}
		else if (keyCode === Excell.KEY_DELETE) {
			this.deleteText();
		}
	},
});
