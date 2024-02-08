import express from "express";

import { BasicAuth, Auth } from "./Middlewares/Auth";

import { AuthenticateUser, CreateAccount, GetAllUserInfo, GetAllUsers, GetUserPermissionsMetadata, RecoverAccount, ResetPassword, UpdatePermissions, UpdateProfile, UploadProfileImage, UserInfo } from "./Controllers/Users";
import { CreateRestaurant, DeleteRestaurant, GetAllRestaurants, GetAllRestaurantsNames, GetMyRestaurant, GetRestaurant, GetRestaurants, UpdateRestaurant, UploadRestaurantImage } from "./Controllers/Restaurants";
import { CreateFood, DeleteFood, GetAllFoods, GetFood, UpdateFood, UploadFoodImage } from "./Controllers/Food";
import { GetAllCartFromRestaurant, GetAllCartFromUser, GetAllCarts, GetCartMetadata, SaveCart, UpdateCart, UpdateCartStatus } from "./Controllers/Cart";
import { CreateOrUpdateAddresses, DeleteAddress, GetAddress, GetAllAddresses } from "./Controllers/Addresses";
import { GetComments, GetRestaurantComments, PostRestaurantComments } from './Controllers/Comments';

import multer from "multer";
import Multer from "./Utils/Multer";
import { CheckRole } from "./Middlewares/ValidateRole";

const routes = express.Router();

routes.get('/login', BasicAuth, AuthenticateUser);
routes.get('/user', [Auth, CheckRole(["user", "manager", "admin"])], UserInfo);
routes.post('/createAccount', CreateAccount);
routes.get('/restaurants', GetRestaurants);
routes.get('/allRestaurants', [Auth, CheckRole(["admin"])], GetAllRestaurants);
routes.get('/restaurant/:slug', GetRestaurant);
routes.get('/myRestaurant', [Auth, CheckRole(["manager"])], GetMyRestaurant);
routes.get('/foods', [Auth, CheckRole(["manager"])], GetAllFoods);
routes.get('/restaurantOverview', [Auth, CheckRole(["admin", "manager"])], GetMyRestaurant);
routes.put('/updateRestaurant/:restaurantId', [Auth, CheckRole(["admin", "manager"])], UpdateRestaurant);
routes.post('/createRestaurant', [Auth, CheckRole(["admin"])], CreateRestaurant);
routes.post('/createFood', [Auth, CheckRole(["manager"])], CreateFood);
routes.post('/createCart', [Auth, CheckRole(["user"])], SaveCart);
routes.patch('/updateFood/:foodId', [Auth, CheckRole(["manager"])], UpdateFood);
routes.delete('/food/:foodId', [Auth, CheckRole(["manager"])], DeleteFood);
routes.put('/updateCart/:cartId', [Auth, CheckRole(["admin"])], UpdateCart);
routes.get('/food/:foodId', [Auth, CheckRole(["manager", "admin", "user"])], GetFood);
routes.get('/GetAllCartFromUser', [Auth, CheckRole(["user"])], GetAllCartFromUser);
routes.get('/GetAllCartFromRestaurant', [Auth, CheckRole(["manager"])], GetAllCartFromRestaurant);
routes.get('/GetAllCarts', [Auth, CheckRole(["admin"])], GetAllCarts);
routes.get('/addresses', [Auth, CheckRole(["user"])], GetAllAddresses);
routes.get('/addresses/:userId', [Auth, CheckRole(["admin"])], GetAllAddresses);
routes.put('/updateAddress/:addressId', [Auth, CheckRole(["user"])], CreateOrUpdateAddresses);
routes.post('/createAddress', [Auth, CheckRole(["user"])], CreateOrUpdateAddresses);
routes.get('/address', [Auth, CheckRole(["admin", "manager", "user"])], GetAddress);
routes.get('/profile', [Auth, CheckRole(["admin", "manager", "user"])], GetAllUserInfo);
routes.patch('/updateProfile', [Auth, CheckRole(["admin", "manager", "user"])], UpdateProfile);
routes.get('/cartMetadata/:cartId', [Auth, CheckRole(["admin"])], GetCartMetadata);
routes.get('/users', [Auth, CheckRole(["admin"])], GetAllUsers);
routes.get('/permission', [Auth, CheckRole(["admin"])], GetUserPermissionsMetadata);
routes.delete('/deleteAddress', [Auth, CheckRole(["user"])], DeleteAddress);
routes.delete('/deleteRestaurant/:restaurantId', [Auth, CheckRole(["admin"])], DeleteRestaurant);
routes.get('/restaurantsName', [Auth, CheckRole(["admin"])], GetAllRestaurantsNames);
routes.patch('/updatePermissions/:userId', [Auth, CheckRole(["admin"])], UpdatePermissions);
routes.patch('/updateCartStatus/:cartId', [Auth, CheckRole(["admin", "manager", "user"])], UpdateCartStatus);
routes.post('/restaurantImageUpload/:restaurantId', [Auth, CheckRole(["admin", "manager"]), multer(Multer).single('file')], UploadRestaurantImage);
routes.post('/foodImageUpload/:foodId', [Auth, CheckRole(["manager"]), multer(Multer).single('file')], UploadFoodImage);
routes.post('/uploadProfileImage', [Auth, CheckRole(["manager", "admin", "user"]), multer(Multer).single('file')], UploadProfileImage);
routes.post('/recoverAccount', RecoverAccount);
routes.post('/resetPassword', ResetPassword);
routes.post('/getrestaurantcomments', GetRestaurantComments);
routes.post('/postrestaurantcomments', [Auth, CheckRole(['user'])], PostRestaurantComments);
routes.get('/getcomments', GetComments);

export default routes;