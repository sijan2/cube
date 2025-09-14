#!/usr/bin/env python3
import os
import sys
import json
import requests
from datetime import datetime
from typing import Optional, Dict, List, Any
from fastmcp import FastMCP

mcp = FastMCP("LeetCode MCP Server")

class LeetCodeService:
    def __init__(self, site: str = "global"):
        self.site = site
        self.base_url = "https://leetcode.com" if site == "global" else "https://leetcode.cn"
        self.graphql_url = f"{self.base_url}/graphql/"
        self.session = requests.Session()
        
    def _make_request(self, query: str, variables: Dict = None) -> Dict:
        """Make GraphQL request to LeetCode"""
        payload = {
            "query": query,
            "variables": variables or {}
        }
        
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        }
        
        try:
            response = self.session.post(self.graphql_url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}

# Initialize LeetCode service
leetcode_service = LeetCodeService()

# LeetCode Problem Tools
@mcp.tool(description="Get today's LeetCode Daily Challenge problem")
def get_daily_challenge() -> dict:
    """Retrieves today's LeetCode Daily Challenge problem with complete details"""
    
    query = """
    query questionOfToday {
        activeDailyCodingChallengeQuestion {
            date
            question {
                questionId
                questionFrontendId
                title
                titleSlug
                difficulty
                content
                topicTags {
                    name
                    slug
                }
                exampleTestcases
                metaData
            }
        }
    }
    """
    
    result = leetcode_service._make_request(query)
    
    if "error" in result:
        return {"success": False, "error": result["error"]}
    
    try:
        daily_data = result["data"]["activeDailyCodingChallengeQuestion"]
        return {
            "success": True,
            "data": {
                "date": daily_data["date"],
                "problem": daily_data["question"]
            }
        }
    except Exception as e:
        return {"success": False, "error": f"Failed to parse daily challenge: {str(e)}"}

@mcp.tool(description="Get details about a specific LeetCode problem")
def get_problem(title_slug: str) -> dict:
    """Retrieves details about a specific LeetCode problem by its title slug"""
    
    query = """
    query getQuestionDetail($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
            questionId
            questionFrontendId
            title
            titleSlug
            content
            difficulty
            likes
            dislikes
            exampleTestcases
            topicTags {
                name
                slug
            }
            stats
            hints
            solution {
                id
                canSeeDetail
            }
            status
            sampleTestCase
            metaData
            judgerAvailable
            judgeType
            mysqlSchemas
            enableRunCode
            enableTestMode
            envInfo
            translatedContent
        }
    }
    """
    
    variables = {"titleSlug": title_slug}
    result = leetcode_service._make_request(query, variables)
    
    if "error" in result:
        return {"success": False, "error": result["error"]}
    
    try:
        problem_data = result["data"]["question"]
        if not problem_data:
            return {"success": False, "error": f"Problem '{title_slug}' not found"}
        
        return {
            "success": True,
            "data": problem_data
        }
    except Exception as e:
        return {"success": False, "error": f"Failed to parse problem: {str(e)}"}

@mcp.tool(description="Search LeetCode problems with filters")
def search_problems(
    category: Optional[str] = None,
    tags: Optional[str] = None, 
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> dict:
    """Search LeetCode problems with multiple filter criteria"""
    
    query = """
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
            categorySlug: $categorySlug
            limit: $limit
            skip: $skip
            filters: $filters
        ) {
            total: totalNum
            questions: data {
                acRate
                difficulty
                freqBar
                questionFrontendId
                isFavor
                paidOnly: isPaidOnly
                status
                title
                titleSlug
                topicTags {
                    name
                    id
                    slug
                }
                hasSolution
                hasVideoSolution
            }
        }
    }
    """
    
    # Build filters
    filters = {}
    if tags:
        filters["tags"] = tags.split(",")
    if difficulty:
        filters["difficulty"] = difficulty.upper()
    if search:
        filters["searchKeywords"] = search
    
    variables = {
        "categorySlug": category or "",
        "limit": limit,
        "skip": offset,
        "filters": filters if filters else {}
    }
    
    result = leetcode_service._make_request(query, variables)
    
    if "error" in result:
        return {"success": False, "error": result["error"]}
    
    try:
        problem_list = result["data"]["problemsetQuestionList"]
        return {
            "success": True,
            "data": {
                "total": problem_list["total"],
                "problems": problem_list["questions"]
            }
        }
    except Exception as e:
        return {"success": False, "error": f"Failed to parse search results: {str(e)}"}

# LeetCode User Tools
@mcp.tool(description="Get LeetCode user profile information")
def get_user_profile(username: str) -> dict:
    """Retrieves LeetCode user profile information"""
    
    query = """
    query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
            contestBadge {
                name
                expired
                hoverText
                icon
            }
            username
            githubUrl
            twitterUrl
            linkedinUrl
            profile {
                ranking
                userAvatar
                realName
                aboutMe
                school
                websites
                countryName
                company
                jobTitle
                skillTags
                postViewCount
                postViewCountDiff
                reputation
                reputationDiff
            }
            problemsSolvedBeatsStats {
                difficulty
                percentage
            }
            submissionCalendar
            submitStatsGlobal {
                acSubmissionNum {
                    difficulty
                    count
                    submissions
                }
            }
        }
    }
    """
    
    variables = {"username": username}
    result = leetcode_service._make_request(query, variables)
    
    if "error" in result:
        return {"success": False, "error": result["error"]}
    
    try:
        user_data = result["data"]["matchedUser"]
        if not user_data:
            return {"success": False, "error": f"User '{username}' not found"}
        
        return {
            "success": True,
            "data": user_data
        }
    except Exception as e:
        return {"success": False, "error": f"Failed to parse user profile: {str(e)}"}

# Sample tools (keeping original ones too)
@mcp.tool(description="Greet a user by name with a welcome message from the MCP server")
def greet(name: str) -> str:
    return f"Hello, {name}! Welcome to our LeetCode MCP server running on Railway!"

@mcp.tool(description="Get information about the MCP server")
def get_server_info() -> dict:
    return {
        "server_name": "LeetCode MCP Server",
        "version": "2.0.0",
        "environment": os.environ.get("ENVIRONMENT", "development"),
        "python_version": sys.version.split()[0],
        "leetcode_site": leetcode_service.site,
        "available_tools": [
            "get_daily_challenge",
            "get_problem", 
            "search_problems",
            "get_user_profile",
            "greet",
            "get_server_info"
        ]
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"
    
    print(f"Starting LeetCode FastMCP server on {host}:{port}")
    print(f"LeetCode site: {leetcode_service.site}")
    
    mcp.run(
        transport="http",
        host=host,
        port=port
    )