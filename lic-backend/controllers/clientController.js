const Client = require('../models/Client');

exports.getClients = async (req, res) => {
  const clients = await Client.find({ agentId: req.user.id });
  res.json(clients);
};

exports.addClient = async (req, res) => {
  const { name, age, policyType, premiumAmount, maturityDate } = req.body;
  const documents = req.files ? req.files.map(f => f.path) : [];

  const client = await Client.create({
    agentId: req.user.id,
    name, age, policyType, premiumAmount, maturityDate, documents
  });
  res.status(201).json(client);
};
