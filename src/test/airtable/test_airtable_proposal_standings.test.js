global.fetch = require('cross-fetch')
const dotenv = require('dotenv')
dotenv.config()

const should = require('chai').should()
const { expect } = require('chai')
const {
  validateProposal
} = require('../../airtable/proposals/proposal_standings')
const {
  State,
  Standings,
  Disputed,
  getProposalRecord,
  getProjectsLatestProposal,
  processProposalStandings,
  processHistoricalStandings,
  updateCurrentRoundStandings,
  getProposalState
} = require('../../airtable/proposals/proposal_standings')
const {
  WALLET_ADDRESS_WITH_ENOUGH_OCEANS,
  WALLET_ADDRESS_WITH_NOT_ENOUGH_OCEANS
} = require('../config')
const { levels } = require('../../airtable/project_summary')

var currentProposals
var allProposals = []

beforeEach(async function () {
  currentProposals = [
    {
      id: 'proposal_5',
      fields: {
        'Project Name': 'test',
        'Proposal URL': 'www.testurl.com',
        'Proposal State': State.Funded,
        'Proposal Standing': undefined,
        'Deliverable Checklist': '[x] D1\n[x] D2\n[x] D3',
        'Last Deliverable Update': 'May 01, 2021',
        'Refund Transaction': undefined,
        'Disputed Status': undefined,
        'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS,
        'One Liner': 'adasd',
        'Grant Deliverables': 'asdasd',
        'Project Lead Full Name': 'John Doe',
        'Country of Recipient': 'country',
        'Project Email Address': 'valid@email.yes',
        'USD Requested': 0
      },
      get: function (key) {
        return this.fields[key]
      }
    },
    {
      id: 'proposal_1_new_existing_entrant',
      fields: {
        'Project Name': 'New Existing Entrant',
        'Proposal URL': 'www.new-existing-entrant.com',
        'Proposal State': undefined,
        'Proposal Standing': undefined,
        'Deliverable Checklist': undefined,
        'Last Deliverable Update': undefined,
        'Refund Transaction': undefined,
        'Disputed Status': undefined,
        'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS,
        'One Liner': 'adasd',
        'Grant Deliverables': 'asdasd',
        'Project Lead Full Name': 'John Doe',
        'Country of Recipient': 'country',
        'Project Email Address': 'valid@email.yes',
        'USD Requested': 0
      },
      get: function (key) {
        return this.fields[key]
      }
    },
    {
      id: 'proposal_1_new_entrant',
      fields: {
        'Project Name': 'New Entrant',
        'Proposal URL': 'www.new-entrant.com',
        'Proposal State': undefined,
        'Proposal Standing': undefined,
        'Deliverable Checklist': undefined,
        'Last Deliverable Update': undefined,
        'Refund Transaction': undefined,
        'Disputed Status': undefined,
        'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS,
        'One Liner': 'adasd',
        'Grant Deliverables': 'asdasd',
        'Project Lead Full Name': 'John Doe',
        'Country of Recipient': 'country',
        'Project Email Address': 'valid@email.yes',
        'USD Requested': 0
      },
      get: function (key) {
        return this.fields[key]
      }
    }
  ]

  allProposals = [
    {
      id: 'proposal_1',
      fields: {
        'Project Name': 'test',
        'Proposal URL': 'www.testurl.com',
        'Proposal State': State.Funded,
        'Proposal Standing': undefined,
        'Deliverable Checklist': '[] D1\n[x] D2\n[x] D3',
        'Last Deliverable Update': 'Jan 01, 2021',
        'Refund Transaction': undefined,
        'Disputed Status': undefined,
        'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS,
        'One Liner': 'adasd',
        'Grant Deliverables': 'asdasd',
        'Project Lead Full Name': 'John Doe',
        'Country of Recipient': 'country',
        'Project Email Address': 'valid@email.yes',
        'USD Requested': 0
      },
      get: function (key) {
        return this.fields[key]
      }
    },
    {
      id: 'proposal_2',
      fields: {
        'Project Name': 'test',
        'Proposal URL': 'www.testurl.com',
        'Proposal State': State.Funded,
        'Proposal Standing': undefined,
        'Deliverable Checklist': '[x] D1\n[x] D2\n[x] D3',
        'Last Deliverable Update': 'Feb 01, 2021',
        'Refund Transaction': '0xRefundTx',
        'Disputed Status': undefined,
        'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS,
        'One Liner': 'adasd',
        'Grant Deliverables': 'asdasd',
        'Project Lead Full Name': 'John Doe',
        'Country of Recipient': 'country',
        'Project Email Address': 'valid@email.yes',
        'USD Requested': 0
      },
      get: function (key) {
        return this.fields[key]
      }
    },
    {
      id: 'proposal_3',
      fields: {
        'Project Name': 'test',
        'Proposal URL': 'www.testurl.com',
        'Proposal State': State.Funded,
        'Proposal Standing': undefined,
        'Deliverable Checklist': '[] D1\n[x] D2\n[x] D3',
        'Last Deliverable Update': 'Mar 01, 2021',
        'Refund Transaction': undefined,
        'Disputed Status': undefined,
        'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS,
        'One Liner': 'adasd',
        'Grant Deliverables': 'asdasd',
        'Project Lead Full Name': 'John Doe',
        'Country of Recipient': 'country',
        'Project Email Address': 'valid@email.yes',
        'USD Requested': 0
      },
      get: function (key) {
        return this.fields[key]
      }
    },
    {
      id: 'proposal_4',
      fields: {
        'Project Name': 'test',
        'Proposal URL': 'www.testurl.com',
        'Proposal State': State.Rejected,
        'Proposal Standing': Standings.NoOcean,
        'Deliverable Checklist': '[] D1\n[x] D2\n[x] D3',
        'Last Deliverable Update': 'Mar 01, 2021',
        'Refund Transaction': undefined,
        'Disputed Status': undefined,
        'Wallet Address': WALLET_ADDRESS_WITH_NOT_ENOUGH_OCEANS,
        'One Liner': 'adasd',
        'Grant Deliverables': 'asdasd',
        'Project Lead Full Name': 'John Doe',
        'Country of Recipient': 'country',
        'Project Email Address': 'valid@email.yes',
        'USD Requested': 0
      },
      get: function (key) {
        return this.fields[key]
      }
    },
    {
      id: 'proposal_5',
      fields: {
        'Project Name': 'test',
        'Proposal URL': 'www.testurl.com',
        'Proposal State': State.Funded,
        'Proposal Standing': Standings.Completed,
        'Deliverable Checklist': '[x] D1\n[x] D2\n[x] D3',
        'Last Deliverable Update': 'Jan 01, 2021',
        'Refund Transaction': undefined,
        'Disputed Status': undefined,
        'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS,
        'One Liner': 'adasd',
        'Grant Deliverables': 'asdasd',
        'Project Lead Full Name': 'John Doe',
        'Country of Recipient': 'country',
        'Project Email Address': 'valid@email.yes',
        'USD Requested': 0
      },
      get: function (key) {
        return this.fields[key]
      }
    },
    {
      id: 'proposal_6',
      fields: {
        'Project Name': 'test',
        'Proposal URL': 'www.testurl.com',
        'Proposal State': State.Funded,
        'Proposal Standing': Standings.Unreported,
        'Deliverable Checklist': '[x] D1\n[x] D2\n[x] D3',
        'Last Deliverable Update': 'Apr 01, 2021',
        'Refund Transaction': undefined,
        'Disputed Status': undefined,
        'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS,
        'One Liner': 'adasd',
        'Grant Deliverables': 'asdasd',
        'Project Lead Full Name': 'John Doe',
        'Country of Recipient': 'country',
        'Project Email Address': 'valid@email.yes',
        'USD Requested': 0
      },
      get: function (key) {
        return this.fields[key]
      }
    },
    {
      id: 'proposal_7',
      fields: {
        'Project Name': 'project2',
        'Proposal URL': 'www.testurl.com',
        'Proposal State': State.Funded,
        'Proposal Standing': Standings.Unreported,
        'Deliverable Checklist': undefined,
        'Last Deliverable Update': 'Apr 01, 2021',
        'Refund Transaction': undefined,
        'Disputed Status': undefined,
        'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS,
        'One Liner': 'adasd',
        'Grant Deliverables': 'asdasd',
        'Project Lead Full Name': 'John Doe',
        'Country of Recipient': 'country',
        'Project Email Address': 'valid@email.yes',
        'USD Requested': 0
      },
      get: function (key) {
        return this.fields[key]
      }
    },
    {
      id: 'proposal_8',
      fields: {
        'Project Name': 'project2',
        'Proposal URL': 'www.testurl_8.com',
        'Proposal State': State.Undefined,
        'Proposal Standing': Standings.Undefined,
        'Deliverable Checklist': '[x] D1\n[x] D2\n[x] D3',
        'Last Deliverable Update': 'Apr 01, 2021',
        'Refund Transaction': undefined,
        'Disputed Status': undefined,
        'Deployment Ready': 'Yes',
        'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS,
        'One Liner': 'adasd',
        'Grant Deliverables': 'asdasd',
        'Project Lead Full Name': 'John Doe',
        'Country of Recipient': 'country',
        'Project Email Address': 'valid@email.yes',
        'USD Requested': 0
      },
      get: function (key) {
        return this.fields[key]
      }
    }
  ]
})

