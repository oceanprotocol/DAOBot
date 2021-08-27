global['fetch'] = require('cross-fetch');
const dotenv = require('dotenv');
dotenv.config();

const {getProposalsSelectQuery, updateProposalRecords, sumSnapshotVotesToAirtable} = require('./airtable_utils')
const {getVoteCountStrategy, getProposalVotes} = require('../snapshot/snapshot_utils');

// DRY/PARAMETERIZE
const roundNumber = 8
const snapshot = require('@snapshot-labs/snapshot.js')
const space = 'officialoceandao.eth';
const provider = snapshot.utils.getProvider(1);

// Let's track the state of various proposals
var allProposals = []
var proposalVotes = {}
var proposalScores = {}
var proposalVoteSummary = {}

// DRY
const getVoterScores = async (provider, strategy, voters, blockHeight) => {
    return snapshot.utils.getScores(
        space,
        strategy,
        1,
        provider,
        voters,
        blockHeight
    ).then(scores => {
        return scores
    });
}

const getAllProposalVotes = async () => {
    for (i=1; i<roundNumber; i++) {
        let strategy = getVoteCountStrategy(i)
        let roundProposals = await getProposalsSelectQuery(`AND({Round} = "${i}", NOT({Proposal State} = "Rejected"), "true")`)
        allProposals = allProposals.concat(roundProposals)

        await Promise.all(roundProposals.map(async (proposal) => {
            try {
                const ipfsHash = proposal.get('ipfsHash')

                await getProposalVotes(ipfsHash)
                    .then((result) => {
                        proposalVotes[ipfsHash] = result.data
                    })

                const voters = Object.keys(proposalVotes[ipfsHash])
                const voterScores = await getVoterScores(provider, strategy, voters, proposal.get('Snapshot Block'))

                Object.entries(proposalVotes[ipfsHash]).map((voter) => {
                    let strategyScore = 0
                    for (i=0; i < strategy.length; i++) {
                        strategyScore += voterScores[i][voter[0]] || 0
                    }
                    voter[1].msg.payload.balance = strategyScore
                })

                let scores = {
                    1: 0,
                    2: 0
                }
                Object.entries(proposalVotes[ipfsHash]).reduce((total, cur) => {
                    const choice = cur[1].msg.payload.choice
                    const balance = cur[1].msg.payload.balance
                    if (scores[choice] === undefined) scores[choice] = 0
                    scores[choice] += balance
                }, {})

                proposalScores[ipfsHash] = scores
            } catch (err) {
                console.log(err)
            }
        }))
    }
}

// This updates every record with the latest snapshot votes
const main = async () => {
    await getAllProposalVotes()
    console.log('\n============ Total Proposal Scores [%s]', proposalScores.length)

    proposalVoteSummary = await sumSnapshotVotesToAirtable(allProposals, proposalScores)
    console.log('\n============ Total Proposals [%s]', proposalVoteSummary.length)

    await updateProposalRecords(proposalVoteSummary)
    console.log('[%s]\nUpdated [%s] rows to Airtable', (new Date()).toString(), proposalVoteSummary.length)
}

main()