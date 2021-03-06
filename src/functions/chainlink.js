const { web3 } = require('./web3')
const aggregatorV3InterfaceABI = require('./../utils/aggregatorV3InterfaceABI.json')
const OceanUsdDataFeedContractAddress =
  '0x7ece4e4E206eD913D991a074A19C192142726797'
const Logger = require('../utils/logger')
const { getTokenPrice: coingeckoGetTokenPrice } = require('./coingecko')

const getTokenPrice = async () => {
  try {
    const priceFeed = new web3.eth.Contract(
      aggregatorV3InterfaceABI.abi,
      OceanUsdDataFeedContractAddress
    )
    const roundData = await priceFeed.methods.latestRoundData().call()
    const price = parseInt(roundData.answer) / 10 ** 8

    return price
  } catch (error) {
    Logger.error(error)
    return await coingeckoGetTokenPrice()
  }
}

module.exports = { getTokenPrice }
