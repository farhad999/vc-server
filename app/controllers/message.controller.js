const db = require("../../config/database");
const Joi = require("joi");
const getConversationList = async (req, res) => {

    const user = req.user;

    const conversations = await db('conversations')
        .select('conversations.*')
        .join('conversation_participants as cp', 'cp.conversationId', '=', 'conversations.id')
        .where("cp.userId", '=', user.id);

    return res.json(conversations);
}

const sendMessage = async (req, res) => {
    let {id} = req.params;
    let user = req.user;

    let {body} = req.body;

    const schema = Joi.object({
        id: Joi.string().required(),
        body: Joi.string().required(),
        createdAt: Joi.optional(),
    });

    const {value, error} = schema.validate(req.body);

    if (!error) {
        try {

            await db('messages')
                .insert({
                    ...value,
                    senderId: user.id,
                    conversationId: id
                });

            return res.json({status: 'success'});

        } catch (er) {

        }
    } else {

    }


    return res.json({status: 'success', 'message': 'Success'});

}

const viewConversation = async (req, res) => {
    const {id} = req.params;

    let {page} = req.query;

    if(!page){
        page = 1;
    }

    const conversation = await db('conversations')
        .where('id', '=', id)
        .first();

    const messages = await db('messages')
        .select('messages.*', 'users.firstName', 'users.lastName', 'users.id as userId')
        .join('users', 'users.id', '=', 'messages.senderId')
        .where('conversationId', '=', id)
        .paginate({perPage: 10, currentPage: page, isLengthAware: true});

    return res.json({conversation, messages})
}

module.exports = {
    sendMessage,
    getConversationList,
    viewConversation

}