const jwt = require("jsonwebtoken")

const helpers = {};

//  Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (strLength)=>{
    strLength = typeof strLength == 'number' && strLength > 0 ? strLength : false
    if(strLength){
        //  Define all the possible characters that could go into a string
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'

        //  Start the final string
        let str = ''
        for(i=1; i<=strLength; i++){
        //  Get a random character from the possibleCharacters string
        let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
        //  Append this character to the final string
        str += randomCharacter
        }

        //  Return the final string
        return str
    }else{
        return false
    }

}

helpers.decodeJsonWebToken = (token) => {
    if (typeof token != 'string' || token.trim().length == 0) return false;
    try {
        return jwt.verify(token, process.env.TOKEN_KEY??"12345678");
    } catch(err) {
        console.error(err);
        return false;
    }
};

module.exports = helpers;

