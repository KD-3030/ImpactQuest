const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ImpactQuest Contract Tests", function () {
  let impactQuest;
  let owner;
  let oracle;
  let user1;
  let user2;

  // Quest IDs for testing
  const BEACH_CLEANUP_ID = 1;
  const TREE_PLANTING_ID = 2;

  beforeEach(async function () {
    // Get signers
    [owner, oracle, user1, user2] = await ethers.getSigners();

    // Deploy contract
    const ImpactQuest = await ethers.getContractFactory("ImpactQuest");
    impactQuest = await ImpactQuest.deploy(oracle.address);
    await impactQuest.waitForDeployment();

    // Create test quests
    await impactQuest.createQuest(
      "Beach Cleanup",
      "Clean up beach litter",
      ethers.parseEther("10"), // 10 IMP tokens
      10, // 10 impact points
      86400, // 24 hour cooldown
      0, // Environmental category
      ethers.parseEther("2") // 2 IMP creator reward per completion
    );

    await impactQuest.createQuest(
      "Tree Planting",
      "Plant a tree in your community",
      ethers.parseEther("25"), // 25 IMP tokens
      25, // 25 impact points
      172800, // 48 hour cooldown
      0, // Environmental category
      ethers.parseEther("5") // 5 IMP creator reward per completion
    );
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await impactQuest.owner()).to.equal(owner.address);
    });

    it("Should set the right oracle address", async function () {
      expect(await impactQuest.oracleAddress()).to.equal(oracle.address);
    });

    it("Should have correct token name and symbol", async function () {
      expect(await impactQuest.name()).to.equal("ImpactQuest Token");
      expect(await impactQuest.symbol()).to.equal("IMP");
    });
  });

  describe("User Registration", function () {
    it("Should allow user to join ImpactQuest", async function () {
      await impactQuest.connect(user1).joinImpactQuest();

      const profile = await impactQuest.getUserProfile(user1.address);
      expect(profile.isActive).to.equal(true);
      expect(profile.questsCompleted).to.equal(0);
      expect(profile.totalImpactScore).to.equal(0);
    });

    it("Should emit UserJoined event", async function () {
      const tx = await impactQuest.connect(user1).joinImpactQuest();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(impactQuest, "UserJoined")
        .withArgs(user1.address, block.timestamp);
    });

    it("Should not allow double registration", async function () {
      await impactQuest.connect(user1).joinImpactQuest();
      
      await expect(
        impactQuest.connect(user1).joinImpactQuest()
      ).to.be.revertedWith("User already registered");
    });
  });

  describe("Quest Creation", function () {
    it("Should create quest with correct details", async function () {
      const quest = await impactQuest.getQuest(BEACH_CLEANUP_ID);
      
      expect(quest.id).to.equal(BEACH_CLEANUP_ID);
      expect(quest.name).to.equal("Beach Cleanup");
      expect(quest.rewardAmount).to.equal(ethers.parseEther("10"));
      expect(quest.impactScore).to.equal(10);
      expect(quest.isActive).to.equal(true);
    });

    it("Should allow anyone to create quests", async function () {
      const tx = await impactQuest.connect(user1).createQuest(
        "Test Quest",
        "Description",
        ethers.parseEther("5"),
        5,
        3600,
        0, // Environmental category
        ethers.parseEther("1") // 1 IMP creator reward
      );
      await tx.wait();
      
      const quest = await impactQuest.getQuest(3);
      expect(quest.creator).to.equal(user1.address);
      expect(quest.creatorRewardPerCompletion).to.equal(ethers.parseEther("1"));
    });

    it("Should increment quest IDs", async function () {
      const nextId = await impactQuest.nextQuestId();
      expect(nextId).to.equal(3); // Already created 2 quests in beforeEach
    });
  });

  describe("Quest Completion", function () {
    beforeEach(async function () {
      // Register user
      await impactQuest.connect(user1).joinImpactQuest();
    });

    it("Should complete quest and mint tokens", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof1"));
      
      await impactQuest.connect(oracle).completeQuest(
        user1.address,
        BEACH_CLEANUP_ID,
        proofHash
      );

      // Check token balance
      const balance = await impactQuest.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("10"));

      // Check profile updated
      const profile = await impactQuest.getUserProfile(user1.address);
      expect(profile.questsCompleted).to.equal(1);
      expect(profile.totalImpactScore).to.equal(10);
      expect(profile.level).to.equal(1); // Seedling level
    });

    it("Should emit QuestCompleted event with timestamp and hash", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof2"));
      
      const tx = await impactQuest.connect(oracle).completeQuest(
        user1.address,
        BEACH_CLEANUP_ID,
        proofHash
      );
      
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(impactQuest, "QuestCompleted")
        .withArgs(
          user1.address,
          BEACH_CLEANUP_ID,
          block.timestamp,
          proofHash,
          ethers.parseEther("10")
        );
    });

    it("Should reward quest creator when quest is completed", async function () {
      // Get initial balances
      const initialCreatorBalance = await impactQuest.balanceOf(owner.address);
      const initialUserBalance = await impactQuest.balanceOf(user1.address);
      
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("creator_reward_proof"));
      
      // Complete the quest (Beach Cleanup - creator reward is 2 IMP)
      const tx = await impactQuest.connect(oracle).completeQuest(
        user1.address,
        BEACH_CLEANUP_ID,
        proofHash
      );
      
      // Check balances after completion
      const finalCreatorBalance = await impactQuest.balanceOf(owner.address);
      const finalUserBalance = await impactQuest.balanceOf(user1.address);
      
      // User should receive quest reward (10 IMP)
      expect(finalUserBalance - initialUserBalance).to.equal(ethers.parseEther("10"));
      
      // Creator should receive creator reward (2 IMP)
      expect(finalCreatorBalance - initialCreatorBalance).to.equal(ethers.parseEther("2"));
      
      // Check CreatorRewarded event was emitted
      await expect(tx)
        .to.emit(impactQuest, "CreatorRewarded")
        .withArgs(
          owner.address,
          BEACH_CLEANUP_ID,
          ethers.parseEther("2"),
          1 // totalCompletions = 1
        );
      
      // Verify totalCompletions was incremented
      const quest = await impactQuest.getQuest(BEACH_CLEANUP_ID);
      expect(quest.totalCompletions).to.equal(1);
    });

    it("Should track multiple completions and reward creator each time", async function () {
      // Register second user
      await impactQuest.connect(user2).joinImpactQuest();
      
      const initialCreatorBalance = await impactQuest.balanceOf(owner.address);
      
      // First completion by user1
      const proofHash1 = ethers.keccak256(ethers.toUtf8Bytes("multi_proof_1"));
      await impactQuest.connect(oracle).completeQuest(
        user1.address,
        BEACH_CLEANUP_ID,
        proofHash1
      );
      
      // Wait for cooldown to pass
      await ethers.provider.send("evm_increaseTime", [86400]); // 24 hours
      await ethers.provider.send("evm_mine");
      
      // Second completion by user2
      const proofHash2 = ethers.keccak256(ethers.toUtf8Bytes("multi_proof_2"));
      await impactQuest.connect(oracle).completeQuest(
        user2.address,
        BEACH_CLEANUP_ID,
        proofHash2
      );
      
      const finalCreatorBalance = await impactQuest.balanceOf(owner.address);
      
      // Creator should receive 2 IMP × 2 completions = 4 IMP total
      expect(finalCreatorBalance - initialCreatorBalance).to.equal(ethers.parseEther("4"));
      
      // Verify totalCompletions
      const quest = await impactQuest.getQuest(BEACH_CLEANUP_ID);
      expect(quest.totalCompletions).to.equal(2);
    });

    it("Should prevent proof hash reuse (anti-replay)", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof3"));
      
      // Complete once
      await impactQuest.connect(oracle).completeQuest(
        user1.address,
        BEACH_CLEANUP_ID,
        proofHash
      );

      // Try to reuse same proof
      await expect(
        impactQuest.connect(oracle).completeQuest(
          user1.address,
          BEACH_CLEANUP_ID,
          proofHash
        )
      ).to.be.revertedWith("Proof already used");
    });

    it("Should only allow oracle to complete quests", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof4"));
      
      await expect(
        impactQuest.connect(user1).completeQuest(
          user1.address,
          BEACH_CLEANUP_ID,
          proofHash
        )
      ).to.be.revertedWith("Only oracle can call this");
    });

    it("Should enforce cooldown period", async function () {
      const proofHash1 = ethers.keccak256(ethers.toUtf8Bytes("proof5"));
      const proofHash2 = ethers.keccak256(ethers.toUtf8Bytes("proof6"));
      
      // Complete once
      await impactQuest.connect(oracle).completeQuest(
        user1.address,
        BEACH_CLEANUP_ID,
        proofHash1
      );

      // Try immediately again (should fail - 24hr cooldown)
      await expect(
        impactQuest.connect(oracle).completeQuest(
          user1.address,
          BEACH_CLEANUP_ID,
          proofHash2
        )
      ).to.be.revertedWith("Quest cooldown not expired");
    });

    it("Should not allow unregistered users to complete quests", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof7"));
      
      await expect(
        impactQuest.connect(oracle).completeQuest(
          user2.address, // user2 not registered
          BEACH_CLEANUP_ID,
          proofHash
        )
      ).to.be.revertedWith("User not registered");
    });
  });

  describe("Level Progression", function () {
    beforeEach(async function () {
      await impactQuest.connect(user1).joinImpactQuest();
    });

    it("Should progress from None to Seedling (10 points)", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("level1"));
      
      await impactQuest.connect(oracle).completeQuest(
        user1.address,
        BEACH_CLEANUP_ID, // 10 points
        proofHash
      );

      const level = await impactQuest.getUserLevelName(user1.address);
      expect(level).to.equal("Seedling");
    });

    it("Should emit LevelUp event", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("level2"));
      
      const tx = await impactQuest.connect(oracle).completeQuest(
        user1.address,
        BEACH_CLEANUP_ID,
        proofHash
      );
      
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(impactQuest, "LevelUp")
        .withArgs(user1.address, 0, 1, block.timestamp); // None -> Seedling
    });

    it("Should progress to Sprout (50 points)", async function () {
      // Complete Beach Cleanup (10 pts) twice
      await impactQuest.connect(oracle).completeQuest(
        user1.address,
        BEACH_CLEANUP_ID,
        ethers.keccak256(ethers.toUtf8Bytes("sprout1"))
      );

      // Fast forward time to pass cooldown
      await time.increase(86401); // 24 hours + 1 second

      await impactQuest.connect(oracle).completeQuest(
        user1.address,
        BEACH_CLEANUP_ID,
        ethers.keccak256(ethers.toUtf8Bytes("sprout2"))
      );

      // Complete Tree Planting (25 pts)
      await impactQuest.connect(oracle).completeQuest(
        user1.address,
        TREE_PLANTING_ID,
        ethers.keccak256(ethers.toUtf8Bytes("sprout3"))
      );

      // Total: 10 + 10 + 25 = 45 points (still Seedling, need 50)
      let level = await impactQuest.getUserLevelName(user1.address);
      expect(level).to.equal("Seedling");

      // Fast forward and do one more
      await time.increase(172801); // 48 hours for tree planting cooldown

      await impactQuest.connect(oracle).completeQuest(
        user1.address,
        TREE_PLANTING_ID,
        ethers.keccak256(ethers.toUtf8Bytes("sprout4"))
      );

      // Total: 45 + 25 = 70 points (Sprout!)
      level = await impactQuest.getUserLevelName(user1.address);
      expect(level).to.equal("Sprout");
    });
  });

  describe("Cooldown System", function () {
    beforeEach(async function () {
      await impactQuest.connect(user1).joinImpactQuest();
    });

    it("Should check canCompleteQuest correctly", async function () {
      // Can complete initially
      let canComplete = await impactQuest.canCompleteQuest(
        user1.address,
        BEACH_CLEANUP_ID
      );
      expect(canComplete).to.equal(true);

      // Complete quest
      await impactQuest.connect(oracle).completeQuest(
        user1.address,
        BEACH_CLEANUP_ID,
        ethers.keccak256(ethers.toUtf8Bytes("cooldown1"))
      );

      // Can't complete immediately
      canComplete = await impactQuest.canCompleteQuest(
        user1.address,
        BEACH_CLEANUP_ID
      );
      expect(canComplete).to.equal(false);

      // Fast forward past cooldown
      await time.increase(86401);

      // Can complete again
      canComplete = await impactQuest.canCompleteQuest(
        user1.address,
        BEACH_CLEANUP_ID
      );
      expect(canComplete).to.equal(true);
    });
  });

  describe("Completion History", function () {
    beforeEach(async function () {
      await impactQuest.connect(user1).joinImpactQuest();
    });

    it("Should record completion history", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("history1"));
      
      await impactQuest.connect(oracle).completeQuest(
        user1.address,
        BEACH_CLEANUP_ID,
        proofHash
      );

      const totalCompletions = await impactQuest.getTotalCompletions();
      expect(totalCompletions).to.equal(1);

      const completion = await impactQuest.getCompletion(0);
      expect(completion.questId).to.equal(BEACH_CLEANUP_ID);
      expect(completion.user).to.equal(user1.address);
      expect(completion.proofHash).to.equal(proofHash);
      expect(completion.verified).to.equal(true);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to deactivate quest", async function () {
      await impactQuest.setQuestActive(BEACH_CLEANUP_ID, false);
      
      const quest = await impactQuest.getQuest(BEACH_CLEANUP_ID);
      expect(quest.isActive).to.equal(false);
    });

    it("Should prevent completing inactive quests", async function () {
      await impactQuest.connect(user1).joinImpactQuest();
      await impactQuest.setQuestActive(BEACH_CLEANUP_ID, false);
      
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("inactive1"));
      
      await expect(
        impactQuest.connect(oracle).completeQuest(
          user1.address,
          BEACH_CLEANUP_ID,
          proofHash
        )
      ).to.be.revertedWith("Quest is not active");
    });

    it("Should allow owner to change oracle address", async function () {
      const newOracle = user2.address;
      
      await impactQuest.setOracleAddress(newOracle);
      
      expect(await impactQuest.oracleAddress()).to.equal(newOracle);
    });

    it("Should only allow owner to change oracle", async function () {
      await expect(
        impactQuest.connect(user1).setOracleAddress(user2.address)
      ).to.be.revertedWithCustomError(impactQuest, "OwnableUnauthorizedAccount");
    });
  });

  describe("Quest Categories", function () {
    it("Should create quest with correct category", async function () {
      const quest = await impactQuest.getQuest(BEACH_CLEANUP_ID);
      expect(quest.category).to.equal(0); // Environmental
    });

    it("Should filter quests by category", async function () {
      // Both quests are Environmental (category 0)
      const envQuests = await impactQuest.getQuestsByCategory(0);
      expect(envQuests.length).to.equal(2);
      expect(envQuests[0]).to.equal(BEACH_CLEANUP_ID);
      expect(envQuests[1]).to.equal(TREE_PLANTING_ID);
    });

    it("Should get only active quests by category", async function () {
      // Deactivate one quest
      await impactQuest.setQuestActive(BEACH_CLEANUP_ID, false);
      
      const activeEnvQuests = await impactQuest.getActiveQuestsByCategory(0);
      expect(activeEnvQuests.length).to.equal(1);
      expect(activeEnvQuests[0]).to.equal(TREE_PLANTING_ID);
    });

    it("Should return correct category name", async function () {
      expect(await impactQuest.getCategoryName(0)).to.equal("Environmental");
      expect(await impactQuest.getCategoryName(1)).to.equal("Community Service");
      expect(await impactQuest.getCategoryName(2)).to.equal("Education");
      expect(await impactQuest.getCategoryName(3)).to.equal("Waste Reduction");
      expect(await impactQuest.getCategoryName(4)).to.equal("Sustainability");
    });

    it("Should create quests in different categories", async function () {
      // Create a Community Service quest
      await impactQuest.createQuest(
        "Volunteer Work",
        "Help at local shelter",
        ethers.parseEther("20"),
        20,
        86400,
        1, // CommunityService
        ethers.parseEther("3") // Creator reward per completion
      );

      const communityQuests = await impactQuest.getQuestsByCategory(1);
      expect(communityQuests.length).to.equal(1);
    });

    it("Should track user completions by category", async function () {
      await impactQuest.connect(user1).joinImpactQuest();
      
      // Complete environmental quest
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("category1"));
      await impactQuest.connect(oracle).completeQuest(
        user1.address,
        BEACH_CLEANUP_ID,
        proofHash
      );

      const envCount = await impactQuest.getUserQuestsByCategory(
        user1.address,
        0 // Environmental
      );
      expect(envCount).to.equal(1);
    });
  });
});

// Helper to get current block timestamp
const time = {
  latest: async () => {
    const block = await ethers.provider.getBlock('latest');
    return block.timestamp;
  },
  increase: async (seconds) => {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine");
  }
};
