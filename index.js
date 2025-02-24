const express = require("express")
const cors = require("cors")
const app = express()
require("dotenv").config()
require("./models/dbConnect")
const authRoutes = require("./routes/authRoutes")
const PORT = process.env.PORT || 8080

app.use(
  cors({
    origin: [
      "https://be-google-login-boilerplate.onrender.com",
      "http://localhost:5173"
    ],
    credentials: true
  })
)

app.use("/auth/", authRoutes)

// Simplemente enviar una respuesta de error directamente sin usar AppError
app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on the server`
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})
