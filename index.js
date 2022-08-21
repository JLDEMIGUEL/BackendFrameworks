'use strict'

//App init
var mongoose = require('mongoose');
var app = require('./app');


//Importar variables de entorno
require('dotenv').config({path:'.env'});

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3900;

mongoose.Promise=global.Promise;
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true })
    .then(() => {
        console.log('Conexion db correcta');

        //Crear servidor y escuchar peticiones http
        app.listen(port, host,()=>{
            console.log('Servidor corriendo correctamente');
        })
    });