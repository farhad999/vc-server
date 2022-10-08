const db = require("../../config/database");
const Joi = require("joi");
const {nanoid} = require("nanoid");
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

    page = parseInt(page);

    const conversation = await db('conversations')
        .where('id', '=', id)
        .first();

    const messages = await db('messages')
        .select('messages.*', 'users.firstName', 'users.lastName', 'users.id as userId')
        .join('users', 'users.id', '=', 'messages.senderId')
        .where('conversationId', '=', id)
        .orderBy('createdAt', 'desc')
        .paginate({perPage: 10, currentPage: page, isLengthAware: true});

    return res.json({conversation, messageData: messages})
}

const start = async (req, res) => {

    const {receiverId} = req.body;

    const user = req.user;

    const conversation = await db('conversations')
        .join('conversation_participants as cp', 'cp.conversationId', '=', 'conversations.id')
        .join('conversation_participants as cp2', 'cp2.conversationId', '=', 'cp.conversationId')
        .where('conversations.type', '=', 'single')
        .where('cp.userId', '=', user.id)
        .where('cp2.userId', '=', receiverId)
        .first();

    if (!conversation) {


        const id = nanoid();

        const participants = [
            {
                id: nanoid(),
                userId: user.id,
                conversationId: id,
            }, {
                id: nanoid(),
                userId: receiverId,
                conversationId: id,
            }
        ]

        const trxProvider = db.transactionProvider();

        const trx = await trxProvider();

        try {

            await trx('conversations')
                .insert({id, type: 'single'});

            await trx('conversation_participants')
                .insert(participants);

            trx.commit();

            return res.json({status: 'success', conversationId: id});

        } catch (er) {
            return res.status(500).json({message: er.message});
        }

    }

    return res.json({status: 'success', conversationId: conversation.id});


}

module.exports = {
    sendMessage,
    getConversationList,
    viewConversation,
    start,

}
