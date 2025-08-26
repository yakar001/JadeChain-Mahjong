export const CONTRACT_ADDRESSES = {
    TOKEN: "0x45A093580580654c6685D532FC1C1314879A3257",       // $JIN代币地址
    NFT: "0x1d7Dc04b98c9343AB181059D2e99e84A90Af6a42",         // 密钥NFT合约地址
    STAKING: "0x4CA02d7F26f6759157Bd933dd9DeDD0D5FC62faf",     // 质押池合约地址
    GAME_MANAGER: "0xF41482846FD052E4484784f940F685Cc3A97409c" // 游戏房间管理器地址
  }

  export const CONTRACT_ABI_PATHS = {
    TOKEN: "../contracts/artifacts/QuanJinToken.sol/QuanJinToken.json",
    NFT: "../contracts/artifacts/QuanJinKeyNFT.sol/QuanJinKeyNFT.json",
    STAKING: "../contracts/artifacts/StakingPool.sol/StakingPool.json",
    GAME_MANAGER: "../contracts/artifacts/GameRoomManager.sol/GameRoomManager.json"
  }