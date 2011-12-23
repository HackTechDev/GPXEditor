<?php
	// PREVENT ACCESS FROM OUTSIDE
	if (! preg_match('/^http(s)?:\/\/' . $_SERVER['SERVER_NAME'] . '\//', $_SERVER['HTTP_REFERER'])) {
		header('HTTP/1.0 404 Not Found');
		print 'only local request can be acceptable';
		return;
	}
	if (strlen($_REQUEST['_proxy_url']) < 1) {
		header('HTTP/1.0 404 Not Found');
		print 'no "_proxy_url" found !';
		return;
	}

	$url = $_REQUEST['_proxy_url'];
	$urlGet = '';
	foreach ($_GET as $key => $val) {
		if (strcmp($key, '_proxy_url') != 0)
			$urlGet .= urlencode($key) . '=' . urlencode($val) . '&';
	}
	if (strlen($urlGet) > 0)
		$url .= '?' . $urlGet . "\n";

	$ch = curl_init();

	$postvars = '';
	foreach ($_POST as $key => $val) {
		if (strcmp($key, '_proxy_url') != 0)
			$postvars .= $key . '=' . $val . '&';
	}
	if (strlen($postvars) > 0) {
		curl_setopt ($ch, CURLOPT_POST, true);
		curl_setopt ($ch, CURLOPT_POSTFIELDS, $postvars);
	}

	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_BINARYTRANSFER, true);
	curl_setopt($ch, CURLOPT_FILETIME, true);
	curl_setopt($ch, CURLOPT_FORBID_REUSE, true);
	curl_setopt($ch, CURLOPT_HEADER, true);
	//curl_setopt($ch, CURLINFO_HEADER_OUT, true);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$t = curl_exec($ch);
	
	$hSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
	$aheaders = explode("\n", substr($t, 0, $hSize));
	foreach ($aheaders as $h) {
		if (! preg_match('/^Transfer-Encoding:/', $h))
			header($h);
		/*
		if (preg_match('/^Content/', $h))
			header($h);
		*/
	}
	print substr($t, $hSize);

	curl_close($ch);
?>
