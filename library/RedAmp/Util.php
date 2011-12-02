<?php
namespace RedAmp;

class Util {
	public static function dump($a){
		echo '<pre>'. preg_replace('/Array\n[ \t]*\(/', 'Array (', print_r( $a, 1 ) ) .'</pre>';
	}
}
