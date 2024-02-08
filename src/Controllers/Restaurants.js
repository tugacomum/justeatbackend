import Food from "../Models/Food";
import Restaurants from "../Models/Restaurants";
import Users from "../Models/Users";
import { calcCrow, validateEmail } from "../Utils/Functions";

export async function GetRestaurants(req, res){
    const lat = req.query.lat;
    const long = req.query.long;

    if(!lat || !long){
        return res.status(404).json({
            "message": "Cannot find geo points in request"
        });
    }


    const allActiveRestaurants = await Restaurants.find({
        isActive: true
    }, {
        closedTime: true,
        openingTime: true,
        photo: true,
        name: true,
        restDays: true,
        stars: true,
        addressLineOne: true,
        addressLineTwo: true,
        latitude: true,
        longitude: true
    });


   const restaurantsNearBy = allActiveRestaurants.sort(function(a, b) {
        return (calcCrow(a.latitude, a.longitude)-calcCrow(b.latitude,b.longitude))
    }); 
    res.status(200).json(restaurantsNearBy);
}


export async function GetAllRestaurants(req, res){
    const allRestaurants = await Restaurants.find({}, {
        closedTime: true,
        openingTime: true,
        photo: true,
        name: true,
        restDays: true,
        stars: true,
        addressLineOne: true,
        addressLineTwo: true,
    });

    res.status(200).json(allRestaurants);
}

export async function CreateRestaurant(req, res){
    const name = req.body.name;
    const photo = req.body.photo;
    const email = req.body.email;
    const vat = req.body.vat;
    const phone = req.body.phone;
    const observations = req.body.observations;
    const addressLineOne = req.body.addressLineOne;
    const addressLineTwo = req.body.addressLineTwo;
    const openingTime = req.body.openingTime;
    const closedTime = req.body.closedTime;
    const latitude = req.body.latitude;
    const stars = req.body.stars;
    const restDays = req.body.restDays;
    const longitude = req.body.longitude;

    if(!name || !email || !vat || !phone || !addressLineOne || !addressLineTwo || !openingTime || !closedTime || !latitude || !restDays || !stars || !longitude){
        return res.status(400).json({
            "message": "Missing fields! See API documentation"
        });
    }

    if(!validateEmail(email)){
        return res.status(400).json({
            "message": "The email address is invalid!"
        });
    }

    if(vat.toString().length !== 9){
        return res.status(400).json({
            "message": "The VAT is invalid!"
        });
    }

    if(phone.toString().length !== 9){
        return res.status(400).json({
            "message": "The Phone Number is invalid!"
        });
    }

    if(isNaN(stars) || parseInt(stars) > 5 || parseInt(stars) < 0){
        return res.status(400).json({
            "message": "Rating need to have a number between 0 and 5.",
            "code": 1
        });
    }

    const openingTimeList = openingTime.split(":");
    const closedTimeList = closedTime.split(":");

    const openingTimeDate = new Date();
    openingTimeDate.setHours(openingTimeList[0]);
    openingTimeDate.setMinutes(openingTimeList[1]);
    openingTimeDate.setSeconds(0);

    const closingTimeDate = new Date();
    closingTimeDate.setHours(closedTimeList[0]);
    closingTimeDate.setMinutes(closedTimeList[1]);
    closingTimeDate.setSeconds(0);

    if(openingTimeDate >= closingTimeDate){
        return res.status(400).json({
            "message": "The opening time cannot be greater than the closing time"
        });
    }

    await Restaurants.create({
        name,
        photo: photo || 'default.png',
        email,
        vat,
        phone,
        observations: observations || 'N/A',
        addressLineOne,
        addressLineTwo,
        openingTime: openingTimeDate,
        closedTime: closingTimeDate,
        latitude,
        longitude,
        restDays,
        stars
    });

    res.status(200).json({
        "message": "Restaurant created successfully!"
    });
}

export async function GetRestaurant(req, res) {
    const slug = req.params.slug;

    if(!slug){
        return res.status(400).json({
            "message": "ID parameter not found!"
        });
    }

    Restaurants.findById(slug, {
        addressLineOne: true,
        addressLineTwo: true,
        openingTime: true,
        closedTime: true,
        email: true,
        longitude: true,
        latitude: true,
        photo: true,
        name: true,
        observations: true,
        stars: true,
        phone: true,
        restDays: true
    }).then((restaurant) => {
        Food.find({
            restaurant: slug
        }).then((foods) => {
            res.status(200).json({
                restaurant,
                foods
            });
        })
    }).catch(() => {
        res.status(404).json({
            "message": "Restaurant not found!",
            "code": 1
        });
    });
}

