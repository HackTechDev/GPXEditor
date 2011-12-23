OpenLayers.Format.GPXEditorIO = OpenLayers.Class(OpenLayers.Format.GPX, {
	initialize: function(options) {
		OpenLayers.Format.GPX.prototype.initialize.apply(this, [options]);
	}
  , read: function(doc) {
		if (typeof doc == "string") 
			doc = OpenLayers.Format.XML.prototype.read.apply(this, [doc]);
		var features = [];

		if (this.extractTracks) {
			var tracks = doc.getElementsByTagName("trk");
			for (var i=0, len=tracks.length; i<len; i++) {
				// Attributes are only in trk nodes, not trkseg nodes
				var attrs = {};
				if (this.extractAttributes) {
					var eattrs = this.parseAttributes(tracks[i]);
					if ('name' in eattrs)
						attrs.name = eattrs.name;
					if ('desc' in eattrs)
						attrs.desc = eattrs.desc;
					else if ('cmt' in eattrs)
						attrs.desc = eattrs.cmt;
				}

				var segs = this.getElementsByTagNameNS(tracks[i], tracks[i].namespaceURI, "trkseg");
				var ls = [];
				for (var j = 0, seglen = segs.length; j < seglen; j++) {
					// We don't yet support extraction of trkpt attributes
					// All trksegs of a trk get that trk's attributes
					var lineString = this.extractSegment(segs[j], 'trkpt');
					if (lineString.components.length > 0)
						ls.push(lineString);
				}
				if (ls.length > 0) {
					var track = new OpenLayers.Geometry.MultiLineString(ls);
					features.push(new OpenLayers.Feature.Vector(track, attrs));
				}
			}
		}

		if (this.extractRoutes) {
			var routes = doc.getElementsByTagName("rte");
			for (var k=0, klen=routes.length; k<klen; k++) {
				var attrs = {};
				if (this.extractAttributes) {
					var eattrs = this.parseAttributes(routes[k]);
					if ('name' in eattrs)
						attrs.name = eattrs.name;
					if ('desc' in eattrs)
						attrs.desc = eattrs.desc;
					else if ('cmt' in eattrs)
						attrs.desc = eattrs.cmt;
				}
				var route = this.extractSegment(routes[k], "rtept");
				if (route.components.length > 0)
					features.push(new OpenLayers.Feature.Vector(route, attrs));
			}
		}

		if (this.extractWaypoints) {
			var waypoints = doc.getElementsByTagName("wpt");
			for (var l = 0, len = waypoints.length; l < len; l++) {
				var attrs = {};
				if (this.extractAttributes) {
					var eattrs = this.parseAttributes(waypoints[l]);
					if ('name' in eattrs)
						attrs.name = eattrs.name;
					if ('desc' in eattrs)
						attrs.desc = eattrs.desc;
					else if ('cmt' in eattrs)
						attrs.desc = eattrs.cmt;
					if ('ele' in eattrs)
						attrs.ele = eattrs.ele;
					if ('sym' in eattrs) {
						switch (eattrs.sym) { /* bad dependancy to ExtJS */
							case GPXEditor1_1.data.WPTRecord.WPT_TYPES.PK:
								attrs.type = GPXEditor1_1.data.WPTRecord.WPT_TYPES.PK;
								break;
							case GPXEditor1_1.data.WPTRecord.WPT_TYPES.PASS:
								attrs.type = GPXEditor1_1.data.WPTRecord.WPT_TYPES.PASS;
								break;
							case GPXEditor1_1.data.WPTRecord.WPT_TYPES.RHSE:
								attrs.type = GPXEditor1_1.data.WPTRecord.WPT_TYPES.RHSE;
								break;
							case GPXEditor1_1.data.WPTRecord.WPT_TYPES.WTRW:
								attrs.type = GPXEditor1_1.data.WPTRecord.WPT_TYPES.WTRW;
								break;
							case GPXEditor1_1.data.WPTRecord.WPT_TYPES.PKLT:
								attrs.type = GPXEditor1_1.data.WPTRecord.WPT_TYPES.PKLT;
								break;
							default:
								attrs.type = GPXEditor1_1.data.WPTRecord.WPT_TYPES.UNKNOW;
								break;
						}
					}
				}
				var wpt = new OpenLayers.Geometry.Point(waypoints[l].getAttribute("lon"), waypoints[l].getAttribute("lat"));
				features.push(new OpenLayers.Feature.Vector(wpt, attrs));
			}
		}

		if (this.internalProjection && this.externalProjection) {
			for (var g = 0, featLength = features.length; g < featLength; g++)
				features[g].geometry.transform(this.externalProjection, this.internalProjection);
		}

		return features;
	}
	, extractSegment: function(segment, segmentType) {
		var points = this.getElementsByTagNameNS(segment, segment.namespaceURI, segmentType);
		var point_feature = [];
		for (var i = 0, len = points.length; i < len; i++) {
			var pt = new OpenLayers.Geometry.Point(points[i].getAttribute('lon'), points[i].getAttribute('lat'));
			var attributes = this.parseAttributes(points[i]);
			if (attributes.ele)
				pt.ele = Math.round(attributes.ele);
			if (attributes.time) 
				pt.time = Date.parseDate(attributes.time, 'c'); /* bad dependancy to ExtJS */
			point_feature.push(pt);
		}
		return new OpenLayers.Geometry.LineString(point_feature);
	}
	, write: function(features) {
		if (! (features instanceof Array))
			features = [features];
		var gpx = this.genNode('gpx', {
			version: '1.1'
			, creator: 'http://shamavideals.l-wa.org/GPXEditor1.1'
		});
		this.setAttributeNS(gpx,
			OpenLayers.Format.GPXEditorIO.XSINS, 'xsi:schemaLocation', 
				OpenLayers.Format.GPXEditorIO.GPXNS + ' ' + OpenLayers.Format.GPXEditorIO.GPXSL);
				/* + ' ' + OpenLayers.Format.GPXEditorIO.GPXENS + ' ' + OpenLayers.Format.GPXEditorIO.GPXESL); */
		/*
		this.setAttributeNS(gpx, 
			null, 'xmlns:gpxe', OpenLayers.Format.GPXEditorIO.GPXENS);
		*/
		var wptNodes = [];
		var rteNodes = [];
		var trkNodes = [];
		for (var i = 0, len = features.length; i < len; i++) {
			if (features[i].geometry instanceof OpenLayers.Geometry.Point)
				wptNodes.push(this.genWpt(features[i]));
			else if (features[i].geometry instanceof OpenLayers.Geometry.LineString)
				rteNodes.push(this.genRte(features[i]));
			else if (features[i].geometry instanceof OpenLayers.Geometry.MultiLineString)
				trkNodes.push(this.genTrk(features[i]));
		}
		if (this.extractWaypoints) {
			for (var i = 0, len = wptNodes.length; i < len; i++)
				gpx.appendChild(wptNodes[i]);
		}
		if (this.extractRoutes) {
			for (var i = 0, len = rteNodes.length; i < len; i++)
				gpx.appendChild(rteNodes[i]);
		}
		if (this.extractTracks) {
			for (var i = 0, len = trkNodes.length; i < len; i++)
				gpx.appendChild(trkNodes[i]);
		}
		return OpenLayers.Format.XML.prototype.write.apply(this, [gpx]);
	}
	, genWpt: function(feature) {
		var wptNode = this.genPtNode('wpt', feature.geometry, {
			name: feature.attributes.name
			, desc: feature.attributes.desc
			, ele: feature.attributes.ele
			, type: feature.attributes.type
		}); 
		return wptNode;
	}
	, genRte: function(feature) {
		var rteNode = this.genNode('rte');
		if (feature.attributes) {
			if (feature.attributes.name != null && feature.attributes.name.length > 0)
				rteNode.appendChild(this.genNode('name', null, feature.attributes.name));
			if (feature.attributes.desc != null && feature.attributes.desc.length > 0)
				rteNode.appendChild(this.genNode('desc', null, feature.attributes.desc));
		}
		var points = feature.geometry.getVertices();
		for (var i = 0, len = points.length; i < len; i++) {
			var rteptNode = this.genPtNode('rtept', points[i], {
				ele: points[i].ele
			});
			rteNode.appendChild(rteptNode);
		}
		return rteNode;
	}
	, genTrk: function(feature) {
		var trkNode = this.genNode('trk');
		if (feature.attributes) {
			if (feature.attributes.name != null && feature.attributes.name.length > 0)
				trkNode.appendChild(this.genNode('name', null, feature.attributes.name));
			if (feature.attributes.desc != null && feature.attributes.desc.length > 0)
				trkNode.appendChild(this.genNode('desc', null, feature.attributes.desc));
		}
		var segs = feature.geometry.components;
		for (var i = 0, slen = segs.length; i < slen; i++) {
			var trksegNode = this.genNode('trkseg');
			var points = segs[i].getVertices();
			for (var j = 0, plen = points.length; j < plen; j++) {
				var trkptNode = this.genPtNode('trkpt', points[j], {
					ele: points[j].ele
					, time: points[j].time
				});
				trksegNode.appendChild(trkptNode);
			}
			trkNode.appendChild(trksegNode);
		}
		return trkNode;
	}
	, genNode: function(eName, attributes, value) {
		var node = this.createElementNS(OpenLayers.Format.GPXEditorIO.GPXNS, eName);
		if (attributes) {
			for (var a in attributes) {
				if (attributes[a] != null)
					node.setAttribute(a, attributes[a]);
			}
		}
		if (value != null)
			node.appendChild(this.createTextNode(value));
		return node;
	}
	, genPtNode: function(eName, point, elements) {
		var ll = new OpenLayers.LonLat(point.x, point.y);
		ll.transform(this.internalProjection, this.externalProjection);
		var ptNode = this.genNode(eName, {
			lon: Ext.util.Format.round(ll.lon, GPXEditor1_1.data.WPTRecord.LL_MAX_DIGITS)
			, lat: Ext.util.Format.round(ll.lat, GPXEditor1_1.data.WPTRecord.LL_MAX_DIGITS)
		});
		if (elements) {
			/* var isFakeEle = false; */
			if ('ele' in elements && elements.ele != null) 
				ptNode.appendChild(this.genNode('ele', null, Math.round(elements.ele)));
			/*
			else if ('fakeEle' in elements && elements.fakeEle != null) {
				ptNode.appendChild(this.genNode('ele', null, Math.round(elements.ele)));
				isFakeEle = true;
			}
			*/
			if ('time' in elements && elements.time != null) 
				ptNode.appendChild(this.genNode('time', null, elements.time.format('c'))); /* Bad dependancy to ExtJs */
			if ('name' in elements && elements.name != null && elements.name.length > 0)
				ptNode.appendChild(this.genNode('name', null, elements.name));
			if ('desc' in elements && elements.desc != null && elements.desc.length > 0)
				ptNode.appendChild(this.genNode('desc', null, elements.desc));
			if ('type' in elements && elements.type != null && elements.type != GPXEditor1_1.data.WPTRecord.WPT_TYPES.UNKNOW) {
				ptNode.appendChild(this.genNode('sym', null, elements.type));
				ptNode.appendChild(this.genNode('type', null, GPXEditor1_1.data.WPTRecord.LOCALES['WPT_TYPE_' + elements.type])); /* Bad dependancy to ExtJS */
			}
			/*
			if (isFakeEle) {
				var ext = this.genNode('extension');
				var fakeEle = this.createElementNS(OpenLayers.Format.GPXEditorIO.GPXNS, 'fakeEle');
				ext.appendChild(fakeEle);
				ptNode.appendChild(ext);
			}
			*/
		}
		return ptNode;
	}
	, parseAttributes: function(node) {
		var attributes = {};
		if (! node)
			return attributes;
		var attrNode = node.firstChild;
		while(attrNode) {
			if (attrNode.nodeType == 1) {
				var value = attrNode.firstChild;
				if (value && (value.nodeType == 3 || value.nodeType == 4)) { /* why test value */
					name = (attrNode.prefix) ?
					attrNode.nodeName.split(":")[1] :
					attrNode.nodeName;
					if (name != "trkseg" && name != "rtept")
						attributes[name] = value.nodeValue;
				}
			}
			attrNode = attrNode.nextSibling;
		}
		return attributes;
	}
	, CLASS_NAME: 'OpenLayers.Format.GPXEditorIO'
});

OpenLayers.Format.GPXEditorIO.XSINS = 'http://www.w3.org/2001/XMLSchema-instance';
OpenLayers.Format.GPXEditorIO.GPXNS = 'http://www.topografix.com/GPX/1/1';
OpenLayers.Format.GPXEditorIO.GPXSL = 'http://www.topografix.com/GPX/1/1/gpx.xsd';
OpenLayers.Format.GPXEditorIO.GPXENS = 'http://shamavideals.l-wa.org/GPXEditor1.1';
OpenLayers.Format.GPXEditorIO.GPXESL = 'http://shamavideals.l-wa.org/GPXEditor1.1/gpxeditor1_1.xsd';
