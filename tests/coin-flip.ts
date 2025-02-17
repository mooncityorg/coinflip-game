import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { CoinFlip } from "../target/types/coin_flip";
const { SystemProgram, LAMPORTS_PER_SOL } = anchor.web3;

import * as assert from "assert";
import { expect } from "chai";
const program = anchor.workspace.CoinFlip;

function programForUser(user) {
  return new anchor.Program(program.idl, program.programId, user.provider);
}

async function play(provider, program, coinFlip, playerOne, playerTwo) {
  const playerChoice = 1;
  const randomSeed = new anchor.BN(Math.floor(Math.random() * 100000));

  const tx = await program.rpc.play(playerChoice, randomSeed, {
    accounts: {
      vendor: playerOne.publicKey,
      player: playerTwo.publicKey,
      coinFlip,
      systemProgram: anchor.web3.SystemProgram.programId,
    },
    signers: playerTwo instanceof (anchor.Wallet as any) ? [] : [playerTwo],
  });

  const gameState = await program.account.coinFlip.fetch(coinFlip);
  console.log("playerTwo: ", playerTwo.publicKey.toString());
  console.log("Winner:", gameState.state.finished.winner.toString());
  console.log({ gameState: gameState.players });
  await provider.connection.confirmTransaction(tx);
}

describe("coin-flip", () => {
  const provider = anchor.Provider.local("http://127.0.0.1:8899");
  anchor.setProvider(provider);

  it("setups the game", async () => {
    const vendor = anchor.web3.Keypair.generate();
    const player = anchor.web3.Keypair.generate();

    let sig = await provider.connection.requestAirdrop(player.publicKey, 1000000000000);
    await provider.connection.confirmTransaction(sig);

    let sig2 = await provider.connection.requestAirdrop(vendor.publicKey, 1000000000000);
    await provider.connection.confirmTransaction(sig2);

    const vendorProgram = programForUser(vendor);

    const [coinFlipPDA, _] = await anchor.web3.PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("coin-flip"), vendor.publicKey.toBuffer(), player.publicKey.toBuffer()],
      program.programId
    );

    const betAmount = new anchor.BN(100000000000);
    const randomSeed = new anchor.BN(Math.floor(Math.random() * 100000));

    await vendorProgram.rpc.setup(player.publicKey, betAmount, randomSeed, {
      accounts: {
        coinFlip: coinFlipPDA,
        vendor: vendor.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [vendor],
    });

    const gameState = await program.account.coinFlip.fetch(coinFlipPDA);
    expect(gameState.players[0].toString()).to.be.equal(vendor.publicKey.toString());
    expect(gameState.players[1].toString()).to.be.equal(player.publicKey.toString());
    expect(gameState.vendorSeed.toString()).to.be.equal(randomSeed.toString());
  });

  it("plays the game", async () => {
    const vendor = anchor.web3.Keypair.generate();
    const player = anchor.web3.Keypair.generate();

    let sig = await provider.connection.requestAirdrop(player.publicKey, 1000000000000);
    await provider.connection.confirmTransaction(sig);
    let sig2 = await provider.connection.requestAirdrop(vendor.publicKey, 1000000000000);
    await provider.connection.confirmTransaction(sig2);

    const vendorProgram = programForUser(vendor);
    const playerProgram = programForUser(player);

    const [coinFlipPDA, _] = await anchor.web3.PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("coin-flip"), vendor.publicKey.toBuffer(), player.publicKey.toBuffer()],
      program.programId
    );

    const betAmount = new anchor.BN(50000000000);
    const randomSeed = new anchor.BN(Math.floor(Math.random() * 100000));

    await vendorProgram.rpc.setup(player.publicKey, betAmount, randomSeed, {
      accounts: {
        coinFlip: coinFlipPDA,
        vendor: vendor.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [vendor],
    });

    await play(provider, playerProgram, coinFlipPDA, vendor, player);

    const gameState = await program.account.coinFlip.fetch(coinFlipPDA);

    expect(gameState.players[0].toString()).to.be.equal(vendor.publicKey.toString());
    expect(gameState.players[1].toString()).to.be.equal(player.publicKey.toString());
    expect(gameState.vendorSeed.toString()).to.be.equal(randomSeed.toString());

    const vendorBalanceAfterFlip = await provider.connection.getAccountInfo(vendor.publicKey);
    console.log("vendorBalanceAfterFlip", vendorBalanceAfterFlip);

    const playerBalanceAfterFlip = await provider.connection.getAccountInfo(player.publicKey);
    console.log("playerBalanceAfterFlip", playerBalanceAfterFlip);
  });
});
