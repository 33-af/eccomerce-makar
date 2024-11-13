const { prisma } = require('../prisma/prisma-client')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// const login = async (req, res) => {
//     try {
//         const { email, password, name } = req.body;

//         if (!email || !password || !name) {
//             return res.status(400).json({ message: "Please fill in all required fields" });
//         }

//         // Дополнительная логика проверки email и password
//         const user = await prisma.user.findFirst({
//             where: {
//                 email,
//             }
//         });
//         const secret = process.env.SECRET_KEY;
//         const isPasswordCorrect = user && (await bcrypt.compare(password, user.password));

//         if (user && isPasswordCorrect) {
//             return res.status(200).json({
//                 id: user.id,
//                 email: user.email,
//                 name: user.name,
//                 token: jwt.sign({ id: user.id }, secret, { expiresIn: '30d' })
//             });
//         } else {
//             return res.status(400).json({ message: 'Неверно введён логин или пароль' });
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Something went wrong" });
//     }
// };


const register = async (req, res) => {
    try {
        
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: "Пожалуйста заполните обезаельное поле" });
        }

        let user = await prisma.user.findFirst({
            where: {
                email
            }
        });

        if (user) {
            // User already exists, so generate and return the JWT token
            const secret = process.env.SECRET_KEY;
            const token = jwt.sign({ id: user.id }, secret, { expiresIn: '30d' });
            return res.status(200).json({
                id: user.id,
                email: user.email,
                name: user.name,
                token: token
            });
        }

        // Create a new user if not already registered
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashPassword
            }
        });

        const secret = process.env.SECRET_KEY;
        const token = jwt.sign({ id: user.id }, secret, { expiresIn: '30d' });

        return res.status(201).json({
            id: user.id,
            email: user.email,
            name,
            token: token
        });

    } catch (error) {
        return res.status(400).json({ message: 'Что-то пошло не так' });
    }
};



const current = (req, res) => {
    return res.status(200).json(req.user);
};

module.exports = {
    // login,
    register,
    current
};
