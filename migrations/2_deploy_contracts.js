var DigitalReserve = artifacts.require("DigitalReserve");

module.exports = function (deployer) {
  deployer.deploy(
    DigitalReserve,
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "0x9493193586338679486747baADc5231621fa9ad0",
    "Pet Contract",
    "PET"
  );
};
