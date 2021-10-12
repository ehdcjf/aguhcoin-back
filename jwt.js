require('dotenv').config();
const crypto = require('crypto');
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

function createToken(user_idx) {
    let header = {
        "tpy": "JWT",
        "alg": "HS256"
    }

    let exp = new Date().getTime() + ((60 * 60 * 2) * 1000)

    let payload = {
        user_idx,
        exp,
    }

    const encodingHeader = Buffer.from(JSON.stringify(header)).toString('base64').replace('=', '').replace('==', '');
    const encodingPayload = Buffer.from(JSON.stringify(payload)).toString('base64').replace('=', '').replace('==', '');


    const signature = crypto.createHmac('sha256', Buffer.from(process.env.SALT))
        .update(encodingHeader + "." + encodingPayload)
        .digest('base64')
        .replace('=', '')
        .replace('==', '');

    let jwt = `${encodingHeader}.${encodingPayload}.${signature}`
    return jwt;
}



function jwtId(AccessToken) {
    let [header, payload, sign] = AccessToken.split('.');
    let { user_idx, exp } = JSON.parse(Buffer.from(payload, 'base64').toString())
    return user_idx;
}

module.exports = {
    createToken,
    jwtId

}