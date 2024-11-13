const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../prisma/prisma-client')
const path = require('path');
const fs = require('fs');

const uploadPath = path.resolve(__dirname, '..', 'static');


const addMeatJerks = async (req, res) => {



    if (!req.user?.id) {
        return res.status(400).json({ message: "User ID не найден" });
    }
    
    const data = req.body;

    // Проверка на обязательные поля
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

       
        const meatJerks = await prisma.meatJerk.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                quantity: Number(data.quantity),  // Преобразуем в число
                price: parseFloat(data.price),    // Преобразуем в число с плавающей точкой
                image: imageUrl, // Сохраняем путь к изображению
                userId: req.user.id,
            }
        });
        

        res.status(200).json(meatJerks);
    } catch (error) {
        console.error("Ошибка при добавлении товара:", error);
        res.status(500).json({ message: "Не удалось добавить товар" });
    }
};

const allMeatJerks = async (req, res) => {
    try {
        const meatJerks = await prisma.meatJerk.findMany();
        res.status(200).json(meatJerks);
    } catch (error) {
        console.error("Ошибка при получении списка товаров:", error);
        res.status(500).json({ message: "Не удалось получить список товаров" });
    }
};

const updateMeatJerk = async (req, res) => {
    const { id } = req.params
    const data = req.body

    try {
        // Проверяем, существует ли товар и принадлежит ли он текущему администратору
        const meatJerk = await prisma.meatJerk.findFirst({
            where: {
                id,
                userId: req.user.id
            }
        });

        if (!meatJerk) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        // Обновляем данные товара
        const updatedMeatJerk = await prisma.meatJerk.update({
            where: { id }, // Здесь правильный синтаксис для where
            data // Обновленные данные
        });

        return res.status(200).json(updatedMeatJerk);
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Не удалось изменить товар" })
    }
}

const removeMeatJerk = async (req, res) => {
    const { id } = req.params;

    try {
   
        const meatJerk = await prisma.meatJerk.findFirst({
            where: {
                id,
                userId: req.user.id
            }
        });

        // Если товар не найден, отправляем 404
        if (!meatJerk) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        // Удаляем товар из базы данных
        await prisma.meatJerk.delete({
            where: { id }
        });

        // Отправляем ответ 204 без содержимого
        res.status(204).send();
    } catch (error) {
        // Логируем ошибку и отправляем ответ 500
        console.error(error);
        res.status(500).json({ message: "Не удалось удалить товар" });
    }
};


const oneMeatJerks = async (req, res) => {
    const { id } = req.params;  // Извлекаем id из параметров URL

    try {
        const meatJerk = await prisma.meatJerk.findUnique({
            where: {
                id: id  // Ищем товар по id
            }
        });

        if (!meatJerk) {
            return res.status(404).json({ message: "Конкретный товар не найден" });
        }

        res.status(200).json(meatJerk);  // Отправляем товар в ответ
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Не удалось получить конкретный товар" });
    }
};

module.exports = {
    allMeatJerks,
    addMeatJerks,
    updateMeatJerk,
    removeMeatJerk,
    oneMeatJerks
}