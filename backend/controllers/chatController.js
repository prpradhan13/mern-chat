import chatModel from "../models/chatModel.js";
import userModel from "../models/userModel.js";

const accessChatController = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).send({
        sucess: false,
        message: "User params not sent with request",
      });
    }

    var isChat = await chatModel
      .find({
        isGroupChat: false,
        $and: [
          { users: { $elemMatch: { $eq: req.user._id } } },
          { users: { $elemMatch: { $eq: userId } } },
        ],
      })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await userModel.populate(isChat, {
      path: "latestMessage.sender",
      select: "name image email",
    });

    if (isChat.length > 0) {
      res.status(200).send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };
      const createChat = await new chatModel(chatData).save();
      const fullChat = await chatModel
        .findOne({ _id: createChat._id })
        .populate("users", "-password");

      res.status(200).send(fullChat);
    }
  } catch (error) {
    res.status(404).send({
      sucess: false,
      message: "Error in Access Chat Controller",
    });
  }
};

const fetchChatController = async (req, res) => {
  try {
    chatModel
      .find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await userModel.populate(results, {
          path: "latestMessage.sender",
          select: "name image email",
        });

        res.status(200).send(results);
      });
  } catch (error) {
    res.status(404).send({
      sucess: false,
      message: "Error in Fetch Chat Controller",
    });
  }
};

const groupController = async (req, res) => {
  try {
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: "Please fill the fields" });
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
      return res.status(400).send("Add atleast 2 users");
    }

    users.push(req.user);

    const groupChat = await new chatModel({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    }).save();

    const allGroupChat = await chatModel
      .findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(allGroupChat);
  } catch (error) {
    res.status(404).send({
      sucess: false,
      message: "Error in Group Controller",
    });
  }
};

const renameGroupController = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;
    const updateChat = await chatModel
      .findByIdAndUpdate(chatId, { chatName }, { new: true })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updateChat) {
      return res.status(404).send("Chat not found");
    } else {
      res.json(updateChat);
    }
  } catch (error) {
    res.status(404).send({
      sucess: false,
      message: "Error in Group Controller",
    });
  }
};

const addGroupController = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const addUser = await chatModel
      .findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    
      if (!addUser) {
        return res.status(404).send("Chat not found");
      } else {
        res.status(200).json(addUser);
      }

  } catch (error) {
    res.status(404).send({
      sucess: false,
      message: "Error in Add Group Controller",
    });
  }
};

const removeGroupController = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const remove = await chatModel
      .findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    
      if (!remove) {
        return res.status(404).send("Chat not found");
      } else {
        res.status(200).json(remove);
      }

  } catch (error) {
    res.status(404).send({
      sucess: false,
      message: "Error in Add Group Controller",
    });
  }
};

export {
  accessChatController,
  fetchChatController,
  groupController,
  renameGroupController,
  addGroupController,
  removeGroupController
};
