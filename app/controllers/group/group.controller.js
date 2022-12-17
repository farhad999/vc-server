const db = require("../../../config/database");
const Group = require("../../models/Group");
const Member = require("../../models/Member");
const Joi = require("joi");
const { faker } = require("@faker-js/faker");
const postService = require("../../services/post.service");
const User = require("../../models/User");
const logger = require("../../../config/logger");
const Request = require("../../models/Request");

const getGroups = async (req, res) => {
  const groups = await db("groups").select('name', 'id', (cb) =>
    cb
      .from("members")
      .where("groups.id", "=", db.ref('members.groupId'))
      .count("members.id").as('count')
  );

  res.json(groups);
};

const createGroup = async (req, res) => {
  const user = req.user;

  const schema = Joi.object({
    name: Joi.string().required(),
  });

  const { value, error } = schema.validate(req.body);

  if (!error) {
    const trx = await db.transaction();

    const { name } = value;

    const id = faker.random.alphaNumeric(8);

    const invitationCode = faker.random.alphaNumeric(10);

    try {
      await trx("groups").insert({
        name: name,
        id: id,
        invitationCode: invitationCode,
        adminId: user.id,
      });

      await trx("members").insert({ userId: user.id, groupId: id });

      trx.commit();

      return res.json({
        status: "success",
        message: "Group Created",
        groupId: id,
      });
    } catch (er) {
      return res.json({ status: "failed", message: er });
    }
  } else {
    return res.json({ status: "failed", message: error });
  }
};

const viewGroup = async (req, res) => {
  const { id } = req.params;

  const group = await Group.query().findById(id);

  if (!group) {
    return res.status(404).send("Group Not Found");
  }

  const user = req.user;

  const member = await Member.query()
    .where("groupId", "=", id)
    .where("userId", "=", user.id)
    .first();

  let accessInfo = { isMember: false, isAdmin: false };

  if (member) {
    if (member.userId === group.adminId) {
      accessInfo.isAdmin = true;
    }
    accessInfo.isMember = true;
  } else {
    const hasRequest = await db("requests")
      .where("userId", "=", user.id)
      .where("typeId", "=", id)
      .where("type", "=", "group")
      .first();

    accessInfo.isRequestSent = !!hasRequest;
  }

  //const withAdmin = await group.$relatedQuery('admin');

  return res.json({ group, accessInfo });
};

const joinRequest = async (req, res) => {
  const { id } = req.params;

  const { code } = req.query;

  const user = req.user;

  const group = await Group.query().findById(id);

  if (!group) {
    return res.status(404).send("Group Not Found");
  }

  const member = await Member.query()
    .where("groupId", "=", id)
    .where("userId", "=", user.id)
    .first();

  if (member) {
    return res.json({ status: "failed", message: "You are already a member" });
  }

  if (code) {
    if (group.invitationCode === code) {
      await db("members").insert({
        userId: user.id,
        typeId: group.id,
        type: "group",
      });
      return res.json({
        status: "success",
        message: "Joined Successful",
        accessInfo: { isMember: true },
      });
    } else {
      return res.json({
        status: "failed",
        message: "Invite Code is not valid, for this group.",
      });
    }
  }

  const isRequestSent = await db("requests")
    .where({ typeId: id, userId: user.id })
    .where("type", "=", "group")
    .first();

  if (isRequestSent) {
    try {
      await db("requests")
        .where({ typeId: id, userId: user.id })
        .where("type", "=", "group")
        .delete();
      return res.json({
        status: "success",
        message: "Request Cancel",
        accessInfo: { isRequestSent: false },
      });
    } catch (er) {}
  } else {
    try {
      await db("requests").insert({
        typeId: id,
        userId: user.id,
        type: "group",
      });

      return res.json({
        status: "success",
        message: "Request Sent",
        accessInfo: { isRequestSent: true },
      });
    } catch (er) {
      return res.json({ status: "failed", message: er });
    }
  }
};

const getPosts = async (req, res) => {
  await postService.getPosts(req, res, "group", "id");
};

const createPost = async (req, res) => {
  await postService.createPost(req, res, "group", "id");
};

const getMembers = async (req, res) => {
  let { id } = req.params;

  const members = await User.query()
    .join("members", "users.id", "=", "members.userId")
    .where("members.groupId", "=", id);

  return res.json(members);
};

const requests = async (req, res) => {
  const { id } = req.params;

  const requests = await User.query()
    .select(
      "users.id",
      "users.firstName",
      "users.lastName",
      "requests.id as requestId"
    )
    .join("requests", "requests.userId", "=", "users.id")
    .where("requests.type", "=", "group")
    .where("requests.typeId", "=", id);

  // const requests = await Request.query().withGraphFetched('user');

  return res.json(requests);
};

const acceptRequest = async (req, res) => {
  let { id, requestId } = req.params;

  let { userId } = req.body;

  let request = await db("requests").where("id", "=", requestId).first();

  let user = req.user;

  if (!user.isAdmin) {
    logger.info("User does not have permission");
    return res
      .status(403)
      .send({ message: "You have not permission to perform this operation" });
  }

  if (!request) {
    logger.info("following request not found: request Id" + requestId);
    return res.status(404).send({ message: "Request not found" });
  }

  const trxProvider = db.transactionProvider();

  const trx = await trxProvider();

  try {
    await trx("members").insert({ groupId: id, userId: userId });

    await trx("requests").where("id", "=", requestId).delete();

    trx.commit();

    return res.json({ status: "success", message: "Request Accepted" });
  } catch (er) {
    //logger.emerg({message: er.message, line: er.stackTrace})
    console.log(er);
  }
};

const removeRequest = async (req, res) => {
  let { id, requestId } = req.params;

  let request = await db("requests").where("id", "=", requestId).first();

  let user = req.user;

  if (!user.isAdmin) {
    logger.info("User does not have permission");
    return res
      .status(403)
      .send({ message: "You have not permission to perform this operation" });
  }

  if (!request) {
    logger.info("following request not found: request Id" + requestId);
    return res.status(404).send({ message: "Request not found" });
  }

  try {
    await db("requests").where("id", "=", requestId).delete();

    return res.json({ status: "success", message: "Request deleted" });
  } catch (er) {
    return res.status(500).json({ message: er.message });
  }
};

module.exports = {
  getGroups,
  createGroup,
  viewGroup,
  joinRequest,
  getPosts,
  createPost,
  getMembers,
  requests,
  acceptRequest,
  removeRequest,
};
