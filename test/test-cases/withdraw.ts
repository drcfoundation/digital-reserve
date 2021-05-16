import { Contract } from "web3-eth-contract";
import IERC20 from "../../build/contracts/IERC20.json";
import {
  DigitalReserveInstance,
  DigitalReserveWithdrawalInstance,
} from "../../types/truffle-contracts";
import { getUnixTimeAfterMins } from "../../utils/timestamp";
import { getContractAddress, Network } from "../../utils/contract-by-network";
import { Withdraw } from "../../types/truffle-contracts/DigitalReserve";

const DigitalReserve = artifacts.require("DigitalReserve");
const DigitalReserveWithdrawal = artifacts.require("DigitalReserveWithdrawal");

export const testWithdraw = async (accounts: Truffle.Accounts) => {
  let instance: DigitalReserveInstance;
  let withdrawalInstance: DigitalReserveWithdrawalInstance;

  let drcContract: Contract;
  let newtworkType: Network;
  let prevDrcUserCanWithdraw: number;
  let prevUserPod: number;

  before(async () => {
    instance = await DigitalReserve.deployed();
    withdrawalInstance = await DigitalReserveWithdrawal.deployed();

    newtworkType = (await web3.eth.net.getNetworkType()) as Network;

    drcContract = new web3.eth.Contract(
      IERC20.abi as AbiItem[],
      getContractAddress("drc", newtworkType)
    );

    const valueInDrc = await instance.getUserVaultInDrc(accounts[0], 100);
    prevDrcUserCanWithdraw = valueInDrc[1].toNumber();
    const userPod = await instance.balanceOf(accounts[0]);
    prevUserPod = Number(web3.utils.fromWei(userPod));
  });

  it("Should be able to withdraw 1000 DRC and burn DR-POD", async () => {
    const withdrawResult = await instance.withdrawDrc(
      1000,
      getUnixTimeAfterMins(10)
    );

    const withdrawLog = withdrawResult.logs.find(
      (log) => log.event === "Withdraw"
    ) as Withdraw | undefined;

    assert.exists(withdrawLog);

    if (withdrawLog) {
      assert.isAtLeast(withdrawLog.args.amount.toNumber(), 1000);
      assert.isAbove(Number(web3.utils.fromWei(withdrawLog.args.podBurned)), 0);
      assert.equal(
        Number(web3.utils.fromWei(withdrawLog.args.podTotalSupply)).toFixed(2),
        (
          prevUserPod - Number(web3.utils.fromWei(withdrawLog.args.podBurned))
        ).toFixed(2)
      );
      assert.equal(withdrawLog.args.user, accounts[0]);

      const valueInDrc = await instance.getUserVaultInDrc(accounts[0], 100);
      const currentDrcUserCanWithdraw = valueInDrc[1].toNumber();

      assert.equal(
        Math.round(
          (currentDrcUserCanWithdraw /
            (prevDrcUserCanWithdraw - withdrawLog.args.amount.toNumber())) *
            100
        ),
        100
      ); // The withdrawal has positive price impact, which made the price go up, then less DRC can be withdrawn
    }
  });

  it("Should be able to withdraw 100% DRC and burn DR-POD", async () => {
    const userPod = await instance.balanceOf(accounts[0]);
    await instance.approve(withdrawalInstance.address, userPod);

    const drcBalance = await drcContract.methods.balanceOf(accounts[0]).call();

    const valueInDrc = await instance.getUserVaultInDrc(accounts[0], 100);
    const currentDrcUserCanWithdraw = valueInDrc[1].toNumber();

    const withdrawResult = await withdrawalInstance.withdraw(
      instance.address,
      100,
      valueInDrc[1],
      getUnixTimeAfterMins(10)
    );

    console.log("Withdraw gas used", withdrawResult.receipt.gasUsed);

    const drcBalanceAfter = await drcContract.methods
      .balanceOf(accounts[0])
      .call();

    assert.equal(
      Number(drcBalanceAfter) - Number(drcBalance),
      currentDrcUserCanWithdraw
    );
  });

  it("Should have 0 left over supply", async () => {
    const totalSupply = (await instance.totalSupply()).toNumber();
    assert.equal(totalSupply, 0);
  });

  it("Should have proof of deposit price as 0", async () => {
    const drPodPrice = (await instance.getProofOfDepositPrice()).toNumber();
    assert.equal(drPodPrice, 0);
  });
};
