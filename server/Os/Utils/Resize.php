<?php
/**
 * Created by PhpStorm.
 * User: cyberex
 * Date: 16.04.15
 * Time: 12:29
 */

namespace OpenStart\Utils;

/**
 * Class Resizer
 */
class Resize
{
	public static function calcSizes($width, $height, $new_width_max, $new_height_max, $crop = false, $method = 0,
									 $watermark = [], $portrait = false)
	{
		$w = $width * 100 / $height;
		$h = $height * 100 / $width;

		$width_new = $height_new = 0;

		$crop_data = ['sx' => 0, 'sy' => 0, 'width' => $width, 'height' => $height];

		if (!$portrait && !$crop)
		{
			if ($method == 0) //По наибольшей
			{
				if ($width / $new_width_max > $height / $new_height_max)
				{
					$width_new = $new_width_max;
					if ($width_new > $width)
						$width_new = $width;
					$height_new = round($height * $width_new / $width);
				}
				else
				{
					$height_new = $new_height_max;
					if ($height_new > $height)
						$height_new = $height;
					$width_new = round($width * $height_new / $height);
				}
			}
			elseif ($method == 1) //По ширине
			{
				$width_new = $new_width_max;
				if ($width_new > $width)
					$width_new = $width;
				$height_new = round($height * $width_new / $width);
			}
			elseif ($method == 2) //По высоте
			{
				$height_new = $new_height_max;
				if ($height_new > $height)
					$height_new = $height;
				$width_new = round($width * $height_new / $height);
			}
		}
		else
		{
			$w2 = $new_width_max * 100 / $new_height_max;
			$h2 = $new_height_max * 100 / $new_width_max;

			if ($w / $w2 > $h / $h2)
			{
				$crop_data['sx']     = round(($width - ($new_width_max * $height / $new_height_max)) / 2);
				$crop_data['sy']     = 0;
				$crop_data['width']  = round($new_width_max * $height / $new_height_max);
				$crop_data['height'] = $height;
			}
			else
			{
				$width_new  = $new_width_max;
				$height_new = round($height * $width_new / $width);

				$crop_data['sx']     = 0;
				$crop_data['sy']     = $portrait ? 0 :
					round($height * (($height_new - $new_height_max) / 2) / $new_height_max / 2);
				$crop_data['width']  = $width;
				$crop_data['height'] = round($new_height_max * $width / $new_width_max);
			}
			$width_new  = $new_width_max;
			$height_new = $new_height_max;
		}

		return [$width_new, $height_new, $crop_data, 'watermark' => $watermark];
	}

	public static function resize(&$img, &$sizes, $filename, $quality = 100, $type = IMG_JPEG, $res = false)
	{

		if (!$res)
		{
			if (($sizes['source']['w'] < $sizes[0] || $sizes['source']['h'] < $sizes[1]) && false)
			{
				if ($sizes[0] > $sizes[1])
				{
					$p        = $sizes[1] / $sizes[0];
					$sizes[0] = $sizes['source']['w'];
					$sizes[1] = $sizes[0] * $p;
				}
				else
				{
					$p        = $sizes[0] / $sizes[1];
					$sizes[1] = $sizes['source']['h'];
					$sizes[0] = $sizes[1] * $p;
				}
			}

			$img2 = imagecreatetruecolor($sizes[0], $sizes[1]);

			// Transparency
			if ($type == IMG_GIF or $type == IMG_PNG)
			{
				imagecolortransparent($img2, imagecolorallocatealpha($img2, 0, 0, 0, 127));
				imagealphablending($img2, false);
				imagesavealpha($img2, true);
			}

			imagecopyresampled($img2, $img, 0, 0, $sizes[2]['sx'], $sizes[2]['sy'], $sizes[0], $sizes[1],
							   $sizes[2]['width'], $sizes[2]['height']);

			//if ($sizes['watermark'])
			//{
			//	self::watermark($img2, $sizes);
			//}
		}
		else
		{

			$img2 = imagecreatetruecolor($sizes[0], $sizes[1]);
			$type = IMG_PNG;

			// Transparency
			if ($type == IMG_GIF or $type == IMG_PNG)
			{
				imagecolortransparent($img2, imagecolorallocatealpha($img2, 0, 0, 0, 127));
				imagealphablending($img2, false);
				imagesavealpha($img2, true);
			}

			$dst_x = 0;
			$dst_y = 0;
			$src_x = $res['sx'];
			$src_y = $res['sy'];
			$dst_w = $sizes[0];
			$dst_h = $sizes[1];
			$src_w = $res['width'];
			$src_h = $res['height'];

			if ($src_x < 0)
			{
				$coeff   = $dst_w / $src_w;
				$shift_x = -$src_x;
				$src_x   = 0;
				$src_w -= $shift_x;
				$dst_x += $shift_x * $coeff;
				$dst_w -= $shift_x * $coeff;
			}
			if ($src_y < 0)
			{
				$coeff   = $dst_h / $src_h;
				$shift_y = -$src_y;
				$src_y   = 0;
				$src_h -= $shift_y;
				$dst_y += $shift_y * $coeff;
				$dst_h -= $shift_y * $coeff;
			}
			if ($src_w + $src_x > $sizes['source']['w'])
			{
				$coeff   = $dst_w / $src_w;
				$shift_x = -($sizes['source']['w'] - $src_w - $src_x);
				$src_w -= $shift_x;
				$dst_w -= $shift_x * $coeff;
			}
			if ($src_h + $src_y > $sizes['source']['h'])
			{
				$coeff   = $dst_h / $src_h;
				$shift_y = -($sizes['source']['h'] - $src_h - $src_y);
				$src_h -= $shift_y;
				$dst_h -= $shift_y * $coeff;
			}

			imagecopyresampled($img2, $img, $dst_x, $dst_y, $src_x, $src_y, $dst_w, $dst_h, $src_w, $src_h);

			//if ($sizes['watermark'])
			//{
			//	self::watermark($img2, $sizes);
			//}
		}
		switch ($type)
		{
			default:
			case IMG_JPEG:
				imagejpeg($img2, $filename, $quality);
				break;
			case IMG_GIF:
				imagegif($img2, $filename);
				break;
			case IMG_PNG:
				imagepng($img2, $filename, intval(($quality - 20) / 10));
				break;
		}

		imagedestroy($img2);
	}
}