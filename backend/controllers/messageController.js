import messageModel from "../models/messageModel.js";
import userModel from "../models/userModel.js";
import chatModel from "../models/chatModel.js";

const sendMessageController = async (req, res) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    return res
      .status(400)
      .send({ message: "Invalid data passed into request" });
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await messageModel.create(newMessage);

    message = await message.populate("sender", "name image");
    message = await message.populate("chat");
    message = await userModel.populate(message, {
      path: "chat.users",
      select: "name image email",
    });

    await chatModel.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
  }
};

const allMessageController = async (req, res) => {
  try {
    const messages = await messageModel
      .find({ chat: req.params.chatId })
      .populate("sender", "name, image email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
  }
};

export { sendMessageController, allMessageController };
