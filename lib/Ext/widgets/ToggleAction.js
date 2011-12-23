Ext.override(Ext.Action, {
	addComponent: function(comp) {
		this.items.push(comp);
		comp.on('destroy', this.removeComponent, this);
		if (this.initialConfig.toggleGroup) {
			comp.on('toggle', function(btn, pressed) {
				this.initialConfig.pressed = pressed;
				this.initialConfig.checked = pressed;
			}, this);
		}
	}
	, toggle: function(state) {
		state = state === undefined ? ! this.initialConfig.pressed : !!state;
		if (state != this.initialConfig.pressed) {
			this.initialConfig.pressed = state;
			this.initialConfig.checked = state;
			this.callEach('toggle', [state]);
		}
	}
});

Ext.ButtonToggleMgr = function(){
	var groups = {};

	function toggleGroup(btn, state) {
		if (state) {
			var g = groups[btn.toggleGroup];
			for (var i = 0, l = g.length; i < l; i++) {
				if (btn.baseAction && btn.baseAction == g[i].baseAction)
					g[i].toggle(true);
				else if (g[i] != btn) 
					g[i].toggle(false);
			}
		}
	}

	return {
		register: function(btn) {
			if (! btn.toggleGroup)
				return;
			var g = groups[btn.toggleGroup];
			if (! g)
				g = groups[btn.toggleGroup] = [];
			g.push(btn);
			btn.on("toggle", toggleGroup);
		}
		, unregister: function(btn) {
			if (! btn.toggleGroup)
				return;
			var g = groups[btn.toggleGroup];
			if (g) {
				g.remove(btn);
				btn.un("toggle", toggleGroup);
			}
		}
		, getPressed : function(group) {
			var g = groups[group];
			if (g) {
				for (var i = 0, len = g.length; i < len; i++) {
					if (g[i].pressed === true) 
						return g[i];
				}
			}
			return null;
		}
	};
}();
