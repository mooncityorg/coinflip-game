import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import styles from "../styles/Home.module.css";

const Header: NextPage = () => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <div>
      <nav className="bg-white border-gray-200 px-2 sm:px-4 py-3 dark:bg-gray-800">
        <div className="container flex flex-wrap justify-between items-center mx-auto">
          <a href="#" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              SolCoinFlip
            </span>
          </a>
          <div className="flex md:order-2">
            <button
              type="button"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 rounded-lg mr-3 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <WalletMultiButton />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
