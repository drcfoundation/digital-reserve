import { Contract } from "web3-eth-contract";
import { AbiItem } from "web3-utils";
import { DigitalReserveInstance } from "../../types/truffle-contracts";
import IUniswapV2Router02 from "../../build/contracts/IUniswapV2Router02.json";
import { StrategyChange } from "../../types/truffle-contracts/DigitalReserve";
import { Network, getContractAddress } from "../../utils/contract-by-network";
import { getUnixTimeAfterMins } from "../../utils/timestamp";
import { getTokensWorthSet2 } from "../test-helpers/get-tokens-worth";

const DigitalReserve = artifacts.require("DigitalReserve");

export const testChangeStrategy = async () => {
  let instance: DigitalReserveInstance;

  let uniRouter: Contract;
  let newtworkType: Network;

  before(async () => {
    instance = await DigitalReserve.deployed();

    uniRouter = new web3.eth.Contract(
      IUniswapV2Router02.abi as AbiItem[],
      getContractAddress("uniswap", newtworkType)
    );
    newtworkType = (await web3.eth.net.getNetworkType()) as Network;
  });

  it("Should change strategy and emit event with old and new settings", async () => {
    const changeStrategyResult = await instance.changeStrategy(
      [
        getContractAddress("wbtc", newtworkType),
        getContractAddress("paxg", newtworkType),
        getContractAddress("weth", newtworkType),
      ],
      [40, 30, 30],
      getUnixTimeAfterMins(10),
    );

    const changeStrategyLog = changeStrategyResult.logs.find(
      (log) => log.event === "StrategyChange"
    ) as StrategyChange | undefined;

    assert.exists(changeStrategyLog);

    if (changeStrategyLog) {
      assert.equal(
        changeStrategyLog.args.oldTokens[2],
        getContractAddress("usdc", newtworkType)
      );
      assert.equal(
        changeStrategyLog.args.newTokens[2],
        getContractAddress("weth", newtworkType)
      );
      assert.equal(changeStrategyLog.args.oldPercentage[1].toNumber(), 40);
      assert.equal(changeStrategyLog.args.newPercentage[1].toNumber(), 30);
      assert.equal(changeStrategyLog.args.oldPercentage[2].toNumber(), 20);
      assert.equal(changeStrategyLog.args.newPercentage[2].toNumber(), 30);
    }
  });

  it("Should have the right settings", async () => {
    const strateyTokenCount = (await instance.strategyTokenCount()).toNumber();
    assert.equal(strateyTokenCount, 3);

    const expectedAddresses = [
      getContractAddress("wbtc", newtworkType),
      getContractAddress("paxg", newtworkType),
      getContractAddress("weth", newtworkType),
    ];
    const expectedPercentages = [40, 30, 30];

    for (let i = 0; i < strateyTokenCount; i++) {
      const strategyToken = await instance.strategyTokens(i);
      assert.equal(strategyToken[0], expectedAddresses[i]);
      assert.equal(strategyToken[1].toNumber(), expectedPercentages[i]);
    }
  });

  it("Should have the right token worth", async () => {
    const { tokenPercentage } = await getTokensWorthSet2(
      instance,
      uniRouter,
      newtworkType
    );

    assert.equal(tokenPercentage[0], 40);
    assert.equal(tokenPercentage[1], 30);
    assert.equal(tokenPercentage[2], 30);
  });
};
