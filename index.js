const express = require("express")
const cors = require("cors")
const fetch = require("node-fetch") // Asegúrate de instalar esto con npm install node-fetch
const app = express()
require("dotenv").config()
require("./models/dbConnect")
const authRoutes = require("./routes/authRoutes")
const PORT = process.env.PORT || 8080

// Configuración de CORS
app.use(
  cors({
    origin: [
      "https://googleloginboilerplate.vercel.app",
      "http://localhost:5173"
    ],
    credentials: true
  })
)

app.use(express.json())

app.use("/auth/", authRoutes)

// Ruta para el ping
app.get("/auth/ping", (req, res) => {
  res.json({message: "Servidor activo"})
})

// Mantener el servidor despierto enviando un ping cada 10 minutos
setInterval(() => {
  fetch(`https://googleloginboilerplate.vercel.app/auth/ping`)
    .then((res) => console.log(`SERVIDOR ACTIVO. Ping enviado: ${new Date().toISOString()}`))
    .catch((err) => console.error("Error en el ping:", err))
}, 600000) // 600000ms = 10 minutos

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
