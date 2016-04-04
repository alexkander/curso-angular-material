<?php

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
  ), $options);

  // Variablle para el retorno.
  $ret = array();

  // recorer las careptas
  foreach ($folders as $folder) {

    $list = glob("{$folder}/*");

    foreach ($list as $item) {

      $item = realpath($item);

      // Si cumple con la regex
      if(preg_match_all($options['include'], $item, $m) && !preg_match($options['exclude'], $item)){

        if((is_file($item) && $options['files']) ||
          (is_dir($item) && $options['dirs'])){
          $ret[] = $m[$options['return']][0];
        }
        
      }

      // Si es un directorio se pide explorar recursivamente
      if(is_dir($item) && $options['recursive']){

        $ret = array_merge($ret, amGlobFiles($item, $options));

      }

    }

  }

  return $ret;

}

$dirBase = realpath(dirname(__FILE__).'/../');
$files = amGlobFiles(array(
  $dirBase
),array(
));

  // Obtener nombre del archivo comprimido temporal
$zip = new ZipArchive();  // Instanciar comprimido

do{
  $zipfilePath = dirname(__FILE__).'/../../storage/dwn-'.date('YmdHis').".zip";
}while(file_exists($zipfilePath));

// Crear el directorio destino si no existe
@mkdir(dirname($zipfilePath), 0755, true);

// Crear archivos comprimido
if($zip->open($zipfilePath, ZIPARCHIVE::CREATE)===true) {

  // Obtener los nombres fisicos de los archivos a descargar
  foreach ($files as $i => $fileName){
    $fileName = realpath($fileName);
    $fileNameNew = substr_replace($fileName, '', 0, strlen($dirBase)+1);
    $zip->addFile($fileName, $fileNameNew);
  }

  $zip->close();

  header('content-type: application/zip');
  header('Content-Disposition: attachment; filename="'.basename($zipfilePath).'"');
  header('Content-Transfer-Encoding: binary');
  header('Expires: 0');
  header('Cache-Control: must-revalidate');
  header('Pragma: public');
  header('Content-Length: '. filesize($zipfilePath));
  set_time_limit(0);
  $file = @fopen($zipfilePath,"rb");
  while(!feof($file)){
    print(@fread($file, 1024*8));
    ob_flush();
    flush();
  }

  unlink($zipfilePath);

}