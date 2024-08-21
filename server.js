const express = require("express");
const { Web3 } = require("web3");
require("dotenv").config();

const app = express();
const port = 3000;

// Connect to Ethereum node using Infura
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC));

const weETH = "0x5B74DD13D4136443A7831fB7AD139BA123B5071B";

const weETHAbi = [
  {
    constant: true,
    inputs: [{ name: "", type: "uint256" }],
    name: "id2asset",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

// Contract details
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractAbi = [
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [{ name: "tokenId", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

// Create a contract instance
const contract = new web3.eth.Contract(contractAbi, contractAddress);

const weETHcontract = new web3.eth.Contract(weETHAbi, weETH);

app.get("/api/:address", async (req, res) => {
  const address = req.params.address;

  try {
    // Validate the Ethereum address
    if (!web3.utils.isAddress(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address" });
    }

    const balance = await contract.methods.balanceOf(address).call();
    const tokenIds = [];

    let totalAssetValue = 0;

    for (let i = 0; i < balance; i++) {
      const tokenId = await contract.methods
        .tokenOfOwnerByIndex(address, i)
        .call();
      tokenIds.push(tokenId);

      // Call the id2asset function for each tokenId and sum the results
      const assetValue = await weETHcontract.methods.id2asset(tokenId).call();
      totalAssetValue += parseFloat(assetValue);
    }

    res.json({
      is_valid_endpoint: true,
      total_balance: totalAssetValue,
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching data" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
