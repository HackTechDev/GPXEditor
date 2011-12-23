<?php
	include_once('GPXEditor1_1.php');

	// PREVENT ACCESS FROM OUTSIDE
	if (! preg_match('/^http(s)?:\/\/' . $_SERVER['SERVER_NAME'] . '\//', $_SERVER['HTTP_REFERER'])) {
		header('HTTP/1.0 404 Not Found');
		print '{success: false, error: \'MSG_ERROR_ONLY_LOCAL_REQUEST\'}';
		return;
	}

	if (! isset($_REQUEST['xmldoc'])) {
		print '{success: false, error: \'MSG_ERROR_NO_XMLDOC_FOUND\'}';
		return;
	}

	addSaved();
	$filename = 'gpxfile.gpx';
	if (isset($_REQUEST['filename']))
		$filename = $_REQUEST['filename'];
	if (! preg_match('/\.gpx$/', $filename))
		$filename .= '.gpx';

	header("Pragma: public");
	header("Expires: 0");
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
	header("Cache-Control: public");
	header("Content-Description: File Transfer");
	header("Content-Type: application/octet-stream");
	header('Content-Disposition: attachment; filename="' . $filename . '";');
	header("Content-Transfer-Encoding: binary");
	header("Content-Length: ". strlen($_REQUEST['xmldoc']));
	print $_REQUEST['xmldoc'];
?>

