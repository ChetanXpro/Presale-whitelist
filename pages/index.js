import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
// import Web3 from "web3";
import Web3Modal from "web3modal";
import { Contract, providers } from "ethers";
import { abi, WHITELIST_CONTRACT_ADDRESS } from "../constants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);

  const web3ModalRef = useRef();

  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);

  //!@Get provider andd signer

  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();

      const web3Provider = new providers.Web3Provider(provider);

    


      //!Get signer and return.
      //!when we pass true in function then here signer will be returned.
      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }

      return web3Provider;
    } catch (error) {
      console.log(error);
    }
  };

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistedContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const tx = await whitelistedContract.addAddressToWhitelist();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (error) {
      console.log(error);
    }
  };

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhitelist) {
        return (
          <div className={styles.description}>Thanks for joining Whitelist</div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading...</button>;
      } else {
        return (
          <button className={styles.button} onClick={addAddressToWhitelist}>
            Join The whitelist
          </button>
        );
      }
    } else {
      <button onClick={connectWallet} className={styles.button}>
        Connect your wallet
      </button>;
    }
  };

  //!@ Check currunt connected address is in whitelist or not

  const checkIfAddressIsWhitelisted = async () => {
    try {
      const signer = getProviderOrSigner(true);
      const whitelistedContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistedContract.whitelistedAddress(
        address
      );

      setJoinedWhitelist(_joinedWhitelist);
    } catch (error) {
      console.log(error);
    }
  };

  // const getNumberOfWhitelisted = async () => {
  //   try {
  //     const provider = await getProviderOrSigner();
  //     const whitelistedContract = new Contract(
  //       WHITELIST_CONTRACT_ADDRESS,
  //       abi,
  //       provider
  //     );

  //     const _numOfWhitelisted =
  //       await whitelistedContract.numAddressWhitelisted();

  //     setnumOfWhitelisted(_numOfWhitelisted);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const getNumberOfWhitelisted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      // call the numAddressesWhitelisted from the contract
      const _numberOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  //!@ Functions to connect wallet
  //!@ Check if address is whitelisted
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();

      setWalletConnected(true);
      checkIfAddressIsWhitelisted();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  //@Modal

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby", // optional
        cacheProvider: true, // optional
        providerOptions: {}, // required
      });

      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>NFT Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to CryptoMon!</h1>
          <div className={styles.description}>Most Unique NFT Collections.</div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./roket.png" />
        </div>
      </div>

      <footer className={styles.footer}>Made with 💓 by CryptoMon</footer>
    </div>
  );
}
