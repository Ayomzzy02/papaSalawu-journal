const User = require("../models/User");
const AppError = require("../utils/appError");

class UserMiddleware {
  static async ValidateUserAccountByEmail(req, res, next) {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password"
      );
      
      if (user) {
        req.user = user;
        return next();
      }
      return res.status(400).json({
        status: "failed",
        message: `User with email does not existed.`,
      });
    } catch (error) {
      return res.status(500).json({
        status: "failed",
        message: error.message,
      });
    }
  }
}

module.exports = UserMiddleware;
