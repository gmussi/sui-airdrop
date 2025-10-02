# SUI Airdrop Tool

A Next.js application for distributing tokens to multiple addresses on the SUI network.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/gmussi/sui-airdrop.svg)](https://github.com/gmussi/sui-airdrop/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/gmussi/sui-airdrop.svg)](https://github.com/gmussi/sui-airdrop/issues)

## 🚀 CHECK LIVE DEMO

**[👉 Try the Live Demo](https://gmussi.github.io/sui-airdrop/)** - Experience the SUI Airdrop Tool in action!

---

## Features

- **Wallet Connection**: Connect your SUI wallet using the latest wallet adapters
- **Token Selection**: Choose from tokens in your wallet to distribute
- **CSV Upload**: Upload a CSV file with recipient addresses and amounts
- **Batch Execution**: Execute airdrops in batches with transaction tracking
- **Real-time Feedback**: See progress and results as transactions are processed

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A SUI wallet (Sui Wallet, Suiet, etc.)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/gmussi/sui-airdrop.git
cd sui-airdrop
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Step 1: Connect Your Wallet

- Click "Connect Wallet" to connect your SUI wallet
- Make sure you're connected to the testnet (default) or mainnet

### Step 2: Select Token

- Choose a token from your wallet to distribute
- The app will show your token balances and metadata

### Step 3: Upload CSV

- Create a CSV file with recipient addresses and amounts
- Required columns: `address` and `amount`
- Addresses must be valid SUI addresses (0x...)
- Amounts must be positive numbers

### Step 4: Execute Airdrop

- Review the airdrop summary
- Click "Execute Airdrop" to start the distribution
- Monitor progress and results in real-time

## CSV Format

Your CSV file should have the following format:

```csv
address,amount
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef,100
0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890,50
```

### Column Requirements:

- **address**: Valid SUI wallet address (starts with 0x, 66 characters)
- **amount**: Positive number representing the token amount to send

## Important Notes

⚠️ **Use at your own risk**: This tool handles real transactions and tokens.

⚠️ **Gas Fees**: Make sure you have sufficient SUI tokens for gas fees.

⚠️ **Test First**: Always test with small amounts on testnet before using mainnet.

⚠️ **Token Balance**: Ensure you have enough tokens to cover all distributions.

## Network Configuration

The app is configured to use:

- **Testnet** For testing and development (change in WalletProvider.tsx)
- **Mainnet**: (default) For production use

## Technical Details

- Built with Next.js 15 and TypeScript
- Uses @mysten/sui and @mysten/dapp-kit for SUI integration
- Implements batch processing to handle large recipient lists
- Includes comprehensive error handling and validation
- Responsive design with Tailwind CSS

## Troubleshooting

### Common Issues:

1. **Wallet Connection Failed**: Make sure you have a SUI wallet installed
2. **Insufficient Balance**: Check you have enough tokens and SUI for gas
3. **CSV Parsing Errors**: Verify your CSV format matches the requirements
4. **Transaction Failures**: Check network status and try smaller batches

### Support:

For issues or questions, please check the SUI documentation or create an issue in this repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Roadmap

- [ ] Add support for custom gas settings

## License

MIT License - see LICENSE file for details.
