## INDICE
- [INDICE](#indice)
- [INTRODUCCION](#introduccion)
- [ESTRUCTURA DE DATOS](#estructura-de-datos)
- [URL BASE](#url-base)
- [ENDPOINTS DISPONIBLES](#endpoints-disponibles)
  - [Ejemplos de uso](#ejemplos-de-uso)
    - [**Metodo GET**](#metodo-get)
    - [Obtener todos los productos](#obtener-todos-los-productos)
    - [Obtener un producto por código](#obtener-un-producto-por-código)
    - [**Metodo POST**](#metodo-post)
      - [Permite crear un nuevo producto.](#permite-crear-un-nuevo-producto)
    - [**Metodo PUT**](#metodo-put)
      - [Permite actualizar un producto existente por su código.](#permite-actualizar-un-producto-existente-por-su-código)
    - [**Metodo DELETE**](#metodo-delete)
      - [Permite eliminar un producto por su código.](#permite-eliminar-un-producto-por-su-código)
- [ARCHIVO.ENV](#archivoenv)

## INTRODUCCION 

>Este proyecto consiste en el desarrollo de una API RESTful que permite realizar operaciones CRUD (Crear, Leer, Actualizar y Eliminar) sobre una colección de productos almacenados en una base de datos MongoDB .
La API está desarrollada con Node.js y Express , siguiendo buenas prácticas de diseño de APIs REST. Fue desarrollada por Milagros Razuc y Rebeca Ozuna

## ESTRUCTURA DE DATOS
Cada producto tiene los siguientes campos:
- `codigo`:número único que identifica al producto.
- `nombre`:nombre comercial del producto.
- `precio`:valor monetario del producto.
- `categoria`:agrupación temática a la que pertenece el producto.
- 
Además, MongoDB agrega automáticamente un campo` _id` como identificador único.

## URL BASE
La URL base de la API es:
```
 http://localhost:<PORT>/ 
 ```
Esta ruta devuelve un mensaje de bienvenida y sirve como punto de entrada principal.

## ENDPOINTS DISPONIBLES
|METODO | RUTA | DESCRIPCION|
|:-----:|------|------------|
|GET|[/productos](/productos)| Obtiene todos los productos|
|GET|[/productos/:codigo](/productos/icodigo)|Obtiene un producto por su codigo|
|POST|[/productos/](/productos/)|Crea un nuevo producto|
|PUT|[/productos/:codigo](/productos/:codigo)|Actualiza un producto existente|
|DELETE|[/productos/:codigo](/productos/:codigo)|Elimina un producto por su ID|

### Ejemplos de uso
#### **Metodo GET**

#### Obtener todos los productos
*REQUEST*
```
GET http://localhost:<PORT>/productos
```
*RESPONSE*
```
[
    {
      "codigo": 7890,
      "nombre": "Pasta dental",
      "precio": 2.99,
      "categoria": "Higiene personal"
    },
    ....
]
```
#### Obtener un producto por código
*REQUEST*
```
GET http://localhost:<PORT>/productos/7890
```
*RESPONSE*
```
    {
      "codigo": 7890,
      "nombre": "Pasta dental",
      "precio": 2.99,
      "categoria": "Higiene personal"
    },
```



#### **Metodo POST**
##### Permite crear un nuevo producto.

*REQUEST*
```
POST http://localhost:<PORT>/productos/

Content-Type: json
     {
      "codigo": 7890,
      "nombre": "Pasta dental",
      "precio": 2.99,
      "categoria": "Higiene personal"
    },

```
*RESPONSE*
```
Producto creado correctamente:
    {
      "codigo": 7890,
      "nombre": "Pasta dental",
      "precio": 2.99,
      "categoria": "Higiene personal"
    }
```
**ERROR HANDLING**

|Problema | Error | Mensaje|
|:-----:|------|------------|
|Se envia un JSON vacio|`400`|Error en el formato de datos enviados |
|El campo `codigo` no existe o no es número|`400`|El campo "codigo" es requerido y debe ser un número' |
|El `codigo` ya existe en la base de datos |`400`| Ya existe un producto con el código `<codigo>`|

#### **Metodo PUT**
##### Permite actualizar un producto existente por su código.

*REQUEST*
```
PUT http://localhost:<PORT>/productos/1828

Content-Type: json
    {
         "precio": 3.99
    },
    //En este caso no es necesario reenviar todo los campos para poder modificarlo
```
*RESPONSE*
```
{
    "message": "Producto actualizado correctamente",
    "modificados": {
        "precio": 3.99
    },
    "producto": {
        "_id": "684391f99a776acd7d61f56d",
        "codigo": 1828,
        "nombre": "Papel de aluminio",
        "precio": 3.99,
        "categoria": "Utensilios de cocina"
    }
}
```
**ERROR HANDLING**

|Problema | Error | Mensaje|
|:-----:|------|------------|
|Se envia un JSON vacio|`400`|Error en el formato de datos recibidos. |
|El `codigo` no existe en la base de datos|`404`|Producto con código `<codigo>` no encontrado |


#### **Metodo DELETE**
##### Permite eliminar un producto por su código.

*REQUEST*
```
DELETE http://localhost:<PORT>/productos/1828
```
*RESPONSE*
```
//Por consola
Producto eliminado
```
**ERROR HANDLING**

|Problema | Error | Mensaje|
|:-----:|------|------------|
|Se envia un JSON vacio|`400`|Error en el formato de datos recibidos. |
|El `codigo` no existe en la base de datos|`404`|Producto con código `<codigo>` no encontrado |


## ARCHIVO.ENV
El archivo .env se utiliza para almacenar configuraciones sensibles o específicas del entorno, como la cadena de conexión a MongoDB.

*Ejemplo*
Crea un archivo llamado .env en la raíz del proyecto y escribe lo siguiente:
```
# Cadena de conexión a MongoDB
MONGO_URI=mongodb+srv://<usuario>:<contraseña>@cluster0.abcd.mongodb.net/<bbdd>?retryWrites=true&w=majority

//Reemplaza <usuario>, <contraseña> y <bbdd> por las credenciales reales. 

# Puerto donde correrá el servidor
PORT=3000
```

