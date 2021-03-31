type ContractName =
  | "uniswap"
  | "drc"
  | "weth"
  | "wbtc"
  | "paxg"
  | "usdc"
  | "farm"
  | "mph";
type NetworkType = "test" | "main";
export type Network = "development" | "ropsten" | "main";

type ContractAddresses = Record<ContractName, Record<NetworkType, string>>;

const contractAddresses: ContractAddresses = {
  uniswap: {
    test: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    main: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  },
  drc: {
    test: "0x6D38D09eb9705A5Fb1b8922eA80ea89d438159C7",
    main: "0xa150Db9b1Fa65b44799d4dD949D922c0a33Ee606",
  },
  weth: {
    test: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    main: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  wbtc: {
    test: "0x0B6D10102bbB04a0CA2Dc49d1b38bD9A788832FD",
    main: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  },
  paxg: {
    test: "0x478640c8D01CAc92Ffcd4a15EaC1408Be52BA47A",
    main: "0x45804880De22913dAFE09f4980848ECE6EcbAf78",
  },
  usdc: {
    test: "0x87c00648150d89651FB6C5C5993338DCfcA3Ff7B",
    main: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  farm: {
    test: "0xDaddaAF81FA6f58610aaE83afA1F30929cDB4B22",
    main: "0xa0246c9032bC3A600820415aE600c6388619A14D",
  },
  mph: {
    test: "0x3007164919cC8A1Ce090DD7AEA5A57051d4478C1",
    main: "0x8888801af4d980682e47f1a9036e589479e835c5",
  },
};

export const getContractAddress = (
  name: ContractName,
  network: Network
): string => {
  const networkType: NetworkType = network !== "ropsten" ? "main" : "test"; // TODO: switch back to mainnet to be safe
  return contractAddresses[name][networkType];
};
