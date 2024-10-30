const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign(
    {
      iss: "Afyabook",
      sub: id,
      iat: new Date().getTime(),
      exp: new Date().setDate(new Date().getDate() + 1),
    },
    process.env.JWT_KEY
  );
};

const decodeToken = (token) => {
  return jwt.verify(token, process.env.JWT_KEY);
};

module.exports = {
  signToken,
  decodeToken,
};
