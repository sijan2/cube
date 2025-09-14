#!/usr/bin/env python3
import os
import sys
import json
import requests
from datetime import datetime
from typing import Optional, Dict, List, Any
from fastmcp import FastMCP
from neo4j import GraphDatabase
import openai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
# Also try loading from server/.env if it exists
if os.path.exists("server/.env"):
    load_dotenv("server/.env")

mcp = FastMCP("LeetCode + Zep MCP Server")

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
            response = self.session.post(self.graphql_url, json=payload, headers=headers, timeout=600)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}

# Initialize LeetCode service
leetcode_service = LeetCodeService()

class ZepGraphitiService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.model_name = os.getenv("ZEP_MODEL_NAME", "gpt-4o-mini")
        self.neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.neo4j_user = os.getenv("NEO4J_USER", "neo4j")
        self.neo4j_password = os.getenv("NEO4J_PASSWORD")
        
        self.driver = None
        self.openai_client = None
        
        # Initialize connections if credentials are available
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
            self.openai_client = openai.OpenAI(api_key=self.openai_api_key)
            
        if self.neo4j_password:
            try:
                self.driver = GraphDatabase.driver(
                    self.neo4j_uri,
                    auth=(self.neo4j_user, self.neo4j_password)
                )
            except Exception as e:
                print(f"⚠️  Neo4j connection failed: {e}")
                self.driver = None
        
        self.enabled = bool(self.openai_client and self.driver)
        if self.enabled:
            print("✅ Zep Graphiti service initialized")
        else:
            print("⚠️  Zep Graphiti not fully configured (requires OPENAI_API_KEY and Neo4j)")

    def is_enabled(self):
        return self.enabled

    def close(self):
        if self.driver:
            self.driver.close()

# Initialize Zep service
zep_service = ZepGraphitiService()

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

# Zep Graphiti Tools
@mcp.tool(description="Store knowledge in the Zep Graphiti knowledge graph")
def zep_add_knowledge(text: str, group_id: str = "default") -> dict:
    """Add knowledge to the Zep Graphiti knowledge graph"""
    if not zep_service.is_enabled():
        return {"success": False, "error": "Zep Graphiti not configured. Need OPENAI_API_KEY and Neo4j."}
    
    try:
        # Simple implementation - in a real setup you'd use the full Graphiti library
        with zep_service.driver.session() as session:
            result = session.run(
                "CREATE (k:Knowledge {text: $text, group_id: $group_id, created_at: datetime()}) RETURN k",
                text=text, group_id=group_id
            )
            node = result.single()
            
            return {
                "success": True,
                "message": "Knowledge stored in Zep Graphiti",
                "node_id": str(node["k"].id) if node else None
            }
    except Exception as e:
        return {"success": False, "error": f"Failed to store knowledge: {str(e)}"}

@mcp.tool(description="Search knowledge in the Zep Graphiti knowledge graph")
def zep_search_knowledge(query: str, group_id: str = "default", limit: int = 10) -> dict:
    """Search for knowledge in the Zep Graphiti knowledge graph"""
    if not zep_service.is_enabled():
        return {"success": False, "error": "Zep Graphiti not configured. Need OPENAI_API_KEY and Neo4j."}
    
    try:
        with zep_service.driver.session() as session:
            # Simple text search - in a real setup you'd use semantic search
            result = session.run(
                """
                MATCH (k:Knowledge) 
                WHERE k.group_id = $group_id AND k.text CONTAINS $query
                RETURN k.text as text, k.created_at as created_at, id(k) as node_id
                ORDER BY k.created_at DESC
                LIMIT $limit
                """,
                query=query, group_id=group_id, limit=limit
            )
            
            knowledge = []
            for record in result:
                knowledge.append({
                    "text": record["text"],
                    "created_at": str(record["created_at"]),
                    "node_id": record["node_id"]
                })
            
            return {
                "success": True,
                "knowledge": knowledge,
                "count": len(knowledge)
            }
    except Exception as e:
        return {"success": False, "error": f"Failed to search knowledge: {str(e)}"}

@mcp.tool(description="Get Zep Graphiti service status and configuration")
def zep_get_status() -> dict:
    """Get the status of Zep Graphiti service"""
    return {
        "enabled": zep_service.is_enabled(),
        "openai_configured": bool(zep_service.openai_client),
        "neo4j_configured": bool(zep_service.driver),
        "neo4j_uri": zep_service.neo4j_uri,
        "model_name": zep_service.model_name,
        "message": "Zep Graphiti service status"
    }

@mcp.tool(description="Generate AI insights from stored knowledge using OpenAI")
def zep_generate_insights(topic: str, group_id: str = "default") -> dict:
    """Generate AI insights from stored knowledge on a specific topic"""
    if not zep_service.is_enabled():
        return {"success": False, "error": "Zep Graphiti not configured. Need OPENAI_API_KEY and Neo4j."}
    
    try:
        # First, search for relevant knowledge
        search_result = zep_search_knowledge(topic, group_id, 5)
        
        if not search_result["success"] or not search_result["knowledge"]:
            return {"success": False, "error": "No relevant knowledge found for this topic"}
        
        # Prepare context from stored knowledge
        context = "\n".join([k["text"] for k in search_result["knowledge"]])
        
        # Generate insights using OpenAI
        response = zep_service.openai_client.chat.completions.create(
            model=zep_service.model_name,
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI assistant that generates insights from stored knowledge. Provide concise, actionable insights."
                },
                {
                    "role": "user",
                    "content": f"Based on this stored knowledge about '{topic}', generate key insights:\n\n{context}"
                }
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        insights = response.choices[0].message.content
        
        return {
            "success": True,
            "topic": topic,
            "insights": insights,
            "knowledge_sources": len(search_result["knowledge"])
        }
        
    except Exception as e:
        return {"success": False, "error": f"Failed to generate insights: {str(e)}"}

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
            "zep_add_knowledge",
            "zep_search_knowledge",
            "zep_get_status",
            "zep_generate_insights",
            "greet",
            "get_server_info"
        ],
        "zep_enabled": zep_service.is_enabled()
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0"
    
    print(f"Starting LeetCode + Zep FastMCP server on {host}:{port}")
    print(f"LeetCode site: {leetcode_service.site}")
    print(f"Zep Graphiti enabled: {zep_service.is_enabled()}")
    print(f"Request timeout: 600 seconds")
    print(f"Available tools: 10")
    
    mcp.run(
        transport="http",
        host=host,
        port=port
    )