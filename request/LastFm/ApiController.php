<?php
use RedAmp\Util as Util;
use RedAmp\Curl as Curl;

class LastFm_ApiController extends AjaxController {
	private $url = 'http://ws.audioscrobbler.com/2.0/';
	private $apiKey = '6c3d64c191c37cac16abe99b3f1301be';
	private $secret = 'd99283ef9f032d8dbccc05d7d29ef749';
	
	public function requestAction(){
		//Get the params
		$params = $_POST;
		
		//Check for a type
		$type = 'get';
		if(isset($params["_type"])){
			$type = strtolower($params["_type"]);
			unset($params["_type"]);
		}
		
		//Add the api key
		$params['api_key'] = $this->apiKey;
		
		//Apply the json format
		$params['format'] = 'json';
		
		//send the request
		$this->sendRequest($params, $type);
	}
	
	public function signedRequestAction(){
		//Get the params
		$params = $_POST;
		
		//Check for a type
		$type = 'get';
		if(isset($params["_type"])){
			$type = strtolower($params["_type"]);
			unset($params["_type"]);
		}
		
		//Add the api key
		$params['api_key'] = $this->apiKey;
		
		//Get the signature
		$signature = $this->getSignature($params);
		
		//Apply the signature to the params
		$params['api_sig'] = $signature;
		
		//Apply the json format
		$params['format'] = 'json';
		
		//send the request
		$this->sendRequest($params, $type);
	}
	
	private function sendRequest($params, $type = 'get'){
		switch ($type){
			case 'post':
				$response = Curl::post($this->url, $params);
			break;
		
			default:
				$response = Curl::get($this->url, $params);
			break;
		}
		
		//Process the response
		if($response){
			$response = json_decode($response, true);
		}
		else{
			$response = array();
			$this->addError('Request failed.');
		}
		
		//Clean the response
		$this->cleanResponse($response);
		
		//Add any errors
		if(isset($response['error']) && isset($response['message'])){
			$this->addError($response['message']);
		}
		
		//Set the response
		foreach ($response as $key => $value){
			$this->setParam($key, $value);
		}
	}
	
	private function getSignature($params) {
		ksort($params);
		$str = '';
		foreach($params as $key => $value) {
			$str .= $key . $value;
		}
		$str = utf8_encode($str);
		$str .= $this->secret;
		$str = md5($str);
		return $str;
	}
	
	public function cleanResponse(&$response){
		foreach ($response as $key => $value){
			if(is_string($key)){
				$newKey = trim($key, '#@');
				if($newKey != $key){
					$response[$newKey] = $value;
					unset ($response[$key]);
					$key = $newKey;
				}
			}
			if(is_array($value)){
				$response[$key] = $this->cleanResponse($value);
			}
		}
		return $response;
	}
}