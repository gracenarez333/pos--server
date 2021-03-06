const router = require("express").Router()
const db = require("../../../models")
const { requireCashier } = require("../../../middleware/authMiddleware")
const { requireAdmin } = require("../../../middleware/authMiddleware")
const logAndSendError = require("../../../helpers/errorHandler")

// POST /orders -- create a new order
router.post("/", requireCashier, async (req, res) => {
  try {
    const newOrder = await db.Order.create(req.body)
    res.json(newOrder)
  } catch (error) {
    logAndSendError("Cannot create order", error, res)
  }
})

//PUT /orders/:id -- update an order
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id
    const options = { new: true }
    const updatedOrder = await db.Order.findByIdAndUpdate(id, req.body, options)
      .populate("lineItems.product")
      .populate("cashier")

    const orderCopy = { ...updatedOrder._doc }
    const cashierCopy = orderCopy.cashier._doc
    delete cashierCopy.password
    orderCopy.cashier = cashierCopy

    res.json(orderCopy)
  } catch (error) {
    logAndSendError("Cannot update order", error, res)
  }
})

// DELETE /orders/:id -- deletes an order
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id
    await db.Order.findByIdAndDelete(id)
    res.json({ msg: "Order deleted" })
  } catch (error) {
    logAndSendError("Cannot delete order", error, res)
  }
})

// GET /orders -- index of all orders
router.get("/", requireAdmin, async (req, res) => {
  try {
    const orders = await db.Order.find({})
      .populate("cashier")
      .populate("lineItems.product")

    const ordersCopy = orders.map((order) => {
      const orderCopy = { ...order._doc }
      const cashierCopy = orderCopy.cashier._doc
      delete cashierCopy.password
      orderCopy.cashier = cashierCopy
      return orderCopy
    })

    res.json(ordersCopy)
  } catch (error) {
    logAndSendError("Cannot get orders", error, res)
  }
})

// GET /orders/:id -- show specific order
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const id = req.params.id
    const order = await db.Order.findById(id)
      .populate("cashier")
      .populate("lineItems.product")
    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    const orderCopy = { ...order._doc }
    const cashierCopy = orderCopy.cashier._doc
    delete cashierCopy.password
    orderCopy.cashier = cashierCopy

    res.json(orderCopy)
  } catch (error) {
    logAndSendError("Cannot get order", error, res)
  }
})

module.exports = router
