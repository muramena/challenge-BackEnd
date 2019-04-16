# Challenge BackEnd

Esta es mi entrega en lo que es el challenge de BackEnd.

##### La consigna fue:

*Crear un sistema de compras de entradas de peliculas. El sistema manejara 2 tipos de roles de usuarios:*
*Usuario comun: es capaz de ver todas las peliculas y los cines en los que estan disponibles y comprar una determinada cantidad de entradas para una funcion.*
*Usuario admin: ademas de ver el listado de cines y peliculas que tienen funcion en cada uno, es capaz de agregar y editar la informacion de estos.*
*Ambos usuarios deben contar con la informacion basica y necesaria: nombre, apellido, email, direccion, telefono (opcional: imagen de perfil).*
*Al momento de la compra, debera persistirse: el usuario que la realizo, la pelicula que se proyectara, en que cine, y el horario.*
*El sistema debera utilizar JWT para la autentificacion de los usuarios.*

*EXTRA:*
*Considerar que el cine podria llegar a tener mas de una sala (donde se proyectaran las peliculas ) con capacidades diferentes, tener estos datos en cuenta al momento de la compra.*
*Use the package manager [pip](https://pip.pypa.io/en/stable/) to install foobar.*



### Situación actual

- El sistema permite registro y logeo de usuarios (comun o cliente, y administrador).
- Además de eso se pueden crear/eliminar cines, salas, películas, funciones y registrar ventas (previo checkeo de token y tipo de usuario en caso de ser necesario).
  - Hay checkeos para ver que una sala este disponible a la hora de crear una función, y que no vaya a ser ocupada durante la duración de la película
  - No es posible vender más entradas que la capacidad de la sala.
  - Cuando se elimina un cine, se eliminan de manera automática todas sus salas (eliminación lógica para mantener un registro histórico de funciones)
  - Cuando se elimina una función, se eliminan automáticamente sus tickets o entradas (eliminación real)

### Faltaría:

- Subida de imágenes de perfíl
- Validación de teléfono en el objeto de usuario
- Normalizar la dirección en la colección de usuarios
- Eliminar funciones futuras a la hora de eliminar una sala

## Instalación
Una vez copiado el repositorio, ejecutar el comando 
```
npm install
```

Luego de eso, montar el servidor (el archivo base del servidor que se encuentra en la carpeta **_server_**)

(Ejecutar por ejemplo el siguiente comando desde la ruta base)
```
node .\server\server.js
```

## Documentación de los endpoints
[MIT](https://choosealicense.com/licenses/mit/)