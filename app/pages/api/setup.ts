// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import * as anchor from "@project-serum/anchor";
import * as idl from "../../coin_flip.json";
import { Connection, PublicKey } from "@solana/web3.js";

const programId = "2WWFGRA4f81ubcjtkh112obV8brzF6nkhBCDGh7Z8hqo";
import { clusterApiUrl } from "@solana/web3.js";

type Data = {
  coinFlipPDA: string;
  vendor: string;
};

const preflightCommitment = "processed";
const commitment = "processed";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  let { playerPublicKey, amount } = JSON.parse(req.body);

  playerPublicKey = new PublicKey(playerPublicKey);
  amount = new anchor.BN(amount);

  const { VENDOR_SECRET_KEY } = process.env;
  if (!VENDOR_SECRET_KEY) return;

  const secretKeyArray = Uint8Array.from(JSON.parse(VENDOR_SECRET_KEY));
  console.log(secretKeyArray);

  const vendor = anchor.web3.Keypair.fromSecretKey(secretKeyArray);
  const vendorWallet = new anchor.Wallet(vendor);

  const connection = new Connection(
    "https://explorer-api.devnet.solana.com/",
    commitment
  );
  const provider = new anchor.Provider(connection, vendorWallet, {
    preflightCommitment,
    commitment,
  });

  let sig = await provider.connection.requestAirdrop(
    playerPublicKey,
    1000000000000
  );
  await provider.connection.confirmTransaction(sig);
  let sig2 = await provider.connection.requestAirdrop(
    vendor.publicKey,
    1000000000000
  );

  await provider.connection.confirmTransaction(sig2);

  // Start

  const program = new anchor.Program(idl as any, programId, provider);

  const randomSeed = new anchor.BN(Math.floor(Math.random() * 100000));

  const [coinFlipPDA, _] = await anchor.web3.PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode("coin-flip"),
      vendor.publicKey.toBuffer(),
      playerPublicKey.toBuffer(),
    ],
    program.programId
  );

  try {
    // delete if account exists
    await program.account.coinFlip.fetch(coinFlipPDA); // should error out if account does not exists
    const deleteTx = await program.rpc.delete(playerPublicKey, {
      accounts: {
        coinFlip: coinFlipPDA,
        vendor: vendor.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [vendor],
    });

    await provider.connection.confirmTransaction(deleteTx);
  } catch (error) {
    console.log("acoount does not exists, continue");
  }

  const setupTx = await program.rpc.setup(playerPublicKey, amount, randomSeed, {
    accounts: {
      coinFlip: coinFlipPDA,
      vendor: vendor.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    },
    signers: [vendor],
  });
  await provider.connection.confirmTransaction(setupTx);

  res.status(200).json({
    coinFlipPDA: coinFlipPDA.toString(),
    vendor: vendor.publicKey.toString(),
  });
}
