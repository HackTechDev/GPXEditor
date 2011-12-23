    OpenLayers.Control.KeyboardDefaults.prototype.defaultKeyPress= function (evt) {
			if (! this.map) /* Shama MDF */
				return;
        //OpenLayers.Console.debug("altKey="+evt.altKey+" ctrlKey="+evt.ctrlKey+" shiftKey="+evt.shiftKey+" charCode="+evt.charCode+" keyCode="+evt.keyCode+" map="+this.map.baseLayer.name);
        var handled= false;
        switch(evt.keyCode) {
            case OpenLayers.Event.KEY_LEFT:
                this.map.pan(-this.slideFactor, 0);
                handled= true;
                break;
            case OpenLayers.Event.KEY_RIGHT:
                this.map.pan(this.slideFactor, 0);
                handled= true;
                break;
            case OpenLayers.Event.KEY_UP:
                this.map.pan(0, -this.slideFactor);
                handled= true;
                break;
            case OpenLayers.Event.KEY_DOWN:
                this.map.pan(0, this.slideFactor);
                handled= true;
                break;

            case 33: // Page Up. Same in all browsers.
                var size = this.map.getSize();
                this.map.pan(0, -0.75*size.h);
                handled= true;
                break;
            case 34: // Page Down. Same in all browsers.
                var size = this.map.getSize();
                this.map.pan(0, 0.75*size.h);
                handled= true;
                break;
            case 35: // End. Same in all browsers.
                var size = this.map.getSize();
                this.map.pan(0.75*size.w, 0);
                handled= true;
                break;
            case 36: // Home. Same in all browsers.
                var size = this.map.getSize();
                this.map.pan(-0.75*size.w, 0);
                handled= true;
                break;

            case 43:  // +/= (ASCII), keypad + (ASCII, Opera)
            case 61:  // +/= (Mozilla, Opera, some ASCII)
            case 187: // +/= (IE)
            case 107: // keypad + (IE, Mozilla)
                this.map.zoomIn();
                handled= true;
                break;
            case 45:  // -/_ (ASCII, Opera), keypad - (ASCII, Opera)
            case 54:  // -/6 (IE8 - IGNF: laptop, no numeric pad - french keyboard)
            case 109: // -/_ (Mozilla), keypad - (Mozilla, IE)
            case 189: // -/_ (IE)
            case 95:  // -/_ (some ASCII)
                this.map.zoomOut();
                handled= true;
                break;
        }
        if (handled===true) {
            OpenLayers.Event.stop(evt);
        }
    };

