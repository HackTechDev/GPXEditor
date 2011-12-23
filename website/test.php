<?
require_once('GPXEditor1_1.php');

$ret = loadGPX('file:///home/shama/dev/GPXEditor1_1/test/gpx/TestV11.gpx');
print 'Success => ' . $ret['success'] . "\n";
if ($ret['success'])
	print 'GPX:' . "\n" . $ret['gpxData'] . "\n";
?>
