<?php
/**
 * Created by PhpStorm.
 * User: cyberex
 * Date: 16.04.15
 * Time: 12:21
 */

use OpenStart\Utils\Resize;

spl_autoload_register(function ($className)
{
	$prefix = 'OpenStart\\';
	$len    = strlen($prefix);

	if (strncmp($prefix, $className, $len) !== 0)
		return;

	$file = __DIR__ . '/Os/' . str_replace('\\', DIRECTORY_SEPARATOR, substr($className, $len)) . '.php';

	if (file_exists($file))
		/** @noinspection PhpIncludeInspection */
		require $file;

	return;
});

preg_match('#^(/images)?/r/(\d+)x(\d+)(m|w|h)?(c|p)?/([^\?]*)#', $_SERVER['REQUEST_URI'], $matches);

$dir         = realpath(__DIR__);
$isExternal  = preg_match('#^https?://#ui', $matches[6]);
$source_file = $isExternal ? $matches[6] : ($dir . '/' . $matches[6]);

if (!$isExternal && !is_readable($source_file))
	show404(__LINE__);

$destination_file = $dir . ($matches[1] ? '' : '/images') . $matches[0];

$source_sizes = getimagesize($source_file);
if (!$source_sizes)
	show404(__LINE__);

$source_width       = $source_sizes[0];
$source_height      = $source_sizes[1];
$source_type        = $source_sizes[2];
$mime               = $source_sizes['mime'];
$destination_width  = $matches[2];
$destination_height = $matches[3];

//Тип ресайза
$type_resize = $matches[4];

$crop     = $matches[5] == 'c';
$portrait = $matches[5] == 'p';

switch ($type_resize)
{
	default:
	case 'm':
		$method = 0;
		break;
	case 'w':
		$method = 1;
		break;
	case 'h':
		$method = 2;
		break;
}

//Выясняем, какие пропорции, если портретный режим
$proportions = [];

$sizes = Resize::calcSizes($source_width, $source_height, $destination_width, $destination_height, $crop, $method, [],
						   $portrait);

$sizes['source']['w'] = $source_width;
$sizes['source']['h'] = $source_height;

if ($source_type != IMG_JPEG && $source_type != IMG_GIF && $source_type != IMG_PNG)
{
	switch ($mime)
	{
		case 'image/png':
			$source_type = IMG_PNG;
	}
}

switch ($source_type)
{
	case IMG_JPEG:
		$source_image = imagecreatefromjpeg($source_file);
		break;
	case IMG_GIF:
		$source_image = imagecreatefromgif($source_file);
		break;
	case IMG_PNG:
		$source_image = imagecreatefrompng($source_file);
		break;
	default:
		show404(__LINE__);
}

if (empty($source_image))
	show404(__LINE__);

$destination_dir = dirname($destination_file);

@mkdir($destination_dir, 0777, true);

Resize::resize($source_image, $sizes, $destination_file, 100, $source_type, $proportions);

if (!file_exists($destination_file))
	show404(__LINE__);

header("Content-Type: $mime");
print file_get_contents($destination_file);
exit;

function show404($LINE)
{
	header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
	die ('File not found: ' . $LINE);
}