describe('Calculating Proposal Standings', function () {
  it('Validates all initial proposal standings', async function () {
    let record = await getProposalRecord(allProposals[0], allProposals)
    should.equal(record.fields['Proposal Standing'], Standings.Incomplete)

    record = await getProposalRecord(allProposals[1], allProposals)
    should.equal(record.fields['Proposal Standing'], Standings.Refunded)

    record = await getProposalRecord(allProposals[2], allProposals)
    should.equal(record.fields['Proposal Standing'], Standings.Incomplete)

    record = await getProposalRecord(allProposals[3], allProposals)
    should.equal(record.fields['Proposal Standing'], Standings.NoOcean)
  })

  it('Validates Incomplete becomes Complete', async function () {
    let record = await getProposalRecord(allProposals[0], allProposals)
    should.equal(record.fields['Proposal Standing'], Standings.Incomplete)

    allProposals[0].fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'
    record = await getProposalRecord(allProposals[0], allProposals)
    should.equal(record.fields['Proposal Standing'], Standings.Completed)
  })

  it('Validates Refunded proposals remains Refunded', async function () {
    let record = await getProposalRecord(allProposals[1], allProposals)
    should.equal(record.fields['Proposal Standing'], Standings.Refunded)

    allProposals[1].fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'
    record = await getProposalRecord(allProposals[1], allProposals)
    should.equal(record.fields['Proposal Standing'], Standings.Refunded)
  })

  it('Validates Incomplete proposals become Completed', async function () {
    let record = await getProposalRecord(allProposals[2], allProposals)
    should.equal(record.fields['Proposal Standing'], Standings.Incomplete)

    allProposals[2].fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'
    record = await getProposalRecord(allProposals[2], allProposals)
    should.equal(record.fields['Proposal Standing'], Standings.Completed)
  })
})

