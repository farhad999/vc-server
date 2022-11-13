const jwt = require("jsonwebtoken");
const db = require("../../config/database");
const config = require("../../config/app.config");

const generateToken = async (userId, guard) => {
  const payload = {
    userId: userId,
  };

  let token = jwt.sign(payload, config.JWT_SECRET_KEY, {
    expiresIn: config.JWT_EXPIRES_DAY,
  });

  await db("tokens").insert({ token: token, userId: userId, guard });

  return token;
};

const verifyToken = async (req, guard) => {
  const bearerHeader = req.headers["authorization"];

  const token = bearerHeader && bearerHeader.split(" ")[1];
  let verified = "";
  let error = "";

  try {
    const verify = jwt.verify(token, config.JWT_SECRET_KEY);

    if (verify) {
      let validToken = await db("tokens")
        .where({
          token: token,
          isBlackListed: false,
          userId: verify.userId,
          guard,
        })
        .first();

      console.log('token', validToken);

      if (!validToken) {
        error = {message:  "Token is not valid"};
      } else {
        verified = verify;
      }
    }
  } catch (er) {
    error = er;
  }

  return [verified, error];
};

const invalidateToken = async (req) => {

    const bearerHeader = req.headers["authorization"];

    const token = bearerHeader && bearerHeader.split(' ')[1];

    let status = '', error = '';

    try{
        await db('tokens')
            .where({token: token})
            .delete();
        status = 'success';
    }
    catch (er){
        error = er;
    }

    return [status, error];
}

module.exports = {
  generateToken,
  verifyToken,
  invalidateToken
};
