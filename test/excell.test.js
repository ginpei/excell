/* eslint no-unused-expressions:off */  // for `expect().to.be.true`
/* global require */
/* global describe it beforeEach afterEach */

var expect = require('chai').expect;
var fs = require('fs');
var jsdom = require('jsdom');

describe('ExCell', ()=>{
	var ExCell;
	var excell;
	var elTable;
	// var elCell1;
	var elCell2;
	// var elCell3;
	var elCell4;
	var elCell5;
	var elCell6;
	// var elCell7;
	var elCell8;
	// var elCell9;
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
				document = window.document;
				elTable = document.querySelector('#table');
				// elCell1 = document.querySelector('#cell-1');
				elCell2 = document.querySelector('#cell-2');
				// elCell3 = document.querySelector('#cell-3');
				elCell4 = document.querySelector('#cell-4');
				elCell5 = document.querySelector('#cell-5');
				elCell6 = document.querySelector('#cell-6');
				// elCell7 = document.querySelector('#cell-7');
				elCell8 = document.querySelector('#cell-8');
				// elCell9 = document.querySelector('#cell-9');

				excell = ExCell.create({
					el: elTable,
				});

				done();
			},
		});
	});

	afterEach(()=>{
		excell.destroy();
	});

	describe('Constructor', ()=>{
		it('adds a class to a target table', ()=>{
			expect(elTable.classList.contains('excell-table')).to.be.true;
		});

		describe('options.getText', ()=>{
			var result;

			beforeEach(()=>{
				excell = ExCell.create({
					el: elTable,
					getText: function(elCell) {
						return elCell.textContent.toUpperCase();
					},
				});

				elCell5.textContent = 'cell5';
				result = excell.getText(elCell5);
			});

			it('is used', ()=>{
				expect(result).to.equal('CELL5');
			});
		});

		describe('options.setText', ()=>{
			beforeEach(()=>{
				excell = ExCell.create({
					el: elTable,
					setText: function(elCell, text) {
						elCell.textContent = text.toUpperCase();
					},
				});

				excell.setText(elCell5, 'cell5');
			});

			it('is used', ()=>{
				expect(elCell5.textContent).to.equal('CELL5');
			});
		});
	});

	describe('Select', ()=>{
		describe('select(elCell)', ()=>{
			beforeEach(()=>{
				excell.select(elCell5);
			});

			it('selects the specified cell', ()=>{
				expect(elCell5.classList.contains('excell-active')).to.be.true;
			});
		});

		describe('select(null)', ()=>{
			beforeEach(()=>{
				excell.select(elCell5);
				excell.select(null);
			});

			it('deselects the specified cell', ()=>{
				expect(elCell5.classList.contains('excell-active')).to.be.false;
			});
		});

		describe('select(elCell) after selecting', ()=>{
			beforeEach(()=>{
				excell.select(elCell5);
				excell.select(elCell6);
			});

			it('deactivates the last active cell and select the next one', ()=>{
				expect(elCell5.classList.contains('excell-active')).to.be.false;
				expect(elCell6.classList.contains('excell-active')).to.be.true;
			});
		});
	});

	describe('Edit', ()=>{
		describe('edit(elCell)', ()=>{
			beforeEach(()=>{
				elCell5.textContent = 'edit123';

				excell.edit(elCell5);
			});

			it('captures the cell element', ()=>{
				expect(excell.elEditingCell).to.equal(elCell5);
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
				expect(elCell5.classList.contains('excell-editing')).to.be.true;
			});
		});

		describe('edit() with an active cell', ()=>{
			beforeEach(()=>{
				excell.select(elCell5);
				excell.edit();
			});

			it('captures the cell element', ()=>{
				expect(excell.elEditingCell).to.equal(elCell5);
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
			beforeEach(()=>{
				elCell5.textContent = 'edit123';
				elCell5.clientWidth = 123;
				elCell5.clientHeight = 124;

				excell.edit(elCell5);
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
			beforeEach(()=>{
				elCell5.textContent = 'edit123';

				excell.edit(elCell5);
				excell.elInput.value = 'edited!';
				excell.finishEditing();
			});

			it('replaces an input element with the result text', ()=>{
				expect(elCell5.childNodes.length).to.equal(1);
				expect(elCell5.firstChild.nodeType).to.equal(elCell5.TEXT_NODE);
			});

			it('is given the input text', ()=>{
				expect(elCell5.firstChild.nodeValue).to.equal('edited!');
			});

			it('removes a class name', ()=>{
				expect(elCell5.classList.contains('excell-editing')).to.false;
			});

			it('clears a captured cell element', ()=>{
				expect(excell.elEditingCell).to.equal(null);
			});

			it('clears a captured input element', ()=>{
				expect(excell.elInput).to.equal(null);
			});
		});

		describe('finishEditing() before editing', ()=>{
			beforeEach(()=>{
				elCell5.textContent = 'edit123';

				excell.finishEditing();
			});

			it('does not throw any errors', ()=>{
				// no errors
			});
		});

		describe('cancelEditing()', ()=>{
			beforeEach(()=>{
				elCell5.textContent = 'edit123';

				excell.edit(elCell5);
				excell.elInput.value = 'edited!';
				excell.cancelEditing();
			});

			it('restores the original text', ()=>{
				expect(elCell5.firstChild.nodeValue).to.equal('edit123');
			});
		});

		describe('cancelEditing() before editing', ()=>{
			beforeEach(()=>{
				excell.cancelEditing();
			});

			it('does not throw any errors', ()=>{
				// no errors
			});
		});
	});

	describe('Delete', ()=>{
		describe('deleteText()', ()=>{
			beforeEach(()=>{
				elCell5.textContent = 'cell5';
				excell.select(elCell5);

				excell.deleteText();
			});

			it('empties a current cell', ()=>{
				expect(elCell5.textContent).to.empty;
			});
		});

		describe('deleteText(elCell)', ()=>{
			beforeEach(()=>{
				elCell5.textContent = 'cell5';
				elCell6.textContent = 'cell6';
				excell.select(elCell5);

				excell.deleteText(elCell6);
			});

			it('empties a specified cell', ()=>{
				expect(elCell6.textContent).to.empty;
			});

			it('does not empty a current cell', ()=>{
				expect(elCell5.textContent).to.equal('cell5');
			});
		});

		describe('deleteText() before selecting', ()=>{
			beforeEach(()=>{
				excell.deleteText();
			});

			it('does not throws errors', ()=>{
				// do nothing
			});
		});
	});

	describe('Move', ()=>{
		describe('left()', ()=>{
			beforeEach(()=>{
				excell.select(elCell5);

				excell.left();
			});

			it('captures the left side cell', ()=>{
				expect(excell.elActiveCell).to.equal(elCell4);
			});

			it('removes a class name from the latest cell', ()=>{
				expect(elCell5.classList.contains('excell-active')).to.false;
			});

			it('adds a class name to the next cell', ()=>{
				expect(elCell4.classList.contains('excell-active')).to.true;
			});
		});

		describe('left() at the left end cell', ()=>{
			beforeEach(()=>{
				excell.select(elCell4);

				excell.left();
			});

			it('leaves a current cell', ()=>{
				expect(excell.elActiveCell).to.equal(elCell4);
			});
		});

		describe('leftEnd()', ()=>{
			beforeEach(()=>{
				excell.select(elCell6);

				excell.leftEnd();
			});

			it('moves a current cell to the left end one', ()=>{
				expect(excell.elActiveCell).to.equal(elCell4);
			});
		});

		describe('right()', ()=>{
			beforeEach(()=>{
				excell.select(elCell5);

				excell.right();
			});

			it('moves a current cell to the right side one', ()=>{
				expect(excell.elActiveCell).to.equal(elCell6);
			});
		});

		describe('right() at the right end cell', ()=>{
			beforeEach(()=>{
				excell.select(elCell6);

				excell.right();
			});

			it('leaves a current cell', ()=>{
				expect(excell.elActiveCell).to.equal(elCell6);
			});
		});

		describe('rightEnd()', ()=>{
			beforeEach(()=>{
				excell.select(elCell4);

				excell.rightEnd();
			});

			it('moves a current cell to the right end one', ()=>{
				expect(excell.elActiveCell).to.equal(elCell6);
			});
		});

		describe('up()', ()=>{
			beforeEach(()=>{
				excell.select(elCell5);

				excell.up();
			});

			it('moves a current cell to the above one', ()=>{
				expect(excell.elActiveCell).to.equal(elCell2);
			});
		});

		describe('up() at the up end cell', ()=>{
			beforeEach(()=>{
				excell.select(elCell2);

				excell.up();
			});

			it('leaves a current cell', ()=>{
				expect(excell.elActiveCell).to.equal(elCell2);
			});
		});

		describe('top()', ()=>{
			beforeEach(()=>{
				excell.select(elCell8);

				excell.top();
			});

			it('moves a current cell to the top one', ()=>{
				expect(excell.elActiveCell).to.equal(elCell2);
			});
		});

		describe('down()', ()=>{
			beforeEach(()=>{
				excell.select(elCell5);

				excell.down();
			});

			it('moves a current cell to the under one', ()=>{
				expect(excell.elActiveCell).to.equal(elCell8);
			});
		});

		describe('down() at the down end cell', ()=>{
			beforeEach(()=>{
				excell.select(elCell8);

				excell.down();
			});

			it('leaves a current cell', ()=>{
				expect(excell.elActiveCell).to.equal(elCell8);
			});
		});

		describe('bottom()', ()=>{
			beforeEach(()=>{
				excell.select(elCell2);

				excell.bottom();
			});

			it('moves a current cell to the bottom one', ()=>{
				expect(excell.elActiveCell).to.equal(elCell8);
			});
		});
	});

	describe('Text', ()=>{
		describe('setText(elCell, text)', ()=>{
			beforeEach(()=>{
				elCell5.textContent = 'cell5';

				excell.setText(elCell5, 'text');
			});

			it('updates the specified cell', ()=>{
				expect(elCell5.textContent).to.equal('text');
			});
		});

		describe('setText(null, text) after selecting', ()=>{
			beforeEach(()=>{
				elCell5.textContent = 'cell5';

				excell.select(elCell5);
				excell.setText(null, 'text');
			});

			it('updates a current cell', ()=>{
				expect(elCell5.textContent).to.equal('text');
			});
		});

		describe('setText(null, text) before selecting', ()=>{
			beforeEach(()=>{
				excell.setText(null, 'text');
			});

			it('does not throw errors', ()=>{
				// do nothing
			});
		});

		describe('setText(text) after selecting', ()=>{
			beforeEach(()=>{
				elCell5.textContent = 'cell5';

				excell.select(elCell5);
				excell.setText('text');
			});

			it('updates a current cell', ()=>{
				expect(elCell5.textContent).to.equal('text');
			});
		});

		describe('getText(elCell)', ()=>{
			var result;

			beforeEach(()=>{
				elCell5.textContent = 'cell5';
				result = excell.getText(elCell5);
			});

			it('returns a text which the specified element contains', ()=>{
				expect(result).to.equal('cell5');
			});
		});

		describe('getText() after selecting', ()=>{
			var result;

			beforeEach(()=>{
				elCell5.textContent = 'cell5';
				excell.select(elCell5);
				result = excell.getText();
			});

			it('returns a text which a current element contains', ()=>{
				expect(result).to.equal('cell5');
			});
		});

		describe('getText() before selecting', ()=>{
			var result;

			beforeEach(()=>{
				result = excell.getText();
			});

			it('returns undefined', ()=>{
				expect(result).to.equal(undefined);
			});
		});
	});

	describe('events', ()=>{
		describe('...', ()=>{
			it('...');
		});
	});
});
