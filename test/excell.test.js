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

	describe('edit()', ()=>{
		it('...');
	});

	describe('finishEditing()', ()=>{
		it('...');
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
