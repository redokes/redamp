<?php
require_once dirname(__FILE__) . '/AjaxController.php';
class CrudController extends AjaxController {
	public $model;
	public $modelInstance;
	public $primaryKey;
	
	public function init(){
		$this->modelInstance = new $this->model();
		return parent::init();
	}
	
	public function createAction() {
		$records = json_decode($_REQUEST['records'], true);
		$response = array();
		
		//Update each record
		foreach($records as $record){
			//remove the id field
			unset($record[$this->primaryKey]);
			$model = new $this->model();
			$model->insert($record);
			$response[] = $this->formatRow($model->get());
		}
		
		$this->setParam('records', $response);
	}
	
	public function readAction() {
		//Check if this is a single read
		if(getParam('id')){
			$model = new $this->model(intval(getParam('id')));
			$records = array(
				$this->formatRow($model->get())
			);
			$this->setParam('records', $records);
			return;
		}
		
		// get submitted params
		$sortBy = getParam('sort', false);
		$filter = json_decode(getParam('filter', '{}'), true);
		
		// Setup the filtering and query variables
		$start = intval(getParam('start', 0));
		$limit = intval(getParam('limit', 0));
		
		//Fields to select
		$fields = $this->getFields();
		
		//From to use
		$from = $this->getFrom();
		
		//Join tables
		$join = $this->getJoin();
		
		//Base where clause
		$where = $this->getWhere();
		
		//Sort
		$sort = $this->getSort();
		
		if ($sortBy) {
			$sortArray = json_decode($sortBy, true);
			$numSorters = count($sortArray);
			$sort = array();
			for ($i = 0; $i < $numSorters; $i++) {
				$sort[] = $sortArray[$i]['property'] . ' ' . $sortArray[$i]['direction'];
			}
		}
		
		//Filter
		$where = array_merge($where, $this->applyFilter($filter));
		

		
		// convert query data to sql
		$fieldsSql = implode(',', $fields);
		$fromSql = ' FROM ' . implode(',', $from);
		$joinSql = implode(' ', $join);
		$whereSql = 'WHERE ' . implode(' AND ', $where);
		if (!count($where)) {
			$whereSql = '';
		}
		$sortSql = implode(',', $sort);

		// get total count
		$total = 0;
		$totalQuery = "SELECT COUNT(*) total $fromSql $joinSql $whereSql";
		$row = LP_Db::fetchRow($totalQuery);
		if ($row) {
			$total = $row['total'];
		}
		$this->setParam('total', $total);
		
		// get records
		$query = "SELECT $fieldsSql $fromSql $joinSql $whereSql";
		$this->setParam('query', $query);
		if($limit){
			$query = LP_Util::buildQuery($query, $sortSql, $limit, $start);
		}
		$rows = LP_Db::fetchAll($query);
		$numRows = count($rows);
		$records = array();
		
		//Format rows
		foreach ($rows as $row){
			$records[] = $this->formatRow($row);
		}
		
		$this->setParam('records', $records);
	}
	
	public function updateAction() {
		$records = json_decode($_REQUEST['records'], true);
		$response = array();
		//Update each record
		foreach($records as $record){
			$model = new $this->model($record[$this->primaryKey]);
			unset($record[$this->primaryKey]);
			$model->setArray($record);
			$model->save();
			$response[] = $this->formatRow($model->get());
		}
		
		$this->setParam('records', $response);
	}
	
	public function destroyAction() {
		$records = json_decode($_REQUEST['records'], true);
		$response = array();
		foreach($records as $record){
			$model = new $this->model($record[$this->primaryKey]);
			$model->delete();
		}
	}
	
	public function getFields(){
		return array(
			'*'
		);
	}
	
	public function getFrom(){
		return array(
			$this->modelInstance->m_sTableName
		);
	}
	
	public function getJoin(){
		return array();
	}
	
	public function getWhere(){
		return array(
			'1=1'
		);
	}
	
	public function getSort(){
		return array(
			"$this->primaryKey DESC"
		);
	}
	
	public function applyFilter($filter){
		$where = array();
		foreach ($filter as $filterObject){
			$value = LP_Db::escape($filterObject['value']);
			$where[] =  "{$filterObject['property']} = $value";
		}
		return $where;
	}
	
	public function formatRow($row){
		return $row;
	}
}