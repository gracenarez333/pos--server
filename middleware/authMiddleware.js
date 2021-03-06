const jwt = require("jsonwebtoken")
const db = require("../models")
const chalk = require("chalk")

const requireUser = async (req, res, next) => {
  try {
    // jwt from the client sent in the headers
    const authHeader = req.headers.authorization
    // decode the jwt -- will throw to the catch if the signature is invalid
    const decode = jwt.verify(authHeader, process.env.JWT_SECRET)
    // find the user in the db that sent the jwt
    const foundUser = await db.User.findById(decode.id)
    // mount the user on the res.locals, so the downstream route has the logged in user
    res.locals.user = foundUser
    next()
  } catch (err) {
    // this means there is a authentication error
    console.warn(chalk.yellow("🚨 Authentication error: " + err.message))
    res.status(401).json({ error: "User auth failed 😵" })
  }
}

const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const decode = jwt.verify(authHeader, process.env.JWT_SECRET)
    const foundUser = await db.User.findById(decode.id)
    if (foundUser.role === "admin") {
      res.locals.user = foundUser
      next()
    } else {
      throw Error("User is not an admin")
    }
  } catch (err) {
    console.warn(chalk.yellow("🚨 Authentication error: " + err.message))
    res.status(401).json({ error: "User auth failed 😵" })
  }
}

const requireCashier = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const decode = jwt.verify(authHeader, process.env.JWT_SECRET)
    const foundUser = await db.User.findById(decode.id)
    if (foundUser.role === "admin" || foundUser.role === "cashier") {
      res.locals.user = foundUser
      next()
    } else {
      throw Error("User is not a cashier or admin")
    }
  } catch (err) {
    console.warn(chalk.yellow("🚨 Authentication error: " + err.message))
    res.status(401).json({ error: "User auth failed 😵" })
  }
}

module.exports = {
  requireUser,
  requireAdmin,
  requireCashier,
}
