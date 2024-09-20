const bcrypt = require('bcryptjs');

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const Usuario = require("../models/usuario");

const APIKEY = 'AQUI VIENE EL API KEY';

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        APIKEY
    }
  })
);


exports.getIngresar = (req, res, next) => {
  let mensaje = req.flash('error');
  if (mensaje.length > 0) {
    mensaje = mensaje[0];
  } else {
    mensaje = null;
  }
  res.render('auth/ingresar', {
    path: '/ingresar',
    titulo: 'Ingresar',
    autenticado: false,
    mensajeError: mensaje
  });
};


exports.postIngresar = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  Usuario.findOne({ email: email })
    .then(usuario => {
      if (!usuario) {
        req.flash('error', 'Invalido email o password');
        return res.redirect('/ingresar');
      }
      bcrypt
        .compare(password, usuario.password)
        .then(hayCoincidencia => {
          if (hayCoincidencia) {
            req.session.autenticado = true;
            req.session.usuario = usuario;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalido email o password');
          res.redirect('/ingresar');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/ingresar');
        });
    })
    .catch(err => console.log(err));
};

exports.getRegistrarse = (req, res, next) => {
  let mensaje = req.flash('error');
  if (mensaje.length > 0) {
    mensaje = mensaje[0];
  } else {
    mensaje = null;
  }
  res.render('auth/registrarse', {
    path: '/registrarse',
    titulo: 'Registrarse',
    autenticado: false,
    mensajeError: mensaje
  });
};

exports.postRegistrarse = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const passwordConfirmado = req.body.passwordConfirmado;
  Usuario.findOne({ email: email })
    .then(usuarioDoc => {
      if (usuarioDoc) {
        req.flash('error', 'El email ingresado ya existe');
        return res.redirect('/registrarse');
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const usuario = new Usuario({
            email: email,
            password: hashedPassword,
            carrito: { items: [] }
          });
          return usuario.save();
        })
        .then(result => {
          res.redirect('/ingresar');
          return transporter.sendMail({
            to: email,
            from: 'jcabelloc@itana.pe', // Corresponde al email verificado en Sendgrid
            subject: 'Registro Exitoso!!',
            html: '<h1>Se ha dado de alta satisfactoriamente!</h1>'
          });
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};


exports.postSalir = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};