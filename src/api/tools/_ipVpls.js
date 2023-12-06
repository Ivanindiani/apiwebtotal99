
const getIpVplsFromWifi = (ip) => {
    /*const VPLS = '192.168.X.18';

    return `http://${VPLS.replace('X', ip.split('.')[1])}:8181`;*/

    return 'http://172.16.10.78:8181';
}

module.exports = { getIpVplsFromWifi };