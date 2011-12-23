<?php
require_once('GPXEditor1_1.php');

$count = getCount();

$isDebug = isset($_REQUEST['debug']) ? $_REQUEST['debug'] : null;
$lang = isset($_REQUEST['lang']) ? $_REQUEST['lang'] : null;
if (! $lang)
  $lang = 'fr';
$lTitle = array(
	'en' => 'online solution for editing gpx files', 
	'fr' => 'édition de fichiers gpx en ligne'
);
$lMsgEn = array(
	'loadExtjsLib' => 'Loading ExtJS library...',
	'loadGeoportalLib' => 'Loading Geoportal library...',
	'loadGoogleMapLib' => 'Loading Google Map library...',
	'loadOpenLayersLib' => 'Loading OpenLayers library...',
	'loadGeoExtLib' => 'Loading GeoExt library ...',
	'loadApp' => 'Loading application...',
	'loadLocale' => 'Loading locale support...',
	'loadInterface' => 'Creating widgets...',
	'statIntro' => 'Statistics: ',
	'nbLoaded' => 'files loaded',
	'nbSaved' => 'files generated'
);
$lMsgFr = array(
	'loadExtjsLib' => 'Chargement de la librairie ExtJS...',
	'loadGeoportalLib' => 'Chargement de la librairie Geoportal...',
	'loadGoogleMapLib' => 'Chargement de la librairie Google Map...',
	'loadOpenLayersLib' => 'Chargement de la librairie OpenLayers...',
	'loadGeoExtLib' => 'Chargement de la librairie GeoExt ...',
	'loadApp' => 'Chargement de l\\\'application...',
	'loadLocale' => 'Chargement des support de langue...',
	'loadInterface' => 'Création du rendu de l\\\'application...',
	'statIntro' => 'Statistiques: ',
	'nbLoaded' => 'fichiers chargés',
	'nbSaved' => 'fichiers générés'
);
$lMsg = array('en' => $lMsgEn, 'fr' => $lMsgFr);
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" 
  "http://www.w3.org/TR/2000/REC-xhtml1-20000126/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
		<title>GPXEditor 1.1 <?= $lTitle[$lang]?></title>
		<link rel="shortcut icon" href="favicon.ico" /> 
		<link rel="stylesheet" type="text/css" href="js/lib/ext-3.2.1/resources/css/ext-all.css" />
		<link rel="stylesheet" type="text/css" href="js/lib/ext-3.2.1/examples/ux/fileuploadfield/css/fileuploadfield.css"/>
		<link rel="stylesheet" type="text/css" href="js/lib/OpenLayers-2.9.1/theme/default/style.css" />
		<link rel="stylesheet" type="text/css" href="js/lib/OpenLayers-2.9.1/theme/default/google.css" />
		<link rel="stylesheet" type="text/css" href="js/lib/geoportal-1.1/js/1.1/theme/geoportal/style.css" />
		<link rel="stylesheet" type="text/css" href="js/lib/GPXEditor1_1/css/Ext.css" />
		<link rel="stylesheet" type="text/css" href="js/lib/GPXEditor1_1/css/GPXEditor1_1.css" />
		<link rel="stylesheet" type="text/css" href="css/website.css" />
	</head>
	<body>
		<!-- header -->
		<div id="header">
			<h1 id="title"><img id="logo" src="img/gpxeditor_bigH.png" alt="GPXEditor 1.1 logo" /> <?= $lTitle[$lang]?>
			<div id="statsAndLang">
				<?=$lMsg[$lang]['statIntro']?>
				<?=$count['nbLoaded']?> <?=$lMsg[$lang]['nbLoaded']?>, 
				<?=$count['nbSaved']?>  <?=$lMsg[$lang]['nbSaved']?>
			</div>
			</h1>
		</div>
		<div id="loading-mask"></div>
			<div id="loading">
				<div class="loading-indicator"><img src="img/wait32.gif" width="32" height="32" style="margin-right:8px;float:left;vertical-align:top;"/>GPXEditor <br /><span id="loading-msg"><?= $lMsg[$lang]['loadExtjsLib']?></span></div>
		</div>
		<!-- Extjs -->
		<script type="text/javascript">document.getElementById('loading-msg').innerHTML = '<?= $lMsg[$lang]['loadExtjsLib']?>';</script>
		<? if ($isDebug) { ?>
			<script type="text/javascript" src="../external-libs/ext-3.2.1/adapter/ext/ext-base-debug.js"></script>
			<script type="text/javascript" src="../external-libs/ext-3.2.1/ext-all-debug.js"></script>
		<? } else { ?>
			<script type="text/javascript" src="js/lib/ext-3.2.1/adapter/ext/ext-base.js"></script>
			<script type="text/javascript" src="js/lib/ext-3.2.1/ext-all.js"></script>
		<? } ?>
		<script type="text/javascript" src="js/lib/ext-3.2.1/examples/ux/fileuploadfield/FileUploadField.js"></script>
		<script type="text/javascript" src="js/lib/ext-3.2.1/examples/ux/CheckColumn.js"></script>
		<script type="text/javascript" src="js/lib/ext-3.2.1/src/locale/ext-lang-<?= $lang ?>.js"></script>
		<!-- OpenLayers -->
		<script type="text/javascript">document.getElementById('loading-msg').innerHTML = '<?= $lMsg[$lang]['loadOpenLayersLib']?>';</script>
		<? if ($isDebug) { ?>
			<script type="text/javascript" src="../external-libs/OpenLayers-2.9.1/lib/OpenLayers.js"></script>
		<? } else { ?>
			<script type="text/javascript" src="js/lib/OpenLayers-2.9.1/OpenLayers.js"></script>
		<? } ?>
		<script type="text/javascript" src="js/lib/OpenLayers-2.9.1/lib/OpenLayers/Lang/<?= $lang?>.js"></script>
		<!-- Geoportal -->
		<script type="text/javascript">document.getElementById('loading-msg').innerHTML = '<?= $lMsg[$lang]['loadGeoportalLib']?>';</script>
		<script src="http://api.ign.fr/geoportail/api?v=1.1-m&amp;key=2517864658001367307&amp;includeEngine=false&amp;" type="text/javascript"></script>
		<? if ($isDebug) { ?>
			<script src="../external-libs/geoportal-1.1/js/1.1/lib/geoportal/lib/GeoportalMin.js" type="text/javascript"></script>
		<? } else { ?>
			<script src="js/lib/geoportal-1.1/js/1.1/GeoportalMin.js" type="text/javascript"></script>
		<? } ?>
		<!-- Google Map --> 
		<script type="text/javascript">document.getElementById('loading-msg').innerHTML = '<?= $lMsg[$lang]['loadGoogleMapLib']?>';</script>
		<script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAgzUkPrecf7_tU_mrY78HURTWMcnTuAzRw4bkWkFX0TFOo6q33xQOPsizsvdD2JWFxIOsSrDUmvUs1A&hl=<?= $lang?>&" type="text/javascript"></script>
		<!-- GeoExt -->
		<script type="text/javascript">document.getElementById('loading-msg').innerHTML = '<?= $lMsg[$lang]['loadGeoExtLib']?>';</script>
		<? if ($isDebug) { ?>
			<script type="text/javascript" src="../external-libs/GeoExt-0.7/lib/GeoExt.js"></script>
		<? } else { ?>
			<script type="text/javascript" src="js/lib/GeoExt-0.7/script/GeoExt.js"></script>
		<? } ?>
		<!-- GPXEditor -->
		<script type="text/javascript">document.getElementById('loading-msg').innerHTML = '<?= $lMsg[$lang]['loadApp']?>';</script>
		<script type="text/javascript" src="js/lib/GPXEditor1_1/GPXEditor1_1<?= $isDebug ? '' : '-comp'?>.js"></script>
		<? if ($isDebug) { ?>
			<script type="text/javascript" src="../lib/GPXEditor1_1/LOCALES/GPXEditor1_1-lang-<?= $lang?>.js"></script>
		<? } else { ?>
			<script type="text/javascript" src="js/locales/GPXEditor1_1-lang-<?= $lang?>-comp.js"></script>
		<? } ?>
		<script type="text/javascript">
			OpenLayers.Lang.setCode('<?= $lang?>');
		</script>
		<!-- Interface -->
		<script type="text/javascript">document.getElementById('loading-msg').innerHTML = '<?= $lMsg[$lang]['loadInterface']?>';</script>
		<script type="text/javascript" src="js/website.js"></script>
		<!-- about -->
		<? include('about-' . $lang . '.php'); ?>
		<!-- help -->
		<? include('help-' . $lang . '.php'); ?>
		<!-- footer -->
		<div id="footer">
			<div id="footerContent">
				<span id="copyleft">GPXEditor 1.1 <a href="license.txt" title="View licence">&copy;</a> by <a href="mailto:shama@l-wa.org" title="drop me a mail">Shama</a> for <a href="http://www.skitour.fr" title="Visit SkiTour">SkiTour website</a></span>
			</div>
		</div>
	</body>
</html>
