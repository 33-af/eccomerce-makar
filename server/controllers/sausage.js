const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../prisma/prisma-client')
const path = require('path');
const fs = require('fs');

const uploadPath = path.resolve(__dirname, '..', 'static');

const addSausage = async (req, res) => {
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

        const sausages = await prisma.sausage.create({
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
        return res.status(200).json(sausages)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Что то пошло не так" })
    }
}



const allSausages = async (req, res) => {
    try {
        const sausages = await prisma.sausage.findMany()
        res.status(200).json(sausages)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Не удалось получить товар" })
    }
}

const updateSausage = async (req, res) => {
    const { id } = req.params
    const data = req.body

    try {
        // Проверяем, существует ли товар и принадлежит ли он текущему администратору
        const sausage = await prisma.sausage.findFirst({
            where: {
                id,
                userId: req.user.id
            }
        });

        if (!sausage) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        // Обновляем данные товара
        const updatedSausage = await prisma.sausage.update({
            where: { id },
            data // Обновленные данные
        });

        return res.status(200).json(updatedSausage);
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Не удалось изменить товар" })
    }
}

const removeSausage = async (req, res) => {
    const { id } = req.params;

    try {
        // Проверяем, существует ли товар и принадлежит ли он текущему администратору
        const sausage = await prisma.sausage.findFirst({
            where: {
                id,
                userId: req.user.id
            }
        });

        // Если товар не найден, отправляем 404
        if (!sausage) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        // Удаляем товар из базы данных
        await prisma.sausage.delete({
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


const oneSausage = async (req, res) => {
    const { id } = req.params;

    try {
        const oneSausage = await prisma.sausage.findUnique({
            where: {
                id:id
            }
        })

        if (!oneSausage) {
            return res.status(404).json({ message: "Конкретный товар не найден" })
        }

        res.status(200).json(oneSausage)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Не удалось  получить конкретный товар" })
    }
}

module.exports = {
    allSausages,
    addSausage,
    updateSausage,
    removeSausage,
    oneSausage
}