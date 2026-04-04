import jwt from "jsonwebtoken"


const isAuth = async (req,res,next) =>{
    try {
       const { token } = req.cookies;

        if(!token){
           return res.status(401).json({ message: "No token" });
        }
        const verifyToken  = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = verifyToken.userId
        next()

    } catch (error) {
          return res.status(401).json({ message: "Invalid token" });
    }
}

export default isAuth