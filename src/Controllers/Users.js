import jwt from "jsonwebtoken";
import Users from "../Models/Users";
import bcrypt from "bcryptjs";
import { validateEmail } from "../Utils/Functions";
import Restaurants from "../Models/Restaurants";
import axios from "axios";
import bcrypt from "bcryptjs";

export function AuthenticateUser(req, res){
    const userId = req.userId;

    const token = jwt.sign({
        userId
    }, process.env.SECRET_KEY, {
        expiresIn: "1h"
    });

    res.status(200).json({
        token
    });
}

export async function UserInfo(req, res){
    const userId = req.userId;

    const userInfo = await Users.findById(userId, {
        nome: true,
        photo: true,
        role: true
    });

    res.status(200).json(userInfo);
}

export async function CreateAccount(req, res){
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const vat = req.body.vat;
    const password = req.body.password;

    if(!name || !email || !phone || !password || !vat){
        return res.status(400).json({
            "field": "notification",
            "alertType": 0,
            "message": "Invalid parameters!"
        });
    }

    if(password < 8){
        return res.status(400).json({
            "field": "password",
            "message": "The password must be at least 8 characters"
        });
    }

    if(!validateEmail(email)){
        return res.status(400).json({
            "field": "email",
            "message": "The email is not valid!"
        });
    }

    if(name.length < 3){
        return res.status(400).json({
            "field": "name",
            "message": "The name needs to be at least 3 characters!"
        });
    }

    if(phone.length < 9){
        return res.status(400).json({
            "field": "phone",
            "message": "The phone needs to be at least 9 characters!"
        });
    }

    if(vat.length < 9){
        return res.status(400).json({
            "field": "vat",
            "message": "The VAT needs to be at least 9 characters!"
        });
    }

    const checkPreexisting = await Users.findOne({
        email
    })

    if(checkPreexisting){
        return res.status(400).json({
            "field": "email",
            "message": "The email already exists!"
        });
    }

    const passwordEnc = await bcrypt.hash(password, 12);

    await Users.create({
        email,
        nome: name,
        phone,
        nif: vat,
        photo: 'default.png',
        password: passwordEnc,
        isActive: true
    });

    res.status(200).json({
        "field": "notification",
        "alertType": 2,
        "message": "User created successfully!"
    });
}

export async function GetAllUsers(req, res){
    const usersData = await Users.find({}, {
        entityConnected: true,
        nome: true,
        email: true,
        phone: true,
        role: true
    });

    const usersPerformaceData = await Promise.all(usersData.map(async (user) => {
        if (user.role === "manager") {
            const findEntity = await Restaurants.findById(user.entityConnected);
            const updatedCartInfo = {
                ...user.toObject(),
                entity: findEntity.name
            };

            return updatedCartInfo;
        } else {
            const updatedCartInfo = {
                ...user.toObject(),
                entity: "N/A"
            };

            return updatedCartInfo;
        }
    }));

    res.status(200).json(usersPerformaceData);
}

export async function GetUserPermissionsMetadata(req, res){
    const userId = req.query.userId;
    
    if(!userId){
        return res.status(400).json({
            "message": "Missing fields! See API documentation",
            "code": 0
        });
    }

    try {
        const userPermsData = await Users.findById(userId, {
            role: true,
            entityConnected: true,
            nome: true
        });
        res.status(200).json(userPermsData);
    }catch(e){
        res.status(400).json({
            "message": "User not found!",
            "code": 1
        });
    }
}

export async function UpdatePermissions(req, res){
    const userId = req.params.userId;
    const role = req.body.role;
    const entityConnected = req.body.entityConnected;
    
    if(!userId || !role || !entityConnected){
        return res.status(400).json({
            "message": "Missing fields! See API documentation",
            "code": 0
        });
    }

    await Users.updateOne({
        _id: userId,
    }, {
        role,
        entityConnected
    });

    res.status(200).json({
        "message": "Permissions updated successfully!"
    });
}

