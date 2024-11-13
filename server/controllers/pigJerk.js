const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../prisma/prisma-client')
const path = require('path');
const fs = require('fs');


const uploadPath = path.resolve(__dirname, '..', 'static');

const addPigJerks = async (req, res) => {
    const data = req.body;
    if (!data.title || !data.description || !data.category || !data.quantity || !data.price || !req.files?.image) {
        return res.status(400).json({ message: "Все поля должны быть обезательно заполнеными" });
    }

    try {
        if (!req.files || !req.files.image) {
            console.error('File not found in request');
            return res.status(400).json({ error: 'No file to upload' });
        }

        const image = req.files.image;

        if (image.mimetype !== 'image/jpeg' && image.mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Invalid file format' });
        }

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        const fileExtension = path.extname(image.name);
        const uniqueName = uuidv4() + fileExtension;
        const filePath = path.join(uploadPath, uniqueName);

        await image.mv(filePath);
        console.log("File uploaded:", filePath);

        const imageUrl = `/static/${uniqueName}`;


        const pigJerk = await prisma.pigJerk.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                quantity: Number(data.quantity),  
                price: parseFloat(data.price),    
                image: imageUrl, 
                userId: req.user.id
            }
        })

        return res.status(200).json(pigJerk)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Что то пошло не так" })
    }
}


const allPigJerks = async (req, res) => {
    try {
        const pigJerks = await prisma.pigJerk.findMany()
        res.status(200).json(pigJerks)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Не удалось получить товар" })
    }
}



const updatePigJerk = async (req, res) => {
    const { id } = req.params
    const data = req.body

    try {
        // Проверяем, существует ли товар и принадлежит ли он текущему администратору
        const pigJerk = await prisma.pigJerk.findFirst({
            where: {
                id,
                userId: req.user.id
            }
        });

        if (!pigJerk) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        // Обновляем данные товара
        const updatedPigJerk = await prisma.pigJerk.update({
            where: { id },
            data // Обновленные данные
        });

        return res.status(200).json(updatedPigJerk);
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Не удалось изменить товар" })
    }
}

const removePigJerk = async (req, res) => {
    const { id } = req.params;

    try {
        // Проверяем, существует ли товар и принадлежит ли он текущему администратору
        const pigJerk = await prisma.pigJerk.findFirst({
            where: {
                id,
                userId: req.user.id
            }
        });

        // Если товар не найден, отправляем 404
        if (!pigJerk) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        // Удаляем товар из базы данных
        await prisma.pigJerk.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        // Логируем ошибку и отправляем ответ 500
        console.error(error);
        res.status(500).json({ message: "Не удалось удалить товар" });
    }
};


const onePigJerk = async (req, res) => {
    const { id } = req.params;

    try {
        const  onePigJerks = await prisma.pigJerk.findUnique({
            where: {
                id:id
            }
        })

        if(!onePigJerks){
            return res.status(404).json({message: "Конкретный товар не найден"})
        }

        res.status(200).json(onePigJerks)
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Не удалось  получить конкретный товар"})
    }
}

module.exports = {
    allPigJerks,
    addPigJerks,
    updatePigJerk,
    removePigJerk,
    onePigJerk
}