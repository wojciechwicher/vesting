var WWToken = artifacts.require("WWToken");
var VestContract = artifacts.require("VestContract");

module.exports = async function (deployer) {
  await deployer.deploy(WWToken);

  const instance = await WWToken.deployed();

  await deployer.deploy(VestContract, instance.address);
};
