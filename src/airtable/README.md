# Airtable Scripts

## process_all_proposal_standings.js
Below is the basic set of rules.

####Step 1 - Identify all proposal standings
- Scan over each proposal and calculates it's own state inside of getProjectStanding()
- Various parameters are calculated per proposal, and state is identified.
- For each proposal, update it's own record & state.
- Push proposal to project[proposal_name] dict[array[]]

####Step 2 - Resolve & Report standings
- Iterate via each project.proposals
- If proposal is incomplete, or in dispute, append portURL into outstandingURls
- If outstandingURL.length > 0, report outstandingURLs

####Step 3 - Report new proposal standings
- For returning teams, make sure they are in good standing
- For each project, use the latest proposal state