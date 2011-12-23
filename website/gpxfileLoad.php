<?php
	include_once('GPXEditor1_1.php');

	// PREVENT ACCESS FROM OUTSIDE
	if (! preg_match('/^http(s)?:\/\/' . $_SERVER['SERVER_NAME'] . '\//', $_SERVER['HTTP_REFERER'])) {
		header('HTTP/1.0 404 Not Found');
		print json_encode(array('success' => false, 'error' => 'MSG_ERROR_ONLY_LOCAL_REQUEST'));
		return;
	}

	if (is_uploaded_file($_FILES['file']['tmp_name'])) {
		$ret = loadGPX($_FILES['file']['tmp_name']);
		unlink($_FILES['file']['tmp_name']);
		if ($ret['success'] == true) {
			header('Content-Type: text/xml');
			print $ret['gpxData'];
		} else {
			print json_encode($ret);
		}
		return;
	}
	if (isset($_REQUEST['url'])) {
		$ret = loadGPX($_REQUEST['url']);
		if ($ret['success'] == true) {
			header('Content-Type: text/xml');
			print $ret['gpxData'];
		}
		else {
			print json_encode($ret);
		}
		return;
	}

	/* fallback */
	header('HTTP/1.0 404 Not Found');
	print json_encode(array('success' => false, 'error' => 'MSG_ERROR_NO_FILE_OR_URL'));
	return;
?>
