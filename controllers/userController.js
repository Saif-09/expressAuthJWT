import UserModel from "../models/User.js";
import bcrypt from "bcrypt"; //for password hashing
import jwt from "jsonwebtoken"; //for JWT

class UserController {
  static userRegistration = async (req, res) => {
    //these data we are getting from FE and we're handling it here in BE
    const { name, email, password, password_confirmation, tc } = req.body;

    //For making sure that the email which the user is using is used onlyonce
    const user = await UserModel.findOne({ email: email }); //the lhs email is in DB and rhs email we're getting from the FE and we are confirming that if there is already same email exists or not, and if there is an email already exists it will be stored in "user"
    if (user) {
      res.send({ status: "failed", message: "Email already exists" });
    } else {
      //We're now checking that all the fields from FE have required data or not
      if (name && email && password && password_confirmation && tc) {
        //We're now checking that the password and password_confirmation match
        if (password === password_confirmation) {
          try {
            //We're now hashing the password and storing it in DB
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            //When all the fields are proper, then we are storing all the user entered values in doc and creating a new Model in DB
            const doc = new UserModel({
              name: name,
              email: email,
              password: hashPassword,
              tc: tc,
            });
            //We are now saving the doc in DB, doc is the new user
            await doc.save();
            const saved_user = await UserModel.findOne({ email: email });
            //We are now generating a JWT token for the user and sending it to the FE
            const token = jwt.sign(
              { userID: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res
              .status(201)
              .send({
                status: "success",
                message: "Registration Sucess",
                token: token,
              });
          } catch (error) {
            console.log(error);
            res.send({ status: "failed", message: "Unable to register" });
          }
        } else {
          res.send({
            status: "failed",
            message: "Password and password confirmation do not match",
          });
        }
      } else {
        res.send({ status: "failed", message: "Please fill all the fields" });
      }
    }
  };
  static userLogin = async (req, res) => {
    try {
      //check e-mail and password is entered or not
      const { email, password } = req.body;
      if (email && password) {
        //check if the user is already in DB or not
        const user = await UserModel.findOne({ email: email });
        if (user != null) {
          //check if the password is correct or not
          const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
          );
          if (user.email === email && isPasswordCorrect) {
            //We are now generating a JWT token for the user and sending it to the FE

            const token = jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.send({
              status: "success",
              message: "Login Successfull",
              token: token,
            });
          } else {
            //if any of the conditions are not met, then we are sending the user to the login page
            res.send({
              status: "failed",
              message: "Email or password is not valid",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "You are not a registered user",
          });
        }
      } else {
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to login" });
    }
  };

  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
        if(password!==password_confirmation){
            res.send({ status: "failed", message: "Password doesn't match" });

        }else{
            const salt = await bcrypt.genSalt(10)
            const newHashPassword = await bcrypt.hash(password, salt)

        }
    } else {
      res.send({ status: "failed", message: "All fields are required" });
    }
  };
}
//exporting class, if you have to use function in it then we can write UserController.userRegistration
export default UserController;
