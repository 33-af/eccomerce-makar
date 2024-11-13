const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../prisma/prisma-client')
const path = require('path');
const fs = require('fs');


const uploadPath = path.resolve(__dirname, '..', 'static');


const addPack = async (req, res) => {



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

        const packages = await prisma.packing.create({
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
        res.status(200).json(packages);
    } catch (error) {
        console.error("Ошибка при добавлении товара:", error);
        res.status(500).json({ message: "Не удалось добавить товар" });
    }
}

const allPacking = async (req, res) => {
    try {
        const packages = await prisma.packing.findMany();
        res.status(200).json(packages)
    } catch (error) {
        console.error("Ошибка при получении списка товаров:", error);
        res.status(500).json({ message: "Не удалось получить список товаров" });
    }
}



const updatePacking = async (req, res) => {
    const { id } = req.params
    const data = req.body

    try {
        // Проверяем, существует ли товар и принадлежит ли он текущему администратору
        const package = await prisma.packing.findFirst({
            where: {
                id,
                userId: req.user.id
            }
        });

        if (!package) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        // Обновляем данные товара
        const updatedPacking = await prisma.packing.update({
            where: { id },
            data // Обновленные данные
        });

        return res.status(200).json(updatedPacking);
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Не удалось изменить товар" })
    }
}

const removePacking = async (req, res) => {
    const { id } = req.params;

    try {
        // Проверяем, существует ли товар и принадлежит ли он текущему администратору
        const package = await prisma.packing.findFirst({
            where: {
                id,
                userId: req.user.id
            }
        });

        // Если товар не найден, отправляем 404
        if (!package) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        // Удаляем товар из базы данных
        await prisma.packing.delete({
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


const onePackage = async (req, res) => {
    const { id } = req.params;

    try {
        const onePackage = await prisma.packing.findUnique({
            where: {
                id: id
            }
        })

        if (!onePackage) {
            return res.status(404).json({ message: "Конкретный товар не найден" })
        }

        res.status(200).json(onePackage)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Не удалось  получить конкретный товар" })
    }
}

module.exports = {
    allPacking,
    addPack,
    updatePacking,
    removePacking,
    onePackage
}