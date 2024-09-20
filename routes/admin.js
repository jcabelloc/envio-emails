const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');


const router = express.Router();


router.get('/crear-producto', isAuth, adminController.getCrearProducto);

router.get('/productos', isAuth, adminController.getProductos);

router.post('/crear-producto', isAuth, adminController.postCrearProducto);

router.get('/editar-producto/:idProducto', isAuth, adminController.getEditarProducto);

router.post('/editar-producto', isAuth, adminController.postEditarProducto);

router.post('/eliminar-producto', isAuth, adminController.postEliminarProducto);


module.exports = router;
