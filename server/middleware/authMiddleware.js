const jwt = require('jsonwebtoken')
const  {prisma} =require('../prisma/prisma-client')


const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Токен отсутствует" });
        }
        console.log("Токен:", token);

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log("Декодированный токен:", decoded);

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        });

        if (!user) {
            return res.status(401).json({ message: "Пользователь не найден" });
        }

        req.user = user;
        next();
    } catch (e) {
        console.error("Ошибка в auth middleware:", e);
        res.status(401).json({ message: "Не авторизирован" });
    }
};

module.exports = {
    auth
};

