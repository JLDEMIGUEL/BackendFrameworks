'use strict'

var validator = require('validator');
var Article = require('../models/article');
var fs = require('fs');
var path = require('path')

var controller = {

    test: (req, res) => {
        return res.status(200).send({
            status: 'success',
            message: "Conexion correcta"
        })
    },

    save: (req, res) => {
        //Recoger parametros post
        var params = req.body;

        //Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (e) {
            return res.status(400).send({
                status: 'error',
                message: "Faltan datos por enviar"
            })
        }

        if (!validate_title || !validate_content) {
            return res.status(400).send({
                status: 'error',
                message: "Los datos no son validos"
            })
        }

        //Crear objeto
        var article = new Article();

        //Asignar valores
        article.title = params.title;
        article.content = params.content;
        
        if(params.image){
            article.image=params.image;
        }else{
            article.image=null;
        }
        //Guardar articulo
        article.save((err, articleStored) => {
            if (err || !articleStored) {
                return res.status(404).send({
                    status: 'error',
                    message: "El articulo no se ha guardado"
                })
            } else {
                return res.status(200).send({
                    status: 'success',
                    message: "Articulo guardado correctamente",
                    article: articleStored
                })
            }
        })
    },

    getArticles: (req, res) => {

        var query = Article.find({});
        var last = Number(req.params.last);

        if (Number.isInteger(last)) {
            query.limit(last);
        }

        query.sort('-date').exec((err, articles) => {
            if (err) {
                return res.status(400).send({
                    status: 'error',
                    message: "No se ha podido cargar los articulos",
                })
            } else if (!articles) {
                return res.status(400).send({
                    status: 'error',
                    message: "No hay articulos",
                })
            } else {
                return res.status(200).send({
                    status: 'success',
                    message: "Articulos",
                    articles
                })
            }

        });
    },
    getArticle: (req, res) => {

        var articleId = req.params.id;

        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: 'error',
                message: "No existe el articulo",
            })
        }

        Article.findById(articleId, (err, article) => {
            if (err || !article) {
                return res.status(404).send({
                    status: 'error',
                    message: "Error al mostrar articulo",
                })
            } else {
                return res.status(200).send({
                    status: 'success',
                    message: "Articulo",
                    article
                })
            }
        });
    },

    update: (req, res) => {

        var articleId = req.params.id;

        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: 'error',
                message: "No existe el articulo",
            })
        }

        var params = req.body;


        //Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (e) {
            return res.status(400).send({
                status: 'error',
                message: "Faltan datos por enviar"
            })
        }

        if (!validate_title || !validate_content) {
            return res.status(400).send({
                status: 'error',
                message: "Los datos no son validos"
            })
        }

        Article.findOneAndUpdate({ _id: articleId }, params, { new: true }, (err, articleUpdated) => {
            if (err || !articleUpdated) {
                return res.status(400).send({
                    status: 'error',
                    message: "Error al actualizar"
                })
            }
            return res.status(200).send({
                status: 'success',
                message: "Articulo actualizado",
                article: articleUpdated
            })
        });
    },

    delete: (req, res) => {


        var articleId = req.params.id;

        if (!articleId || articleId == null) {
            return res.status(404).send({
                status: 'error',
                message: "No existe el articulo",
            })
        }

        Article.findOneAndRemove({ _id: articleId }, (err, articleDeleted) => {
            if (err || !articleDeleted) {
                return res.status(400).send({
                    status: 'error',
                    message: "Error al borrar artilculo"
                })
            }
            return res.status(200).send({
                status: 'success',
                message: "Articulo borrado",
                article: articleDeleted
            })
        })
    },

    upload: (req, res) => {

        var articleId = req.params.id;

        var file_name = 'Imagen no subida';

        if (!req.files) {
            return res.status(400).send({
                status: 'error',
                message: "Error al subir imagen"
            })
        }

        file_name = req.files.file0.path.split('\\')[2];

        var extension = file_name.split('\.')[1];

        if (extension != 'jpg' && extension != 'png' && extension != 'jpeg' && extension != 'gif') {

            fs.unlink(req.files.file0.path, (err) => {
                return res.status(400).send({
                    status: 'error',
                    message: "Extension imagen no valido"
                })
            });
        } else {
            if(articleId){
                Article.findOneAndUpdate({ _id: articleId }, { image: file_name }, { new: true }, (err, articleUpdated) => {
                    if (err || !articleUpdated) {
                        return res.status(400).send({
                            status: 'error',
                            message: "Error al actualizar"
                        })
                    }
                    return res.status(200).send({
                        status: 'success',
                        message: "Imagen subida correctamente",
                        file_name
                    })
                })
            }else{
                return res.status(200).send({
                    status: 'success',
                    message: "Imagen subida correctamente",
                    file_name
                })
            }


        }
    },

    getImage: (req, res) => {

        var file = req.params.image;
        var path_file = "./upload/articles/" + file;

        fs.exists(path_file, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(path_file));
            } else {
                return res.status(400).send({
                    status: 'error',
                    message: "La imagen no existe"
                })
            }
        })


    },

    search: (req, res) => {

        var search = req.params.search;

        Article.find({
            "$or": [
                {
                    "title": { "$regex": search, "$options": "i" },
                    "content": { "$regex": search, "$options": "i" },
                }
            ]
        }).sort([['date','descending']]).exec((err,articles)=>{
            if (err || !articles || articles.length==0) {
                return res.status(400).send({
                    status: 'error',
                    message: "Error al buscar articulo"
                })
            }
            return res.status(200).send({
                status: 'success',
                message: "Articulos encontrados",
                articles
            })
        });

    }
};



module.exports = controller;