const express = require("express")
const cors = require("cors")
const app = express()
require("dotenv").config()
require("./models/dbConnect")
const authRoutes = require("./routes/authRoutes")
const PORT = process.env.PORT || 8080

// Configuración de CORS
app.use(
  cors({
    origin: [
      "https://googleloginboilerplate.vercel.app", // Asegúrate de incluir el dominio del frontend
      "http://localhost:5173"
    ],
    credentials: true // Permite cookies y encabezados de autenticación
  })
)

app.use(express.json()) // Asegúrate de que Express pueda manejar JSON en el body

app.use("/auth/", authRoutes)

// Manejo de rutas no encontradas
app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on the server`
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})
