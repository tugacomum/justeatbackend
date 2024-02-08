import Food from "../Models/Food";
import Users from "../Models/Users";

export async function CreateFood(req, res){
    const name = req.body.name;
    const price = req.body.price;
    const alergy = req.body.alergy;
    const description = req.body.description;

    if(!name || !price || !description){
        return res.status(400).json({
            "message": "Missing fields! See API documentation"
        });
    }

    const userId = req.userId;

    const userData = await Users.findById(userId, {
        entityConnected: true
    });

    const foodCreated = await Food.create({
        alergy: alergy || 'N/A',
        description,
        name,
        photo: 'default-menu.jpg',
        price,
        restaurant: userData.entityConnected
    });

    res.status(200).json({
        "message": "Food created successfully!",
        "code": 2,
        "foodId": foodCreated._id
    });
}

export async function GetFood(req, res){
    const foodId = req.params.foodId;

    if(!foodId){
        return res.status(400).json({
            "message": "Missing field! See API documentation"
        });
    }

    Food.findById(foodId).then((foodItem) => {
        res.status(200).json(foodItem);
    });
}

export async function GetAllFoods(req, res){
    const userId = req.userId;

    const userData = await Users.findById(userId, {
        entityConnected: true
    });

    Food.find({ restaurant: userData.entityConnected, status: true }, {
        description: true,
        name: true,
        photo: true,
        price: true
    }).then((findFoods) => {
        res.status(200).json(findFoods);
    }).catch(() => {
        res.status(404).json({
            "message": "Food not found!",
            "code": 1
        });
    });
}

export async function UploadFoodImage(req, res){
    try {
        await Food.updateOne({
            _id: req.params.foodId
        }, {
            photo: req.fileName
        })
        res.status(200).json({
            "message": "Restaurant image updated!",
            "code": 1,
            "fileName": req.fileName
        });
    }catch(e){
        res.status(400).json({
            "message": "Restaurant image not found!",
            "code": 1
        });
    }
}

export async function UpdateFood(req, res){
    const foodId = req.params.foodId;

    const name = req.body.name;
    const price = req.body.price;
    const alergy = req.body.alergy;
    const description = req.body.description;

    if(!foodId || !name || !price || !description){
        return res.status(400).json({
            "message": "Missing fields! See API documentation"
        });
    }

    await Food.updateOne({ _id: foodId }, {
        alergy: alergy || 'N/A',
        description,
        name,
        price
    });

    res.status(200).json({
        "message": "Food updated successfully!",
        "code": 2
    });
}

export async function DeleteFood(req, res){
    const foodId = req.params.foodId;

    await Food.updateOne({ _id: foodId }, {
        status: false
    });

    res.status(200).json({
        "message": "Food deleted successfully!",
        "code": 2
    });
}