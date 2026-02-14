const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DCarbonToken", function () {
  let dcarbon, owner, minter, user;
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

  beforeEach(async function () {
    [owner, minter, user] = await ethers.getSigners();
    const DCarbonToken = await ethers.getContractFactory("DCarbonToken");
    dcarbon = await DCarbonToken.deploy();
    await dcarbon.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await dcarbon.name()).to.equal("dLuz Carbon Credit");
      expect(await dcarbon.symbol()).to.equal("dCARBON");
    });

    it("Should grant admin and minter roles to deployer", async function () {
      const DEFAULT_ADMIN = ethers.ZeroHash;
      expect(await dcarbon.hasRole(DEFAULT_ADMIN, owner.address)).to.be.true;
      expect(await dcarbon.hasRole(MINTER_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint", async function () {
      const amount = ethers.parseEther("100"); // 100 tonnes CO2
      await dcarbon.mint(user.address, amount);
      expect(await dcarbon.balanceOf(user.address)).to.equal(amount);
    });

    it("Should reject minting from non-minter", async function () {
      const amount = ethers.parseEther("100");
      await expect(
        dcarbon.connect(user).mint(user.address, amount)
      ).to.be.revertedWithCustomError(dcarbon, "AccessControlUnauthorizedAccount");
    });

    it("Should allow admin to grant minter role", async function () {
      await dcarbon.grantRole(MINTER_ROLE, minter.address);
      expect(await dcarbon.hasRole(MINTER_ROLE, minter.address)).to.be.true;

      const amount = ethers.parseEther("50");
      await dcarbon.connect(minter).mint(user.address, amount);
      expect(await dcarbon.balanceOf(user.address)).to.equal(amount);
    });
  });

  describe("Retiring", function () {
    it("Should allow holder to retire credits", async function () {
      const amount = ethers.parseEther("100");
      await dcarbon.mint(user.address, amount);

      const retireAmount = ethers.parseEther("40");
      await expect(
        dcarbon.connect(user).retire(retireAmount, "2026 annual offset")
      )
        .to.emit(dcarbon, "CarbonRetired")
        .withArgs(user.address, retireAmount, "2026 annual offset");

      expect(await dcarbon.balanceOf(user.address)).to.equal(
        amount - retireAmount
      );
    });

    it("Should reject retiring more than balance", async function () {
      const amount = ethers.parseEther("100");
      await dcarbon.mint(user.address, amount);

      const tooMuch = ethers.parseEther("200");
      await expect(
        dcarbon.connect(user).retire(tooMuch, "overcommit")
      ).to.be.revertedWithCustomError(dcarbon, "ERC20InsufficientBalance");
    });
  });
});
