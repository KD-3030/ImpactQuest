// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ImpactQuest
 * @dev A gamified impact tracking system on Celo blockchain
 * Features:
 * - ERC20 IMP tokens for quest rewards
 * - Soulbound reputation levels (non-transferable)
 * - AI-verified quest completion with timestamps
 * - Progressive evolution system (Seedling → Sprout → Sapling → Tree)
 */
contract ImpactQuest is ERC20, Ownable, ReentrancyGuard {
    
    // ============ Structs ============
    
    enum UserLevel { None, Seedling, Sprout, Sapling, Tree }
    
    enum QuestCategory { 
        Environmental,      // Beach cleanups, tree planting
        CommunityService,   // Volunteering, helping neighbors
        Education,          // Teaching, workshops
        WasteReduction,     // Recycling, composting
        Sustainability      // Energy saving, water conservation
    }
    
    struct UserProfile {
        UserLevel level;
        uint256 totalImpactScore;
        uint256 questsCompleted;
        uint256 lastQuestTimestamp;
        uint256 joinedTimestamp;
        bool isActive;
    }
    
    struct QuestCompletion {
        uint256 questId;
        address user;
        uint256 timestamp;
        bytes32 proofHash; // Hash of the AI verification proof
        uint256 rewardAmount;
        bool verified;
    }
    
    struct Quest {
        uint256 id;
        string name;
        string description;
        uint256 rewardAmount;
        uint256 impactScore;
        bool isActive;
        uint256 cooldownPeriod; // Minimum time between completions (in seconds)
        QuestCategory category; // Quest category for filtering
        address creator; // Quest creator address
        uint256 creatorRewardPerCompletion; // Tokens creator gets per completion
        uint256 totalCompletions; // Track completions for creator rewards
    }
    
    enum RewardTransactionType {
        QuestCompletion,
        StageUpgrade,
        CreatorReward,
        Redemption,
        RedemptionRefund
    }
    
    struct RewardTransaction {
        uint256 id;
        address user;
        RewardTransactionType transactionType;
        int256 amount; // Positive for earning, negative for spending
        uint256 questId; // 0 if not quest-related
        string description;
        uint256 timestamp;
        UserLevel previousLevel; // For stage upgrades
        UserLevel newLevel; // For stage upgrades
    }
    
    // ============ State Variables ============
    
    mapping(address => UserProfile) public userProfiles;
    mapping(address => mapping(uint256 => uint256)) public lastQuestCompletionTime;
    mapping(uint256 => Quest) public quests;
    mapping(bytes32 => bool) public usedProofHashes; // Prevent proof replay attacks
    
    QuestCompletion[] public completionHistory;
    RewardTransaction[] public rewardTransactions;
    
    // User-specific transaction tracking
    mapping(address => uint256[]) private userTransactionIds;
    
    // Category tracking - for efficient filtering
    mapping(QuestCategory => uint256[]) private questsByCategory;
    
    uint256 public nextQuestId = 1;
    uint256 public nextTransactionId = 1;
    uint256 public constant TOKENS_PER_QUEST = 10 * 10**18; // 10 IMP tokens
    
    // Level thresholds (impact score required to reach each level)
    uint256 public constant SEEDLING_THRESHOLD = 10;
    uint256 public constant SPROUT_THRESHOLD = 50;
    uint256 public constant SAPLING_THRESHOLD = 150;
    uint256 public constant TREE_THRESHOLD = 500;
    
    // Oracle address (your backend that verifies AI proofs)
    address public oracleAddress;
    
    // ============ Events ============
    
    event UserJoined(address indexed user, uint256 timestamp);
    event QuestCompleted(
        address indexed user,
        uint256 indexed questId,
        uint256 timestamp,
        bytes32 proofHash,
        uint256 rewardAmount
    );
    event CreatorRewarded(
        address indexed creator,
        uint256 indexed questId,
        uint256 rewardAmount,
        uint256 totalCompletions
    );
    event LevelUp(
        address indexed user,
        UserLevel oldLevel,
        UserLevel newLevel,
        uint256 timestamp
    );
    event QuestCreated(
        uint256 indexed questId,
        string name,
        uint256 rewardAmount,
        uint256 impactScore
    );
    event QuestUpdated(uint256 indexed questId, bool isActive);
    event OracleAddressUpdated(address indexed oldOracle, address indexed newOracle);
    event RewardTransactionRecorded(
        uint256 indexed transactionId,
        address indexed user,
        RewardTransactionType transactionType,
        int256 amount,
        uint256 timestamp
    );
    
    // ============ Modifiers ============
    
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Only oracle can call this");
        _;
    }
    
    modifier questExists(uint256 questId) {
        require(quests[questId].id != 0, "Quest does not exist");
        _;
    }
    
    modifier questActive(uint256 questId) {
        require(quests[questId].isActive, "Quest is not active");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _oracleAddress) ERC20("ImpactQuest Token", "IMP") Ownable(msg.sender) {
        require(_oracleAddress != address(0), "Invalid oracle address");
        oracleAddress = _oracleAddress;
    }
    
    // ============ User Functions ============
    
    /**
     * @dev Join ImpactQuest - creates user profile
     */
    function joinImpactQuest() external {
        require(!userProfiles[msg.sender].isActive, "User already registered");
        
        userProfiles[msg.sender] = UserProfile({
            level: UserLevel.None,
            totalImpactScore: 0,
            questsCompleted: 0,
            lastQuestTimestamp: 0,
            joinedTimestamp: block.timestamp,
            isActive: true
        });
        
        emit UserJoined(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Complete a quest (called by Oracle after AI verification)
     * @param user The user who completed the quest
     * @param questId The ID of the completed quest
     * @param proofHash Hash of the verification proof (image + AI response)
     */
    function completeQuest(
        address user,
        uint256 questId,
        bytes32 proofHash
    ) external onlyOracle questExists(questId) questActive(questId) nonReentrant {
        require(userProfiles[user].isActive, "User not registered");
        require(!usedProofHashes[proofHash], "Proof already used");
        require(proofHash != bytes32(0), "Invalid proof hash");
        
        Quest memory quest = quests[questId];
        
        // Check cooldown period
        uint256 lastCompletion = lastQuestCompletionTime[user][questId];
        require(
            block.timestamp >= lastCompletion + quest.cooldownPeriod,
            "Quest cooldown not expired"
        );
        
        // Mark proof as used
        usedProofHashes[proofHash] = true;
        
        // Update user profile
        UserProfile storage profile = userProfiles[user];
        UserLevel oldLevel = profile.level;
        
        profile.totalImpactScore += quest.impactScore;
        profile.questsCompleted += 1;
        profile.lastQuestTimestamp = block.timestamp;
        
        // Update last completion time
        lastQuestCompletionTime[user][questId] = block.timestamp;
        
        // Record completion
        completionHistory.push(QuestCompletion({
            questId: questId,
            user: user,
            timestamp: block.timestamp,
            proofHash: proofHash,
            rewardAmount: quest.rewardAmount,
            verified: true
        }));
        
        // Mint reward tokens
        _mint(user, quest.rewardAmount);
        
        // Record reward transaction for quest completion
        _recordTransaction(
            user,
            RewardTransactionType.QuestCompletion,
            int256(quest.rewardAmount),
            questId,
            string(abi.encodePacked("Completed quest: ", quest.name)),
            oldLevel,
            oldLevel
        );
        
        // Reward quest creator
        if (quest.creator != address(0) && quest.creatorRewardPerCompletion > 0) {
            _mint(quest.creator, quest.creatorRewardPerCompletion);
            quests[questId].totalCompletions += 1;
            
            // Record creator reward transaction
            _recordTransaction(
                quest.creator,
                RewardTransactionType.CreatorReward,
                int256(quest.creatorRewardPerCompletion),
                questId,
                string(abi.encodePacked("Creator reward for quest: ", quest.name)),
                userProfiles[quest.creator].level,
                userProfiles[quest.creator].level
            );
            
            emit CreatorRewarded(
                quest.creator,
                questId,
                quest.creatorRewardPerCompletion,
                quests[questId].totalCompletions
            );
        }
        
        // Check for level up
        UserLevel newLevel = _calculateLevel(profile.totalImpactScore);
        if (newLevel != oldLevel) {
            profile.level = newLevel;
            
            // Calculate stage upgrade bonus (10 tokens per level up)
            uint256 stageBonus = 10 * 10**18;
            _mint(user, stageBonus);
            
            // Record stage upgrade transaction
            _recordTransaction(
                user,
                RewardTransactionType.StageUpgrade,
                int256(stageBonus),
                0,
                string(abi.encodePacked("Level up bonus: ", _getLevelName(newLevel))),
                oldLevel,
                newLevel
            );
            
            emit LevelUp(user, oldLevel, newLevel, block.timestamp);
        }
        
        emit QuestCompleted(
            user,
            questId,
            block.timestamp,
            proofHash,
            quest.rewardAmount
        );
    }
    
    /**
     * @dev Get user's current profile
     */
    function getUserProfile(address user) external view returns (
        UserLevel level,
        uint256 totalImpactScore,
        uint256 questsCompleted,
        uint256 lastQuestTimestamp,
        uint256 joinedTimestamp,
        bool isActive
    ) {
        UserProfile memory profile = userProfiles[user];
        return (
            profile.level,
            profile.totalImpactScore,
            profile.questsCompleted,
            profile.lastQuestTimestamp,
            profile.joinedTimestamp,
            profile.isActive
        );
    }
    
    /**
     * @dev Get user's level name as string
     */
    function getUserLevelName(address user) external view returns (string memory) {
        UserLevel level = userProfiles[user].level;
        if (level == UserLevel.Tree) return "Tree";
        if (level == UserLevel.Sapling) return "Sapling";
        if (level == UserLevel.Sprout) return "Sprout";
        if (level == UserLevel.Seedling) return "Seedling";
        return "None";
    }
    
    /**
     * @dev Check if user can complete a specific quest (respects cooldown)
     */
    function canCompleteQuest(address user, uint256 questId) external view returns (bool) {
        if (!userProfiles[user].isActive) return false;
        if (!quests[questId].isActive) return false;
        
        uint256 lastCompletion = lastQuestCompletionTime[user][questId];
        uint256 cooldown = quests[questId].cooldownPeriod;
        
        return block.timestamp >= lastCompletion + cooldown;
    }
    
    /**
     * @dev Get total number of quest completions
     */
    function getTotalCompletions() external view returns (uint256) {
        return completionHistory.length;
    }
    
    /**
     * @dev Get completion details by index
     */
    function getCompletion(uint256 index) external view returns (
        uint256 questId,
        address user,
        uint256 timestamp,
        bytes32 proofHash,
        uint256 rewardAmount,
        bool verified
    ) {
        require(index < completionHistory.length, "Index out of bounds");
        QuestCompletion memory completion = completionHistory[index];
        return (
            completion.questId,
            completion.user,
            completion.timestamp,
            completion.proofHash,
            completion.rewardAmount,
            completion.verified
        );
    }
    
    // ============ Quest Management (Owner Only) ============
    
    /**
     * @dev Create a new quest
     */
    function createQuest(
        string memory name,
        string memory description,
        uint256 rewardAmount,
        uint256 impactScore,
        uint256 cooldownPeriod,
        QuestCategory category,
        uint256 creatorRewardPerCompletion
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Quest name required");
        require(rewardAmount > 0, "Reward must be positive");
        require(impactScore > 0, "Impact score must be positive");
        
        uint256 questId = nextQuestId++;
        
        quests[questId] = Quest({
            id: questId,
            name: name,
            description: description,
            rewardAmount: rewardAmount,
            impactScore: impactScore,
            isActive: true,
            cooldownPeriod: cooldownPeriod,
            category: category,
            creator: msg.sender,
            creatorRewardPerCompletion: creatorRewardPerCompletion,
            totalCompletions: 0
        });
        
        // Add to category mapping for filtering
        questsByCategory[category].push(questId);
        
        emit QuestCreated(questId, name, rewardAmount, impactScore);
        return questId;
    }
    
    /**
     * @dev Update quest active status
     */
    function setQuestActive(uint256 questId, bool isActive) external onlyOwner questExists(questId) {
        quests[questId].isActive = isActive;
        emit QuestUpdated(questId, isActive);
    }
    
    /**
     * @dev Get quest details
     */
    function getQuest(uint256 questId) external view returns (
        uint256 id,
        string memory name,
        string memory description,
        uint256 rewardAmount,
        uint256 impactScore,
        bool isActive,
        uint256 cooldownPeriod,
        QuestCategory category,
        address creator,
        uint256 creatorRewardPerCompletion,
        uint256 totalCompletions
    ) {
        Quest memory quest = quests[questId];
        return (
            quest.id,
            quest.name,
            quest.description,
            quest.rewardAmount,
            quest.impactScore,
            quest.isActive,
            quest.cooldownPeriod,
            quest.category,
            quest.creator,
            quest.creatorRewardPerCompletion,
            quest.totalCompletions
        );
    }
    
    // ============ Category Filtering ============
    
    /**
     * @dev Get all quest IDs in a specific category
     */
    function getQuestsByCategory(QuestCategory category) 
        external view returns (uint256[] memory) 
    {
        return questsByCategory[category];
    }
    
    /**
     * @dev Get only active quests in a specific category
     */
    function getActiveQuestsByCategory(QuestCategory category) 
        external view returns (uint256[] memory) 
    {
        uint256[] memory allQuests = questsByCategory[category];
        
        // Count active quests first
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allQuests.length; i++) {
            if (quests[allQuests[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create result array with only active quests
        uint256[] memory activeQuests = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < allQuests.length; i++) {
            if (quests[allQuests[i]].isActive) {
                activeQuests[currentIndex] = allQuests[i];
                currentIndex++;
            }
        }
        
        return activeQuests;
    }
    
    /**
     * @dev Get category name as string
     */
    function getCategoryName(QuestCategory category) external pure returns (string memory) {
        if (category == QuestCategory.Environmental) return "Environmental";
        if (category == QuestCategory.CommunityService) return "Community Service";
        if (category == QuestCategory.Education) return "Education";
        if (category == QuestCategory.WasteReduction) return "Waste Reduction";
        if (category == QuestCategory.Sustainability) return "Sustainability";
        return "Unknown";
    }
    
    /**
     * @dev Get user's quest count by category
     */
    function getUserQuestsByCategory(address user, QuestCategory category) 
        external view returns (uint256 count) 
    {
        uint256[] memory categoryQuests = questsByCategory[category];
        count = 0;
        
        for (uint256 i = 0; i < completionHistory.length; i++) {
            if (completionHistory[i].user == user) {
                // Check if this quest belongs to the category
                for (uint256 j = 0; j < categoryQuests.length; j++) {
                    if (completionHistory[i].questId == categoryQuests[j]) {
                        count++;
                        break;
                    }
                }
            }
        }
        
        return count;
    }
    
    // ============ Oracle Management ============
    
    /**
     * @dev Update oracle address (only owner)
     */
    function setOracleAddress(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        address oldOracle = oracleAddress;
        oracleAddress = newOracle;
        emit OracleAddressUpdated(oldOracle, newOracle);
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Calculate user level based on impact score
     */
    function _calculateLevel(uint256 impactScore) internal pure returns (UserLevel) {
        if (impactScore >= TREE_THRESHOLD) return UserLevel.Tree;
        if (impactScore >= SAPLING_THRESHOLD) return UserLevel.Sapling;
        if (impactScore >= SPROUT_THRESHOLD) return UserLevel.Sprout;
        if (impactScore >= SEEDLING_THRESHOLD) return UserLevel.Seedling;
        return UserLevel.None;
    }
    
    /**
     * @dev Record a reward transaction
     */
    function _recordTransaction(
        address user,
        RewardTransactionType transactionType,
        int256 amount,
        uint256 questId,
        string memory description,
        UserLevel previousLevel,
        UserLevel newLevel
    ) internal {
        uint256 transactionId = nextTransactionId++;
        
        rewardTransactions.push(RewardTransaction({
            id: transactionId,
            user: user,
            transactionType: transactionType,
            amount: amount,
            questId: questId,
            description: description,
            timestamp: block.timestamp,
            previousLevel: previousLevel,
            newLevel: newLevel
        }));
        
        // Track user's transaction IDs
        userTransactionIds[user].push(transactionId - 1); // Store array index
        
        emit RewardTransactionRecorded(
            transactionId,
            user,
            transactionType,
            amount,
            block.timestamp
        );
    }
    
    /**
     * @dev Get level name as string
     */
    function _getLevelName(UserLevel level) internal pure returns (string memory) {
        if (level == UserLevel.Tree) return "Tree";
        if (level == UserLevel.Sapling) return "Sapling";
        if (level == UserLevel.Sprout) return "Sprout";
        if (level == UserLevel.Seedling) return "Seedling";
        return "None";
    }
    
    // ============ Transaction Query Functions ============
    
    /**
     * @dev Get total number of reward transactions
     */
    function getTotalTransactions() external view returns (uint256) {
        return rewardTransactions.length;
    }
    
    /**
     * @dev Get transaction by ID
     */
    function getTransaction(uint256 transactionId) external view returns (
        uint256 id,
        address user,
        RewardTransactionType transactionType,
        int256 amount,
        uint256 questId,
        string memory description,
        uint256 timestamp,
        UserLevel previousLevel,
        UserLevel newLevel
    ) {
        require(transactionId > 0 && transactionId < nextTransactionId, "Invalid transaction ID");
        RewardTransaction memory txn = rewardTransactions[transactionId - 1];
        return (
            txn.id,
            txn.user,
            txn.transactionType,
            txn.amount,
            txn.questId,
            txn.description,
            txn.timestamp,
            txn.previousLevel,
            txn.newLevel
        );
    }
    
    /**
     * @dev Get all transaction IDs for a user
     */
    function getUserTransactionIds(address user) external view returns (uint256[] memory) {
        uint256[] memory indices = userTransactionIds[user];
        uint256[] memory ids = new uint256[](indices.length);
        
        for (uint256 i = 0; i < indices.length; i++) {
            ids[i] = rewardTransactions[indices[i]].id;
        }
        
        return ids;
    }
    
    /**
     * @dev Get user's transaction count
     */
    function getUserTransactionCount(address user) external view returns (uint256) {
        return userTransactionIds[user].length;
    }
    
    /**
     * @dev Get user's last N transactions
     */
    function getUserRecentTransactions(address user, uint256 count) 
        external view returns (RewardTransaction[] memory) 
    {
        uint256[] memory indices = userTransactionIds[user];
        uint256 resultCount = count > indices.length ? indices.length : count;
        
        RewardTransaction[] memory result = new RewardTransaction[](resultCount);
        
        // Get the last N transactions (most recent first)
        for (uint256 i = 0; i < resultCount; i++) {
            uint256 index = indices[indices.length - 1 - i];
            result[i] = rewardTransactions[index];
        }
        
        return result;
    }
    
    /**
     * @dev Record a redemption (spending tokens) - called by backend
     */
    address public treasury;

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    function recordRedemption(
        address user,
        uint256 tokensSpent,
        string memory shopName
    ) external payable onlyOracle nonReentrant {
        require(userProfiles[user].isActive, "User not registered");
        require(balanceOf(user) >= tokensSpent, "Insufficient token balance");
        require(msg.value > 0, "CELO payment required");
        require(treasury != address(0), "Treasury not set");

        // Burn the tokens
        _burn(user, tokensSpent);

        // Transfer CELO to treasury/shop
        (bool sent, ) = treasury.call{value: msg.value}("");
        require(sent, "CELO transfer failed");

        // Record negative transaction
        _recordTransaction(
            user,
            RewardTransactionType.Redemption,
            -int256(tokensSpent),
            0,
            string(abi.encodePacked("Redeemed at ", shopName)),
            userProfiles[user].level,
            userProfiles[user].level
        );
    }
    
    /**
     * @dev Record a redemption refund (tokens returned) - called by backend
     */
    function recordRedemptionRefund(
        address user,
        uint256 tokensRefunded,
        string memory reason
    ) external onlyOracle {
        require(userProfiles[user].isActive, "User not registered");
        
        // Mint the refunded tokens back
        _mint(user, tokensRefunded);
        
        // Record positive transaction
        _recordTransaction(
            user,
            RewardTransactionType.RedemptionRefund,
            int256(tokensRefunded),
            0,
            string(abi.encodePacked("Refund: ", reason)),
            userProfiles[user].level,
            userProfiles[user].level
        );
    }
    
    /**
     * @dev Override transfer to make tokens soulbound (non-transferable) - Optional
     * Comment out these functions if you want tokens to be transferable
     */
    /*
    function transfer(address, uint256) public pure override returns (bool) {
        revert("IMP tokens are soulbound and non-transferable");
    }
    
    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert("IMP tokens are soulbound and non-transferable");
    }
    */
}
