module.exports = (storage) => {
  const Sequelize = require('sequelize');

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storage,
  });


  const Contract = require('./Contract')(sequelize, Sequelize);
  const Profile = require('./Profile')(sequelize, Sequelize);
  const Job = require('./Job')(sequelize, Sequelize);

  Profile.hasMany(Contract, {as: 'Contractor', foreignKey: 'ContractorId'});
  Contract.belongsTo(Profile, {as: 'Contractor'});
  Profile.hasMany(Contract, {as: 'Client', foreignKey: 'ClientId'});
  Contract.belongsTo(Profile, {as: 'Client'});
  Contract.hasMany(Job);
  Job.belongsTo(Contract);

  return {
    sequelize,
    Profile,
    Contract,
    Job,
  };
};

