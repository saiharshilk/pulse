// Runs every test in one fixed timezone, so results match on any machine
// and the daylight-saving tests have real 23- and 25-hour days to check.
module.exports = async () => {
  process.env.TZ = 'America/Chicago';
};