describe('Process Project Standings', function () {
  it('Should get the correct proposal state', async function () {
    // current state, has enough Oceans, expected state
    const proposalStates = [
      [State.Undefined, true, false, State.Accepted],
      [State.Undefined, false, false, State.Rejected],
      [State.Rejected, false, false, State.Rejected],
      [State.Rejected, true, false, State.Accepted],
      [State.DownVoted, true, false, State.DownVoted],
      [State.DownVoted, true, false, State.DownVoted],
      [State.DownVoted, true, true, State.DownVoted],
      [State.Accepted, true, true, State.Funded],
      [State.Rejected, true, true, State.Funded]
    ]

    for (const state of proposalStates) {
      const result = getProposalState(state[0], state[1], state[2])
      should.equal(result, state[3])
    }
  })

  it('All proposalStandings are Completed or Refunded', async function () {
    // Complete every proposal
    allProposals.forEach((x) => {
      x.fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'
    })

    // Process proposals and historical standings
    const proposalStandings = await processProposalStandings(allProposals)
    await processHistoricalStandings(proposalStandings)

    // Verify every proposal in history is completed or refunded
    const projectName = allProposals[0].get('Project Name')
    proposalStandings[projectName].forEach((x) => {
      expect(x.fields['Proposal Standing']).to.be.oneOf([
        Standings.Completed,
        Standings.Refunded,
        Standings.NoOcean
      ])
    })

    // expect last elements Proposal Standing to be `Standings.Completed`
    expect(
      proposalStandings[projectName].find((x) => x.id === 'proposal_6').fields[
        'Proposal Standing'
      ]
    ).to.equal(Standings.Completed)
  })

  describe('Proposal validation', () => {
    let proposal = {}
    const level = levels(1)
    beforeEach(() => {
      proposal = {
        id: 'proposal_8',
        fields: {
          'Project Name': 'project2',
          'Proposal URL': 'www.testurl_8.com',
          'Proposal State': State.Undefined,
          'Proposal Standing': Standings.Undefined,
          'Deliverable Checklist': '[x] D1\n[x] D2\n[x] D3',
          'Last Deliverable Update': 'Apr 01, 2021',
          'Refund Transaction': undefined,
          'Disputed Status': undefined,
          'Deployment Ready': 'Yes',
          'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS,
          'One Liner': 'adasd',
          'Grant Deliverables': 'asdasd',
          'Project Lead Full Name': 'John Doe',
          'Country of Recipient': 'country',
          'Project Email Address': 'valid@email.yes',
          'USD Requested': 0
        },
        get: function (key) {
          return this.fields[key]
        }
      }
    })
    it('Should check if the email address is empty or invalid', () => {
      proposal.fields['Project Email Address'] = undefined
      expect(validateProposal(proposal, level)).to.equal(
        'Missing Email Address'
      )

      proposal.fields['Project Email Address'] = ''
      expect(validateProposal(proposal, level)).to.equal(
        'Missing Email Address'
      )

      proposal.fields['Project Email Address'] = 'asdasc#$$%@@gmail.com'
      expect(validateProposal(proposal, level)).to.equal(
        'Invalid Email Address'
      )

      proposal.fields['Project Email Address'] = 'asdas@gmail.com'
      expect(validateProposal(proposal, level)).to.equal(true)
    })
    it('Should check if the One Liner is empty', () => {
      proposal.fields['One Liner'] = undefined
      expect(validateProposal(proposal, level)).to.equal('Missing One Liner')
    })
    it('Should check if the Proposal URL is empty', () => {
      proposal.fields['Proposal URL'] = undefined
      expect(validateProposal(proposal, level)).to.equal('Missing Proposal URL')
    })
    it('Should check if the Grant Deliverables is empty', () => {
      proposal.fields['Grant Deliverables'] = undefined
      expect(validateProposal(proposal, level)).to.equal(
        'Missing Grant Deliverables'
      )
    })
    it('Should check if the Project Lead Full Name is empty', () => {
      proposal.fields['Project Lead Full Name'] = undefined
      expect(validateProposal(proposal, level)).to.equal(
        'Missing Project Lead Full Name'
      )
    })
    it('Should check if the Country of Recipient is empty', () => {
      proposal.fields['Country of Recipient'] = undefined
      expect(validateProposal(proposal, level)).to.equal(
        'Missing Country of Recipient'
      )
    })

    it('Should check the amount of USD requested is valid', () => {
      proposal.fields['USD Requested'] = 100
      expect(validateProposal(proposal, levels(0))).to.equal(true) // new project

      proposal.fields['USD Requested'] = 3000
      expect(validateProposal(proposal, levels(0))).to.equal(true) // new project

      proposal.fields['USD Requested'] = 3001
      expect(validateProposal(proposal, levels(0))).to.equal(
        'Invalid USD Requested'
      ) // new project

      proposal.fields['USD Requested'] = 10000
      expect(validateProposal(proposal, levels(1))).to.equal(true) // 1 project completed
      proposal.fields['USD Requested'] = 10001
      expect(validateProposal(proposal, levels(1))).to.equal(
        'Invalid USD Requested'
      ) // 1 project completed

      proposal.fields['USD Requested'] = 20000
      expect(validateProposal(proposal, levels(2))).to.equal(true) // 2 projects completed
      proposal.fields['USD Requested'] = 20001
      expect(validateProposal(proposal, levels(2))).to.equal(
        'Invalid USD Requested'
      ) // 2 projects completed

      proposal.fields['USD Requested'] = 20000
      expect(validateProposal(proposal, levels(5))).to.equal(true) // 5 projects completed
      proposal.fields['USD Requested'] = 20001
      expect(validateProposal(proposal, levels(5))).to.equal(
        'Invalid USD Requested'
      ) // 5 projects completed
    })

    it('Should set the proposal state to rejected if the proposal is invalid', async () => {
      proposal.fields['USD Requested'] = 35000
      const record = await getProposalRecord(proposal, [])
      expect(record.fields['Proposal State']).to.equal(State.Rejected)
    })
  })

  it('Should set to in progress if deployment ready', async function () {
    const proposalStandings = {
      project: [
        {
          id: 'proposal_4',
          fields: {
            'Project Name': 'project',
            'Proposal URL': 'www.testurl_8.com',
            'Proposal State': State.Funded,
            'Proposal Standing': Standings.Completed,
            'Deliverable Checklist': '[x] D1\n[x] D2\n[x] D3',
            'Last Deliverable Update': 'Apr 01, 2021',
            'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS
          },
          get: function (key) {
            return this.fields[key]
          }
        },
        {
          id: 'proposal_8',
          fields: {
            'Project Name': 'project',
            'Proposal URL': 'www.testurl_8.com',
            'Proposal State': State.Undefined,
            'Proposal Standing': Standings.Undefined,
            'Deliverable Checklist': '[x] D1\n[x] D2\n[x] D3',
            'Last Deliverable Update': 'Apr 01, 2021',
            'Deployment Ready': 'Yes', // Deployment ready
            'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS
          },
          get: function (key) {
            return this.fields[key]
          }
        },
        {
          id: 'proposal_1',
          fields: {
            'Project Name': 'project',
            'Proposal URL': 'www.testurl_8.com',
            'Proposal State': State.Undefined,
            'Proposal Standing': Standings.NoOcean, // No Ocean
            'Deliverable Checklist': '[x] D1\n[x] D2\n[x] D3',
            'Last Deliverable Update': 'Apr 01, 2021',
            'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS
          },
          get: function (key) {
            return this.fields[key]
          }
        },
        {
          id: 'proposal_1',
          fields: {
            'Project Name': 'project_new',
            'Proposal URL': 'www.testurl_8.com',
            'Proposal State': State.Undefined,
            'Proposal Standing': Standings.NoOcean, // No Ocean
            'Deliverable Checklist': '[x] D1\n[x] D2\n[x] D3',
            'Last Deliverable Update': 'Apr 01, 2021',
            'Wallet Address': WALLET_ADDRESS_WITH_ENOUGH_OCEANS
          },
          get: function (key) {
            return this.fields[key]
          }
        }
      ]
    }

    await processHistoricalStandings(proposalStandings)
    expect(proposalStandings.project[0].fields['Proposal Standing']).to.equal(
      Standings.Completed
    )
    expect(proposalStandings.project[1].fields['Proposal Standing']).to.equal(
      Standings.Progress
    )
    expect(proposalStandings.project[2].fields['Proposal Standing']).to.equal(
      Standings.NoOcean
    )
    expect(proposalStandings.project[3].fields['Proposal Standing']).to.equal(
      Standings.NoOcean
    )
  })

  it('Should set the latest project rejected if any of the previous ones has a bad standing', async function () {
    allProposals.forEach((x) => {
      x.fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'
    })
    allProposals.find((x) => x.id === 'proposal_7').fields[
      'Deliverable Checklist'
    ] = undefined // set proposal_7 to be incomplete

    // Process proposals and historical standings
    const previousProposals = allProposals.slice(0, allProposals.length - 1)
    const currentProposals = [allProposals[allProposals.length - 1]]

    const proposalStandings = await processProposalStandings(previousProposals)
    await processHistoricalStandings(proposalStandings)

    const latestProposalStandings = await getProjectsLatestProposal(
      proposalStandings
    )

    const currentProposalStandings = await processProposalStandings(
      currentProposals,
      previousProposals
    )

    const latestProposals = getProjectsLatestProposal(currentProposalStandings)
    await updateCurrentRoundStandings(
      currentProposalStandings,
      latestProposalStandings
    )

    expect(latestProposals.project2.fields['Proposal State']).to.equal(
      State.Rejected
    )
  })

  it('If proposalStanding is Incomplete then remainder of projectStanding is Incomplete', async function () {
    // Complete every proposal
    allProposals.forEach((x) => {
      x.fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'
    })
    // Set the very first proposal to not be completed
    allProposals[0].fields['Deliverable Checklist'] = '[] D1\n[x] D2\n[x] D3'

    // Process all proposals
    const proposalStandings = await processProposalStandings(allProposals)
    await processHistoricalStandings(proposalStandings)

    // Validate that all proposals are Incomplete
    const projectName = allProposals[0].get('Project Name')
    proposalStandings[projectName].forEach((x) => {
      should.equal(x.fields['Proposal Standing'], Standings.Incomplete)
    })
  })

  it('Validate [latestProposal] is head of indexed proposals ', async function () {
    // Complete every proposal
    allProposals.forEach((x) => {
      x.fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'
    })
    // Set the very first proposal to not be completed
    allProposals[0].fields['Deliverable Checklist'] = '[] D1\n[x] D2\n[x] D3'

    // Process all proposals
    const proposalStandings = await processProposalStandings(allProposals)
    await processHistoricalStandings(proposalStandings)

    // Validate that all proposals are Incomplete
    const projectName = allProposals[0].get('Project Name')
    proposalStandings[projectName].forEach((x) => {
      should.equal(x.fields['Proposal Standing'], Standings.Incomplete)
    })

    // Step 3 - Report the latest (top of stack) proposal standing
    // Retrieve the last proposals from projectStandings
    const latestProposals = getProjectsLatestProposal(proposalStandings)

    const lastProjectId = allProposals
      .filter((x) => x.get('Project Name') === projectName)
      .slice(-1)[0].id
    should.equal(latestProposals[projectName].id, lastProjectId)
  })

  it('Validate [currentProposalStanding] maps to head of indexed proposals', async function () {
    // Complete every proposal
    allProposals.forEach((x) => {
      x.fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'
    })
    // Set the very first proposal to not be completed
    allProposals[0].fields['Deliverable Checklist'] = '[] D1\n[x] D2\n[x] D3'

    // Process all proposals
    const proposalStandings = await processProposalStandings(allProposals)
    await processHistoricalStandings(proposalStandings)

    // Step 3 - Report the latest (top of stack) proposal standing from each project
    // latestProposal should equal head of each project
    const latestProposals = getProjectsLatestProposal(proposalStandings)

    for (const [projectName, value] of Object.entries(latestProposals)) {
      const lastProjectId = allProposals
        .filter((x) => x.get('Project Name') === projectName)
        .slice(-1)[0].id
      should.equal(value.id, lastProjectId)
    }

    const currentProposalStandings = await processProposalStandings(
      currentProposals
    )
    updateCurrentRoundStandings(currentProposalStandings, latestProposals)
    should.equal(
      currentProposalStandings.test[0].fields['Proposal Standing'],
      latestProposals.test.fields['Proposal Standing']
    )
    should.equal(
      currentProposalStandings.test[0].fields['Proposal Standing'],
      Standings.Incomplete
    )
  })

  it('Validate [currentProposalStanding] New Entrants, and Unmatched have standing=New Project', async function () {
    // Complete every proposal
    allProposals.forEach((x) => {
      x.fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'
    })
    // Set the very first proposal to not be completed
    allProposals[0].fields['Deliverable Checklist'] = '[] D1\n[x] D2\n[x] D3'

    // Process all proposals
    const proposalStandings = await processProposalStandings(allProposals)
    await processHistoricalStandings(proposalStandings)

    // Step 3 - Report the latest (top of stack) proposal standing from each project
    // latestProposal should equal head of each project
    const latestProposals = getProjectsLatestProposal(proposalStandings)
    for (const [projectName, value] of Object.entries(latestProposals)) {
      const lastProjectId = allProposals
        .filter((x) => x.get('Project Name') === projectName)
        .slice(-1)[0].id
      should.equal(value.id, lastProjectId)
    }

    const currentProposalStandings = await processProposalStandings(
      currentProposals
    )
    updateCurrentRoundStandings(currentProposalStandings, latestProposals)
    should.equal(
      currentProposalStandings.test[0].fields['Proposal Standing'],
      latestProposals.test.fields['Proposal Standing']
    )
    should.equal(
      currentProposalStandings.test[0].fields['Proposal Standing'],
      Standings.Incomplete
    )

    should.equal(
      currentProposalStandings['New Existing Entrant'][0].fields[
        'Proposal Standing'
      ],
      Standings.NewProject
    )
    should.equal(
      currentProposalStandings['New Existing Entrant'][0].fields[
        'Proposal State'
      ],
      State.Accepted
    )
    should.equal(
      currentProposalStandings['New Entrant'][0].fields['Proposal Standing'],
      Standings.NewProject
    )
    should.equal(
      currentProposalStandings['New Entrant'][0].fields['Proposal State'],
      State.Accepted
    )
  })

  it('Validates [Bad Project State] is cleaned up', async function () {
    // Initialize Proposal[1] to not be refunded
    // Process all proposals
    allProposals[1].fields['Refund Transaction'] = undefined

    let proposalStandings = await processProposalStandings(allProposals)
    await processHistoricalStandings(proposalStandings)

    // Validate proposals are incomplete and bad URLs are reporting properly
    should.equal(
      proposalStandings.test[0].fields['Proposal Standing'],
      Standings.Incomplete
    )
    should.equal(
      proposalStandings.test[1].fields['Proposal Standing'],
      Standings.Incomplete
    )

    let badUrl0 = proposalStandings.test[0].fields['Outstanding Proposals']
    let badUrl1 = proposalStandings.test[1].fields['Outstanding Proposals']
    let badUrl0Count = badUrl0.split('\n')
    let badUrl1Count = badUrl1.split('\n')
    should.equal(badUrl0Count.length, 2)
    should.equal(badUrl1Count.length, 2)

    // Update initial proposal to be completed
    allProposals[0].fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'

    // Process standings again
    proposalStandings = await processProposalStandings(allProposals)
    await processHistoricalStandings(proposalStandings)

    // Validate first proposal is completed, and [Oustanding URLs] is correct.
    should.equal(
      proposalStandings.test[0].fields['Proposal Standing'],
      Standings.Completed
    )
    should.equal(
      proposalStandings.test[1].fields['Proposal Standing'],
      Standings.Completed
    )

    badUrl0 = proposalStandings.test[0].fields['Outstanding Proposals']
    badUrl1 = proposalStandings.test[1].fields['Outstanding Proposals']
    badUrl0Count = badUrl0.split('\n')
    should.equal(badUrl0Count.length, 1)

    badUrl1Count = badUrl1.split('\n')
    should.equal(badUrl1Count.length, 1)
  })

  it('Validates [Ongoing Disputed Proposals] are a bad state. Not Eligible for grants.', async function () {
    // Complete every proposal
    allProposals.forEach((x) => {
      x.fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'
    })
    // Set the very first proposal to not be completed
    allProposals[0].fields['Disputed Status'] = Disputed.Ongoing

    // Process all proposals
    const proposalStandings = await processProposalStandings(allProposals)
    await processHistoricalStandings(proposalStandings)

    for (let i = 1; i < proposalStandings.length; i++) {
      should.equal(
        proposalStandings.test[i].fields['Proposal Standing'],
        Standings.Dispute
      )
    }
  })

  it('Validates [Completed Disputes] is a good state.', async function () {
    // Complete every proposal
    allProposals.forEach((x) => {
      x.fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'
    })
    // Set the very first proposal to not be completed
    allProposals[0].fields['Disputed Status'] = Disputed.Resolved

    // Process all proposals
    const proposalStandings = await processProposalStandings(allProposals)
    await processHistoricalStandings(proposalStandings)

    for (let i = 1; i < proposalStandings.length; i++) {
      should.equal(
        proposalStandings.test[i].fields['Proposal Standing'],
        Standings.Completed
      )
    }
  })

  it('Validates projects not funded, receive New Project.', async function () {
    // Set the very first proposal to not be completed
    allProposals[1].fields['Proposal State'] = State.NotGranted
    allProposals[1].fields['Project Name'] = 'test1'

    allProposals[5].fields['Proposal State'] = State.NotGranted
    allProposals[5].fields['Project Name'] = 'test2'

    // Zero every completion
    allProposals.forEach((x) => {
      x.fields['Deliverable Checklist'] = undefined
    })

    // Process all proposals
    const proposalStandings = await processProposalStandings(allProposals)
    await processHistoricalStandings(proposalStandings)

    should.equal(
      proposalStandings.test1[0].fields['Proposal Standing'],
      Standings.NewProject
    )
    should.equal(
      proposalStandings.test2[0].fields['Proposal Standing'],
      Standings.NewProject
    )
  })

  it('Validates downvoted/declined projects without standing receive previous standings.', async function () {
    // Set the very first proposal to not be completed
    allProposals[0].fields['Proposal State'] = State.Funded
    allProposals[0].fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'

    allProposals[1].fields['Proposal State'] = State.Funded
    allProposals[1].fields['Refund Transaction'] = undefined
    allProposals[1].fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'

    allProposals[2].fields['Proposal State'] = State.Funded
    allProposals[2].fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'

    allProposals[3].fields['Proposal State'] = State.DownVoted
    allProposals[3].fields['Deliverable Checklist'] = undefined

    // Process all proposals
    const proposalStandings = await processProposalStandings(allProposals)
    await processHistoricalStandings(proposalStandings)

    should.equal(
      proposalStandings.test[0].fields['Proposal Standing'],
      Standings.Completed
    )
    should.equal(
      proposalStandings.test[1].fields['Proposal Standing'],
      Standings.Completed
    )
    should.equal(
      proposalStandings.test[2].fields['Proposal Standing'],
      Standings.Completed
    )
    should.equal(
      proposalStandings.test[3].fields['Proposal Standing'],
      Standings.Incomplete
    )
  })

  it('Validates State.Received proposals report Standing.NoOcean.', async function () {
    // Complete every proposal
    allProposals.forEach((x) => {
      x.fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'
    })

    // Process all proposals
    const proposalStandings = await processProposalStandings(allProposals)
    await processHistoricalStandings(proposalStandings)

    // Step 3 - Report the latest (top of stack) proposal standing from each project
    // latestProposal should equal head of each project
    const latestProposals = getProjectsLatestProposal(proposalStandings)

    currentProposals[0].fields['Proposal State'] = State.Rejected
    currentProposals[0].fields['Wallet Address'] =
      WALLET_ADDRESS_WITH_NOT_ENOUGH_OCEANS

    const currentProposalStandings = await processProposalStandings(
      currentProposals
    )
    updateCurrentRoundStandings(currentProposalStandings, latestProposals)

    should.equal(
      currentProposalStandings.test[0].fields['Proposal Standing'],
      Standings.NoOcean
    )
  })

  it('Validate "No Ocean" property of "Proposal Standings" reported correctly', async function () {
    // Set the very first proposal to not be completed
    allProposals[0].fields['Proposal Standings'] = Standings.NoOcean
    allProposals[0].fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'
    allProposals[0].fields['Proposal State'] = State.Rejected
    allProposals[0].fields['Wallet Address'] = WALLET_ADDRESS_WITH_ENOUGH_OCEANS
    // Process all proposals
    const proposalStandings = await processProposalStandings(allProposals)
    await processHistoricalStandings(proposalStandings)

    should.equal(
      proposalStandings.test[0].fields['Proposal Standing'],
      Standings.Completed
    )
    should.equal(
      proposalStandings.test[0].fields['Proposal State'],
      State.Accepted
    )
  })

  it('Validate all project proposal standings are in a good standing state', async function () {
    //  Set the first proposal to be 'Unreported'
    allProposals[0].fields['Proposal Standing'] = Standings.Unreported
    allProposals[0].fields['Last Deliverable Update'] = 'May 01, 2021'

    //  Set the third proposal to be 'Incomplete'
    allProposals[2].fields['Proposal Standing'] = Standings.Incomplete

    // Process all proposals
    const proposalStandings = await processProposalStandings(allProposals)
    await processHistoricalStandings(proposalStandings)
    const latestProposal = getProjectsLatestProposal(proposalStandings)

    should.equal(latestProposal.test.fields['Bad Status'], true)
  })

  it('Validate "No Ocean" property of "Proposal Standings" does not propagate to next round', async function () {
    // Process all proposals
    allProposals[0].fields.Earmarks = 'New Entrants'
    allProposals[0].fields['Deliverable Checklist'] = '[x] D1\n[x] D2\n[x] D3'
    allProposals[0].fields['Proposal State'] = State.Rejected
    allProposals[0].fields['Proposal Standing'] = Standings.NoOcean
    allProposals[0].fields['Wallet Address'] = WALLET_ADDRESS_WITH_ENOUGH_OCEANS

    allProposals[2].fields.Earmarks = 'New Entrants'
    allProposals[2].fields['Deliverable Checklist'] = ''
    allProposals[2].fields['Proposal State'] = State.Rejected
    allProposals[2].fields['Proposal Standing'] = Standings.NoOcean
    allProposals[2].fields['Wallet Address'] = WALLET_ADDRESS_WITH_ENOUGH_OCEANS

    const proposalStandings = await processProposalStandings(allProposals)

    await processHistoricalStandings(proposalStandings)

    should.equal(
      proposalStandings.test[0].fields['Proposal Standing'],
      Standings.Completed
    )
    should.equal(
      proposalStandings.test[2].fields['Proposal Standing'],
      Standings.Incomplete
    )
  })
})
