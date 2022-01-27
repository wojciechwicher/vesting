const WWToken = artifacts.require("WWToken");
const VestContract = artifacts.require("VestContract");
const helper = require('./utils.js');

contract("Exchange", (accounts) => {
  let wWToken;
  let vestContract;
  let balance;
  let result;

  describe("Vesting tests", async () => {

    before(async () => {
      wWToken = await WWToken.deployed();
      vestContract = await VestContract.deployed(wWToken.address);
    }); 

    it("token balance test", async () => {
      balance = await wWToken.balanceOf(accounts[0]);
      assert.equal(balance.toString(), "1000000000000000000000", "The balance for account[0] of wWTokenA should be 1000000000000000000000");
      await wWToken.approve(vestContract.address, 1000, {from: accounts[0],});
      await vestContract.deposit( 1000, { from: accounts[0], });
      balance = await wWToken.balanceOf(accounts[0]);
      assert.equal(balance.toString(), "999999999999999999000", "The balance for account[0] of wWTokenA should be 999999999999999999000");
      balance = await wWToken.balanceOf(accounts[1]);
      assert.equal(balance.toString(), "0", "The balance for account[1] of wWTokenA should be 0");
      balance = await wWToken.balanceOf(vestContract.address);
      assert.equal(balance.toString(), "1000", "The balance for kantor of wWTokenA should be 1000");
    });

    it("cant vest more tokens than stored in the deposit", async () => {
      try {
        await vestContract.vest(accounts[1],1001);
        assert(false);
      } catch (err) {
        assert.include( err.message, 'there are not enough tokens in the deposit', 'not enough tokens in the deposit' );
      }
    });

    it("can vest only once", async () => {
      await vestContract.vest(accounts[1],30);
      try {
        await vestContract.vest(accounts[1],30);
        assert(false);
      } catch (err) {
        assert.include( err.message, 'it is forbidden to vest more than once', 'vesting of vested token is forbiden' );
      }
    });

    it("claim function", async () => {
      await vestContract.claim({from:accounts[1]});
      result = await vestContract.getVestedAmount({from:accounts[1]});
      assert.equal(result.toString(), "0", "claim after 0 days");

      await helper.advanceTimeAndBlock(60*60*24*10); //advance 10 days

      await vestContract.claim({from:accounts[1]});
      result = await vestContract.getVestedAmount({from:accounts[1]});
      assert.equal(result.toString(), "10", "claim after 10 days");

      await helper.advanceTimeAndBlock(60*60*24*1); //advance 1 day

      await vestContract.claim({from:accounts[1]});
      result = await vestContract.getVestedAmount({from:accounts[1]});
      assert.equal(result.toString(), "11", "claim after 11 days");

      await helper.advanceTimeAndBlock(60*60*24*19); //advance 19 days

      await vestContract.claim({from:accounts[1]});

      balance = await wWToken.balanceOf(accounts[1]);
      assert.equal(balance.toString(), "30", "The balance for account[1] of wWTokenA should be 29");

      balance = await wWToken.balanceOf(vestContract.address);
      assert.equal(balance.toString(), "970", "The balance for kantor of wWTokenA should be 971");
    });

    it("claim without vested tokens", async () => {
      try {
        await vestContract.claim({from:accounts[1]});
        assert(false);
      } catch (err) {
        assert.include( err.message, 'there are no tokens to claim', 'it is not possible to claim tokens that are no vested' );
      }
    });

    it("vest again the same account", async () => {
      await vestContract.vest(accounts[1],30);
    });

  });
});
