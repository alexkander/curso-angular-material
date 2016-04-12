<?php

require_once dirname(__FILE__).'/private/global.php';

// Obtener nombre del archivo comprimido temporal
$zip = new ZipArchive();  // Instanciar comprimido

do{
  $zipfilePath = STORATE_DIR.'/zips/sirideas-editor-'.date('YmdHis').".zip";
}while(file_exists($zipfilePath));

// Crear el directorio destino si no existe
@mkdir(dirname($zipfilePath), 0755, true);

// Listar archivos a comprimir
$files = amGlobFiles(ROOT_SITE);

$noFiles = amGlobFiles(STORATE_DIR.'/zips/');

$files = array_diff($files, $noFiles);

// Crear archivos comprimido
if($zip->open($zipfilePath, ZIPARCHIVE::CREATE)===true) {

  // Obtener los nombres fisicos de los archivos a descargar
  foreach ($files as $i => $fileName){
    $shortFileName = substr_replace($fileName, '', 0, strlen(ROOT_SITE)+1);
    $zip->addFile($fileName, $shortFileName);
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