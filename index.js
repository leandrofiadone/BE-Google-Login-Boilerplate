const express = require("express")
const cors = require("cors")
const fetch = require("node-fetch") // Asegúrate de instalar esto con npm install node-fetch
const app = express()
require("dotenv").config()
require("./models/dbConnect")
const authRoutes = require("./routes/authRoutes")
const PORT = process.env.PORT || 8080

let totalPipelineMinutes = 0 // Variable global para acumular los minutos de ejecución

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

// Middleware para medir pipeline minutes
app.use((req, res, next) => {
  const start = process.hrtime() // Inicia el temporizador

  res.on("finish", () => {
    const elapsed = process.hrtime(start) // Obtiene el tiempo transcurrido
    const elapsedMs = elapsed[0] * 1000 + elapsed[1] / 1e6 // Convierte a milisegundos
    totalPipelineMinutes += elapsedMs / 60000 // Convierte a minutos y acumula

    console.log(`⏳ Tiempo de ejecución: ${(elapsedMs / 1000).toFixed(2)}s`)
    console.log(
      `⏳ Pipeline Minutes Acumulados: ${totalPipelineMinutes.toFixed(2)} min`
    )
  })

  next()
})

app.use("/auth/", authRoutes)

// Ruta para obtener los pipeline minutes acumulados
app.get("/auth/pipeline-minutes", (req, res) => {
  res.json({
    pipelineMinutes: totalPipelineMinutes.toFixed(2)
  })
})

// Ruta para el ping
app.get("/auth/ping", (req, res) => {
  res.json({message: "Servidor activo"})
})

// Mantener el servidor despierto enviando un ping cada 10 minutos
setInterval(() => {
  fetch(`https://be-google-login-boilerplate.onrender.com/auth/ping`)
    .then(() =>
      console.log(`SERVIDOR ACTIVO. Ping enviado: ${new Date().toISOString()}`)
    )
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
