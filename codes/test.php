  <html>
    <head>
      <title>Example</title>
    </head>
    <body>
      <ul>
        <?php for($i =0; $i<3; $i++): ?>
          <li>Desde PHP <?php $i ?></li>
        <?php endforeach ?>
      </ul>
      <script>
        var ulTag = a = document.getElementsByTagName('ul')[0];
        for(var i=0; i<3;i++){
          ulTag.innerHTML += '<li>Desde JS '+i+'</li>'
        }
      </script>
    </body>
  </html>
  
  <html>
    <head>
      <title>Example</title>
    </head>
    <body>
      <ul>
      <li>Desde PHP 0</li>
          <li>Desde PHP 1</li>
      <li>Desde PHP 2</li>
      </ul>
      <script>
        var ulTag = a = document.getElementsByTagName('ul')[0];
        for(var i=0; i<3;i++){
          ulTag.innerHTML += '<li>Desde JS '+i+'</li>'
        }
      </script>
    </body>
  </html>
  
   
  <html>
    <head>
      <title>Example</title>
    </head>
    <body>
      <ul>
      <li>Desde PHP 0</li>
          <li>Desde PHP 1</li>
      <li>Desde PHP 2</li>
      <li>Desde JS 0</li>
      <li>Desde JS 1</li>
      <li>Desde JS 2</li>
      </ul>
      <script>
        var ulTag = a = document.getElementsByTagName('ul')[0];
        for(var i=0; i<3;i++){
          ulTag.innerHTML += '<li>Desde JS '+i+'</li>'
        }
      </script>
    </body>
  </html>
  