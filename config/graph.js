export default {
  name: 'loan-dapp-graph',
  githubUser: 'joeandrews',
  outputDir: 'graph',
  manifest: 'subgraph.yaml',
  networks: {
    development: {
      node: 'http://127.0.0.1:8020',
      ipfs: 'http://localhost:5001',
    },
    production: {
      node: 'https://api.thegraph.com/deploy/',
      ipfs: 'https://api.thegraph.com/ipfs/',
    },
  },
  databases: {
    development: {
      name: 'graph-node',
      host: 'localhost',
      port: 5432,
      user: 'graph-node',
      password: '',
    },
    production: {
      name: '',
    },
  },
};
