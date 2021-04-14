import sequelize from '../sequelize';
import moment from 'moment';
import faker from 'faker';
faker.locale = "ko";

const { plan, group, memo, todo } = sequelize.models;

export const dummyCreatorFunction = async (userId: number) => {
  try {
    const now = moment().format("YYYY-MM-DD");
    const add = moment().add(7, "days").format("YYYY-MM-DD");

    const plans = [
      {
        start: now,
        end: add,
        userId
      },
    ];
    
    const groups = [
      {
        title: faker.name.jobType(),
        userId
      },
      {
        title: faker.name.jobType(),
        userId
      },
      {
        title: faker.name.jobType(),
        userId
      },
    ];
    
    const memos = [
      {
        title: faker.name.jobTitle(),
        content: faker.lorem.sentences(),
        userId
      },
      {
        title: faker.name.jobTitle(),
        content: faker.lorem.sentences(),
        userId
      }
    ];
    
    const todos = [
      {
        content: faker.lorem.sentence(),
        start: now,
        end: add,
        success: "N",
        userId
      },
      {
        content: faker.lorem.sentence(),
        start: now,
        end: add,
        success: "N",
        userId
      },
      {
        content: faker.lorem.sentence(),
        start: now,
        end: add,
        success: "N",
        userId
      },
      {
        content: faker.lorem.sentence(),
        start: now,
        end: add,
        success: "N",
        userId
      },
      {
        content: faker.lorem.sentence(),
        start: now,
        end: add,
        success: "Y",
        userId
      },
      {
        content: faker.lorem.sentence(),
        start: now,
        end: add,
        success: "Y",
        userId
      },
    ];

    await sequelize.transaction( async (transaction) => {
      await plan.bulkCreate(plans, { updateOnDuplicate: ["id"], transaction });
      await group.bulkCreate(groups, { updateOnDuplicate: ["id"], transaction });
      await memo.bulkCreate(memos, { updateOnDuplicate: ["id"], transaction });
      await todo.bulkCreate(todos, { updateOnDuplicate: ["id"], transaction });
    });
    
    return {
      err: false,
      data: null,
      message: "",
    };
  } catch(err) {
    return {
      err: true,
      data: null,
      message: err?.message
    };
  }
};