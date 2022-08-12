const Joi = require("joi");
const db = require("../../config/database");
const createPost = async (req, res, type, typeKeyId) => {

    let typeId = req.params[typeKeyId];

    let user = req.user;

    let files = req.files;

    const schema = Joi.object({
        body: Joi.string().required()
    });

    const {value, error} = schema.validate(req.body);

    if (!error) {
        const trxProvider = db.transactionProvider();

        const trx = await trxProvider();

        try {
            let id = await trx('posts')
                .insert({
                    ...value,
                    userId: user.id,
                    typeId: typeId,
                    type: type,
                });

            for (let file of files) {
                await trx('attachments')
                    .insert({
                        name: file.filename,
                        ownerId: user.id,
                        path: file.path,
                        attachable: 'posts',
                        attachableId: id[0]
                    })
            }

            trx.commit();

            return res.json({status: 'success', 'message': 'Post Successful'});

        } catch (er) {
            return res.json({status: 'failed', error: error})
        }


    } else {
        return res.json({status: 'failed', error: error})
    }

}

const getPosts = async (req, res, type, typeKeyId) => {

    let typeId = req.params[typeKeyId];

    let {page} = req.query;

    if (!page) {
        page = 1;
    }

    const posts = await db('posts')
        .select('posts.*', 'users.firstName', 'users.lastName')
        .join('users', 'users.id', '=', 'posts.userId')
        .where('typeId', '=', typeId)
        .where('type', '=', type)
        .orderBy('posts.createdAt', 'desc')
        .paginate({perPage: 10, currentPage: page, isLengthAware: true});

    const {data} = posts;

    let postIds = data.map(item => item.id);

    const attachments = await db('attachments')
        .whereIn('attachableId', postIds)
        .where('attachable', '=', 'posts');

    data.map(item => {
        item.attachments = attachments.filter(i => i.attachableId === item.id);
        return item;
    });

    return res.json(posts);

}

module.exports = {
    createPost,
    getPosts
}