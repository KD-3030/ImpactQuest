#!/bin/bash
# API Endpoint Testing Script for ImpactQuest
# Run with: bash scripts/test-api.sh

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🧪 ImpactQuest API Testing Suite"
echo "================================"
echo ""

# Test 1: GET /api/quests - List all quests
echo -e "${BLUE}Test 1: GET /api/quests${NC}"
response=$(curl -s "$BASE_URL/api/quests")
count=$(echo "$response" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
if [ "$count" -gt 0 ]; then
  echo -e "${GREEN}✓ Success: Found $count quests${NC}"
else
  echo -e "${RED}✗ Failed: No quests returned${NC}"
fi
echo ""

# Test 2: GET /api/quests/[id] - Get single quest
echo -e "${BLUE}Test 2: GET /api/quests/[id]${NC}"
quest_id=$(echo "$response" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$quest_id" ]; then
  single_quest=$(curl -s "$BASE_URL/api/quests/$quest_id")
  quest_title=$(echo "$single_quest" | grep -o '"title":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$quest_title" ]; then
    echo -e "${GREEN}✓ Success: Fetched quest '$quest_title'${NC}"
  else
    echo -e "${RED}✗ Failed: Could not fetch quest${NC}"
  fi
else
  echo -e "${RED}✗ Failed: No quest ID available${NC}"
fi
echo ""

# Test 3: POST /api/quests - Create new quest
echo -e "${BLUE}Test 3: POST /api/quests - Create new quest${NC}"
new_quest=$(curl -s -X POST "$BASE_URL/api/quests" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Quest",
    "description": "This quest was created via API testing",
    "coordinates": [72.8777, 19.0760],
    "address": "Test Location, Mumbai",
    "category": "cleanup",
    "impactPoints": 25,
    "verificationPrompt": "Test verification prompt"
  }')

if echo "$new_quest" | grep -q '"success":true'; then
  new_quest_id=$(echo "$new_quest" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
  echo -e "${GREEN}✓ Success: Created quest with ID $new_quest_id${NC}"
else
  echo -e "${RED}✗ Failed: Could not create quest${NC}"
  echo "$new_quest" | head -3
fi
echo ""

# Test 4: PUT /api/quests/[id] - Update quest
if [ -n "$new_quest_id" ]; then
  echo -e "${BLUE}Test 4: PUT /api/quests/[id] - Update quest${NC}"
  update_response=$(curl -s -X PUT "$BASE_URL/api/quests/$new_quest_id" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Updated API Test Quest",
      "description": "This quest was updated via API testing",
      "location": {
        "type": "Point",
        "coordinates": [72.8777, 19.0760],
        "address": "Updated Location, Mumbai"
      },
      "category": "education",
      "impactPoints": 30,
      "verificationPrompt": "Updated verification prompt",
      "isActive": false
    }')
  
  if echo "$update_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Success: Updated quest${NC}"
  else
    echo -e "${RED}✗ Failed: Could not update quest${NC}"
  fi
  echo ""
fi

# Test 5: DELETE /api/quests/[id] - Delete quest
if [ -n "$new_quest_id" ]; then
  echo -e "${BLUE}Test 5: DELETE /api/quests/[id] - Delete quest${NC}"
  delete_response=$(curl -s -X DELETE "$BASE_URL/api/quests/$new_quest_id")
  
  if echo "$delete_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Success: Deleted quest${NC}"
  else
    echo -e "${RED}✗ Failed: Could not delete quest${NC}"
  fi
  echo ""
fi

# Test 6: GET /api/user/[address] - Get user stats
echo -e "${BLUE}Test 6: GET /api/user/[address] - Get user stats${NC}"
test_address="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
user_response=$(curl -s "$BASE_URL/api/user/$test_address")

if echo "$user_response" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Success: Fetched user stats${NC}"
  level=$(echo "$user_response" | grep -o '"level":[0-9]*' | grep -o '[0-9]*')
  points=$(echo "$user_response" | grep -o '"impactPoints":[0-9]*' | grep -o '[0-9]*')
  echo "  Level: ${level:-0}, Points: ${points:-0}"
else
  echo -e "${RED}✗ Failed: Could not fetch user stats${NC}"
fi
echo ""

# Test 7: POST /api/submit-proof - Submit quest completion
echo -e "${BLUE}Test 7: POST /api/submit-proof - Submit quest completion${NC}"
if [ -n "$quest_id" ]; then
  submit_response=$(curl -s -X POST "$BASE_URL/api/submit-proof" \
    -H "Content-Type: application/json" \
    -d "{
      \"walletAddress\": \"$test_address\",
      \"questId\": \"$quest_id\",
      \"imageData\": \"data:image/jpeg;base64,/9j/4AAQSkZJRg...\"
    }")
  
  if echo "$submit_response" | grep -q '"success":true'; then
    verified=$(echo "$submit_response" | grep -o '"verified":[a-z]*' | cut -d':' -f2)
    points_earned=$(echo "$submit_response" | grep -o '"pointsEarned":[0-9]*' | grep -o '[0-9]*')
    echo -e "${GREEN}✓ Success: Submitted proof (Verified: $verified, Points: $points_earned)${NC}"
  else
    echo -e "${RED}✗ Failed: Could not submit proof${NC}"
  fi
else
  echo -e "${RED}✗ Skipped: No quest ID available${NC}"
fi
echo ""

# Test 8: GET /api/admin/submissions - List all submissions
echo -e "${BLUE}Test 8: GET /api/admin/submissions - List all submissions${NC}"
submissions_response=$(curl -s "$BASE_URL/api/admin/submissions")

if echo "$submissions_response" | grep -q '"success":true'; then
  submission_count=$(echo "$submissions_response" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
  echo -e "${GREEN}✓ Success: Found ${submission_count:-0} submissions${NC}"
else
  echo -e "${RED}✗ Failed: Could not fetch submissions${NC}"
fi
echo ""

# Test 9: GET /api/admin/users - List all users
echo -e "${BLUE}Test 9: GET /api/admin/users - List all users${NC}"
users_response=$(curl -s "$BASE_URL/api/admin/users")

if echo "$users_response" | grep -q '"success":true'; then
  user_count=$(echo "$users_response" | grep -o '"users":\[[^]]*\]' | grep -o '"walletAddress"' | wc -l)
  total_points=$(echo "$users_response" | grep -o '"totalPoints":[0-9]*' | grep -o '[0-9]*')
  echo -e "${GREEN}✓ Success: Found ${user_count:-0} users, Total Points: ${total_points:-0}${NC}"
else
  echo -e "${RED}✗ Failed: Could not fetch users${NC}"
fi
echo ""

echo "================================"
echo "✅ API Testing Complete!"
echo ""
