const jwt = require("jsonwebtoken");
const db = require("../../config/database");
const config = require("../../config/app.config");

const generateToken = async (userId) => {
  const payload = {
    userId: userId,
  };

  let token = jwt.sign(payload, config.JWT_SECRET_KEY, {
    expiresIn: config.JWT_EXPIRES_DAY,
  });

  await db("tokens").insert({ token: token, userId: userId });

  await db("tokens").insert({ token: token, userId: userId });

  return token;
};

const verifyToken = async (req, tokenType) => {
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
        })
        .first();

      if (!validToken) {
        error = "Token is not valid";
      } else {
        verified = verify;
      }
    }
  } catch (er) {
    error = er;
  }

  return [verified, error];
};

module.exports = {
  generateToken,
  verifyToken,
};
