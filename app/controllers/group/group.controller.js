const db = require('../../../config/database')
const Group = require('../../models/Group')
const Member = require('../../models/Member')
const Joi = require("joi");
const {faker} = require("@faker-js/faker");

const getGroups = async (req, res) => {

    const groups = await Group.query();

    res.json(groups);

}

const createGroup = async (req, res) => {

    const user = req.user;

    const schema = Joi.object({
        name: Joi.string().required(),
    })

    const {value, error} = schema.validate(req.body);

    if (!error) {

        const trx = await db.transaction();

        const {name} = value;

        const id = faker.random.alphaNumeric(8);

        const invitationCode = faker.random.alphaNumeric(10);

        try {

            await trx('groups').insert({
                name: name,
                id: id,
                invitationCode: invitationCode,
                adminId: user.id
            });

            await trx('members').insert({userId: user.id, groupId: id});

            trx.commit();

            return res.json({status: 'success', message: 'Group Created', groupId: id});

        } catch (er) {
            return res.json({status: 'failed', message: er})
        }


    } else {
        return res.json({status: 'failed', message: error});
    }

}

const viewGroup = async (req, res) => {

    const {id} = req.params;

    const group = await Group.query().findById(id);

    if (!group) {
        return res.status(404).send('Group Not Found');
    }

    const user = req.user;

    const member = await Member.query()
        .where('groupId', '=', id)
        .where('userId', '=', user.id).first();

    let accessInfo = {isMember: false, isAdmin: false};

    if (member) {
        if (member.userId === group.adminId) {
            accessInfo.isAdmin = true;
        }
        accessInfo.isMember = true;
    } else {
        const hasRequest = await db('requests')
            .where('userId', '=', user.id)
            .where('groupId', '=', id)
            .where('type', '=', 'group')
            .first();

        accessInfo.isRequestSent = !!hasRequest;

    }

    //const withAdmin = await group.$relatedQuery('admin');

    return res.json({group, accessInfo});

}

const joinRequest = async (req, res) => {

    const {id} = req.params;

    const {code} = req.query;

    const user = req.user;


    const group = await Group.query().findById(id);

    if(!group){
        return res.status(404).send('Group Not Found');
    }

    const member = await Member.query()
        .where('groupId', '=', id)
        .where('userId', '=', user.id).first();

    if(member){
        return res.json({status: 'failed', message: 'You are already a member'});
    }

    if(code){
        if(group.invitationCode === code){
            await db('members')
                .insert({userId: user.id, groupId: group.id});
            return res.json({status: 'success', message: 'Joined Successful', accessInfo: {isMember: true}});
        }else{
            return res.json({status: 'failed', 'message': 'Invite Code is not valid, for this group.'})
        }
    }


    const isRequestSent = await db('requests')
        .where({groupId: id, userId: user.id})
        .where('type', '=', 'group')
        .first();

    if (isRequestSent) {

        try {
            await db('requests')
                .where({groupId: id, userId: user.id})
                .where('type', '=', 'group')
                .delete();
            return res.json({status: 'success', message: 'Request Cancel', accessInfo: {isRequestSent: false}});
        } catch (er) {

        }

    } else {

        try {
            await db('requests')
                .insert({groupId: id, userId: user.id});

            return res.json({status: 'success', message: 'Request Sent', accessInfo: {isRequestSent: true}})
        } catch (er) {
            return res.json({status: 'failed', message: er})
        }

    }
}

module.exports = {
    getGroups,
    createGroup,
    viewGroup,
    joinRequest
}