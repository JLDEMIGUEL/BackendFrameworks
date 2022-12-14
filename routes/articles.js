'use strict'

var express = require('express');
var ArticleController = require('../controllers/article');
var router = express.Router();

var multyparty = require('connect-multiparty');
var md_upload = multyparty({uploadDir:'./upload/articles'})

//Rutas de prueba
router.get('/test',ArticleController.test);

//Rutas articulos
router.post('/save',ArticleController.save);
router.get('/articles/:last?',ArticleController.getArticles);
router.get('/article/:id',ArticleController.getArticle);
router.put('/article/:id',ArticleController.update);
router.delete('/article/:id',ArticleController.delete);
router.post('/upload-image/:id?',md_upload,ArticleController.upload);
router.get('/get-image/:image',ArticleController.getImage);
router.get('/search/:search',ArticleController.search);

module.exports = router;