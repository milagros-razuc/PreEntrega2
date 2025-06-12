const express = require('express');
const {connectToMongoDB, disconnectFromMongoDB} = require('./src/mongodb');
const app = express();
const PORT =process.env.PORT;

app.use(express.json());


app.use((req,res,next)=>{
    res.header("Content-Type","application/json; charset=utf-8");
    next();
});

//METODOS GET

app.get('/',(req,res)=>{
    res.status(200).end('Bienvenido a la API de Supermercado!'); //General
});

app.get('/productos',async(req,res)=>{
    const client = await connectToMongoDB();
        if(!client){
            res.status(500).send('Error al conectarse a MongoDB');
            return;
        }
    const db = client.db('ENTREGA2');
    const productos = await db.collection('supermercado').find().toArray(); 

    await disconnectFromMongoDB();
        res.json(productos);                                                   //Devuelve todos los productos
});

app.get('/productos/:codigo',async(req,res)=>{
    const codigo= parseInt(req.params.codigo) || 0;
    
    const client = await connectToMongoDB();
        if(!client){
            res.status(500).send('Error al conectarse a MongoDB');
            return;
        }
    const db = client.db('ENTREGA2');
    
    const producto = await db.collection('supermercado').findOne({codigo:codigo});
    
    await disconnectFromMongoDB();//Me aseguro desconectar antes del return
        if(!producto){                                                                   //Verifica que existe el producto
            res.status(404).json({ error: 'Producto no encontrado' }); 
            return;
        }
    res.json(producto);
});

// METODO POST
app.post('/productos', async(req,res)=>{
    const nuevoProd = req.body;
        if (nuevoProd === undefined){                                                   //Verifica formato 
            res.status(400).send('Error en el formato de datos enviados');
            return;
        };
        //Agrego validación por si el producto no trae nombre
        if(!nuevoProd.nombre){
        return res.status(400).send('El campo "nombre" es requerido');
        }

        if (!nuevoProd.codigo || typeof nuevoProd.codigo !== 'number') {             // Verifica que tenga el campo 'codigo' y que sea un numero
        return res.status(400).send('El campo "codigo" es requerido y debe ser un número');
        }

        //Agrego validación por si el producto no trae precio o el precio no es numero
        if(!nuevoProd.precio || typeof nuevoProd.precio !== 'number'){
        return res.status(400).json({error: 'El precio deben ser un número'})
        }
        //Agrego validación por si el producto no trae categoria
        if(!nuevoProd.categoria){
        return res.status(400).send('El campo "categoria" es requerido');
        }
    
    const client = await connectToMongoDB();
        if(!client){
            res.status(500).send('Error al conectarse a MongoDB');
            return;
        }
    
    const db = client.db('ENTREGA2');
    
    const productoExistente = await  db.collection('supermercado').findOne({ codigo: nuevoProd.codigo });     //Verifica que el codigo no exista

        if (productoExistente) {
            return res.status(400).json({
                error: `Ya existe un producto con el código ${nuevoProd.codigo}`
            });
        }

        db.collection('supermercado').insertOne(nuevoProd) 
        .then(()=>{
            console.log('Nuevo producto creado');
            res.status(201).json({message: 'Producto creado correctamente', data: nuevoProd});
        }) 
        .catch(error =>{
            //Agrego info del error para saber de dónde vino
            console.error('Error al insertar el producto',error);
            res.status(500).send('Error al insertar el producto');
        })
        .finally(()=>{
            //Uso la funcion creada en mongodb.js y tmb para que aparezca en consola
            disconnectFromMongoDB();
        });

});

//METODO PUT
app.put('/productos/:codigo',async(req,res)=>{
    const codigo = parseInt(req.params.codigo);
    const nuevosDatos=req.body;

    //Agrego validacion por si trae un objeto vacío o sin claves
    if(!nuevosDatos || Object.keys(nuevosDatos).length === 0 ){                                                              //Verifica el formato
        return res.status(400).send('Error en el formato de datos recibidos.');
    }
    //Agregué validacion en caso que no sea un codigo no sea un número
    if(isNaN(codigo)){
        return res.status(400).json({error: 'El código debe ser un número'})
    }

    const client = await connectToMongoDB();
        if(!client){
            res.status(500).send('Error al conectarse a MongoDB');
            return;
        }

    const collection = client.db('ENTREGA2').collection('supermercado');
    
    const productoExistente = await collection.findOne({ codigo: codigo });

    if (!productoExistente) {      
        //aseguro que se desconecte antes del return 
        disconnectFromMongoDB();                                              //Verifica que exista el producto a actualizar
        return res.status(404).json({ error: `Producto con código ${codigo} no encontrado` });
    }


    collection.updateOne({codigo: parseInt(codigo)},{$set: nuevosDatos})               //Actualiza el producto
    .then(async () => {
        const productoActualizado = await collection.findOne({ codigo: parseInt(codigo) }); 

        console.log('Producto modificado');
        res.status(200).json({
            message: 'Producto actualizado correctamente',
            modificados: nuevosDatos,
            producto: productoActualizado
        });
    })
    .catch((error)=>{
        res.status(500).json({
            descripcion:'Error al modificar el producto',
            error: error
        });
    })
    .finally(()=>{
        disconnectFromMongoDB();
    });
});

//  METODO DELETE

app.delete('/productos/:codigo',async(req,res)=>{
    const codigo = parseInt(req.params.codigo);

    //Valida si no hay código o si el código no es num
    if (!codigo || isNaN(codigo)){
        return res.status(400).send('El código debe ser un número');
    }

    const client = await connectToMongoDB();
        if(!client){
            res.status(500).send('Error al conectarse a MongoDB');
            return;
        }
    //No hace falta hacer de vuelta client connect, ya lo hace connectToMongoDB
    const collection = client.db('ENTREGA2').collection('supermercado');
    
    collection.deleteOne({codigo: codigo})
    
    .then(resultado=>{
        if (resultado.deletedCount ===0){
            res.status(404).json({ error: `Producto con código ${codigo} no encontrado` });
        } else{
            console.log('Producto eliminado');
            res.status(204).send();
        }
    })
    .catch((error)=>{
        console.error(error);
        res.status(500).send('Se produjo un error al intentar eliminar el producto');
    })
    .finally(()=>{
        disconnectFromMongoDB();
    });

})



app.use((req, res) => {
    res.status(404).send(`
        <h1>⚠️ Página no encontrada</h1>
        <p>Lo sentimos, el recurso que buscas no existe.</p>
        <a href="/">Volver al inicio</a>
    `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('Servidor corriendo en http://localhost:' + PORT);
});

