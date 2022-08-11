const {sequelize, Profile} = require('../models');
const {ClientError} = require('../error');


const depositBalance = async function(req, res) {
  const {Job, Contract} = req.app.get('models');
  const {userId} = req.params;
  const amount = req.body.amount;


  const user = await Profile.findByPk(userId);
  if (!user) {
    res.status(400).send({error: 'User not found'});
  }

  if (!amount) {
    res.status(400).send(
        {error: 'Invalid amount in request'},
    );
  }

  await sequelize.transaction(async (t) => {
    const {amountToPay} = await Job.findOne({
      attributes: [
        [sequelize.fn('sum', sequelize.col('price')), 'amountToPay'],
      ],
      include: {
        attributes: [],
        model: Contract,
        required: true,
        where: {ClientId: userId},
      },
      where: {
        paid: null,
      },
      raw: true,
      group: 'Contract.ClientId',
    });

    if (amount/amountToPay > 0.25) {
      // eslint-disable-next-line max-len
      throw new ClientError('You can not deposit more than 25% his total of jobs to pay');
    }

    await user.increment('balance', {by: amount, transaction: t});
  });


  res.send({success: true});
};


module.exports = {depositBalance};
