const fetch = require('cross-fetch')
const base = require('airtable').base(process.env.AIRTABLE_BASEID)
var Airtable = require('airtable')
const Logger = require('../utils/logger')
const splitArr = (arr, chunk) => {
  const arrSplit = []
  for (let i = 0; i < arr.length; i += chunk) {
    arrSplit.push(arr.slice(i, i + chunk))
  }
  return arrSplit
}

const getRoundsSelectQueryByBase = async (selectQuery, AirtableBaseId) => {
  const newBase = require('airtable').base(AirtableBaseId)
  try {
    return await newBase('Funding Rounds')
      .select({
        view: 'Rounds',
        filterByFormula: selectQuery
      })
      .firstPage()
  } catch (err) {
    Logger.error(err)
  }
}

const getRoundsSelectQuery = async (selectQuery) => {
  try {
    return await base('Funding Rounds')
      .select({
        view: 'Rounds',
        filterByFormula: selectQuery
      })
      .firstPage()
  } catch (err) {
    Logger.error(err)
  }
}

const getTableFields = async (tableName, airtableBaseId, view) => {
  const newBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    airtableBaseId
  )
  const selectQuery = view ? { view: view } : undefined
  return await newBase(tableName).select(selectQuery).firstPage()
}

// TODO - Query+Paginate
const getProposalsSelectQuery = async (selectQuery, sortQuery = []) => {
  try {
    return await base('Proposals')
      .select({
        view: 'All Proposals',
        filterByFormula: selectQuery,
        sort: sortQuery
      })
      .firstPage()
  } catch (err) {
    Logger.error(err)
  }
}

const getProposalsSelectQueryFromBaseId = async (selectQuery, baseId) => {
  const base = require('airtable').base(baseId)
  try {
    return await base('Proposals')
      .select({
        view: 'All Proposals',
        filterByFormula: selectQuery
      })
      .firstPage()
  } catch (err) {
    Logger.error(err)
  }
}

const getProposals = async () => {
  try {
    return await base('Proposals')
      .select({
        view: 'All Proposals'
      })
      .firstPage()
  } catch (err) {
    Logger.error(err)
  }
}

const sumSnapshotVotesToAirtable = async (proposals, scores) => {
  const records = []
  proposals.map((p) => {
    const batchIndex = p.get('Snapshot Batch Index')
    const batchNoIndex = p.get('Snapshot Batch Index No')
    const ipfsHash = p.get('ipfsHash')

    const yesIndex = batchIndex === undefined ? 1 : batchIndex
    const noIndex = batchNoIndex === undefined ? 2 : batchNoIndex

    const yesVotes =
      scores[ipfsHash][yesIndex] === undefined ? 0 : scores[ipfsHash][yesIndex]
    const noVotes =
      scores[ipfsHash][noIndex] === undefined ? 0 : scores[ipfsHash][noIndex]

    records.push({
      id: p.id,
      fields: {
        'Voted Yes': yesVotes,
        'Voted No': noVotes
      }
    })
  })
  return records
}

const updateProposalRecords = async (records) => {
  const splitRecords = splitArr(records, 10)
  await Promise.all(
    splitRecords.map((batch) => {
      fetch(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASEID}/Proposals`,
        {
          method: 'patch', // make sure it is a "PATCH request"
          view: 'All Proposals',
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, // API key
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ records: batch })
        }
      )
        .then((res) => {
          Logger.log('Response from Airtable: ', res.status)
        })
        .catch((err) => {
          Logger.error(err)
        })
    })
  )
}

const updateRoundRecord = async (record) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASEID}/Funding Rounds`,
      {
        method: 'patch', // make sure it is a "PATCH request"
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, // API key
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
      }
    )
      .then((res) => {
        Logger.log('Response from Airtable: ', res.status)
        return res.json()
      })
      .then((res) => {
        if (res.error) {
          Logger.error(res.error)
          reject(res.error)
        }
        Logger.log(res)
        resolve(res)
      })
      .catch((err) => {
        Logger.error(err)
        reject(err)
      })
  })
}

const deleteProposalRecords = async (records, tableName) => {
  const splitRecords = splitArr(records, 8)
  const newBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASEID
  )
  await splitRecords.map(async (batch) => {
    const recordsIdList = await transformBatchForDelete(batch)
    await newBase(tableName).destroy(
      recordsIdList,
      function (err, deletedRecords) {
        if (err) {
          Logger.error(err)
          return
        }
        Logger.log('Deleted', deletedRecords.length, 'records')
      }
    )
  })
}

const transformBatchForDelete = async (batch) => {
  const data = []
  await batch.forEach((record) => {
    data.push(record.id)
  })
  return data
}

const addRecordsToAirtable = async (records, tableName) => {
  await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASEID}/${tableName}`,
    {
      method: 'POST',
      view: 'All Proposals',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`, // API key
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ records: records })
    }
  )
    .then((res) => {
      Logger.log('Response from Airtable: ', res.status)
    })
    .catch((err) => {
      Logger.error(err)
    })
}

module.exports = {
  getRoundsSelectQuery,
  getProposalsSelectQuery,
  updateProposalRecords,
  updateRoundRecord,
  deleteProposalRecords,
  sumSnapshotVotesToAirtable,
  getProposals,
  addRecordsToAirtable,
  getTableFields,
  getProposalsSelectQueryFromBaseId,
  getRoundsSelectQueryByBase
}
