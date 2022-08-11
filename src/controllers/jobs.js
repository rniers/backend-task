const {Transaction, QueryTypes} = require('sequelize');
const {ClientError} = require('../error');

const unpaidJobs = async (req, res) => {
  const {Job} = req.app.get('models');
  const sequelize = req.app.get('sequelize');
  const unpaidQuery =
    `select J.*
        from Jobs J left join Contracts C on J.ContractId = C.id
            where C.status = 'in_progress' AND J.paid is null
                and (C.ClientId = :profile_id OR C.ContractorId = :profile_id)`;

  const unpaid = await sequelize.query(unpaidQuery, {
    model: Job,
    mapToModel: true,
    type: QueryTypes.SELECT,
    replacements: {profile_id: req.profile.id},
  });

  res.json(unpaid);
};

const payJob = async (req, res) => {
  const {Job, Contract, Profile} = req.app.get('models');
  const {jobId} = req.params;

  const performPayment = sequelize.transaction(
      {isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE},
      async (t) => {
        const job = await Job.findByPk(
            jobId,
            {
              include: {
                model: Contract,
                required: true,
                include: [
                  {model: Profile, required: true, as: 'Contractor'},
                  {model: Profile, required: true, as: 'Client'},
                ],
              },
              transaction: t,
            },
        );

        if (job.paid) {
          throw new ClientError('Job already paid');
        }

        if (job.price > job.Contract.Client.balance) {
          throw new ClientError('Insufficient funds');
        }

        // decrement client balance
        const decrement = job.Contract.Client.decrement(
            'balance',
            {by: job.price, transaction: t},
        );

        // increment contractor balance
        const increment = job.Contract.Contractor.increment(
            'balance',
            {by: job.price, transaction: t},
        );

        // set paid, update updatedAt field, set paymentDate
        job.paid = true;
        job.paymentDate = Date.now();

        return Promise.all([
          job.save({transaction: t}),
          increment,
          decrement,
        ]);
      });

  try {
    const [job] = await performPayment;

    res.send({
      jobId: job.id,
      paid: job.paid,
    });
  } catch (err) {
    if (err instanceof ClientError) {
      return res.status(400).send({error: err.message});
    }

    throw err;
  }
};

module.exports = {unpaidJobs, payJob};
