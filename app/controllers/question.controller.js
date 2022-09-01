const db = require('../../config/database');
const Joi = require("joi");
const {faker} = require('@faker-js/faker')
const Question = require('../models/Question');
const Answer = require('../models/Answer')

const index = async (req, res) => {

    let {type, typeId, ref} = req.query;

    const user = req.user;

    let page = 0;

    const questionQuery = Question.query().withGraphFetched('user')
        .where('morphType', '=', type)
        .where('morphId', '=', typeId)
        .orderBy('createdAt', 'desc');

    if (ref === 'my') {
        questionQuery.where('userId', '=', user.id)
    }

    const questions = await questionQuery.page(page, 10);

    return res.json(questions);
}

const store = async (req, res) => {

    const user = req.user;

    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string(),
        type: Joi.string(),
        typeId: Joi.string(),
    })

    const {error, value} = schema.validate(req.body);

    if (!error) {


        let {title, description, type, typeId} = value;

        try {
            await db('questions').insert({
                id: faker.random.alphaNumeric(6),
                title,
                description,
                morphType: type,
                morphId: typeId,
                userId: user.id,
            });

            return res.json({status: 'success', message: 'Question Posted'});

        } catch (er) {
            return res.status(500).send(er.message);
        }

    } else {
        res.send(error.message);
    }

}

const viewQuestion = async (req, res) => {
    const {id} = req.params;
    const question = await Question.query().withGraphFetched('user')
        .findById(id);

    if (!question) {
        return res.status(404).send('Not found');
    }

    const answers = await Answer.query().withGraphFetched('user')
        .where('questionId', '=', id);

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