// Constructor args for FlashBankRouterV3 on chainId 8453 (Base mainnet).
// Mirrors the values passed by deploy-router-v3.js (defaults: feeBps 2, ownerFeeBps 200,
// maxBorrowBps 5000, maxFlashLoan 1000 WETH, supportsPermit true, admin = ADMIN_ADDRESS).
module.exports = [
  "0xC021a233A427627aE1BB5765e925Ab6E0c4319e7",
  [
    "0x4200000000000000000000000000000000000006"
  ],
  [
    {
      "enabled": true,
      "supportsPermit": true,
      "feeBps": 2,
      "maxFlashLoan": "1000000000000000000000",
      "wrapper": "0x4200000000000000000000000000000000000006",
      "maxBorrowBps": 5000,
      "ownerFeeBps": 200
    }
  ]
];
