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
    },
    enviarCodigoLostTitulo: 'OLVIDÓ SU CONTRASEÑA',
    enviarCodigoLostCuerpo: (codigo, tiempo) => {
        return `Hola, este correo es para que puedas resetear tu contraseña, ingresa el siguiente código en la plataforma solicitada: <br/>
        <p><b>${codigo}</b> este código tiene un tiempo de expiración de ${tiempo} minuto(s)<p/>
        <p>Si no has solicitado este reseteo, por favor olvida o borra este mensaje.</p>`
    },
};

module.exports = correos;