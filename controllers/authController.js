const axios = require("axios")
const jwt = require("jsonwebtoken")
const {oauth2Client} = require("../utils/googleClient")
const User = require("../models/userModel")

/* GET Google Authentication API. */
exports.googleAuth = async (req, res, next) => {
  console.log("Iniciando proceso de autenticación Google...")
  const code = req.query.code
  console.log(
    "Código de autenticación recibido:",
    code ? "Código presente" : "No hay código"
  )

  try {
    console.log("Obteniendo tokens desde Google...")
    const googleRes = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(googleRes.tokens)
    console.log("Tokens obtenidos y credenciales establecidas")

    console.log("Solicitando información del usuario...")
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    )
    console.log("Información del usuario recibida correctamente")

    const {email, name, picture} = userRes.data
    console.log(
      `Datos extraídos: email=${email}, nombre=${name}, imagen=disponible:${!!picture}`
    )

    console.log("Buscando usuario en la base de datos...")
    let user = await User.findOne({email})

    if (!user) {
      console.log("Usuario no encontrado, creando nuevo usuario...")
      user = await User.create({
        name,
        email,
        image: picture
      })
      console.log("Nuevo usuario creado con ID:", user._id)
    } else {
      console.log("Usuario encontrado con ID:", user._id)
    }

    const {_id} = user
    console.log("Generando JWT para el usuario...")
    const token = jwt.sign({_id, email}, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_TIMEOUT
    })
    console.log("JWT generado correctamente")

    console.log("Autenticación completada con éxito")
    res.status(200).json({
      message: "success",
      token,
      user
    })
  } catch (err) {
    console.error("Error en proceso de autenticación Google:", err.message)
    console.error("Detalles del error:", err)
    console.log("Respondiendo con error 500")
    res.status(500).json({
      message: "Internal Server Error"
    })
  }
}
