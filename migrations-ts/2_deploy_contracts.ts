const DigitalReserve = artifacts.require("DigitalReserve");

type Network = "development" | "ropsten" | "main";

module.exports = async (
  deployer: Truffle.Deployer,
  network: Network
  // accounts: string[]
) => {
  console.log(network);

  const drcAddress =
    network === "ropsten"
      ? "0x6D38D09eb9705A5Fb1b8922eA80ea89d438159C7"
      : "0xa150Db9b1Fa65b44799d4dD949D922c0a33Ee606";

  await deployer.deploy(
    DigitalReserve,
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    drcAddress,
    "Digital Reserve",
    "DR-POD-S3"
  );

  const digitalReserve = await DigitalReserve.deployed();
  console.log(
    `DigitalReserve deployed at ${digitalReserve.address} in network: ${network}.`
  );
};

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {};
