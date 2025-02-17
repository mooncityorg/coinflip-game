import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

import idl from "../coin_flip.json";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

const programID = new PublicKey(idl.metadata.address);
const preflightCommitment = "processed";
const commitment = "processed";

export const useProgram = () => {
  const [program, setProgram] = useState<anchor.Program<anchor.Idl>>();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  useEffect(() => {
    updateProgram();
  }, [connection, wallet]);

  const updateProgram = () => {
    if (wallet) {
      const provider = new anchor.Provider(connection, wallet, {
        preflightCommitment,
        commitment,
      });

      const program = new anchor.Program(idl as any, programID, provider);

      setProgram(program);
    } else {
      setProgram(undefined);
    }
  };

  return {
    program,
    wallet,
    connection,
  };
};
