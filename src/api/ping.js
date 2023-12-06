const { validMethod } = require("./validations/_middleware");

module.exports = async function handler(req, res) {
    let filters = validMethod(req, {
        method: 'GET'
    });
    if(filters.error) return res.status(405).json(filters);

    return res.status(200).send("pong");
}