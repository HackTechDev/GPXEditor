Ext.layout.ToolbarVLayout = Ext.extend(Ext.layout.ToolbarLayout, {
	onLayout: function(ct, target) {
		target.addClass('x-toolbar-layout-vct');
		if (! this.topTb) {
		 target.insertHtml('beforeEnd',
			'<table cellspacing="0" class="x-toolbar-vct">'
			+ '<tbody>'
				+ '<tr>'
					+ '<td class="x-toolbar-top" align="center" valign="top" style="vertical-align: top;">'
						+ '<table cellspacing="0"><tbody class="x-toolbar-top-row"></tbody></table>'
					+ '</td>'
				+ '</tr>'
				+ '<tr>'
					+ '<td class="x-toolbar-bottom" align="center" valign="bottom" style="vertical-align: bottom;">'
						+ '<table cellspacing="0" class="x-toolbar-bottom-ct">'
							+ '<tbody>'
								+ '<tr>'
									+ '<td>'
										+ '<table cellspacing="0"><tbody class="x-toolbar-bottom-row"></tbody></table>'
									+ '</td>'
								+ '</tr>'
								+ '<tr>'
									+ '<td>'
										+ '<table cellspacing="0"><tbody class="x-toolbar-extras-row"></tbody></table>'
									+ '</td>'
								+ '</tr>'
							+ '</tbody>'
						+ '</table>'
					+ '</td>'
				+ '</tr>'
			+ '</tbody>'
			+ '</table>');
			this.topTb = target.child('tbody.x-toolbar-top-row', true);
			this.bottomTb = target.child('tbody.x-toolbar-bottom-row', true);
			this.extrasTb = target.child('tbody.x-toolbar-extras-row', true);
		}
		var side = this.topTb;
		var pos = 0;

		var items = ct.items.items;
		for (var i = 0, len = items.length, c; i < len; i++, pos++) {
			c = items[i];
			if(c.isFill) {
				side = this.bottomTb;
				pos = -1;
			} else if (! c.rendered) {
				c.render(this.insertCell(c, side, pos));
			} else {
				if (! c.xtbHidden && ! this.isValidParent(c, side.childNodes[pos])) {
					var td = this.insertCell(c, side, pos);
					td.appendChild(c.getPositionEl().dom); 
					c.container = Ext.get(td); 
				}
			}
		}
		/* strip extra empty cells */
		this.cleanup(this.topTb);
		this.cleanup(this.bottomTb);
		this.cleanup(this.extrasTb);
		// 	this.fitToSize(target); // TODO Need to implement this
		var tc = target.child('table.x-toolbar-vct');
		var tDiff = target.getWidth() - target.getWidth(true);
		target.setWidth(tc.getWidth() + tDiff);
	}
	/* TODO needed fitToSier */
	, cleanup: function(tbody) {
		var cn = tbody.childNodes;
		for (var i = 0; i < tbody.childNodes.length; i++) {
			c = cn[i];
			if (! c.firstChild || ! c.firstChild.firstChild) {
				tbody.removeChild(c);
				i--;
			}
		}
	}
	, insertCell: function(c, side, pos) {
		if (! side)
			return;
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		td.className = 'x-toolbar-cell';
		tr.appendChild(td);
		side.insertBefore(tr, side.childNodes[pos] || null);
		return td;
	}
});
Ext.Container.LAYOUTS.vtoolbar = Ext.layout.ToolbarVLayout;
