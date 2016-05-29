function Excell(options) {
	if (this instanceof Excell) {
		this.initialize(options);
	}
	else {
		return Excell.create(options);
	}
}

Excell.create = function(options) {
	var instance = new Excell(options);
	return instance;
};

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
	},

	/**
	 * @param {HTMLElement} elCell
	 */
	startEdit: function(elCell) {
		var elInput = this._createElInput(elCell);
		elCell.innerHTML = '';
		elCell.appendChild(elInput);
		elCell.classList.add('excell-active');
		elInput.select();

		this.elCurCell = elCell;
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
		var elCell = this.elCurCell;
		var elInput = this.elInput;

		elCell.textContent = elInput.value;
		elCell.classList.remove('excell-active');

		this.elCurCell = null;
		this.elInput = null;
	},

	/**
	 * @param {Event} event
	 */
	el_click: function(event) {
		var elTarget = event.target;
		var elCell = elTarget.closest('td,th');
		if (elCell) {
			this.startEdit(elCell);
		}
	},
});
