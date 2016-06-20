/* global ExCell */
(function() {
	Array.from(document.querySelectorAll('.js-table')).forEach(function(elTable) {
		ExCell.create({
			el: elTable,
		});
	});
})();
