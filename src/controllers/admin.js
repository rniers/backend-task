const {sequelize} = require('../models');
const {Op} = require('sequelize');
const moment = require('moment');


const bestProfession = async function(req, res) {
  const {Job, Contract, Profile} = req.app.get('models');
  const {start, end} = req.query;

  const startDate = new Date(start);
  const endDate = new Date(end);

  const profession = await Job.findOne({
    attributes: [
      [sequelize.literal('`Contract->Contractor`.`profession`'), 'profession'],
      [sequelize.fn('sum', sequelize.col('price')), 'totalPaid'],
    ],
    include: {
      model: Contract,
      attributes: [],
      required: true,
      include: [
        {
          model: Profile,
          required: true,
          as: 'Contractor',
          attributes: ['profession'],
        },
      ],
    },
    raw: true,
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [startDate, endDate],
      },
    },
    group: ['profession'],
    order: sequelize.literal('totalPaid DESC'),
  });

  const response = {};

  if (!!profession) {
    response.profession = profession.profession;
    response.totalPaid = profession.totalPaid;
  }

  return res.send(response);
};


const bestClients = async function(req, res) {
  const {Job, Contract, Profile} = req.app.get('models');
  const {start, end, limit} = req.query;

  const queryLimit = limit || 2;

  const startDate = moment(start, 'YYYY-MM-DD', true).format();
  if (!startDate) {
    return res.send({error: 'Invalid start date'});
  }

  const endDate = moment(end, 'YYYY-MM-DD', true).format();
  if (!endDate) {
    return res.send({error: 'Invalid end date'});
  }

  const clients = await Job.findAll({
    attributes: [
      [sequelize.fn('sum', sequelize.col('price')), 'totalPaid'],
    ],
    include: {
      model: Contract,
      attributes: [],
      required: true,
      include: [
        {
          model: Profile,
          required: true,
          as: 'Client',
        },
      ],
    },
    raw: true,
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [startDate, endDate],
      },
    },
    group: ['Contract.Client.id'],
    order: sequelize.literal('totalPaid DESC'),
    limit: queryLimit,
  });

  return res.send(clients);
};


module.exports = {bestProfession, bestClients};
