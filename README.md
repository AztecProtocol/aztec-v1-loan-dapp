# loan-dapp-starter-kit

This dapp is accompanied by a series of Medium articles to help developers get started with AZTEC.

DEMO: https://youtu.be/LRt1SKB2514

The code base is split into 3 main folders.

1. client (The frontend react code that interfaces with web3 and graph-ql)
2. contracts (The solidity contracts deployed to ganache that interact with AZTEC)
3. graph (The graph-node mappings that index the local blockchain)

<br />

This repo requires the following minimum versions installed in the developer enviroment:

`Truffle v5.0.12 (core: 5.0.12)`
<br />
<br />
`Solidity - 0.5.4 (solc-js)`
<br />
<br />
`Node v11.13.0`
<br />
<br />
`Web3.js v1.0.0-beta.37`
<br />
<br />
`Yarn - 1.15`
<br />
<br />

### Getting started:

1. `git clone git@github.com:AztecProtocol/loan-dapp-starter-kit.git`

2. `cd loan-dapp-starter-kit`

3. `cp .env.test .env`

This copies the local file to a local .env file that ganache will use to deterministically create test accounts to make local development easier.


4. `yarn install`

5. `cd client && yarn install`

6. `cd .. && yarn start`

The start script will do the following:
  - Start ganache, importing any accounts from the .env file
  - Compile and migrate both the dApp contracts and AZTEC and deploy the contracts the the local blockchain
  - Start a docker container that runs the graph-node
  - Build the graph-node mappings and deploy them to the graph-node
  - Copy the truffle build artefacts to the client for interaction with the contracts (ABIs)

7. In a new terminal window `yarn client`

This command will run the create-react-app and host the client at localhost:3000

Navigate to http://localhost:3000 and click the restore account button.

Ganache has been started with 3 deterministic development accounts, each funded with 1000 ETH (Wahoo). You can restore the first account by using the seed phrase `office shallow practice favorite diary review floor quote faith initial foot squeeze`.

Enter any password to encrypt the hot-wallet keystore vault and press restore to enter the dApp!
