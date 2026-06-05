const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function verifyContract(network, contractAddress, constructorArgs) {
	const configs = {
		ethereum: {
			apiUrl: 'https://api.etherscan.io/v2/api',
			apiKey: process.env.ETHERSCAN_API_KEY,
			explorerUrl: 'https://etherscan.io',
			chainId: '1'
		},
		base: {
			apiUrl: 'https://api.basescan.org/v2/api',
			apiKey: process.env.BASESCAN_API_KEY || process.env.ETHERSCAN_API_KEY,
			explorerUrl: 'https://basescan.org',
			chainId: '8453'
		}
	};

	const config = configs[network];
	if (!config) {
		console.error(`❌ Unknown network: ${network}`);
		process.exit(1);
	}

	if (!config.apiKey) {
		console.error(`❌ API key not found for ${network}`);
		console.error(`   Set ${network === 'ethereum' ? 'ETHERSCAN_API_KEY' : 'BASESCAN_API_KEY'} in .env`);
		process.exit(1);
	}

	console.log(`🔍 Verifying contract on ${network}...`);
	console.log(`📍 Address: ${contractAddress}`);
	console.log(`🌐 Explorer: ${config.explorerUrl}`);

	// Read flattened contract
	const flattenedPath = '/tmp/FlashBankRevolutionary-flat.sol';
	if (!fs.existsSync(flattenedPath)) {
		console.error(`❌ Flattened contract not found at ${flattenedPath}`);
		console.error(`   Run: npx hardhat flatten contracts/FlashBankRevolutionary.sol > ${flattenedPath}`);
		process.exit(1);
	}

	let sourceCode = fs.readFileSync(flattenedPath, 'utf8');
	
	// Remove SPDX comments that might cause issues
	sourceCode = sourceCode.replace(/\/\/ Original license:.*\n/g, '');

	console.log(`📄 Contract code loaded (${sourceCode.length} characters)`);

	// Prepare verification data with standard JSON input for V2 API
	const compilerSettings = {
		optimizer: {
			enabled: true,
			runs: 200
		},
		viaIR: true
	};

	const data = {
		chainid: config.chainId,
		apikey: config.apiKey,
		module: 'contract',
		action: 'verifysourcecode',
		contractaddress: contractAddress,
		sourceCode: sourceCode,
		codeformat: 'solidity-single-file',
		contractname: 'FlashBankRevolutionary',
		compilerversion: 'v0.8.19+commit.7dd6d404',
		optimizationUsed: '1',
		runs: '200',
		constructorArguements: constructorArgs,
		evmversion: 'default',
		licenseType: '3',
		compilerSettings: JSON.stringify(compilerSettings)
	};

	try {
		console.log('\n⏳ Submitting verification request...');
		const response = await axios.post(config.apiUrl, new URLSearchParams(data), {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});

		if (response.data.status === '1') {
			const guid = response.data.result;
			console.log(`✅ Verification submitted successfully!`);
			console.log(`📋 GUID: ${guid}`);
			console.log(`\n⏳ Checking verification status...`);

			// Wait and check status
			await new Promise(resolve => setTimeout(resolve, 5000));
			
			for (let i = 0; i < 12; i++) {
				const statusResponse = await axios.get(config.apiUrl, {
					params: {
						chainid: config.chainId,
						apikey: config.apiKey,
						module: 'contract',
						action: 'checkverifystatus',
						guid: guid
					}
				});

				if (statusResponse.data.status === '1') {
					console.log(`\n🎉 Contract verified successfully!`);
					console.log(`🔗 View at: ${config.explorerUrl}/address/${contractAddress}#code`);
					return true;
				} else if (statusResponse.data.result.includes('Pending')) {
					process.stdout.write('.');
					await new Promise(resolve => setTimeout(resolve, 5000));
				} else {
					console.log(`\n⚠️  Status: ${statusResponse.data.result}`);
					await new Promise(resolve => setTimeout(resolve, 5000));
				}
			}

			console.log(`\n⏰ Verification taking longer than expected.`);
			console.log(`   Check status manually at: ${config.explorerUrl}/address/${contractAddress}#code`);
			return false;

		} else {
			console.error(`\n❌ Verification failed: ${response.data.result}`);
			console.error(`\n💡 This might be because:`);
			console.error(`   1. API V2 is required (use manual verification)`);
			console.error(`   2. Contract already verified`);
			console.error(`   3. API rate limit reached`);
			return false;
		}

	} catch (error) {
		console.error(`\n❌ Error during verification:`, error.message);
		if (error.response) {
			console.error(`   Response:`, error.response.data);
		}
		console.error(`\n💡 Fallback to manual verification:`);
		console.error(`   Run: ./scripts/prepare-verification.sh`);
		return false;
	}
}

// Main
const args = process.argv.slice(2);
if (args.length < 2) {
	console.log('Usage: node scripts/verify-contract.js <network> <address> [constructorArgs]');
	console.log('');
	console.log('Examples:');
	console.log('  node scripts/verify-contract.js ethereum 0xBDcC71d5F73962d017756A04919FBba9d30F0795 0000000000000000000000003cd6bbf16599af7fde6f4b7c8b6fd6bea4edc191');
	console.log('  node scripts/verify-contract.js base 0xBDcC71d5F73962d017756A04919FBba9d30F0795 0000000000000000000000003cd6bbf16599af7fde6f4b7c8b6fd6bea4edc191');
	process.exit(1);
}

const [network, contractAddress, constructorArgs = '0000000000000000000000003cd6bbf16599af7fde6f4b7c8b6fd6bea4edc191'] = args;

verifyContract(network, contractAddress, constructorArgs)
	.then(success => process.exit(success ? 0 : 1))
	.catch(error => {
		console.error('Fatal error:', error);
		process.exit(1);
	});

