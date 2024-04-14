"use client";

import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount, useNetwork, usePublicClient } from "wagmi";
// import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { InputBase } from "~~/components/scaffold-eth";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

// const BET_PRICE = "1";
// const BET_FEE = "0.2";
const TOKEN_RATIO = 1n;

const Home: NextPage = () => {
  // const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <PageBody />
      </div>
    </>
  );
};

export default Home;

function PageBody() {
  return (
    <>
      <div className="flex flex-col items-center space-y-2">
        <h2 className="text-xl font-bold">Page Body</h2>
        <p className="text-lg">This is the body of the page.</p>
      </div>
      <DisplayNetwork />
      <CheckStatus />
      <OpenBets />
      <BuyTokens />
    </>
  );
}

function DisplayNetwork() {
  const { chain } = useNetwork();
  return (
    <div className="flex flex-col items-center space-y-2">
      <h2 className="text-xl font-bold">Network</h2>
      <p className="text-lg">Connected to: {chain?.name}</p>
    </div>
  );
}

function CheckStatus() {
  const { data: lotteryState, isLoading } = useScaffoldContractRead({
    contractName: "Lottery",
    functionName: "betsOpen",
    watch: true,
  });

  return (
    <div className="flex flex-col items-center space-y-2">
      <h2 className="text-xl font-bold">Check Status</h2>
      {isLoading ? (
        <span className="loading loading-spinner"></span>
      ) : (
        <p className="text-lg">The lottery is {lotteryState ? "open" : "closed"}</p>
      )}
    </div>
  );
}
// TODO: Add the BuyTokens function
// TODO: Add view and place bets functionality
// TODO Add view and claim winnings functionality

function BuyTokens() {
  const [amount, setAmount] = useState<string>("");
  const account = useAccount();
  const { data: tokenBalance } = useScaffoldContractRead({
    contractName: "LotteryToken",
    functionName: "balanceOf",
    args: [account?.address],
    watch: true,
  });

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "Lottery",
    functionName: "purchaseTokens",
    value: parseEther(amount) / TOKEN_RATIO,
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction Blockhash", txnReceipt.blockHash);
    },
  });

  return (
    <div className="flex flex-col items-center space-y-2">
      <h2 className="text-xl font-bold">Buy Token</h2>
      <InputBase name="amount" placeholder="amount" value={amount} onChange={setAmount} />
      <button className="btn btn-primary" onClick={() => writeAsync()} disabled={isLoading}>
        {isLoading ? "Buying Token..." : "Buy Token"}
      </button>
      <p className="text-lg">Your token balance: {tokenBalance ? tokenBalance.toString() : "0"}</p>
    </div>
  );
}

function OpenBets() {
  const [duration, setDuration] = useState<string>("");
  const [closeTime, setCloseTime] = useState<bigint | undefined>(undefined);
  const client = usePublicClient();

  useEffect(() => {
    client
      .getBlock()
      .then(block => {
        setCloseTime(block.timestamp + BigInt(duration));
      })
      .catch(console.error);
  }, [duration]);

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "Lottery",
    functionName: "openBets",
    args: [closeTime],
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction Blockhash", txnReceipt.blockHash);
    },
  });

  return (
    <div className="flex flex-col items-center space-y-2">
      <h2 className="text-xl font-bold">Open Bets</h2>
      <InputBase name="duration" placeholder="duration in sec." value={duration} onChange={setDuration} />
      <button className="btn btn-primary" onClick={() => writeAsync()} disabled={isLoading}>
        {isLoading ? "Opening Bets..." : "Send"}
        Open Bets
      </button>
    </div>
  );
}
