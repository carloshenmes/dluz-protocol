const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DLuzToken", function () {
  let dluz, owner, addr1, addr2;
  const INITIAL_SUPPLY = ethers.parseEther("30000000"); // 30M
  const MAX_SUPPLY = ethers.parseEther("100000000"); // 100M

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const DLuzToken = await ethers.getContractFactory("DLuzToken");
    dluz = await DLuzToken.deploy(owner.address);
    await dluz.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await dluz.name()).to.equal("dLuz Token");
      expect(await dluz.symbol()).to.equal("DLUZ");
    });

    it("Should mint initial supply to owner", async function () {
      expect(await dluz.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("Should set deployer as owner", async function () {
      expect(await dluz.owner()).to.equal(owner.address);
    });

    it("Should have correct max supply", async function () {
      expect(await dluz.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint up to max supply", async function () {
      const amount = ethers.parseEther("1000");
      await dluz.mint(addr1.address, amount);
      expect(await dluz.balanceOf(addr1.address)).to.equal(amount);
    });

    it("Should reject minting beyond max supply", async function () {
      const remaining = MAX_SUPPLY - INITIAL_SUPPLY;
      const tooMuch = remaining + ethers.parseEther("1");
      await expect(
        dluz.mint(addr1.address, tooMuch)
      ).to.be.revertedWithCustomError(dluz, "ExceedsMaxSupply");
    });

    it("Should reject minting from non-owner", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        dluz.connect(addr1).mint(addr1.address, amount)
      ).to.be.revertedWithCustomError(dluz, "OwnableUnauthorizedAccount");
    });
  });

  describe("Burning", function () {
    it("Should allow token holder to burn", async function () {
      const burnAmount = ethers.parseEther("1000");
      await dluz.burn(burnAmount);
      expect(await dluz.balanceOf(owner.address)).to.equal(
        INITIAL_SUPPLY - burnAmount
      );
    });
  });

  describe("Remaining Mintable", function () {
    it("Should return correct remaining mintable supply", async function () {
      const expected = MAX_SUPPLY - INITIAL_SUPPLY;
      expect(await dluz.remainingMintable()).to.equal(expected);
    });

    it("Should decrease after minting", async function () {
      const mintAmount = ethers.parseEther("5000000"); // 5M
      await dluz.mint(addr1.address, mintAmount);
      const expected = MAX_SUPPLY - INITIAL_SUPPLY - mintAmount;
      expect(await dluz.remainingMintable()).to.equal(expected);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.parseEther("500");
      await dluz.transfer(addr1.address, amount);
      expect(await dluz.balanceOf(addr1.address)).to.equal(amount);

      await dluz.connect(addr1).transfer(addr2.address, amount);
      expect(await dluz.balanceOf(addr2.address)).to.equal(amount);
      expect(await dluz.balanceOf(addr1.address)).to.equal(0);
    });
  });
});
