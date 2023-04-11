import UserModel from "../models/User.js";

class AdminController {
    static getAllUsers = async (req, res) => {
      try {
        if (req.user.role !== "admin") {
          return res.status(403).json({
            status: "failed",
            message: "You are not authorized to access this resource",
          });
        }
        const users = await UserModel.find({});
        res.status(200).json({ status: "success", data: users });
      } catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: "Server error" });
      }
    };
  
    static getUserById = async (req, res) => {
      try {
        if (req.user.role !== "admin") {
          return res.status(403).json({
            status: "failed",
            message: "You are not authorized to access this resource",
          });
        }
        const userId = req.params.userId;
        const user = await UserModel.findById(userId);
        if (!user) {
          res.status(404).json({ status: "failed", message: "User not found" });
        } else {
          res.status(200).json({ status: "success", data: user });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ status: "failed", message: "Server error" });
      }
    };
  }
  
  
  

export default AdminController;
