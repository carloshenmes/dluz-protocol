const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonRegistry", function () {
  let registry, dcarbon, denergy, dluz;
  let owner, project, user;
  const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));

  beforeEach(async function () {
    [owner, project, user] = await ethers.getSigners();

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
      await dluz.getAddress()
    );
    await registry.waitForDeployment();

    const registryAddr = await registry.getAddress();
    await dcarbon.grantRole(MINTER_ROLE, registryAddr);
    await denergy.grantRole(MINTER_ROLE, registryAddr);
    await dluz.transferOwnership(registryAddr);
  });

  describe("Deployment", function () {
    it("Should store correct token addresses", async function () {
      expect(await registry.dCarbonMinter()).to.equal(await dcarbon.getAddress());
      expect(await registry.dCarbonBurnable()).to.equal(await dcarbon.getAddress());
      expect(await registry.dEnergyToken()).to.equal(await denergy.getAddress());
      expect(await registry.dLuzToken()).to.equal(await dluz.getAddress());
    });

    it("Should set deployer as owner", async function () {
      expect(await registry.owner()).to.equal(owner.address);
    });

    it("Should have default reward rate of 10", async function () {
      expect(await registry.dluzRewardRate()).to.equal(10);
    });

    it("Should revert if any token address is zero", async function () {
      const CarbonRegistry = await ethers.getContractFactory("CarbonRegistry");
      const a = await dcarbon.getAddress();
      const b = await denergy.getAddress();
      const c = await dluz.getAddress();

      await expect(
        CarbonRegistry.deploy(ethers.ZeroAddress, b, c)
      ).to.be.revertedWithCustomError(registry, "InvalidAddress");

      await expect(
        CarbonRegistry.deploy(a, ethers.ZeroAddress, c)
      ).to.be.revertedWithCustomError(registry, "InvalidAddress");

      await expect(
        CarbonRegistry.deploy(a, b, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(registry, "InvalidAddress");
    });
  });

  describe("registerCredit", function () {
    const tonnes = 100;
    const energyType = 0;
    const projectName = "Solar Farm Alpha";
    const country = "Brasil";
    const docHash = ethers.keccak256(ethers.toUtf8Bytes("certificate-001"));

    it("Should mint dCARBON and dENERGY to project wallet", async function () {
      await registry.registerCredit(project.address, tonnes, energyType, projectName, country, docHash);
      const expected = ethers.parseEther(tonnes.toString());
      expect(await dcarbon.balanceOf(project.address)).to.equal(expected);
      expect(await denergy.balanceOf(project.address)).to.equal(expected);
    });

    it("Should mint DLUZ reward to owner", async function () {
      const initialBalance = await dluz.balanceOf(owner.address);
      await registry.registerCredit(project.address, tonnes, energyType, projectName, country, docHash);
      const reward = ethers.parseEther((tonnes * 10).toString());
      expect(await dluz.balanceOf(owner.address)).to.equal(initialBalance + reward);
    });

    it("Should record credit correctly", async function () {
      await registry.registerCredit(project.address, tonnes, energyType, projectName, country, docHash);
      const credit = await registry.getCredit(0);
      expect(credit.id).to.equal(0);
      expect(credit.project).to.equal(project.address);
      expect(credit.tonnes).to.equal(tonnes);
      expect(credit.energyType).to.equal(energyType);
      expect(credit.projectName).to.equal(projectName);
      expect(credit.country).to.equal(country);
      expect(credit.documentHash).to.equal(docHash);
      expect(credit.active).to.be.true;
    });

    it("Should update counters", async function () {
      await registry.registerCredit(project.address, tonnes, energyType, projectName, country, docHash);
      expect(await registry.totalTonnesRegistered()).to.equal(tonnes);
      expect(await registry.totalCredits()).to.equal(1);
      expect(await registry.tonnesRegisteredBy(project.address)).to.equal(tonnes);
      const expectedReward = ethers.parseEther((tonnes * 10).toString());
      expect(await registry.totalDluzRewarded()).to.equal(expectedReward);
    });

    it("Should emit CreditRegistered event", async function () {
      await expect(
        registry.registerCredit(project.address, tonnes, energyType, projectName, country, docHash)
      ).to.emit(registry, "CreditRegistered");
    });

    it("Should revert if caller is not owner", async function () {
      await expect(
        registry.connect(user).registerCredit(project.address, tonnes, energyType, projectName, country, docHash)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });

    it("Should revert if project address is zero", async function () {
      await expect(
        registry.registerCredit(ethers.ZeroAddress, tonnes, energyType, projectName, country, docHash)
      ).to.be.revertedWithCustomError(registry, "InvalidAddress");
    });

    it("Should revert if tonnes is zero", async function () {
      await expect(
        registry.registerCredit(project.address, 0, energyType, projectName, country, docHash)
      ).to.be.revertedWithCustomError(registry, "ZeroAmount");
    });

    it("Should revert if projectName is empty", async function () {
      await expect(
        registry.registerCredit(project.address, tonnes, energyType, "", country, docHash)
      ).to.be.revertedWithCustomError(registry, "EmptyProjectName");
    });

    it("Should revert if country is empty", async function () {
      await expect(
        registry.registerCredit(project.address, tonnes, energyType, projectName, "", docHash)
      ).to.be.revertedWithCustomError(registry, "EmptyCountry");
    });

    it("Should revert if DLUZ supply is insufficient", async function () {
      await expect(
        registry.registerCredit(project.address, 7_000_001, energyType, projectName, country, docHash)
      ).to.be.revertedWithCustomError(registry, "InsufficientDluzSupply");
    });
  });

  describe("revokeCredit", function () {
    const docHash = ethers.keccak256(ethers.toUtf8Bytes("certificate-002"));

    beforeEach(async function () {
      await registry.registerCredit(project.address, 50, 1, "Wind Farm Beta", "Brasil", docHash);
    });

    it("Should mark credit as inactive", async function () {
      await registry.revokeCredit(0);
      const credit = await registry.getCredit(0);
      expect(credit.active).to.be.false;
    });

    it("Should emit CreditRevoked event", async function () {
      await expect(registry.revokeCredit(0))
        .to.emit(registry, "CreditRevoked");
    });

    it("Should revert if credit ID is invalid", async function () {
      await expect(
        registry.revokeCredit(999)
      ).to.be.revertedWithCustomError(registry, "InvalidCreditId");
    });

    it("Should revert if credit already revoked", async function () {
      await registry.revokeCredit(0);
      await expect(
        registry.revokeCredit(0)
      ).to.be.revertedWithCustomError(registry, "CreditAlreadyRevoked");
    });

    it("Should revert if caller is not owner", async function () {
      await expect(
        registry.connect(user).revokeCredit(0)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });
  });

  describe("retire", function () {
    const tonnes = 100;
    const tokenAmount = ethers.parseEther(tonnes.toString());
    const docHash = ethers.keccak256(ethers.toUtf8Bytes("certificate-003"));

    beforeEach(async function () {
      await registry.registerCredit(project.address, tonnes, 0, "Solar Farm", "Brasil", docHash);
      await dcarbon.connect(project).approve(await registry.getAddress(), tokenAmount);
    });

    it("Should burn dCARBON from caller", async function () {
      await registry.connect(project).retire(tokenAmount, "Offset 2026");
      expect(await dcarbon.balanceOf(project.address)).to.equal(0);
    });

    it("Should record retirement correctly", async function () {
      await registry.connect(project).retire(tokenAmount, "Offset 2026");
      const ret = await registry.getRetirement(0);
      expect(ret.retiree).to.equal(project.address);
      expect(ret.amount).to.equal(tokenAmount);
      expect(ret.reason).to.equal("Offset 2026");
    });

    it("Should update retirement counters", async function () {
      await registry.connect(project).retire(tokenAmount, "Offset 2026");
      expect(await registry.totalRetired()).to.equal(tokenAmount);
      expect(await registry.totalRetiredBy(project.address)).to.equal(tokenAmount);
      expect(await registry.totalRetirements()).to.equal(1);
    });

    it("Should emit CarbonRetired event", async function () {
      await expect(
        registry.connect(project).retire(tokenAmount, "Offset 2026")
      ).to.emit(registry, "CarbonRetired");
    });

    it("Should revert if amount is zero", async function () {
      await expect(
        registry.connect(project).retire(0, "Offset 2026")
      ).to.be.revertedWithCustomError(registry, "ZeroAmount");
    });

    it("Should revert if reason is empty", async function () {
      await expect(
        registry.connect(project).retire(tokenAmount, "")
      ).to.be.revertedWithCustomError(registry, "EmptyReason");
    });

    it("Should revert if caller has no dCARBON balance", async function () {
      await expect(
        registry.connect(user).retire(tokenAmount, "No tokens")
      ).to.be.reverted;
    });
  });

  describe("setDluzRewardRate", function () {
    it("Should update reward rate", async function () {
      await registry.setDluzRewardRate(20);
      expect(await registry.dluzRewardRate()).to.equal(20);
    });

    it("Should emit DluzRewardRateUpdated event", async function () {
      await expect(registry.setDluzRewardRate(20))
        .to.emit(registry, "DluzRewardRateUpdated")
        .withArgs(10, 20);
    });

    it("Should revert if caller is not owner", async function () {
      await expect(
        registry.connect(user).setDluzRewardRate(20)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pagination", function () {
    const docHash = ethers.keccak256(ethers.toUtf8Bytes("cert-page"));

    beforeEach(async function () {
      for (let i = 0; i < 5; i++) {
        await registry.registerCredit(project.address, 10, 0, `Project ${i}`, "Brasil", docHash);
      }
      const amount = ethers.parseEther("10");
      await dcarbon.connect(project).approve(await registry.getAddress(), amount * 2n);
      await registry.connect(project).retire(amount, "Retire 1");
      await registry.connect(project).retire(amount, "Retire 2");
    });

    it("Should paginate credits", async function () {
      const page = await registry.getCredits(1, 3);
      expect(page.length).to.equal(3);
      expect(page[0].projectName).to.equal("Project 1");
      expect(page[2].projectName).to.equal("Project 3");
    });

    it("Should return empty array if offset exceeds total", async function () {
      const page = await registry.getCredits(100, 10);
      expect(page.length).to.equal(0);
    });

    it("Should paginate retirements", async function () {
      const page = await registry.getRetirements(0, 10);
      expect(page.length).to.equal(2);
      expect(page[0].reason).to.equal("Retire 1");
      expect(page[1].reason).to.equal("Retire 2");
    });

    it("Should clamp limit when exceeding total credits", async function () {
      const page = await registry.getCredits(3, 100);
      expect(page.length).to.equal(2);
    });

    it("Should return exact page when limit fits within credits", async function () {
      const page = await registry.getCredits(0, 3);
      expect(page.length).to.equal(3);
    });

    it("Should clamp limit when exceeding total retirements", async function () {
      const page = await registry.getRetirements(1, 100);
      expect(page.length).to.equal(1);
    });

    it("Should return exact page when limit fits within retirements", async function () {
      const page = await registry.getRetirements(0, 1);
      expect(page.length).to.equal(1);
    });
    it("Should not clamp when offset+limit equals total credits", async function () {
      const page = await registry.getCredits(0, 2);
      expect(page.length).to.equal(2);
    });
    it("Should not clamp when offset+limit equals total retirements", async function () {
      const page = await registry.getRetirements(0, 2);
      expect(page.length).to.equal(2);
    });
  });
});
