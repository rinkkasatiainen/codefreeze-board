#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for quiet flag
QUIET=false
if [[ "$1" == "--quiet" ]]; then
    QUIET=true
fi

# Initialize variables
failed_tests=()
total_tests=0
passed_tests=0

if [ "$QUIET" = false ]; then
    echo "🧪 Running tests for all cfb- packages..."
    echo "=========================================="
else
    echo "🧪 Running tests for all cfb- packages..."
fi

# Find all directories that start with 'cfb-'
for dir in cfb-*/; do
    if [ -d "$dir" ]; then
        package_name=$(basename "$dir")
        total_tests=$((total_tests + 1))
        
        # Check if package.json exists and has a test script
        if [ -f "$dir/package.json" ]; then
            if [ "$QUIET" = false ]; then
                echo -n "Testing $package_name... "
            fi
            
            # Run npm test in the directory
            if [ "$QUIET" = true ]; then
                # Quiet mode: suppress output
                cd "$dir" > /dev/null 2>&1
                npm run test > /dev/null 2>&1
                exit_code=$?
                cd .. > /dev/null 2>&1
            else
                # Detailed mode: capture output
                cd "$dir"
                output=$(npm run test 2>&1)
                exit_code=$?
                cd ..
            fi
            
            # Extract test stats from output if available
            test_stats=""
            if [ "$QUIET" = false ]; then
                # Look for pattern like "X passed, Y failed"
                if echo "$output" | grep -q '[0-9]\+ passed, [0-9]\+ failed'; then
                    test_stats=$(echo "$output" | grep -o '[0-9]\+ passed, [0-9]\+ failed' | tail -1)
                fi
                if echo "$output" | grep -q '[0-9]\+ passing ([0-9]\+'; then
                    passing=$(echo "$output" | grep '[0-9]\+ passing' | tail -1)
                    failing=$(echo "$output" | grep '[0-9]\+ failing' | tail -1 || echo "0 failing")
                    test_stats="${passing}, ${failing}"
                fi
            fi
            
            if [ $exit_code -eq 0 ]; then
                if [ "$QUIET" = true ]; then
                    echo -e "${GREEN}✅ $package_name${NC}"
                else
                    if [ -n "$test_stats" ]; then
                        echo -e "${GREEN}✅ PASSED${NC} (${YELLOW}$test_stats${NC})"
                    else
                        echo -e "${GREEN}✅ PASSED${NC}"
                    fi
                fi
                passed_tests=$((passed_tests + 1))
            else
                if [ "$QUIET" = true ]; then
                    echo -e "${RED}❌ $package_name${NC}"
                else
                    if [ -n "$test_stats" ]; then
                        echo -e "${RED}❌ FAILED${NC} ($test_stats)"
                    else
                        echo -e "${RED}❌ FAILED${NC}"
                    fi
                    echo -e "${YELLOW}Error output:${NC}"
                    echo "$output" | sed 's/^/  /'
                    echo ""
                fi
                failed_tests+=("$package_name")
            fi
        else
            if [ "$QUIET" = true ]; then
                echo -e "${YELLOW}⚠️  $package_name (no package.json)${NC}"
            else
                echo -e "${YELLOW}⚠️  No package.json found${NC}"
            fi
        fi
    fi
done

if [ "$QUIET" = false ]; then
    echo ""
    echo "=========================================="
    echo "📊 Test Results Summary:"
    echo "   Total packages: $total_tests"
    echo -e "   Passed: ${GREEN}$passed_tests${NC}"
    echo -e "   Failed: ${RED}${#failed_tests[@]}${NC}"
else
    echo ""
    echo "📊 Summary: $passed_tests/$total_tests passed"
fi

if [ ${#failed_tests[@]} -gt 0 ]; then
    if [ "$QUIET" = false ]; then
        echo ""
        echo -e "${RED}❌ Failed packages:${NC}"
        for package in "${failed_tests[@]}"; do
            echo "   - $package"
        done
        echo ""
        echo -e "${RED}Some tests failed! Please check the output above.${NC}"
    else
        echo -e "${RED}Failed: ${failed_tests[*]}${NC}"
    fi
    exit 1
else
    if [ "$QUIET" = false ]; then
        echo ""
        echo -e "${GREEN}🎉 All tests passed!${NC}"
    else
        echo -e "${GREEN}All tests passed!${NC}"
    fi
    exit 0
fi