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

  var c_addr = "0xf7389e84220FF1165842e38C8e92772846e61A9d"; // 1. 공짜 민팅
  var c_addr_2 = "0x127c6Abf99a85f8852352Bf269ad1073b6F21417"; // 2. 유료 민팅
  var contract = new web3_2.eth.Contract(abi, c_addr); // 1번
  var contract2 = new web3_2.eth.Contract(abi2, c_addr_2); // 2번

  async function connect() {
    if (window.ethereum) {
      try {
        const res = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(res[0]);

        getBalance();
        getTbalance();
      } catch (err) {
        console.error(err);
      }
    } else {
      console.log("Install metamask");
    }
  }

  async function getTbalance() {
    if (account) {
      try {
        var a = await contract2 /*필요에 따라 1번, 2번 바꾸기*/.methods
          .balanceOf(account)
          .call();
        setTbalance(a);
      } catch (err) {
        console.error(err);
      }
    } else {
      console.log("connect the wallet");
    }
  }
  // getTbalance()

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
    async function subscribeBlock() {
      const subscription = await web3.eth.subscribe("newHeads");
      subscription.on("data", async (blockHead) => {
        setBlockNumber(Number(blockHead.number));
      });
    }

    subscribeBlock();

    getTbalance();
    getBalance();
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
      window.ethereum.on("accountsChanged", connect);
    }
  });

  async function sendTx(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    console.log(typeof data.get("amount"));
    /*var a = Number(data.get("amount"));
    a = web3.utils.numberToHex(a);*/
    var a = web3.utils.numberToHex(Number(data.get("amount")));
    console.log(a, typeof a);

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [{ from: account, to: data.get("address"), value: a }],
    });
  }

  /*async function sendTx(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    const params = {
      from : account,
      to : data.get("address"),
      value : data.get("amount")
    }
    await web3.eth.sendTransaction(params);
  }*/

  async function sendERC(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    var a = web3.utils.numberToHex(Number(data.get("amount_2")));

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: account,
          to: c_addr_2 /*contract address 바꾸기*/,
          data: contract2.methods
            .transfer(data.get("address_2"), a)
            .encodeABI(),
        },
      ],
    });
  }

  async function minting(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    var a = web3.utils.numberToHex(Number(data.get("amount_3")));
    var b = web3.utils.numberToHex(Number(data.get("amount_3")) * 10000);

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: account,
          to: c_addr_2 /*contract address 바꾸기*/,
          value: b,
          data: contract2 /*contract 1,2번 바꾸기*/.methods
            .MintToken(a)
            .encodeABI(),
        },
      ],
    });
  }

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
      <li>current token balance : {tbalance} </li>
      <li>current chainId : {chainId} </li>
      <form onSubmit={sendTx}>
        <input type="text" name="address" placeholder="write address"></input>
        <input type="text" name="amount" placeholder="write amount"></input>
        <button type="submit">Send TX</button>
      </form>
      <form onSubmit={sendERC}>
        <input type="text" name="address_2" placeholder="write address"></input>
        <input type="text" name="amount_2" placeholder="write amount"></input>
        <button type="submit">Send ERC</button>
      </form>
      <form onSubmit={minting}>
        <input type="text" name="amount_3" placeholder="write amount"></input>
        <button type="submit">Mint</button>
      </form>
    </div>
  );
}

export default App;
