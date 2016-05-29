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
			textContent: elCell.textContent,
			width: elCell.clientWidth,
		};

		var elInput = document.createElement('input');

		elInput.value = settings.textContent;
		elInput.originalValue = settings.textContent;
		elInput.className = settings.className;
		elInput.style.width = settings.width + 'px';
		elInput.style.height = settings.height + 'px';

		var listener = function(event) {
			this._finishEditing();
			elInput.removeEventListener('blur', listener);
		}.bind(this);
		elInput.addEventListener('blur', listener);

		return elInput;
	},

	/**
	 */
	_finishEditing: function() {
		var elCell = this.elEditingCell;
		var elInput = this.elInput;

		elCell.textContent = elInput.value;
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
	 * @param {Event} event
	 * @returns {HTMLElement}
	 */
	_findEventCell: function(event) {
		var elTarget = event.target;
		var elCell = elTarget.closest('td,th');
		return elCell;
	},

	/**
	 */
	left: function() {
		if (this.status() === 'active') {
			this._moveHorizontally(-1);
		}
	},

	/**
	 */
	right: function() {
		if (this.status() === 'active') {
			this._moveHorizontally(+1);
		}
	},

	/**
	 * @param {number} direction
	 */
	_moveHorizontally: function(direction) {
		var elCur = this.elActiveCell;
		if (!elCur) {
			return;
		}

		var elRow = elCur.parentElement;
		var index = Array.from(elRow.children).indexOf(elCur);
		var elNext = elRow.children[index + direction];
		if (elNext) {
			this.select(elNext);
		}
	},

	/**
	 */
	up: function() {
		if (this.status() === 'active') {
			this._moveVertically(-1);
		}
	},

	/**
	 */
	down: function() {
		if (this.status() === 'active') {
			this._moveVertically(+1);
		}
	},

	/**
	 * @param {number} direction
	 */
	_moveVertically: function(direction) {
		var elCur = this.elActiveCell;
		if (!elCur) {
			return;
		}

		var elRow = elCur.parentElement;
		var elTable = elRow.parentElement;
		var hIndex = Array.from(elRow.children).indexOf(elCur);
		var vIndex = Array.from(elTable.children).indexOf(elRow);
		var elNextRow = elTable.children[vIndex + direction];
		if (elNextRow) {
			var elNext = elNextRow.children[hIndex];
			if (elNext) {
				this.select(elNext);
			}
		}
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
		if (keyCode === Excell.KEY_LEFT) {
			this.left();
		}
		else if (keyCode === Excell.KEY_UP) {
			this.up();
		}
		else if (keyCode === Excell.KEY_RIGHT) {
			this.right();
		}
		else if (keyCode === Excell.KEY_DOWN) {
			this.down();
		}
		else if (keyCode === Excell.KEY_ENTER) {
			this.edit();
		}
		else if (keyCode === Excell.KEY_ESCAPE) {
			this.cancelEditing();
		}
	},
});
