## 🤖 OceanDAO Bot

This bot pipes data from a few different sources, so we can efficiently report DAO-Related informaiton.
- Make sure you have `node` and `npm`
- `npm install`
- Create a `.env` file with the following envs.
```
AIRTABLE_API_KEY=KEY_HERE
AIRTABLE_BASEID=ID_HERE
INFURA_API_KEY=KEY_HERE
ETH_PRIVATE_KEY=KEY_HERE
SNAPSHOT_HUB_URL=https://hub.snapshot.page
SNAPSHOT_URL=snapshot.org
SNAPSHOT_SPACE=officialoceandao.eth
CG_TOKEN_SLUG=ocean-protocol
BUILD_TYPE=DEV
GITHUB_REPOSITORY=oceandao
GITHUB_ORGANISATION=oceanprotocol
GITHUB_TOKEN=TOKEN_HERE
GSHEET_BASEID=GSHEET_ID_HERE
LOG_LEVEL=error
WALLET_ADDRESS_WITH_ENOUGH_OCEANS=0xeC8531e056CD7E3Bb1Fc81Ff48A00ce88c4615D7
WALLET_ADDRESS_WITH_NOT_ENOUGH_OCEANS=0x1234567890000000000000000000000000000000
```
## ❓ How To: Access OceanDAO Airtable Data
Anyone can access the live data for OceanDAO.
Design: Consider this a document-based DB.

You can view the [Proposals Airtable through this link](https://airtable.com/shrd5s7HSXc2vC1iC).
This contains all proposals for each funding round, and all required params to execute voting + funding.

You can view the [Funding Rounds Airtable through this link](https://airtable.com/shrvk1ENKwlG8vOBL)
This contains all funding round params required to execute voting + funding OPS (Funding Started -> Voting Ended -> Declare Winners & Amounts.

You can use our [Airtable API Endpoint via this link](https://airtable.com/appVer8ccYGnqSm2H/api/docs#javascript/introduction) and access it via `curl`.

This bot sits on a cron, and updates Airtable to display a voting Leaderboard.
Run the sync_airtable.js script using `node` inside the CLI.

`user@vm:in/your/cli/DAOBot/$ node src/airtable/sync_airtable_active_proposal_votes.js >> log_sync_airtable_active_proposal_votes.csv`

## 💾 Airtable - Configure DAOBot to use your Airtable 

Configure your AIRTABLE_API_KEY + AIRTABLE_BASEID to execute the airtable/db sync.
`user@vm:in/your/cli/DAOBot/$node src/airtable/sync_airtable_active_proposal_votes.js`

## 📈 GSheets - Point DAOBot to GSheet, get Vote Results
You can use DAOBot to dump votes from Snapshot, onto GSheets.
You can [instantly setup your GSheet, to render inside Notion.](https://www.notion.vip/charts/)

This bot also connects with GSheets.
1. Copy your credentials.json into DAOBot/ root  
`user@vm:in/your/cli/DAOBot/$node src/gsheets/index.js`
2. Follow cli prompts. token.json should be generated  
`user@vm:in/your/cli/DAOBot/$node src/gsheets/sync_gsheets_active_proposal_votes.js >> log_sync_gsheets_active_proposal_votes.csv`

## ⏲️ CRON - Configure DAOBOT Crontab

The bash scripts located in the root `/DAOBot/` directory should allow you to run the node sync-scripts, from cron.

Instructions  
- From the command line enter: crontab -e
- Execute your cron scripts relative to your `/DAOBot/` path. 
- Your local node installation may be in a different path than what's inside the .sh scripts. Use `which node`.

Example Crontab - Sync every 2 minutes 
```
* * * * * sh /DAOBot/cron_update_funding_round.sh 2>&1
*/5 * * * * sh /DAOBot/cron_project_summary.sh 2>&1
```

## 📜️ Documentation

There may be a need for you to understand other aspects of DAOBot, such as executing operational work to support DAOBot and your grants program.

A simple example of this may be to redistribute funds at the end of a round in case a project dropped out, or in case you decided to distribute a larger amount.

For further details on this, please visit the `docs` folder.

## Operations Playbook

We might need to adjust the blockheight as required, if there are any issues when deploying the ballot.
https://github.com/oceanprotocol/DAOBot/issues/202

## 🏛 License

```text
Copyright 2022 Ocean Protocol Foundation Ltd.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

