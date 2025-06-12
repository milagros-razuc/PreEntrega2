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
        if(!producto){                                                                   //Verifica que existe el producto
            res.status(404).json({ error: 'Producto no encontrado' }); 
            return;
        }

    await disconnectFromMongoDB();
        res.json(producto);
});

// METODO POST
app.post('/productos/', async(req,res)=>{
        const nuevoProd = req.body;
        if (nuevoProd === undefined){                                                   //Verifica formato 
            res.status(400).send('Error en el formato de datos enviados');
            return;
        };

         if (!nuevoProd.codigo || typeof nuevoProd.codigo !== 'number') {             // Verifica que tenga el campo 'codigo' y que sea un numero
        return res.status(400).send('El campo "codigo" es requerido y debe ser un número');
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
            console.error(error);
        })
        .finally(()=>{
            client.close();
        });

});

//METODO PUT
app.put('/productos/:codigo',async(req,res)=>{
    const codigo = parseInt(req.params.codigo);
    const nuevosDatos=req.body;

    if(!nuevosDatos){                                                              //Verifica el formato
        res.status(400).send('Error en el formato de datos recibidos.');
    }

    const client = await connectToMongoDB();
        if(!client){
            res.status(500).send('Error al conectarse a MongoDB');
            return;
        }

    const collection = client.db('ENTREGA2').collection('supermercado');
    
    const productoExistente = await collection.findOne({ codigo: codigo });

        if (!productoExistente) {                                                     //Verifica que exista el producto a actualizar
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
        res.status(500).json({descripcion:'Error al modificar el producto'});
    })
    .finally(()=>{
        client.close();
    });
});

//  METODO DELETE

app.delete('/productos/:codigo',async(req,res)=>{
    const codigo = req.params.codigo;
    if (!req.params.codigo){
        return res.status(400).send('El formato de datos es erroneo o invalido');
    }

    const client = await connectToMongoDB();
        if(!client){
            res.status(500).send('Error al conectarse a MongoDB');
            return;
        }
    
    client.connect()
    .then(()=>{
        const collection = client.db('ENTREGA2').collection('supermercado');
        return collection.deleteOne({codigo: parseInt(codigo)})
    })
    .then((resultado)=>{
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
        client.close();
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

