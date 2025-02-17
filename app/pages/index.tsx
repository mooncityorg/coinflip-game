import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Play from "../components/Play";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className="flex flex-col h-screen justify-between">
      <Header />
      <Play />
      <Footer />
    </div>
  );
};

export default Home;
