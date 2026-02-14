const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEnergyToken", function () {
  let denergy, owner, minter, user;
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

  beforeEach(async function () {
    [owner, minter, user] = await ethers.getSigners();
    const DEnergyToken = await ethers.getContractFactory("DEnergyToken");
    denergy = await DEnergyToken.deploy();
    await denergy.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await denergy.name()).to.equal("dLuz Renewable Energy");
      expect(await denergy.symbol()).to.equal("dENERGY");
    });

    it("Should grant admin and minter roles to deployer", async function () {
      const DEFAULT_ADMIN = ethers.ZeroHash;
      expect(await denergy.hasRole(DEFAULT_ADMIN, owner.address)).to.be.true;
      expect(await denergy.hasRole(MINTER_ROLE, owner.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint", async function () {
      const amount = ethers.parseEther("500"); // 500 MWh
      await denergy.mint(user.address, amount);
      expect(await denergy.balanceOf(user.address)).to.equal(amount);
    });

    it("Should reject minting from non-minter", async function () {
      const amount = ethers.parseEther("500");
      await expect(
        denergy.connect(user).mint(user.address, amount)
      ).to.be.revertedWithCustomError(denergy, "AccessControlUnauthorizedAccount");
    });

    it("Should allow admin to grant minter role", async function () {
      await denergy.grantRole(MINTER_ROLE, minter.address);
      expect(await denergy.hasRole(MINTER_ROLE, minter.address)).to.be.true;

      const amount = ethers.parseEther("200");
      await denergy.connect(minter).mint(user.address, amount);
      expect(await denergy.balanceOf(user.address)).to.equal(amount);
    });
  });

  describe("Redeeming", function () {
    it("Should allow holder to redeem RECs", async function () {
      const amount = ethers.parseEther("500");
      await denergy.mint(user.address, amount);

      const redeemAmount = ethers.parseEther("150");
      await expect(
        denergy.connect(user).redeem(redeemAmount, "Q1 2026 compliance")
      )
        .to.emit(denergy, "EnergyRedeemed")
        .withArgs(user.address, redeemAmount, "Q1 2026 compliance");

      expect(await denergy.balanceOf(user.address)).to.equal(
        amount - redeemAmount
      );
    });

    it("Should reject redeeming more than balance", async function () {
      const amount = ethers.parseEther("500");
      await denergy.mint(user.address, amount);

      const tooMuch = ethers.parseEther("1000");
      await expect(
        denergy.connect(user).redeem(tooMuch, "overcommit")
      ).to.be.revertedWithCustomError(denergy, "ERC20InsufficientBalance");
    });
  });
});
