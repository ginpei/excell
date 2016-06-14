var expect = require('chai').expect;
var fs = require('fs');
var jsdom = require('jsdom');

describe('ExCell', ()=>{
	var ExCell;
	var excell;
	var el;

	beforeEach((done)=>{
		jsdom.env({
			html: fs.readFileSync('test/excell.test.html', 'utf-8'),
			src: [
				fs.readFileSync('./excell.js', 'utf-8'),
			],
			done: (err, window)=>{
				ExCell = window.ExCell;
				el = window.document.querySelector('table');

				excell = ExCell.create({
					el: el,
				});

				done();
			},
		});
	});

	it('adds a class to a target table', ()=>{
		expect(el.classList.contains('excell-table')).to.be.true;
	});
});
