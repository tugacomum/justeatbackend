import Addresses from "../Models/Addresses";

export async function GetAllAddresses(req, res){
    let userId = req.params.userId;
    
    if(!userId){
        userId = req.userId;
    }

    Addresses.find({
        clientId: userId,
        status: true
    }).then((addressList) => {
        res.status(200).json(addressList);
    });
}

export async function CreateOrUpdateAddresses(req, res){
    const addressId = req.params.addressId;

    const addressLineOne = req.body.addressLineOne;
    const addressLineTwo = req.body.addressLineTwo;

    if(!addressLineOne || !addressLineTwo){
        return res.status(400).json({
            "message": "Missing fields! See API documentation",
            "code": 0
        });
    }

    if(addressId){
        try {
            const addressData = await Addresses.findById(addressId, {
                clientId: true
            });
            if(addressData.clientId !== req.userId){
                return res.status(401).json({
                    "message": "This address not belongs to your account!",
                    "code": 0
                });
            }
            await Addresses.updateOne({
                _id: addressId
            }, {
                addressLineOne,
                addressLineTwo
            });
        }catch(e){
            return res.status(404).json({
                "message": "Address not found",
                "code": 1
            });
        }
    }else{
        await Addresses.create({
            addressLineOne,
            addressLineTwo,
            clientId: req.userId,
            status: true
        });
    }

    res.status(200).json({
        "message": "The address was successfully added or updated!",
        "code": 2
    });
}

export async function GetAddress(req, res){
    const addressId = req.query.addressId;
    
    if(!addressId){
        return res.status(400).json({
            "message": "Missing fields! See API documentation",
            "code": 0
        });
    }

    try {
        const address = await Addresses.findById(addressId, {
            addressLineOne: true,
            addressLineTwo: true,
            clientId: true
        });

        if(address.clientId !== req.userId){
            return res.status(401).json({
                "message": "This address not belongs to your account!",
                "code": 0
            });
        }

        res.status(200).json(address);
    }catch(e){
        return res.status(400).json({
            "message": "Address not found",
            "code": 1
        });
    }
}

export async function DeleteAddress(req, res){
    const addressId = req.query.addressId;
    
    if(!addressId){
        return res.status(400).json({
            "message": "Missing fields! See API documentation",
            "code": 0
        });
    }

    try {
        const address = await Addresses.findById(addressId, {
            clientId: true
        });

        if(address.clientId !== req.userId){
            return res.status(401).json({
                "message": "This address not belongs to your account!",
                "code": 0
            });
        }

        await Addresses.updateOne({
            _id: addressId
        }, {
            status: false
        });

        res.status(200).json({
            "message": "The address was successfully deleted!",
            "code": 2
        });
    }catch(e){
        return res.status(400).json({
            "message": "Address not found",
            "code": 1
        });
    }
}