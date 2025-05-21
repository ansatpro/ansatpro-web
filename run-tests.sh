#!/bin/bash
# Script to run all tests and generate a coverage report for ANSAT Pro

# Set environment variables for testing
export NODE_ENV=test

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}    ANSAT Pro Test Runner and Coverage      ${NC}"
echo -e "${BLUE}==============================================${NC}"

# Create test results directory if it doesn't exist
mkdir -p test-results

echo -e "${YELLOW}Running Unit Tests...${NC}"
npx vitest run --config vitest.unit.config.js --reporter=verbose

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Unit Tests Passed!${NC}"
else
  echo -e "${RED}Unit Tests Failed!${NC}"
  exit 1
fi

echo -e "${YELLOW}Running API Tests...${NC}"
npx vitest run --config vitest.api.config.js --reporter=verbose

if [ $? -eq 0 ]; then
  echo -e "${GREEN}API Tests Passed!${NC}"
else
  echo -e "${RED}API Tests Failed!${NC}"
  exit 1
fi

echo -e "${YELLOW}Running End-to-End Tests...${NC}"
# Note: You may need to have a development server running for E2E tests
npx vitest run --config vitest.e2e.config.js --reporter=verbose

if [ $? -eq 0 ]; then
  echo -e "${GREEN}E2E Tests Passed!${NC}"
else
  echo -e "${RED}E2E Tests Failed!${NC}"
  exit 1
fi

echo -e "${YELLOW}Generating Coverage Report...${NC}"
npx vitest run --coverage --config vitest.unit.config.js

echo -e "${GREEN}All tests completed!${NC}"
echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}    Test Results Summary                     ${NC}"
echo -e "${BLUE}==============================================${NC}"
echo -e "${YELLOW}Coverage report available at: coverage/index.html${NC}"
echo -e "${YELLOW}Open the report with: open coverage/index.html${NC}"
