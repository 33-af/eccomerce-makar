const { prisma } = require('../prisma/prisma-client');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const uploadPath = path.resolve(__dirname, '..', 'static');

const addBanner = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      console.error('File not found in request');
      return res.status(400).json({ error: 'No file to upload' });
    }

    const image = req.files.image;


    if (image.mimetype !== 'image/jpeg' && image.mimetype !== 'image/png') {
      console.error('Invalid file format');
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

    const bannerUrl = `/static/${uniqueName}`;

    const banner = await prisma.banner.create({
      data: {
        imageUrl: bannerUrl,
        userId: req.user.id, 
        image: uniqueName,    
      },
    });
    

    res.status(200).json({ message: 'Banner uploaded successfully', banner });
  } catch (error) {
    console.error('Error during banner upload:', error);
    res.status(500).json({ error: 'Failed to save banner in the database' });
  }
};



const allBanners = async (req, res) => {
  try {
    // Fetch all banners, no user filtering
    const banners = await prisma.banner.findMany();  // No 'where: { userId: req.user.id }' filter

    // If needed, add the full URL to the image path
    const bannersWithFullUrls = banners.map(banner => ({
      ...banner,
      imageUrl: `http://localhost:5001${banner.imageUrl}`  // Make sure the image URL is correct
    }));

    res.status(200).json(bannersWithFullUrls);
  } catch (e) {
    console.error('Error fetching banners:', e);
    res.status(500).json({ message: "Failed to retrieve banners" });
  }
};

const getBannerById = async (req, res) => {
  const { id } = req.params;  // Получаем id как строку

  try {
    // Если `id` в базе данных — это UUID или строка, убираем `parseInt`
    const banner = await prisma.banner.findUnique({
      where: { id },  // Используем id как строку, если это UUID
    });

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    const bannerWithFullUrl = {
      ...banner,
      imageUrl: `http://localhost:5001${banner.imageUrl}`,
    };

    res.status(200).json(bannerWithFullUrl);
  } catch (e) {
    console.error('Error fetching banner:', e);
    res.status(500).json({ message: "Failed to retrieve banner" });
  }
};

const removeBanner = async (req, res) => {
  const { id } = req.params;  // Получаем id баннера из параметров запроса

  try {
    // Ищем баннер с указанным id, принадлежащий текущему пользователю
    const banner = await prisma.banner.findFirst({
      where: {
        id,                 // Идентификатор баннера
        userId: req.user.id // Идентификатор пользователя из авторизации
      }
    });

    // Если баннер не найден, возвращаем ошибку 404
    if (!banner) {
      return res.status(404).json({ message: "Баннер не найден" });
    }

    // Удаляем найденный баннер
    await prisma.banner.delete({ where: { id } });

    // Отправляем ответ с кодом 204, означающим успешное удаление
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка при удалении баннера:', error);
    res.status(500).json({ message: "Ошибка при удалении баннера" });
  }
};


const updateBanner = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const banner = await prisma.banner.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });
    if (!banner) {
      return res.status(404).json({ message: "Баннер не найден" });
    }
    const updatedBanner = await prisma.banner.update({
      where: { id },
      data
    });
    res.status(200).json(updatedBanner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при обновлении баннера" });
  }
}

module.exports = {
  allBanners,
  addBanner,
  updateBanner,
  removeBanner,
  getBannerById
};