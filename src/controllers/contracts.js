const {Op} = require('sequelize');

const getContracts = async (req, res) => {
  const {Contract} = req.app.get('models');
  const contracts = await Contract.findAll({
    where: {
      status: {[Op.ne]: 'terminated'},
      [Op.or]: [{ContractorId: req.profile.id},
        {ClientId: req.profile.id}],
    },
  });

  res.json(contracts);
};

const getContractById = async (req, res) => {
  const {Contract} = req.app.get('models');
  const {contractId} = req.params;
  const contract = await Contract.findOne({
    where: {id: contractId},
  });

  if (!contract) {
    return res.status(404).end();
  }

  if (contract.ClientId !== req.profile.id &&
    contract.ContractorId !== req.profile.id) {
    return res.status(401).end();
  }

  if (contract) {
    return res.json(contract);
  }
};


module.exports = {getContractById, getContracts};
