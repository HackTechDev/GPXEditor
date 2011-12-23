<?php

$COUNTER_PATH = './counter';
$LOAD_FILEPATH = $COUNTER_PATH . '/load.txt';
$SAVE_FILEPATH = $COUNTER_PATH . '/save.txt';

libxml_use_internal_errors();

function loadGPX($uri) {
	if (! isset($uri))
		return array('success' => false, 'error' => 'MSG_ERROR_NO_FILE_OR_URL');
	libxml_use_internal_errors(true);
	$xmldoc = null;
	try {
		$xmldoc1 = new DOMDocument();
		$xmldoc1->load($uri, LIBXML_COMPACT | LIBXML_NOERROR | LIBXML_NOWARNING | LIBXML_NOXMLDECL);
		$gpxItems = $xmldoc1->getElementsByTagNameNS('http://www.topografix.com/GPX/1/1', 'gpx');
		if ($gpxItems->length < 1) 
			$gpxItems = $xmldoc1->getElementsByTagNameNS('http://www.topografix.com/GPX/1/0', 'gpx');
		if ($gpxItems->length > 0) {
			$xmldoc = new DOMDocument();
			$node = $xmldoc->importNode($gpxItems->item(0), true);
			$xmldoc->appendChild($node);
		}
	} catch(Exception $e) {}
	libxml_clear_errors();
	if (! $xmldoc)
		return array('success' => false, 'error' => 'MSG_ERROR_NOT_VALID_XML');
	addLoaded();
	return array('success' => true, 'gpxData' => $xmldoc->saveXML());
}

function addLoaded() {
	global $LOAD_FILEPATH;
	if (is_writable($LOAD_FILEPATH)) {
		$c = getCount();
		$nbLoaded = $c['nbLoaded'];
		$nbLoaded++;
		$h = fopen($LOAD_FILEPATH, 'w');
		fwrite($h, $nbLoaded);
		fclose($h);
	}
}

function addSaved() {
	global $SAVE_FILEPATH;
	$c = getCount();
	$nbSaved = $c['nbSaved'];
	$nbSaved++;
	$h = fopen($SAVE_FILEPATH, 'w');
	fwrite($h, $nbSaved);
	fclose($h);
}

function getCount() {
	global $LOAD_FILEPATH;
	global $SAVE_FILEPATH;
	$nbLoaded = 0;
	$nbSaved = 0;
	if (file_exists($LOAD_FILEPATH)) {
		$h = fopen($LOAD_FILEPATH, 'r');
		$nbLoaded = rtrim(fgets($h));
		fclose($h);
	}
	if (file_exists($SAVE_FILEPATH)) {
		$h = fopen($SAVE_FILEPATH, 'r');
		$nbSaved = rtrim(fgets($h));
		fclose($h);
	}
	return array('nbLoaded' => $nbLoaded, 'nbSaved' => $nbSaved);
}

?>
