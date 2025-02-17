import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { useProgram } from "../hooks/useProgram";
import * as anchor from "@project-serum/anchor";

const Play: NextPage = () => {
  const { program, wallet, connection } = useProgram();
  const [betAmount, setBetAmount] = useState("");
  const [betSide, setBetSide] = useState(0);
  const [statusInfo, setStatusInfo] = useState("Idle");

  const playFlip = async () => {
    if (parseFloat(betAmount) < 0.1 || parseFloat(betAmount) > 5) {
      setStatusInfo("Please enter a bet between 0.1 and 5 SOL.");
      return;
    }
    if (wallet && program && connection) {
      const amount = parseFloat(betAmount) * anchor.web3.LAMPORTS_PER_SOL;

      const data = {
        playerPublicKey: wallet.publicKey.toString(),
        amount,
        side: betSide,
      };

      try {
        setStatusInfo("Generating a random seed");
        const response = await fetch("/api/setup", {
          method: "POST",
          body: JSON.stringify(data),
        });

        const responseJson = await response.json();
        const randomSeed = new anchor.BN(Math.floor(Math.random() * 100000));

        setStatusInfo("Waiting for user confirmation");
        const tx = await program.rpc.play(betSide, randomSeed, {
          accounts: {
            vendor: responseJson.vendor,
            player: wallet.publicKey,
            coinFlip: responseJson.coinFlipPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
        });

        await connection.confirmTransaction(tx);
        setStatusInfo("Waiting for transaction confirmation");

        const coinFlipData = await program.account.coinFlip.fetch(responseJson.coinFlipPDA);

        const winner = coinFlipData.state.finished.winner.toString();
        if (winner === wallet.publicKey.toString()) setStatusInfo(`You won! Amount: ${betAmount} SOL`);
        else setStatusInfo(`You lost :(`);
      } catch (error) {
        console.log(error);
        setStatusInfo("Something went wrong, please try again.");
      }
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto py-4 px-4  sm:px-6 lg:px-8"></div>
      <div className="flex justify-center">
        <div className="p-4 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md sm:p-6 lg:p-16 dark:bg-gray-800 dark:border-gray-700 w-1/2">
          <form className="space-y-6 pb-3" action="#">
            <h5 className="text-xl font-medium text-gray-900 dark:text-white">Flip a coin!</h5>
            <div>
              <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                Bet amount in SOL
              </label>
              <input
                type="number"
                id="amount"
                className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white`}
                placeholder="0.1"
                step="0.1"
                onChange={(e) => setBetAmount(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button
                className={`w-full text-white ${
                  betSide === 0 ? "bg-blue-700" : "bg-black-200"
                } hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
                onClick={() => setBetSide(0)}
              >
                Heads
              </button>
              <button
                className={`w-full text-white ${
                  betSide === 1 ? "bg-blue-700" : "bg-black-200"
                } hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
                onClick={() => setBetSide(1)}
              >
                Tails
              </button>
            </div>
            <button
              onClick={() => playFlip()}
              className={`w-full text-white  ${
                betAmount !== "" ? "bg-blue-700" : "bg-gray-500"
              } focus:ring-4  font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
              disabled={betAmount === ""}
            >
              Play
            </button>
          </form>
          <p className="block text-sm font-medium text-gray-900 dark:text-gray-300 mt-3">Status: {statusInfo}</p>
        </div>
      </div>
    </>
  );
};

export default Play;
