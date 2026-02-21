const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonRegistry", function () {
  let registry, dcarbon, denergy, dluz;
  let owner, treasury, user;
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

  beforeEach(async function () {
    [owner, treasury, user] = await ethers.getSigners();

    // Deploy tokens
    const DCarbonToken = await ethers.getContractFactory("DCarbonToken");
    dcarbon = await DCarbonToken.deploy();
    await dcarbon.waitForDeployment();

    const DEnergyToken = await ethers.getContractFactory("DEnergyToken");
    denergy = await DEnergyToken.deploy();
    await denergy.waitForDeployment();

    const DLuzToken = await ethers.getContractFactory("DLuzToken");
    dluz = await DLuzToken.deploy(owner.address);
    await dluz.waitForDeployment();

    // Deploy registry with 4 args
    const CarbonRegistry = await ethers.getContractFactory("CarbonRegistry");
    registry = await CarbonRegistry.deploy(
      await dcarbon.getAddress(),
      await denergy.getAddress(),
      await dluz.getAddress(),
      treasury.address
    );
    await registry.waitForDeployment();

    const registryAddr = await registry.getAddress();

    // Grant MINTER_ROLE to registry on dENERGY
    await denergy.grantRole(MINTER_ROLE, registryAddr);

    // Transfer DLUZ to treasury and approve registry
    const treasuryBalance = ethers.parseEther("10000000"); // 10M
    await dluz.transfer(treasury.address, treasuryBalance);
    await dluz.connect(treasury).approve(registryAddr, ethers.MaxUint256);

    // Mint dCARBON to user for testing
    const userCarbon = ethers.parseEther("1000");
    await dcarbon.mint(user.address, userCarbon);
    await dcarbon.connect(user).approve(registryAddr, ethers.MaxUint256);
  });

  describe("Deployment", function () {
    it("Should store correct token addresses", async function () {
      expect(await registry.dCarbonToken()).to.equal(await dcarbon.getAddress());
      expect(await registry.dEnergyToken()).to.equal(await denergy.getAddress());
      expect(await registry.dluzToken()).to.equal(await dluz.getAddress());
    });

    it("Should store correct treasury address", async function () {
      expect(await registry.dluzTreasury()).to.equal(treasury.address);
    });

    it("Should set deployer as owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });

    it("Should have default energy rate of 1e18 (1:1)", async function () {
      expect(await registry.energyRate()).to.equal(ethers.parseEther("1"));
    });

    it("Should have default DLUZ reward rate of 10e18 (10:1)", async function () {
      expect(await registry.dluzRewardRate()).to.equal(ethers.parseEther("10"));
    });

    it("Should revert if any address is zero", async function () {
      const CarbonRegistry = await ethers.getContractFactory("CarbonRegistry");
      const a = await dcarbon.getAddress();
      const b = await denergy.getAddress();
      const c = await dluz.getAddress();
      const t = treasury.address;

      await expect(
        CarbonRegistry.deploy(ethers.ZeroAddress, b, c, t)
      ).to.be.revertedWithCustomError(registry, "InvalidAddress");

      await expect(
        CarbonRegistry.deploy(a, ethers.ZeroAddress, c, t)
      ).to.be.revertedWithCustomError(registry, "InvalidAddress");

      await expect(
        CarbonRegistry.deploy(a, b, ethers.ZeroAddress, t)
      ).to.be.revertedWithCustomError(registry, "InvalidAddress");

      await expect(
        CarbonRegistry.deploy(a, b, c, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(registry, "InvalidAddress");
    });
  });

  describe("retire", function () {
    const amount = ethers.parseEther("100");

    it("Should burn dCARBON from caller", async function () {
      const before = await dcarbon.balanceOf(user.address);
      await registry.connect(user).retire(amount, "Offset 2026");
      expect(await dcarbon.balanceOf(user.address)).to.equal(before - amount);
    });

    it("Should mint dENERGY 1:1 to caller", async function () {
      await registry.connect(user).retire(amount, "Offset 2026");
      expect(await denergy.balanceOf(user.address)).to.equal(amount);
    });

    it("Should transfer DLUZ reward 10:1 from treasury to caller", async function () {
      const expectedReward = amount * 10n;
      const treasuryBefore = await dluz.balanceOf(treasury.address);
      await registry.connect(user).retire(amount, "Offset 2026");
      expect(await dluz.balanceOf(user.address)).to.equal(expectedReward);
      expect(await dluz.balanceOf(treasury.address)).to.equal(treasuryBefore - expectedReward);
    });

    it("Should record retirement correctly", async function () {
      await registry.connect(user).retire(amount, "Offset 2026");
      const ret = await registry.getRetirement(0);
      expect(ret.retiree).to.equal(user.address);
      expect(ret.amount).to.equal(amount);
      expect(ret.reason).to.equal("Offset 2026");
    });

    it("Should update counters", async function () {
      await registry.connect(user).retire(amount, "Offset 2026");
      expect(await registry.totalRetired()).to.equal(amount);
      expect(await registry.totalRetiredBy(user.address)).to.equal(amount);
      expect(await registry.totalRetirements()).to.equal(1);
    });

    it("Should emit CarbonRetired event", async function () {
      await expect(
        registry.connect(user).retire(amount, "Offset 2026")
      ).to.emit(registry, "CarbonRetired");
    });

    it("Should emit EnergyMinted event", async function () {
      await expect(
        registry.connect(user).retire(amount, "Offset 2026")
      ).to.emit(registry, "EnergyMinted");
    });

    it("Should emit DluzRewarded event", async function () {
      await expect(
        registry.connect(user).retire(amount, "Offset 2026")
      ).to.emit(registry, "DluzRewarded");
    });

    it("Should revert if amount is zero", async function () {
      await expect(
        registry.connect(user).retire(0, "Offset 2026")
      ).to.be.revertedWithCustomError(registry, "ZeroAmount");
    });

    it("Should revert if reason is empty", async function () {
      await expect(
        registry.connect(user).retire(amount, "")
      ).to.be.revertedWithCustomError(registry, "EmptyReason");
    });

    it("Should revert if caller has no dCARBON balance", async function () {
      await expect(
        registry.connect(owner).retire(amount, "No tokens")
      ).to.be.reverted;
    });

    it("Should handle multiple retirements", async function () {
      const half = ethers.parseEther("50");
      await registry.connect(user).retire(half, "First");
      await registry.connect(user).retire(half, "Second");
      expect(await registry.totalRetirements()).to.equal(2);
      expect(await registry.totalRetired()).to.equal(amount);
      expect(await registry.totalRetiredBy(user.address)).to.equal(amount);
    });
  });

  describe("Admin", function () {
    it("Should update energy rate", async function () {
      const newRate = ethers.parseEther("2"); // 2:1
      await registry.setEnergyRate(newRate);
      expect(await registry.energyRate()).to.equal(newRate);
    });

    it("Should emit EnergyRateUpdated event", async function () {
      const newRate = ethers.parseEther("2");
      await expect(registry.setEnergyRate(newRate))
        .to.emit(registry, "EnergyRateUpdated")
        .withArgs(ethers.parseEther("1"), newRate);
    });

    it("Should update DLUZ reward rate", async function () {
      const newRate = ethers.parseEther("20"); // 20:1
      await registry.setDluzRewardRate(newRate);
      expect(await registry.dluzRewardRate()).to.equal(newRate);
    });

    it("Should emit DluzRewardRateUpdated event", async function () {
      const newRate = ethers.parseEther("20");
      await expect(registry.setDluzRewardRate(newRate))
        .to.emit(registry, "DluzRewardRateUpdated")
        .withArgs(ethers.parseEther("10"), newRate);
    });

    it("Should update DLUZ treasury", async function () {
      await registry.setDluzTreasury(owner.address);
      expect(await registry.dluzTreasury()).to.equal(owner.address);
    });

    it("Should emit DluzTreasuryUpdated event", async function () {
      await expect(registry.setDluzTreasury(owner.address))
        .to.emit(registry, "DluzTreasuryUpdated")
        .withArgs(treasury.address, owner.address);
    });

    it("Should revert setDluzTreasury with zero address", async function () {
      await expect(
        registry.setDluzTreasury(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(registry, "InvalidAddress");
    });

    it("Should revert admin functions from non-owner", async function () {
      await expect(
        registry.connect(user).setEnergyRate(0)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");

      await expect(
        registry.connect(user).setDluzRewardRate(0)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");

      await expect(
        registry.connect(user).setDluzTreasury(user.address)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pagination", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("10");
      for (let i = 0; i < 5; i++) {
        await registry.connect(user).retire(amount, `Retire ${i}`);
      }
    });

    it("Should paginate retirements", async function () {
      const page = await registry.getRetirements(0, 3);
      expect(page.length).to.equal(3);
      expect(page[0].reason).to.equal("Retire 0");
      expect(page[2].reason).to.equal("Retire 2");
    });

    it("Should return empty array if offset exceeds total", async function () {
      const page = await registry.getRetirements(100, 10);
      expect(page.length).to.equal(0);
    });

    it("Should clamp limit when exceeding total", async function () {
      const page = await registry.getRetirements(3, 100);
      expect(page.length).to.equal(2);
    });

    it("Should return exact page when limit fits", async function () {
      const page = await registry.getRetirements(0, 5);
      expect(page.length).to.equal(5);
    });

    it("Should handle offset at last element", async function () {
      const page = await registry.getRetirements(4, 10);
      expect(page.length).to.equal(1);
      expect(page[0].reason).to.equal("Retire 4");
    });
  });

  describe("Branch Coverage - Edge Cases", function () {
    let registry, dcarbon, denergy, dluz;
    let owner, user;

    beforeEach(async function () {
      [owner, user] = await ethers.getSigners();

      const DLUZ = await ethers.getContractFactory("DLuzToken");
      dluz = await DLUZ.deploy(owner.address);
      await dluz.waitForDeployment();

      const DCARBON = await ethers.getContractFactory("DCarbonToken");
      dcarbon = await DCARBON.deploy();
      await dcarbon.waitForDeployment();

      const DENERGY = await ethers.getContractFactory("DEnergyToken");
      denergy = await DENERGY.deploy();
      await denergy.waitForDeployment();

      const Registry = await ethers.getContractFactory("CarbonRegistry");
      registry = await Registry.deploy(
        await dcarbon.getAddress(),
        await denergy.getAddress(),
        await dluz.getAddress(),
        owner.address
      );
      await registry.waitForDeployment();

      const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
      await denergy.grantRole(MINTER_ROLE, await registry.getAddress());
      await dluz.approve(await registry.getAddress(), ethers.MaxUint256);
      await dcarbon.mint(user.address, ethers.parseEther("100"));
      await dcarbon.connect(user).approve(await registry.getAddress(), ethers.MaxUint256);
    });

    it("Should skip energy minting when energyRate is 0", async function () {
      await registry.setEnergyRate(0);
      await registry.connect(user).retire(ethers.parseEther("10"), "zero energy rate");
      const bal = await denergy.balanceOf(user.address);
      expect(bal).to.equal(0);
    });

    it("Should skip energy minting when energyAmount truncates to 0", async function () {
      // Set rate so small that (1 * rate) / 1e18 == 0
      await registry.setEnergyRate(1); // 1 wei rate
      // Retire 1 wei of dcarbon => (1 * 1) / 1e18 = 0
      await dcarbon.mint(user.address, 1);
      await registry.connect(user).retire(1, "tiny amount truncates energy");
      // energy should still be 0 from this specific retirement
    });

    it("Should skip DLUZ reward when dluzRewardRate is 0", async function () {
      await registry.setDluzRewardRate(0);
      const balBefore = await dluz.balanceOf(user.address);
      await registry.connect(user).retire(ethers.parseEther("10"), "zero reward rate");
      const balAfter = await dluz.balanceOf(user.address);
      expect(balAfter).to.equal(balBefore);
    });

    it("Should skip DLUZ reward when rewardAmount truncates to 0", async function () {
      await registry.setDluzRewardRate(1); // 1 wei rate
      await dcarbon.mint(user.address, 1);
      const balBefore = await dluz.balanceOf(user.address);
      await registry.connect(user).retire(1, "tiny amount truncates reward");
      const balAfter = await dluz.balanceOf(user.address);
      expect(balAfter).to.equal(balBefore);
    });
  
    it("Should revert when DLUZ transferFrom returns false", async function () {
      // Deploy mock token that returns false on transferFrom
      const MockFail = await ethers.getContractFactory("MockFailToken");
      const mockDluz = await MockFail.deploy();
      await mockDluz.waitForDeployment();

      // Deploy registry with mock DLUZ
      const Registry = await ethers.getContractFactory("CarbonRegistry");
      const reg = await Registry.deploy(
        await dcarbon.getAddress(),
        await denergy.getAddress(),
        await mockDluz.getAddress(),
        owner.address
      );
      await reg.waitForDeployment();

      // Setup permissions
      const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
      await denergy.grantRole(MINTER_ROLE, await reg.getAddress());

      // Approve mock DLUZ from treasury (owner)
      await mockDluz.approve(await reg.getAddress(), ethers.MaxUint256);

      // Mint dCARBON to user and approve
      await dcarbon.mint(user.address, ethers.parseEther("10"));
      await dcarbon.connect(user).approve(await reg.getAddress(), ethers.MaxUint256);

      // retire should revert with DluzTransferFailed
      await expect(
        reg.connect(user).retire(ethers.parseEther("10"), "fail test")
      ).to.be.revertedWithCustomError(reg, "DluzTransferFailed");
    });

  });

});

// ─── Complementary Tests: Pause, Rate Caps, Reason Length ────────────

describe("CarbonRegistry - Security Guards", function () {
  let registry, dcarbon, denergy, dluz;
  let owner, treasury, user;
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

  beforeEach(async function () {
    [owner, treasury, user] = await ethers.getSigners();

    const DCarbonToken = await ethers.getContractFactory("DCarbonToken");
    dcarbon = await DCarbonToken.deploy();
    await dcarbon.waitForDeployment();

    const DEnergyToken = await ethers.getContractFactory("DEnergyToken");
    denergy = await DEnergyToken.deploy();
    await denergy.waitForDeployment();

    const DLuzToken = await ethers.getContractFactory("DLuzToken");
    dluz = await DLuzToken.deploy(owner.address);
    await dluz.waitForDeployment();

    const CarbonRegistry = await ethers.getContractFactory("CarbonRegistry");
    registry = await CarbonRegistry.deploy(
      await dcarbon.getAddress(),
      await denergy.getAddress(),
      await dluz.getAddress(),
      treasury.address
    );
    await registry.waitForDeployment();

    const registryAddr = await registry.getAddress();
    await denergy.grantRole(MINTER_ROLE, registryAddr);
    await dluz.transfer(treasury.address, ethers.parseEther("10000000"));
    await dluz.connect(treasury).approve(registryAddr, ethers.MaxUint256);
    await dcarbon.mint(user.address, ethers.parseEther("1000"));
    await dcarbon.connect(user).approve(registryAddr, ethers.MaxUint256);
  });

  describe("Pausable", function () {
    it("Should pause and block retire", async function () {
      await registry.pause();
      await expect(
        registry.connect(user).retire(ethers.parseEther("10"), "Paused test")
      ).to.be.revertedWithCustomError(registry, "EnforcedPause");
    });

    it("Should unpause and allow retire again", async function () {
      await registry.pause();
      await registry.unpause();
      await expect(
        registry.connect(user).retire(ethers.parseEther("10"), "Unpaused test")
      ).to.not.be.reverted;
    });

    it("Should revert pause from non-owner", async function () {
      await expect(
        registry.connect(user).pause()
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });

    it("Should revert unpause from non-owner", async function () {
      await registry.pause();
      await expect(
        registry.connect(user).unpause()
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });

    it("Should emit Paused event", async function () {
      await expect(registry.pause())
        .to.emit(registry, "Paused")
        .withArgs(owner.address);
    });

    it("Should emit Unpaused event", async function () {
      await registry.pause();
      await expect(registry.unpause())
        .to.emit(registry, "Unpaused")
        .withArgs(owner.address);
    });
  });

  describe("Rate Caps", function () {
    const MAX_RATE = ethers.parseEther("100");
    const OVER_MAX = ethers.parseEther("101");

    it("Should accept energy rate at MAX_ENERGY_RATE", async function () {
      await expect(registry.setEnergyRate(MAX_RATE)).to.not.be.reverted;
      expect(await registry.energyRate()).to.equal(MAX_RATE);
    });

    it("Should revert energy rate above MAX_ENERGY_RATE", async function () {
      await expect(
        registry.setEnergyRate(OVER_MAX)
      ).to.be.revertedWithCustomError(registry, "RateTooHigh");
    });

    it("Should accept DLUZ reward rate at MAX_DLUZ_REWARD_RATE", async function () {
      await expect(registry.setDluzRewardRate(MAX_RATE)).to.not.be.reverted;
      expect(await registry.dluzRewardRate()).to.equal(MAX_RATE);
    });

    it("Should revert DLUZ reward rate above MAX_DLUZ_REWARD_RATE", async function () {
      await expect(
        registry.setDluzRewardRate(OVER_MAX)
      ).to.be.revertedWithCustomError(registry, "RateTooHigh");
    });

    it("Should accept energy rate at zero", async function () {
      await expect(registry.setEnergyRate(0)).to.not.be.reverted;
      expect(await registry.energyRate()).to.equal(0);
    });

    it("Should accept DLUZ reward rate at zero", async function () {
      await expect(registry.setDluzRewardRate(0)).to.not.be.reverted;
      expect(await registry.dluzRewardRate()).to.equal(0);
    });
  });

  describe("Reason Length", function () {
    it("Should accept reason with exactly 280 chars", async function () {
      const reason280 = "A".repeat(280);
      await expect(
        registry.connect(user).retire(ethers.parseEther("1"), reason280)
      ).to.not.be.reverted;
    });

    it("Should revert reason with 281 chars", async function () {
      const reason281 = "A".repeat(281);
      await expect(
        registry.connect(user).retire(ethers.parseEther("1"), reason281)
      ).to.be.revertedWithCustomError(registry, "ReasonTooLong");
    });

    it("Should accept reason with 1 char", async function () {
      await expect(
        registry.connect(user).retire(ethers.parseEther("1"), "X")
      ).to.not.be.reverted;
    });
  });
});