export async function RecoverAccount(req, res){
    const email = req.body.email;
    
    if(!email){
        return res.status(400).json({
            "message": "Missing fields! See API documentation",
            "code": 0
        });
    }

    await Users.findOne({
        email: email
    }).then(async (findUser) => {
        const code = Math.floor(100000 + Math.random() * 900000);
        await Users.updateOne({
            _id: findUser._id
        }, {
            recoverCode: code
        });

        axios.post("https://api.twilio.com/2010-04-01/Accounts/AC64c7baa8dfeb7af39ef3e37e34b17e33/Messages.json", new URLSearchParams({
            To: "+351" + findUser.phone,
            From: 'JustEat',
            Body: "Your recovery code for your account is " + code
          }), {
            auth: {
                username: process.env.TWILIO_USER,
                password: process.env.TWILIO_PASS
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        res.status(200).json({
            "message": "An SMS was sent to your phone!",
            "code": 2
        });
    }).catch(() => {
        res.status(404).json({
            "message": "User not found!",
            "code": 0
        });
    })
}

export async function ResetPassword(req, res){
    const otpCode = req.body.otp;
    const email = req.body.email;
    const password = req.body.password;

    if(!otpCode || !password || !email){
        return res.status(400).json({
            "message": "Missing fields! See API documentation.",
            "code": 0
        });
    }

    if(password.length < 8){
        res.status(400).json({
            "message": "The password must be at least 8 characters!",
            "code": 1
        });
    }

    if(otpCode.length !== 6){
        res.status(400).json({
            "message": "The OTP Code must have 6 digits!",
            "code": 1
        });
    }

    if(!validateEmail(email)){
        return res.status(400).json({
            "field": "email",
            "code": 1
        });
    }

    Users.findOne({ email }, { recoverCode: true }).then(async(userData) => {
        if(userData.recoverCode !== otpCode){
            return res.status(401).json({
                "message": "The OTP Code is invalid!",
                "code": 0
            });
        }else{
            Users.findOneAndUpdate({ email }, {
                password: await bcrypt.hash(password, 12),
                recoverCode: '0'
            }).then(() => {
                res.status(200).json({
                    "message": "Password reset with success!",
                    "code": 2
                });
            }).catch(() => {
                res.status(404).json({
                    "message": "User not found!",
                    "code": 1
                });
            })
        }
    });
}

export async function GetAllUserInfo(req, res){
    const userId = req.userId;

    const userData = await Users.findById(userId, {
        email: true,
        nif: true,
        phone: true,
        nome: true,
        photo: true
    });

    res.status(200).json(userData);
}

export async function UpdateProfile(req, res){
    const userId = req.userId;

    const name = req.body.nome;
    const email = req.body.email;
    const phone = req.body.phone;
    const vat = req.body.nif;

    if(!name || !email || !phone || !vat){
        return res.status(400).json({
            "message": "Missing fields! See API documentation",
            "code": 0
        });
    }

    if(!validateEmail(email)){
        return res.status(400).json({
            "message": "The email is not valid!",
            "code": 1
        });
    }

    if(name.length < 3){
        return res.status(400).json({
            "message": "The name needs to be at least 3 characters!",
            "code": 1
        });
    }

    if(phone.length < 9){
        return res.status(400).json({
            "message": "The phone needs to be at least 9 characters!",
            "code": 1
        });
    }

    if(vat.length < 9){
        return res.status(400).json({
            "message": "The VAT needs to be at least 9 characters!",
            "code": 1
        });
    }

    const checkPreexisting = await Users.findOne({
        email
    }, {
        _id: true
    });

    if(checkPreexisting && userId !== checkPreexisting._id.toString()){
        return res.status(400).json({
            "message": "The email already exists!",
            "code": 1
        });
    }

    await Users.findByIdAndUpdate(userId, {
        nome: name,
        email,
        phone,
        nif: vat
    });

    res.status(200).json({
        "message": "User updated successfully!",
        "code": 2
    });
}

export async function UploadProfileImage(req, res){
    try {
        await Users.updateOne({
            _id: req.userId
        }, {
            photo: req.fileName
        })
        res.status(200).json({
            "message": "Profile image updated!",
            "code": 2,
            "fileName": req.fileName
        });
    }catch(e){
        res.status(400).json({
            "message": "Profile image not found!",
            "code": 1
        });
    }
}