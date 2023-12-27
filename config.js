// config.js
module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    "local": {
        AUTHORIZATION: 'c25179a144ca828d8951fc2e061c85c5667c6ccc',
        AUTHORIZATION_TIENDAS: '002608697ec1ca9fd39f97dd86ff5deb940f4ad6',
        PASSWORD_PG_ENCRYPT: '7aaae6bcc7706ff40ef05fc49c9a19e41e34bc15',
        TIMEOUT_TIENDAS: 30*1000, // 30 Segundos
        tiendasSegmentosLocal: '192.168.X.18',
        HOST: process.env.HOST || '172.16.10.78',
        PORT: process.env.PORT || 8484,
        REDIS: {
            host: '127.0.0.1',
            port: 6379,
            db: 1
        },
        defaultRedisKey: 'apiwebtotal',
        MEGASOFT: {
            URL_MEGASOFT: 'https://paytest.megasoft.com.ve/payment/action',
            TIMEOUT_MEGASOFT: 90*1000, // Minuto 1 medio
            COD_AFILIACION: '2023112401',
            AUTHORIZATION: 'Basic Z3Q5OWFwcDpBcHBndDk5Lg=='
        },
        googleCaptchaUrl: 'https://www.google.com/recaptcha/api/siteverify',
        googleCaptchaSecret: '6LeuKj0pAAAAAIeaxZVcDtNTcoFBZ8NwkZPfiaaZ',
        googleCaptchaTimeout: 30*1000,
        timeSesion: 1, // dias
        timeCodeAuth: 5, // minutos
        mail: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            from: 'directorcondominios@gmail.com',
            user: 'directorcondominios@gmail.com',
            password: 'krojgogksapyrjfg'
        },
    },
    "development": {
        AUTHORIZATION: 'c25179a144ca828d8951fc2e061c85c5667c6ccc',
        AUTHORIZATION_TIENDAS: '002608697ec1ca9fd39f97dd86ff5deb940f4ad6',
        PASSWORD_PG_ENCRYPT: '7aaae6bcc7706ff40ef05fc49c9a19e41e34bc15',
        TIMEOUT_TIENDAS: 30*1000, // 30 Segundos
        tiendasSegmentosLocal: '192.168.X.18',
        HOST: process.env.HOST || '172.16.10.78',
        PORT: process.env.PORT || 8484,
        REDIS: {
            host: '127.0.0.1',
            port: 6379,
            db: 1
        },
        defaultRedisKey: 'apiwebtotal',
        MEGASOFT: {
            URL_MEGASOFT: 'https://paytest.megasoft.com.ve/payment/action',
            TIMEOUT_MEGASOFT: 90*1000, // Minuto 1 medio
            COD_AFILIACION: '2023112401',
            AUTHORIZATION: 'Basic Z3Q5OWFwcDpBcHBndDk5Lg=='
        },
        googleCaptchaUrl: 'https://www.google.com/recaptcha/api/siteverify',
        googleCaptchaSecret: '6LeuKj0pAAAAAIeaxZVcDtNTcoFBZ8NwkZPfiaaZ',
        googleCaptchaTimeout: 30*1000,
        timeSesion: 1, // dias
        timeCodeAuth: 5, // minutos
        mail: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            from: 'directorcondominios@gmail.com',
            user: 'directorcondominios@gmail.com',
            password: 'krojgogksapyrjfg'
        },
    },
    "production": {
        AUTHORIZATION: 'c25179a144ca828d8951fc2e061c85c5667c6ccc',
        AUTHORIZATION_TIENDAS: '002608697ec1ca9fd39f97dd86ff5deb940f4ad6',
        PASSWORD_PG_ENCRYPT: '7aaae6bcc7706ff40ef05fc49c9a19e41e34bc15',
        TIMEOUT_TIENDAS: 30*1000, // 30 Segundos
        tiendasSegmentosLocal: '192.168.X.18',
        HOST: process.env.HOST || '172.16.10.78',
        PORT: process.env.PORT || 8484,
        REDIS: {
            host: '127.0.0.1',
            port: 6379,
            db: 1
        },
        defaultRedisKey: 'apiwebtotal',
        MEGASOFT: {
            URL_MEGASOFT: 'https://paytest.megasoft.com.ve/payment/action',
            TIMEOUT_MEGASOFT: 90*1000, // Minuto 1 medio
            COD_AFILIACION: '2023112401',
            AUTHORIZATION: 'Basic Z3Q5OWFwcDpBcHBndDk5Lg=='
        },
        googleCaptchaUrl: 'https://www.google.com/recaptcha/api/siteverify',
        googleCaptchaSecret: '6LeuKj0pAAAAAIeaxZVcDtNTcoFBZ8NwkZPfiaaZ',
        googleCaptchaTimeout: 30*1000,
        timeSesion: 1, // dias
        timeCodeAuth: 15, // minutos
        mail: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            from: 'directorcondominios@gmail.com',
            user: 'directorcondominios@gmail.com',
            password: 'krojgogksapyrjfg'
        },
    }
}
