<?php

class AjaxController {

	private $_returnCode = array();
	private $_errors = array();
	private $_messages = array();
	private $_redirect = '';
	private $_sendPlainText = false;
	
	public $actionName = false;
	public $moduleName = false;
	public $controllerName = false;
	
	public function indexAction() {
		
	}
	
	/**
	 * Allow subclasses repeated functionality across all actions within a single controller
	 * if all actions need some of the same resources or configuration
	 */
	public function init() {}
	
	/**
	 * Allow subclasses repeated functionality across all actions within a single controller
	 * if all actions need some of the same processing after performing the action
	 */
	public function afterAction() {}
	
	public function parseRequest($request = false) {
		if (!$request) {
			$request = $_SERVER['REQUEST_URI'];
		}
		
		// Break apart request into directory structure
		$parts = explode('/', trim($request, '/'));
		
		// Ignore ? params in the url
		$parts[count($parts)-1] = reset(explode('?', end($parts)));
		
		$numParts = count($parts);
		$this->actionName = 'index';
		if ($numParts >= 3) {
			$this->moduleName = $this->getModuleName($parts[1]);
			$this->controllerName = $this->getControllerName($parts[2]);
			if ($numParts > 3) {
				$this->actionName = $this->getActionName($parts[3]);
			}
			else {
				$this->actionName = $this->getActionName($this->actionName);
			}
		}
	}
	
	public function run() {
		// look for controller class
		$controllerFile = __DIR__ . '/' . $this->moduleName . '/' . $this->controllerName . '.php';
		if (is_file($controllerFile)) {
			include_once $controllerFile;
			$controllerClassName = $this->moduleName . '_' . $this->controllerName;
			if (class_exists($controllerClassName, true)) {
				$controllerClass = new $controllerClassName();
				$controllerClass->init();
				$controllerClass->doAction($this->actionName);
				$controllerClass->afterAction();
				return $controllerClass;
			}
		}
	}
	
	/**
	 * Run the class action method
	 * @param string $actionName
	 * @return bool
	 */
	public function doAction($actionName) {
		if (method_exists($this, $actionName)) {
			$this->$actionName();
			return true;
		}
		return false;
	}
	
	/**
	 *
	 * @param string $str Module name based on the request string
	 * @return string Properly formatted module name to be used for the class name and directory structure
	 */
	public function getModuleName($str) {
		$str = strtolower($str);
		$parts = explode('-', $str);
		$numParts = count($parts);
		for ($i = 0; $i < $numParts; $i++) {
			$parts[$i] = ucfirst($parts[$i]);
		}
		return implode('', $parts);
	}
	
	/**
	 *
	 * @param string $str Controller name based on the request string
	 * @return string Properly formatted controller name to be used for the class name and directory structure
	 */
	public function getControllerName($str) {
		$str = strtolower($str);
		$parts = explode('-', $str);
		$numParts = count($parts);
		for ($i = 0; $i < $numParts; $i++) {
			$parts[$i] = ucfirst($parts[$i]);
		}
		return implode('', $parts) . 'Controller';
	}
	
	/**
	 *
	 * @param string $str Action name based on the request string
	 * @return string Properly formatted action name to be used for the class name and directory structure
	 */
	public function getActionName($str) {
		$str = strtolower($str);
		$parts = explode('-', $str);
		$numParts = count($parts);
		for ($i = 1; $i < $numParts; $i++) {
			$parts[$i] = ucfirst($parts[$i]);
		}
		return implode('', $parts) . 'Action';
	}

	public function sendPlainText() {
		$this->_sendPlainText = true;
	}

	public function setRedirect($redirect) {
		$this->_redirect = $redirect;
	}

	public function paramExists($key) {
		return isset($this->_returnCode[$key]);
	}

	public function setParam($key, $value = '') {
		$this->_returnCode[$key] = $value;
	}
	
	public function getParam($key) {
		return $this->_returnCode[$key];
	}

	public function pushParam($key, $value) {
		$this->_returnCode[$key][] = $value;
	}
	
	/**
	 * Pass an error message or an array with a field name for the error message
	 * @param string $message the error message
	 * @param string $field the form field name
	 */
	public function addError($message, $field = false) {
		if(is_array($message)){
			$this->_errors[] = $message;
			return;
		}
		if ($field) {
			$this->_errors[$field] = $message;
		}
		else {
			$this->_errors[] = $message;
		}
	}
	
	/**
	 *
	 * @param string $message 
	 */
	public function addMessage($message) {
		if (is_array($message)) {
			$this->_messages = array_merge($this->_messages, $message);
		}
		else if (strlen($message)) {
			$this->_messages[] = $message;
		}
	}

	public function getReturnCode() {
		return $this->_returnCode;
	}

	public function anyErrors() {
		if (count($this->_errors)) {
			return 1;
		}
		else {
			return 0;
		}
	}
	
	public function setHeaderData() {
		if (count($this->_errors)) {
			$this->_returnCode['success'] = false;
		}
		else {
			$this->_returnCode['success'] = true;
		}
		
		// build error string as list
		$errorStr = '<div class="form-messages form-errors"><ul>';
		foreach($this->_errors as $key => $value) {
			if(is_array($value)){
				$errorStr .= '<li field="' . $value['id'] . '">' . $value['msg'] . '</li>';
			}
			else{
				$errorStr .= '<li field="' . $key . '">' . $value . '</li>';
			}
		}
		$errorStr .= '</ul></div>';
		
		// build message string as list
		$msgStr = '';
		if (count($this->_messages) == 1) {
			$msgStr = $this->_messages[0];
		}
		else if(count($this->_messages) > 1) {
			$msgStr = '<div class="form-messages"><ul>';
			foreach($this->_messages as $key => $value) {
				$msgStr .= '<li field="' . $key . '">' . $value . '</li>';
			}
			$msgStr .= '</ul></div>';
		}

		$this->_returnCode['errors'] = $this->_errors;
		$this->_returnCode['errorStr'] = $errorStr;
		$this->_returnCode['msg'] = $this->_messages;
		$this->_returnCode['msgStr'] = $msgStr;
		$this->_returnCode['redirect'] = $this->_redirect;
	}
	
	public function sendHeaders() {
		$this->setHeaderData();

		if (!headers_sent()) {
			if ($this->_sendPlainText) {
				//echo $this->_returnCode;
			}
			else {
				header('Content-type: application/json');
				echo json_encode($this->_returnCode);
			}
		}
	}

	public function setReturnCode($value) {
		$this->_returnCode = $value;
	}
	
	/**
	 *
	 * @return array
	 */
	public function getErrors() {
		return $this->_errors;
	}
	
	public function setErrors($errors){
		$this->_errors = $errors;
	}

	public function sendTextHeaders() {
		if (count($this->_errors)) {
			$this->_returnCode['success'] = false;
		}
		else {
			$this->_returnCode['success'] = true;
		}

		$this->_returnCode['errors'] = $this->_errors;
		$this->_returnCode['redirect'] = $this->_redirect;

		//Add in "msg" param for ext forms
		$this->_returnCode['msg'] = $this->_messages;

		echo json_encode($this->_returnCode);
	}

}