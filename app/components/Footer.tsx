import type { NextPage } from "next";

const Footer: NextPage = () => {
  return (
    <footer className="p-4 bg-white shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800 ">
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2022 SolCoinFlip
        </span>
        <ul className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
          <li>
            <a href="#" className="mr-3 hover:underline md:mr-6 ">
              Open in Github
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
