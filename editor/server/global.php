<?php

// Se ejecuta desde la raíz del editor
chdir(dirname(__FILE__).'/../');
define('JSON_PROJECTS', 'samples/projects.json');

function response($success, $data = null){
  $response = array(
    'success' => $success,
  );
  if($success)
    $response['data'] = $data;

  header('content-type:application/json');
  echo json_encode($response);
  
}

function chechkMethod($methodName){
  if(strtolower($_SERVER['REQUEST_METHOD']) !== strtolower($methodName)){
    response(false);
    exit;
  }
}

// Clase para manejar los datos
class Table{

  protected
    $file = null,
    $data = array('id' => 0, 'records' => array());

  public function __construct($file){

    $this->file = $file;

    $this->read();

  }

  public function read(){

    if(file_exists($this->file))
      $this->data = json_decode(file_get_contents($this->file), true);

  }

  public function save(){

    file_put_contents($this->file, json_encode($this->data));

  }

  public function all(){

    return $this->data['records'];

  }

  public function get($id){

    return isset($this->data['records'][$id])? $this->data['records'][$id] : null;

  }

  public function set($id, array $record){

    $this->data['records'][$id] = $record;

  }

  public function delete($id){

    unset($this->data['records'][$id]);

  }

  public function add(array &$record){

    $record['id'] = $this->id();
    
    $this->set($record['id'], $record);
    
  }

  public function id(){

    $id = $this->data['id']+1;

    if(!isset($this->data['records'][$id]))
      return $id;

    $this->data['id']++;

    return $this->id();

  }

}
