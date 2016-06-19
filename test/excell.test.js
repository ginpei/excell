/* eslint no-unused-expressions:off */  // for `expect().to.be.true`
/* global require */
/* global describe it beforeEach afterEach */

var expect = require('chai').expect;
var fs = require('fs');
var jsdom = require('jsdom');

describe('ExCell', ()=>{
	var ExCell;
	var excell;
	var el;
	var document;

	beforeEach((done)=>{
		jsdom.env({
			html: fs.readFileSync('test/excell.test.html', 'utf-8'),
			src: [
				fs.readFileSync('./excell.js', 'utf-8'),
			],
			done: (err, window)=>{
				if (err) {
					throw err;
				}

				ExCell = window.ExCell;
				el = window.document.querySelector('table');
				document = window.document;

				excell = ExCell.create({
					el: el,
				});

				done();
			},
		});
	});

	afterEach(()=>{
		excell.destroy();
	});

	it('adds a class to a target table', ()=>{
		expect(el.classList.contains('excell-table')).to.be.true;
	});

	describe('select(elCell)', ()=>{
		describe('just calling', ()=>{
			var elCell;

			beforeEach(()=>{
				elCell = document.querySelector('#cell-5');
				excell.select(elCell);
			});

			it('selects the specified cell', ()=>{
				expect(elCell.classList.contains('excell-active')).to.be.true;
			});
		});

		describe('calling with null', ()=>{
			var elCell;

			beforeEach(()=>{
				elCell = document.querySelector('#cell-5');
				excell.select(elCell);
				excell.select(null);
			});

			it('deselects the specified cell', ()=>{
				expect(elCell.classList.contains('excell-active')).to.be.false;
			});
		});

		describe('calling after selecting', ()=>{
			var elCell1;
			var elCell2;

			beforeEach(()=>{
				elCell1 = document.querySelector('#cell-5');
				elCell2 = document.querySelector('#cell-6');
				excell.select(elCell1);
				excell.select(elCell2);
			});

			it('deactivates the last active cell and select the next one', ()=>{
				expect(elCell1.classList.contains('excell-active')).to.be.false;
				expect(elCell2.classList.contains('excell-active')).to.be.true;
			});
		});
	});

	describe('Edit', ()=>{
		describe('edit(elCell)', ()=>{
			var elCell1;

			beforeEach(()=>{
				elCell1 = document.querySelector('#cell-5');
				elCell1.textContent = 'edit123';

				excell.edit(elCell1);
			});

			it('captures the cell element', ()=>{
				expect(excell.elEditingCell).to.equal(elCell1);
			});

			it('replaces its content', ()=>{
				expect(excell.elEditingCell.childNodes.length).to.equal(1);
			});

			it('puts one input with its text content', ()=>{
				var elInput = excell.elEditingCell.firstChild;
				expect(elInput.tagName.toLowerCase()).to.equal('input');
				expect(elInput.value).to.equal('edit123');
			});

			it('captures the input element', ()=>{
				var elInput = excell.elEditingCell.firstChild;
				expect(excell.elInput).to.equal(elInput);
			});

			it('sets a class', ()=>{
				expect(elCell1.classList.contains('excell-editing')).to.be.true;
			});
		});

		describe('edit() with an active cell', ()=>{
			var elCell1;

			beforeEach(()=>{
				elCell1 = document.querySelector('#cell-5');

				excell.select(elCell1);
				excell.edit();
			});

			it('captures the cell element', ()=>{
				expect(excell.elEditingCell).to.equal(elCell1);
			});
		});

		describe('edit() with any active cells', ()=>{
			beforeEach(()=>{
				excell.select(null);
				excell.edit();
			});

			it('does not capture any cells', ()=>{
				expect(excell.elEditingCell).to.equal(undefined);
			});

			it('does not create an input element', ()=>{
				expect(excell.elInput).to.equal(undefined);
			});
		});

		describe('creating an input element', ()=>{
			var elCell1;

			beforeEach(()=>{
				elCell1 = document.querySelector('#cell-5');
				elCell1.textContent = 'edit123';
				elCell1.clientWidth = 123;
				elCell1.clientHeight = 124;

				excell.edit(elCell1);
			});

			it('sets a class name', ()=>{
				expect(excell.elInput.classList.contains('excell-input')).to.be.true;
			});

			it('copies text of the cell', ()=>{
				expect(excell.elInput.value).to.equal('edit123');
			});

			it('contains original text of the cell', ()=>{
				expect(excell.elInput.originalValue).to.equal('edit123');
			});

			it('copies size of the cell', ()=>{
				expect(excell.elInput.style.width).to.equal('123px');
				expect(excell.elInput.style.height).to.equal('124px');
			});
		});

		describe('finishEditing()', ()=>{
			var elCell1;

			beforeEach(()=>{
				elCell1 = document.querySelector('#cell-5');
				elCell1.textContent = 'edit123';

				excell.edit(elCell1);
				excell.elInput.value = 'edited!';
				excell.finishEditing();
			});

			it('replaces an input element with the result text', ()=>{
				expect(elCell1.childNodes.length).to.equal(1);
				expect(elCell1.firstChild.nodeType).to.equal(elCell1.TEXT_NODE);
			});

			it('is given the input text', ()=>{
				expect(elCell1.firstChild.nodeValue).to.equal('edited!');
			});

			it('removes a class name', ()=>{
				expect(elCell1.classList.contains('excell-editing')).to.false;
			});

			it('clears a captured cell element', ()=>{
				expect(excell.elEditingCell).to.equal(null);
			});

			it('clears a captured input element', ()=>{
				expect(excell.elInput).to.equal(null);
			});
		});
	});

	describe('cancelEditing()', ()=>{
		it('...');
	});

	describe('move', ()=>{
		describe('left()', ()=>{
			it('...');
		});

		describe('right()', ()=>{
			it('...');
		});

		describe('up()', ()=>{
			it('...');
		});

		describe('down()', ()=>{
			it('...');
		});
	});

	describe('setText()', ()=>{
		it('...');
	});

	describe('getText()', ()=>{
		it('...');
	});

	describe('events', ()=>{
		describe('...', ()=>{
			it('...');
		});
	});
});
