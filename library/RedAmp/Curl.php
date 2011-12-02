<?php
namespace RedAmp;

class Curl {
	
	public static function get($url, $params){
		$keyValues = array();
		foreach($params as $key => $value) {
			$keyValues[] = $key . '=' . urlencode($value);
		}
		$params = implode('&', $keyValues);
		$url = $url . "?" . $params;
		
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_POST, FALSE);
		curl_setopt($ch, CURLOPT_HTTPGET, TRUE);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
		curl_setopt($ch, CURLOPT_VERBOSE, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, null);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_HEADER, 0);  // DO NOT RETURN HTTP HEADERS
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  // RETURN THE CONTENTS OF THE CALL
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
		curl_setopt($ch, CURLOPT_TIMEOUT, 20);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 20);
		curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
		$response = curl_exec($ch);
		
		//Handle error
		$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		if($responseCode == 404 || $responseCode == 500) {
			return false;
		}
		
		//Close the handler
		curl_close($ch);
		
		//Return successful response
		return $response;
	}
	
	public static function post($url, $params = array()) {
		$keyValues = array();
		foreach($params as $key => $value) {
			$keyValues[] = $key . '=' . urlencode($value);
		}
		$params = implode('&', $keyValues);
		
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_VERBOSE, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt($ch, CURLOPT_HEADER, 0);  // DO NOT RETURN HTTP HEADERS
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);  // RETURN THE CONTENTS OF THE CALL
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
		curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
		curl_setopt($ch, CURLOPT_TIMEOUT, 20);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 20);
		curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
		$response = curl_exec($ch);
		
		//Handle error
		$responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		if($responseCode == 404 || $responseCode == 500) {
			return false;
		}
		
		//Close handler
		curl_close($ch);
		
		//Return successfull response
		return $response;
	}
}
