import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseEther, AddressLike } from "ethers";

const BET_PRICE = "1";
const BET_FEE = "0.2";
const TOKEN_RATIO = 1n;
let contractAddress: AddressLike;
let tokenAddress: AddressLike;

const deployLottery: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy the token contract
  const token = await deploy("LotteryToken", {
    from: deployer,
    args: ["LotteryToken", "LT0"],
    log: true,
    autoMine: true,
  });

  tokenAddress = token.address;
  console.log("Token address: ", tokenAddress);

  const contract = await deploy("Lottery", {
    from: deployer,
    args: [tokenAddress, "LT0", TOKEN_RATIO, parseEther(BET_PRICE), parseEther(BET_FEE)],
    log: true,
    autoMine: true,
  });

  contractAddress = contract.address;
  console.log(contractAddress);
};

export default deployLottery;

deployLottery.tags = ["Lottery"];
