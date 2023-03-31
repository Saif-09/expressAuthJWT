import UserModel from "../models/User.js";
import bcrypt from "bcrypt"; //for password hashing
import jwt from "jsonwebtoken"; //for JWT
import transporter from "../config/emailConfig.js";

class UserController {
  static userRegistration = async (req, res) => {
    //these data we are getting from FE and we're handling it here in BE
    const { name, email, password, password_confirmation } = req.body;

    //For making sure that the email which the user is using is used onlyonce
    const user = await UserModel.findOne({ email: email }); //the lhs email is in DB and rhs email we're getting from the FE and we are confirming that if there is already same email exists or not, and if there is an email already exists it will be stored in "user"
    if (user) {
      res.send({ status: "failed", message: "Email already exists" });
    } else {
      //We're now checking that all the fields from FE have required data or not
      if (name && email && password && password_confirmation ) {
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
              // tc: tc,
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
            res.send({ "status": "failed", "message": "New Password and Confirm New Passoword doesn't match" });

        }else{
            const salt = await bcrypt.genSalt(10)
            const newHashPassword = await bcrypt.hash(password, salt)
            await UserModel.findByIdAndUpdate(req.user._id,{$set:{password: newHashPassword}})
            res.send({ "status": "success", "message": "Password changed successfully" });

        }
    } else {
      res.send({ "status": "failed", "message": "All fields are required" });
    }
  }

  static loggedUser = async(req,res)=>{
    res.send({"user":req.user})
    //it will give output like this- 
    /*"user": {
         "_id": "6425f8dc3a0dabc2cab053a5",
         "name": "Saif",
         "email": "saif@gail.com",
         "tc": true,
         "__v": 0
     }*/  
  }

  //Send Reset Password Email, when a user forgot it's password and write it's email in FE and click submit then we get that email here
  static sendUserPasswordResetEmail = async(req,res)=>{
    const{email} = req.body
    if(email){
      const user = await UserModel.findOne({email:email})
      
      if(user){
        const secret = user._id + process.env.JWT_SECRET_KEY
        const token = jwt.sign({ userID:user._id}, secret, { expiresIn:'15m'})
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
        console.log(link);

        //Send Email
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: 'Reset Password',
          html:`<a href = ${link}>Click Here To Reset your Password</a>`
        })

        res.send({ "status": "success", "message": "Password Reset Email Sent " });
        
      }else{
        res.send({ "status": "failed", "message": "Email not found" });
      }

    }else{
      res.send({ "status": "failed", "message": "Email is required" });
    }

  }

  //after user click on the link that sent to email there will be a function to update the password
  static userPasswordReset = async(req,res)=>{
    //check that token is of which user to continue
    const{password,password_confirmation} = req.body
    const {id,token} = req.params
    const user = await UserModel.findById(id)
    const new_secret = user._id + process.env.JWT_SECRET_KEY
    try {
      jwt.verify(token, new_secret)
      if(password && password_confirmation){
        if(password!==password_confirmation){
          res.send({ "status": "failed", "message": "Password and Confirmation do not match" });

        }else{
          const salt = await bcrypt.genSalt(10);
            const newHashPassword = await bcrypt.hash(password, salt);
            await UserModel.findByIdAndUpdate(user._id,{$set:{password: newHashPassword}})
            res.send({ "status": "success", "message": "Password Updated" });
            
        }

      }else{
        res.send({ "status": "failed", "message": "All field is required" });
      }

    } catch (error) {
      console.log(error);
      res.send({ "status": "failed", "message": "Invalid Token" });
    }
  }
}
//exporting class, if you have to use function in it then we can write UserController.userRegistration
export default UserController;
