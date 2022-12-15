const Joi = require("joi");
const db = require("../../config/database");

const index = async (req, res) => {
  const user = req.user;
  
  const {type} = req.query;

  if(type === 'class_tasks'){
    const tasks = await db('assignments')
    .join('assignment_students as as', 'as.assignmentId', '=', 'assignments.id')
    .where('as.status', '=', 'assigned')
    .where('as.assignedTo', '=', user.id);

    return res.json({tasks: tasks})
  }

  const tasks = await db("tasks").where("userId", "=", user.id);

  return res.json({ tasks: tasks });
};

const create = async (req, res) => {
  const user = req.user;

  const taskSchema = Joi.object({
    content: Joi.string().required(),
    date: Joi.date().allow(null),
  });

  const { value, error } = taskSchema.validate(req.body);

  if (!error) {
    try {
      await db("tasks").insert({
        ...value,
        userId: user.id,
      });

      return res.json({ status: "success", message: "Task Added" });
    } catch (er) {
      return res.status(500).json({ status: "error", message: er.message });
    }
  }

  return res
    .status(422)
    .json({ status: "failed", message: "Validation Error" + error.message });
};

const toggleIsComplete = async (req, res) => {
  let { id } = req.params;

  //find out task

  let task = await db("tasks").where("id", "=", id).first();

  if(!task){
    return res.status(404).json({status: 'failed', message:  'Task Not Found'});
  }

  try{

    await db('tasks')
    .update({isComplete: !task.isComplete})
    .where('id', '=', id);

    return res.json({status: 'success'})

  }catch(er){
    return res.status(500).json({status: 'error', message: 'Server error '+ er.message});
  }

};

const deleteTask = async (req, res) => {
    let { id } = req.params;
  
    //find out task
  
    let task = await db("tasks").where("id", "=", id).first();
  
    if(!task){
      return res.status(404).json({status: 'failed', message:  'Task Not Found'});
    }
  
    try{
  
      await db('tasks')
      .where('id', '=', id)
      .delete();
  
      return res.json({status: 'success', message: 'Task Deleted'});
  
    }catch(er){
      return res.status(500).json({status: 'error', message: 'Server error '+ er.message});
    }
  
  };

module.exports = {
  index,
  create,
  toggleIsComplete,
  deleteTask,
};