export async function GetMyRestaurant(req, res){
    let restaurantId;

    if(req.query.editedEntity){
        restaurantId = req.query.editedEntity;
    }else{
        const userId = req.userId;

        const userRestaurant = await Users.findById(userId, {
            entityConnected: true
        });
    
        if(!userRestaurant.entityConnected){
            return res.status(400).json({
                "message": "The user is not connected to a restaurant!"
            });
        }

        restaurantId = userRestaurant.entityConnected;
    }

    
    Restaurants.findById(restaurantId, {
        name: true,
        vat: true,
        openingTime: true,
        closedTime: true,
        addressLineOne: true,
        addressLineTwo: true,
        latitude: true,
        longitude: true,
        restDays: true,
        observations: true,
        phone: true,
        email: true,
        photo: true,
        stars: true
    }).then((restaurant) => {
        res.status(200).json(restaurant);
    }).catch(() => {
        res.status(400).json({
            "message": "Restaurant not found!",
            "code": 1
        });
    });
}

export async function UpdateRestaurant(req, res){
    let restaurantId = req.params.restaurantId;

    if(restaurantId === "own"){
        const userRestaurant = await Users.findById(req.userId);
        restaurantId = userRestaurant.entityConnected;
    }

    const name = req.body.name;
    const email = req.body.email;
    const vat = req.body.vat;
    const phone = req.body.phone;
    const observations = req.body.observations;
    const addressLineOne = req.body.addressLineOne;
    const addressLineTwo = req.body.addressLineTwo;
    const openingTime = req.body.openingTime;
    const closedTime = req.body.closedTime;
    const latitude = req.body.latitude;
    const restDays = req.body.restDays;
    const stars = req.body.stars;
    const longitude = req.body.longitude;

    if(!restaurantId || !name || !email || !vat || !stars || !phone || !addressLineOne || !addressLineTwo || !openingTime || !closedTime || !latitude || !restDays || !longitude){
        return res.status(400).json({
            "message": "Missing fields! See API documentation",
            "code": 0
        });
    }

    if(!validateEmail(email)){
        return res.status(400).json({
            "message": "The email address is invalid!",
            "code": 1
        });
    }

    if(vat.toString().length !== 9){
        return res.status(400).json({
            "message": "The VAT is invalid!",
            "code": 1
        });
    }

    if(phone.toString().length !== 9){
        return res.status(400).json({
            "message": "The Phone Number is invalid!",
            "code": 1
        });
    }

    if(isNaN(stars) || parseInt(stars) > 5 || parseInt(stars) < 0){
        return res.status(400).json({
            "message": "Rating need to have a number between 0 and 5.",
            "code": 1
        });
    }

    const openingTimeList = openingTime.split(":");
    const closedTimeList = closedTime.split(":");

    const openingTimeDate = new Date();
    openingTimeDate.setHours(openingTimeList[0]);
    openingTimeDate.setMinutes(openingTimeList[1]);
    openingTimeDate.setSeconds(0);

    const closingTimeDate = new Date();
    closingTimeDate.setHours(closedTimeList[0]);
    closingTimeDate.setMinutes(closedTimeList[1]);
    closingTimeDate.setSeconds(0);

    if(openingTimeDate >= closingTimeDate){
        return res.status(400).json({
            "message": "The opening time cannot be greater than the closing time",
            "code": 1
        });
    }

    await Restaurants.updateOne({ _id: restaurantId }, {
        name,
        email,
        vat,
        phone,
        observations: observations || 'N/A',
        addressLineOne,
        addressLineTwo,
        openingTime: openingTimeDate,
        closedTime: closingTimeDate,
        latitude,
        longitude,
        stars,
        restDays
    });

    res.status(200).json({
        "message": "Restaurant updated successfully!"
    });
}

export async function GetAllRestaurantsNames(req, res){
    const restaurants = await Restaurants.find({}, {
        name: true
    });
    
    res.status(200).json(restaurants);
}

export async function DeleteRestaurant(req, res){
    const restaurantId = req.params.restaurantId;

    if(!restaurantId){
        return res.status(400).json({
            "message": "Missing fields! See API documentation",
            "code": 0
        });
    }

    try {
        await Restaurants.updateOne({
            _id: restaurantId
        }, {
            isActive: false
        });

        res.status(200).json({
            "message": "Restaurant deleted successfully",
            "code": 2
        });
    }catch(e){
        res.status(200).json({
            "message": "Restaurant not found!",
            "code": 0
        });
    }
}

export async function UploadRestaurantImage(req, res){
    try {
        await Restaurants.updateOne({
            _id: req.params.restaurantId
        }, {
            photo: req.fileName
        })
        res.status(200).json({
            "message": "Restaurant image updated!",
            "code": 2,
            "fileName": req.fileName
        });
    }catch(e){
        res.status(400).json({
            "message": "Restaurant image not found!",
            "code": 1
        });
    }
}