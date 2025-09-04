import jwt from 'jsonwebtoken'


const verifyToken = async (req, res, next) => {
    const { token } = req.headers
    if (!token) {
        return res.json({ success: false, message: 'Not Authorized Login Again' })
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        console.log(token_decode)
        req.user_id = token_decode.id
        console.log(req.user_id)
        next()
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default verifyToken;