import { comparePassword, hashPassword } from "../helper/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";

// Sign Up Controller
const signUpController = async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    if (!name || !email || !password) {
      res.status(400).send({
        success: false,
        message: "Please enter required fields",
      });
    }

    const userExists = await userModel.findOne({ email });

    if (userExists) {
      res.status(400).send({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      image,
    }).save();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Could not create user",
    });
  }
};

// Log in Controller
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(404)
        .send({ success: false, message: "Invalid email or password" });
    }

    // check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not exists" });
    }

    // compare password
    const matchPassword = await comparePassword(password, user.password);
    if (!matchPassword) {
      return res.status(404).send({
        success: false,
        message: "Invalid Password",
      });
    }

    // generate token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).send({
      success: true,
      message: `Welcome ${user.name}`,
      userDetails: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image
      },
      token,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Could not login",
    });
  }
};

// All user Controller
const allUserController = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await userModel
      .find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select("-password")
    
    res.status(200).send({
      success: true,
      message: "Getting allusers",
      users,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "Error getting allusers",
    });
  }
};

export { signUpController, loginController, allUserController };
