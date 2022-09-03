const db = require('../../config/database');
const Joi = require("joi");
const {faker} = require('@faker-js/faker')

const index = async (req, res) => {

    let {type, typeId, ref, tag} = req.query;

    const user = req.user;

    let page = 1;

    const questionQuery = db('questions')
        .select('questions.id', 'questions.userId', 'questions.title', 'questions.createdAt',
            cb => cb.from('answers').count('answers.id').where('questions.id', '=', db.ref('answers.questionId')).as('count')
        )
        .where('questions.morphType', '=', type)
        .where('questions.morphId', '=', typeId)
        .orderBy('questions.createdAt', 'desc');


    if (ref === 'my') {
        questionQuery.where('userId', '=', user.id)
    }

    if (tag) {
        questionQuery.join('taggables', 'taggables.taggableId', '=', 'questions.id')
            .join('tags', 'tags.id', '=', 'taggables.tagId')
            .where('tags.slug', '=', tag);
    }

    const {data, pagination} = await questionQuery.paginate({page: page, isLengthAware: true, perPage: 10});


    const tags = await db('tags')
        .select('tags.id', 'tags.name', 'tags.slug', 'taggables.taggableId')
        .join('taggables', 'taggables.tagId', '=', 'tags.id')
        .whereIn('taggables.taggableId', data.map(item => item.id));

    const postUser = await db('users')
        .select('id', 'firstName', 'lastName')
        .whereIn('id', data.map(item => item.userId));

    //now process this data

    data.map((question) => {
        question.tags = tags.filter(item => item.taggableId === question.id);
        question.user = postUser.find(item => item.id === question.userId);
    })

    return res.json({data, pagination});
}

const store = async (req, res) => {

    const user = req.user;

    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string(),
        tags: Joi.array().items(Joi.object({
            name: Joi.string().alphanum(),
            slug: Joi.string().required(),
        })),
        type: Joi.string(),
        typeId: Joi.string(),
    })

    const {error, value} = schema.validate(req.body);

    if (!error) {


        let {title, description, type, typeId, tags} = value;

        const trxProvider = db.transactionProvider();
        const trx = await trxProvider();

        let questionId = faker.random.alphaNumeric(6)

        try {

            await trx('questions').insert({
                id: questionId,
                title,
                description,
                morphType: type,
                morphId: typeId,
                userId: user.id,
            });

            for (const tag of tags) {

                console.log('tag', tag);

                let t = await trx('tags')
                    .where('slug', '=', tag.slug)
                    .where('morphType', '=', type)
                    .where('morphId', '=', typeId)
                    .first();

                let tagId;

                if (!t) {

                    tagId = faker.random.alphaNumeric(6)

                    await trx('tags').insert({
                        ...tag,
                        morphType: type,
                        morphId: typeId,
                        id: tagId
                    })
                } else {
                    tagId = t.id;
                }
                await trx('taggables')
                    .insert({
                        id: faker.random.alphaNumeric(6),
                        taggableType: 'questions',
                        taggableId: questionId,
                        tagId: tagId,
                    })

            }
            trx.commit();

            return res.json({status: 'success', message: 'Question Posted'});

        } catch (er) {
            trx.rollback();
            return res.status(500).send(er.message);
        }

    } else {
        res.send(error.message);
    }

}

const viewQuestion = async (req, res) => {
    const {id} = req.params;

    const question = await db('questions')
        .select('id', 'title', 'description', 'createdAt', 'userId')
        .where('id', '=', id)
        .first();

    if (!question) {
        return res.status(404).send('Not found');
    }

    //now get the user related to this question

    question.user = await db('users')
        .select('id', 'firstName', 'lastName')
        .where('id', '=', question.userId)
        .first();

    const answers = await db('answers')
        .where('questionId', '=', id);

    const users = await db('users')
        .select('id', 'firstName', 'lastName')
        .whereIn('id', answers.map(item => item.userId));

    answers.map((answer)=> {
        answer.user = users.find(item=>item.id === answer.userId);
        return answer;
    })

    return res.json({question, answers});
}

const postAnswer = async (req, res) => {
    let {id} = req.params;

    const user = req.user;

    try {
        const answerId = faker.random.alphaNumeric(6);
        await db('answers')
            .insert({id: answerId, questionId: id, body: req.body.content, userId: user.id})

        return res.json({status: 'success', id: answerId});
    } catch (er) {
        return res.status(500).send(er.message);
    }


}
module.exports = {
    store,
    index,
    viewQuestion,
    postAnswer
}