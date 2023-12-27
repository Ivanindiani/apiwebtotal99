const correos = { // Los cuerpos del correo son en HTML
    enviarCodigoTitulo: 'VERIFICACIÓN DE CORREO',
    enviarCodigoCuerpo: (codigo) => {
        return `Hola, este correo es para que verifiques tu correo electrónico en nuestra plataforma cuyo código es el siguiente: <br/>
        <p><b>${codigo}</b><p/>`
    },
    notificarRegistroTitulo: 'NOTIFICACIÓN DE REGISTRO',
    notificarRegistro: () => {
        return `Hola, te agradecemos por registrarte en nuestra plataforma.
        <p>Ahora te invitamos a actualizar tu perfil y realizar tu primera compra, recuerda que puedes contactarnos si necesitas ayuda</p>`
    }
};

module.exports = correos;