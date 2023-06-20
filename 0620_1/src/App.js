import React from "react";
import { useEffect, useState } from "react";
import Web3 from "web3";
import { ethers } from "ethers";

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [balance, setBalance] = useState();
  const [account, setAccount] = useState();
  const [chainId, setChainId] = useState();
  const [tbalance, setTbalance] = useState();

  const web3 = new Web3(
    "https://goerli.infura.io/v3/fde392db998e4cf7ac4c02779be256af"
  );
  const web3_2 = new Web3(
    "https://goerli.infura.io/v3/fde392db998e4cf7ac4c02779be256af"
  );

  var c_addr = "0xf7389e84220FF1165842e38C8e92772846e61A9d";
  var contract = new web3.eth.Contract(abi, c_addr);

  async function connect() {
    if (window.ethereum) {
      try {
        const res = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(res[0]);

        getBalance();
      } catch (err) {
        console.error(err);
      }
    } else {
      console.log("Install metamask");
    }
  }

  useEffect(() => {
    async function getBlock() {
      const blockNumber = await web3.eth.getBlockNumber();
      setBlockNumber(Number(blockNumber));
    }

    getBlock();
  });

  async function getBalance() {
    const res = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (account) {
      const _balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [res[0].toString(), "latest"],
      });

      setBalance(ethers.formatEther(_balance));
    } else {
      console.log("wallet is not connected");
    }
  }
  /*async function getBalance() {
    if(account) {
      const _balance = await web3.eth.getBalance(account);
      setBalance(ethers.formatEther(_balance));
    } else {
      console.log("wallet is not connected");
    }
  }*/

  useEffect(() => {
    getBalance();

    async function subscribeBlock() {
      const subscription = await web3.eth.subscribe("newHeads");
      subscription.on("data", async (blockHead) => {
        setBlockNumber(Number(blockHead.number));
      });
    }

    subscribeBlock();
  });

  async function getChainId() {
    if (window.ethereum) {
      const ID = await window.ethereum.request({
        method: "eth_chainId",
      });
      setChainId(ID);
    }
  }

  getChainId();

  async function chainChanged() {
    if (window.ethereum) {
      setAccount(null);
      setBalance(null);
      connect();
      getChainId();
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", chainChanged);
    }
  });

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged");
    }
  });

  return (
    <div className="App">
      <div
        onClick={() => {
          connect();
        }}
      >
        CONNECT WALLET
      </div>
      <li>current Block number : {blockNumber}</li>
      <li>current Address : {account}</li>
      <li>currnet balance : {balance} eth</li>
      <li>current chainId : {chainId} </li>
    </div>
  );
}

export default App;
