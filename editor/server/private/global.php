<?php

// Se ejecuta desde la raíz del editor
define('ROOT_SERVER', realpath(dirname(__FILE__).'/../'));
define('ROOT_SITE', realpath(ROOT_SERVER.'/../'));
chdir(ROOT_SERVER);

function _define($name, $dir){

  @mkdir($dir, 0755, true);
  define($name, realpath($dir));

}

_define('STORATE_DIR', ROOT_SITE. '/storage');

_define('PROJECTS_DIR', STORATE_DIR.'/projects');
define('PROJECTS_JSON', PROJECTS_DIR. '/projects.json');

function response($success, $data = null){

  $response = array();

  if($success === false){
    $response['success'] = false;
    if(isset($data)){
      $response['ddd'] = $data;
    }
  }else{
    $response['success'] = true;
    if(isset($data)){
      $response['ddd'] = $data;
    }else if($success !== true){
      $response['ddd'] = $success;
    }
  }
  
  header('content-type:application/json');
  echo json_encode($response);
  
}

function chechkMethod($methodName){

  if(strtolower($_SERVER['REQUEST_METHOD']) !== strtolower($methodName)){
    response(false);
    exit;
  }

}

function amGlobFiles($folders, array $options = array()){

  // Convertir en array si no es un array.
  if(!is_array($folders))
    $folders = array($folders);

  // Opciones por defcto
  $options = array_merge(array(
    'files' => true,
    'dirs' => false,
    'recursive' => true,
    'include' => '/.*/',
    'exclude' => '/^$/',
    'return' => 0,
    'root' => null,
    'callback' => null,
  ), $options);

  if(isset($options['root'])){
    $options['root'] = realpath($options['root']);
  }

  // Variablle para el retorno.
  $ret = array();

  // recorer las careptas
  foreach ($folders as $folder) {

    $folder = realpath($folder);

    if(!$folder)
      continue;

    $list = glob("{$folder}/*");

    foreach ($list as $item) {

      $item = realpath($item);

      // Si cumple con la regex
      if(preg_match_all($options['include'], $item, $m) && !preg_match($options['exclude'], $item)){

        if((is_file($item) && $options['files'] === true) ||
          (is_dir($item) && $options['dirs'] === true)){
          $path = $m[$options['return']][0];

          if($options['root'])
            $path = substr_replace($path, '', 0, strlen($options['root'])+1);

          if(is_callable($options['callback'])){
            $key = null;
            $callback = $options['callback'];
            $value = $callback($path, $key);

            if(isset($key))
              $ret[$key] = $value;
            else
              $ret[] = $value;

          }else{
            $ret[] = $path;
          }

        }
        
      }

      // Si es un directorio se pide explorar recursivamente
      if(is_dir($item) && $options['recursive'] === true){

        $ret = array_merge($ret, amGlobFiles($item, $options));

      }

    }

  }

  return $ret;

}

// Clase para manejar los datos
class Table{

  protected
    $file = null,
    $data = array('id' => 0);

  public function __construct($file){

    $this->file = $file;

    $this->read();

  }

  public function read(){

    if(file_exists($this->file))
      $this->data = json_decode(file_get_contents($this->file), true);

  }

  public function save(){

    $data = $this->data;
    unset($data['records']);
    file_put_contents($this->file, json_encode($data));

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

class Project{

  protected static $data = null;
  protected $id = null;
  public $name = null;
  public $type = '';

  public function __construct($id){

    if(!isset(self::$data) && $this->conftableExists())
      self::$data = $this->conftable();
    else
      self::$data = array('id' => 0);

    $this->id = intval($id);

    if(!$this->isNew() && $this->confExists()){

      $data = $this->conf();

      $this->name = @$data['name'];
      $this->type = @$data['type'];

    }

  }

  public function save(array $codes = array()){

    if($this->isNew()){
      $this->id = self::_nid();
      $this->saveconftable();
    }

    if(empty($this->name))
      $this->name = self::_id($this->id);

    @mkdir($this->dir(), 0755, true);

    file_put_contents($this->confpath(), json_encode([
      'name' => $this->name,
      'type' => $this->type,
    ]));

    foreach ($codes as $name => $value) {
      file_put_contents($this->dir().'/'.$name, $value['code']);
    }

  }

  public function delete(){

    $dirname = $this->dir();
    array_map('unlink', glob("$dirname/*.*"));
    return !!@rmdir($dirname);
    
  }

  public function id(){

    return self::_id($this->id);

  }

  public function dir(){

    return self::_dir($this->id());

  }

  public function isNew(){

    return !isset($this->id) || $this->id === 0;

  }

  public function confpath(){

    return self::_confpath($this->id());

  }

  public function conf(){

    return json_decode(file_get_contents($this->confpath()), true);

  }

  public function confExists(){

    return is_file($this->confpath());

  }

  public function files(){

    $dir = $this->dir();
    return amGlobFiles($dir, [
      'root' => $dir,
      'exclude' => '/\.json$/',
    ]);

  }

  public function url(){

    return 'storage/projects/'.$this->id().'/';

  }

  public function arr(){

    return [
      'id' => $this->id,
      'name' => $this->name,
      'type' => $this->type,
      'url' => $this->url(),
      'files' => $this->files(),
    ];

  }

  public function conftablepath(){

    return PROJECTS_DIR.'/projects.json';

  }

  public function conftable(){

    return json_decode(file_get_contents($this->conftablepath()), true);

  }

  public function saveconftable(){

    file_put_contents($this->conftablepath(), json_encode(self::$data));

  }

  public function conftableExists(){

    return is_file($this->conftablepath());

  }

  private static function _nid(){

    $id = self::$data['id']+1;

    if(!is_file(self::_confpath($id)))
      return $id;

    self::$data['id']++;

    return self::_nid();

  }

  public static function _id($id){

    return sprintf('%04d', $id);

  }

  private static function _dir($id){

    return PROJECTS_DIR . '/'.self::_id($id);

  }

  private static function _confpath($id){

    return self::_dir($id).'/project.json';

  }

  public static function all(){

    $groups = array();

    $fn = function($item, &$key) use(&$groups){

      $key = intval(basename($item));
      $p = new Project($key);

      if(!isset($groups[$p->type]))
        $groups[$p->type] = array();

      $groups[$p->type][] = $p->id;

      return $p->arr();

    };

    $ret = amGlobFiles(PROJECTS_DIR, [
      'dirs' => true,
      'files' => false,
      'recursive' => false,
      'callback' => $fn]);

    return array('groups' => $groups, 'records' => $ret);

  }

}