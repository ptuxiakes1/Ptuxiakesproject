#!/usr/bin/env python3
"""
Enhanced Backend Testing for Essay Bid Submission System
Focus on testing the enhanced features as requested in the review
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import sys

# Configuration
BASE_URL = "https://4cd6362e-1afc-4bf0-b7fb-6c2b8d7cb81d.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class EnhancedTestResults:
    def __init__(self):
        self.results = {}
        self.tokens = {}
        self.test_data = {}
    
    def add_result(self, test_name: str, success: bool, message: str, details: Any = None):
        self.results[test_name] = {
            "success": success,
            "message": message,
            "details": details
        }
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")

def make_request(method: str, endpoint: str, data: Dict = None, token: str = None, params: Dict = None) -> tuple:
    """Make HTTP request and return (success, response_data, status_code)"""
    url = f"{BASE_URL}{endpoint}"
    headers = HEADERS.copy()
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, params=params)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method.upper() == "PUT":
            if params:
                # Handle query parameters for PUT requests
                response = requests.put(url, headers=headers, json=data, params=params)
            else:
                response = requests.put(url, headers=headers, json=data)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            return False, {"error": "Invalid HTTP method"}, 0
        
        try:
            response_data = response.json()
        except:
            response_data = {"text": response.text}
        
        return response.status_code < 400, response_data, response.status_code
    
    except Exception as e:
        return False, {"error": str(e)}, 0

def setup_test_users(results: EnhancedTestResults):
    """Setup test users for enhanced testing"""
    print("\n=== Setting up Test Users ===")
    
    import time
    timestamp = str(int(time.time()))
    
    # Create multiple students
    students = [
        {
            "email": f"student1.{timestamp}@university.gr",
            "name": "Sophia Alexandrou",
            "password": "StudentPass123!",
            "role": "student"
        },
        {
            "email": f"student2.{timestamp}@university.gr", 
            "name": "Nikos Papadakis",
            "password": "StudentPass456!",
            "role": "student"
        }
    ]
    
    # Create multiple supervisors
    supervisors = [
        {
            "email": f"supervisor1.{timestamp}@university.gr",
            "name": "Dr. Maria Konstantinou",
            "password": "SupervisorPass123!",
            "role": "supervisor"
        },
        {
            "email": f"supervisor2.{timestamp}@university.gr",
            "name": "Prof. Dimitris Stavros",
            "password": "SupervisorPass456!",
            "role": "supervisor"
        }
    ]
    
    # Create admin
    admin = {
        "email": f"admin.{timestamp}@university.gr",
        "name": "System Administrator",
        "password": "AdminPass789!",
        "role": "admin"
    }
    
    # Register all users
    for i, student in enumerate(students):
        success, response, status = make_request("POST", "/auth/register", student)
        if success and "token" in response:
            results.tokens[f"student{i+1}"] = response["token"]
            results.test_data[f"student{i+1}_id"] = response["user"]["id"]
            results.add_result(f"Student {i+1} Registration", True, f"Student {i+1} registered successfully")
        else:
            results.add_result(f"Student {i+1} Registration", False, f"Failed to register student {i+1}", response)
    
    for i, supervisor in enumerate(supervisors):
        success, response, status = make_request("POST", "/auth/register", supervisor)
        if success and "token" in response:
            results.tokens[f"supervisor{i+1}"] = response["token"]
            results.test_data[f"supervisor{i+1}_id"] = response["user"]["id"]
            results.add_result(f"Supervisor {i+1} Registration", True, f"Supervisor {i+1} registered successfully")
        else:
            results.add_result(f"Supervisor {i+1} Registration", False, f"Failed to register supervisor {i+1}", response)
    
    success, response, status = make_request("POST", "/auth/register", admin)
    if success and "token" in response:
        results.tokens["admin"] = response["token"]
        results.test_data["admin_id"] = response["user"]["id"]
        results.add_result("Admin Registration", True, "Admin registered successfully")
    else:
        results.add_result("Admin Registration", False, "Failed to register admin", response)

def test_enhanced_request_management(results: EnhancedTestResults):
    """Test Enhanced Request Management with role-based access"""
    print("\n=== Testing Enhanced Request Management ===")
    
    # Create requests from different students
    request_data_1 = {
        "title": "Byzantine History Research Paper",
        "due_date": (datetime.now() + timedelta(days=14)).isoformat(),
        "word_count": 2500,
        "assignment_type": "essay",
        "field_of_study": "history",
        "attachments": [],
        "extra_information": "Focus on the fall of Constantinople"
    }
    
    request_data_2 = {
        "title": "Modern Greek Poetry Analysis",
        "due_date": (datetime.now() + timedelta(days=21)).isoformat(),
        "word_count": 3000,
        "assignment_type": "essay",
        "field_of_study": "literature",
        "attachments": [],
        "extra_information": "Analyze works of Cavafy and Seferis"
    }
    
    # Student 1 creates request
    if "student1" in results.tokens:
        success, response, status = make_request("POST", "/requests", request_data_1, results.tokens["student1"])
        if success and "id" in response:
            results.test_data["request1_id"] = response["id"]
            results.add_result("Student 1 Request Creation", True, "Student 1 created request successfully")
        else:
            results.add_result("Student 1 Request Creation", False, "Failed to create request", response)
    
    # Student 2 creates request
    if "student2" in results.tokens:
        success, response, status = make_request("POST", "/requests", request_data_2, results.tokens["student2"])
        if success and "id" in response:
            results.test_data["request2_id"] = response["id"]
            results.add_result("Student 2 Request Creation", True, "Student 2 created request successfully")
        else:
            results.add_result("Student 2 Request Creation", False, "Failed to create request", response)
    
    # Test that students can only see their own requests
    if "student1" in results.tokens:
        success, response, status = make_request("GET", "/requests", token=results.tokens["student1"])
        if success and isinstance(response, list):
            student1_requests = [req for req in response if req.get("student_id") == results.test_data.get("student1_id")]
            other_requests = [req for req in response if req.get("student_id") != results.test_data.get("student1_id")]
            
            if len(student1_requests) > 0 and len(other_requests) == 0:
                results.add_result("Student 1 Request Isolation", True, f"Student 1 sees only their own {len(student1_requests)} request(s)")
            else:
                results.add_result("Student 1 Request Isolation", False, f"Student 1 should only see their own requests. Own: {len(student1_requests)}, Others: {len(other_requests)}")
        else:
            results.add_result("Student 1 Request Isolation", False, "Failed to get student 1 requests", response)
    
    # Test that supervisors can see all pending requests
    if "supervisor1" in results.tokens:
        success, response, status = make_request("GET", "/requests", token=results.tokens["supervisor1"])
        if success and isinstance(response, list):
            pending_requests = [req for req in response if req.get("status") == "pending"]
            if len(pending_requests) >= 2:  # Should see both student requests
                results.add_result("Supervisor Pending Requests View", True, f"Supervisor sees {len(pending_requests)} pending request(s)")
            else:
                results.add_result("Supervisor Pending Requests View", False, f"Supervisor should see all pending requests, found {len(pending_requests)}")
        else:
            results.add_result("Supervisor Pending Requests View", False, "Failed to get supervisor requests", response)
    
    # Test that admins can see all requests
    if "admin" in results.tokens:
        success, response, status = make_request("GET", "/requests", token=results.tokens["admin"])
        if success and isinstance(response, list):
            all_requests = len(response)
            if all_requests >= 2:  # Should see all requests
                results.add_result("Admin All Requests View", True, f"Admin sees all {all_requests} request(s)")
            else:
                results.add_result("Admin All Requests View", False, f"Admin should see all requests, found {all_requests}")
        else:
            results.add_result("Admin All Requests View", False, "Failed to get admin requests", response)
    
    # Test assigned requests endpoint for all roles
    if "admin" in results.tokens:
        success, response, status = make_request("GET", "/requests/assigned", token=results.tokens["admin"])
        if success and isinstance(response, list):
            results.add_result("Admin Assigned Requests Endpoint", True, f"Admin can access assigned requests endpoint ({len(response)} found)")
        else:
            results.add_result("Admin Assigned Requests Endpoint", False, "Failed to access assigned requests endpoint", response)
    
    if "student1" in results.tokens:
        success, response, status = make_request("GET", "/requests/assigned", token=results.tokens["student1"])
        if success and isinstance(response, list):
            results.add_result("Student Assigned Requests Endpoint", True, f"Student can access assigned requests endpoint ({len(response)} found)")
        else:
            results.add_result("Student Assigned Requests Endpoint", False, "Failed to access assigned requests endpoint", response)
    
    if "supervisor1" in results.tokens:
        success, response, status = make_request("GET", "/requests/assigned", token=results.tokens["supervisor1"])
        if success and isinstance(response, list):
            results.add_result("Supervisor Assigned Requests Endpoint", True, f"Supervisor can access assigned requests endpoint ({len(response)} found)")
        else:
            results.add_result("Supervisor Assigned Requests Endpoint", False, "Failed to access assigned requests endpoint", response)

def test_enhanced_bidding_system(results: EnhancedTestResults):
    """Test Enhanced Bidding System with admin-only bid viewing"""
    print("\n=== Testing Enhanced Bidding System ===")
    
    # Create bids from different supervisors
    if "request1_id" in results.test_data and "supervisor1" in results.tokens:
        bid_data_1 = {
            "request_id": results.test_data["request1_id"],
            "price": 180.00,
            "estimated_completion": (datetime.now() + timedelta(days=10)).isoformat(),
            "proposal": "I specialize in Byzantine history with 15 years of research experience. I can provide comprehensive analysis of the fall of Constantinople with primary source references."
        }
        
        success, response, status = make_request("POST", "/bids", bid_data_1, results.tokens["supervisor1"])
        if success and "id" in response:
            results.test_data["bid1_id"] = response["id"]
            results.add_result("Supervisor 1 Bid Creation", True, "Supervisor 1 created bid successfully")
        else:
            results.add_result("Supervisor 1 Bid Creation", False, "Failed to create bid", response)
    
    if "request1_id" in results.test_data and "supervisor2" in results.tokens:
        bid_data_2 = {
            "request_id": results.test_data["request1_id"],
            "price": 160.00,
            "estimated_completion": (datetime.now() + timedelta(days=12)).isoformat(),
            "proposal": "As a history professor with expertise in medieval studies, I can deliver a well-researched paper on Byzantine history with competitive pricing."
        }
        
        success, response, status = make_request("POST", "/bids", bid_data_2, results.tokens["supervisor2"])
        if success and "id" in response:
            results.test_data["bid2_id"] = response["id"]
            results.add_result("Supervisor 2 Bid Creation", True, "Supervisor 2 created bid successfully")
        else:
            results.add_result("Supervisor 2 Bid Creation", False, "Failed to create bid", response)
    
    # Test that only admins can view all bids
    if "admin" in results.tokens:
        success, response, status = make_request("GET", "/bids", token=results.tokens["admin"])
        if success and isinstance(response, list):
            admin_bids = len(response)
            if admin_bids >= 2:  # Should see all bids
                results.add_result("Admin Bid Viewing", True, f"Admin can view all {admin_bids} bid(s)")
            else:
                results.add_result("Admin Bid Viewing", False, f"Admin should see all bids, found {admin_bids}")
        else:
            results.add_result("Admin Bid Viewing", False, "Failed to get admin bids", response)
    
    # Test that students cannot access bids endpoint
    if "student1" in results.tokens:
        success, response, status = make_request("GET", "/bids", token=results.tokens["student1"])
        if not success and status == 403:
            results.add_result("Student Bid Access Restriction", True, "Students correctly cannot access bids endpoint")
        else:
            results.add_result("Student Bid Access Restriction", False, "Students should not be able to access bids endpoint", response)
    
    # Test supervisors can only see their own bids
    if "supervisor1" in results.tokens:
        success, response, status = make_request("GET", "/bids", token=results.tokens["supervisor1"])
        if success and isinstance(response, list):
            supervisor1_bids = [bid for bid in response if bid.get("supervisor_id") == results.test_data.get("supervisor1_id")]
            other_bids = [bid for bid in response if bid.get("supervisor_id") != results.test_data.get("supervisor1_id")]
            
            if len(supervisor1_bids) > 0 and len(other_bids) == 0:
                results.add_result("Supervisor Bid Isolation", True, f"Supervisor 1 sees only their own {len(supervisor1_bids)} bid(s)")
            else:
                results.add_result("Supervisor Bid Isolation", False, f"Supervisor should only see their own bids. Own: {len(supervisor1_bids)}, Others: {len(other_bids)}")
        else:
            results.add_result("Supervisor Bid Isolation", False, "Failed to get supervisor bids", response)
    
    # Test admin bid retrieval for specific requests
    if "admin" in results.tokens and "request1_id" in results.test_data:
        success, response, status = make_request("GET", f"/bids/request/{results.test_data['request1_id']}", token=results.tokens["admin"])
        if success and isinstance(response, list):
            request_bids = len(response)
            if request_bids >= 2:  # Should see both bids for this request
                results.add_result("Admin Request-Specific Bid Retrieval", True, f"Admin can retrieve {request_bids} bid(s) for specific request")
            else:
                results.add_result("Admin Request-Specific Bid Retrieval", False, f"Admin should see all bids for request, found {request_bids}")
        else:
            results.add_result("Admin Request-Specific Bid Retrieval", False, "Failed to get request-specific bids", response)
    
    # Test that non-admins cannot access request-specific bids
    if "supervisor1" in results.tokens and "request1_id" in results.test_data:
        success, response, status = make_request("GET", f"/bids/request/{results.test_data['request1_id']}", token=results.tokens["supervisor1"])
        if not success and status == 403:
            results.add_result("Non-Admin Request Bid Access Restriction", True, "Non-admins correctly cannot access request-specific bids")
        else:
            results.add_result("Non-Admin Request Bid Access Restriction", False, "Non-admins should not access request-specific bids", response)
    
    # Test bid status updates by admins
    if "admin" in results.tokens and "bid1_id" in results.test_data:
        success, response, status = make_request("PUT", f"/bids/{results.test_data['bid1_id']}/status?status_value=accepted", 
                                                token=results.tokens["admin"])
        if success:
            results.add_result("Admin Bid Status Update", True, "Admin successfully updated bid status")
            
            # Test that accepting a bid rejects other bids for the same request
            if "bid2_id" in results.test_data:
                success, response, status = make_request("GET", "/bids", token=results.tokens["admin"])
                if success and isinstance(response, list):
                    bid2_status = None
                    for bid in response:
                        if bid.get("id") == results.test_data["bid2_id"]:
                            bid2_status = bid.get("status")
                            break
                    
                    if bid2_status == "rejected":
                        results.add_result("Auto-Reject Other Bids", True, "Other bids automatically rejected when one is accepted")
                    else:
                        results.add_result("Auto-Reject Other Bids", False, f"Other bids should be rejected, found status: {bid2_status}")
        else:
            results.add_result("Admin Bid Status Update", False, "Failed to update bid status", response)

def test_updated_chat_system(results: EnhancedTestResults):
    """Test Updated Chat System - only available for assigned requests"""
    print("\n=== Testing Updated Chat System ===")
    
    # Test that chat is only available for assigned requests (accepted status)
    # First, we need an assigned request (from the bid acceptance above)
    if "request1_id" in results.test_data:
        # Check if request is now assigned
        if "admin" in results.tokens:
            success, response, status = make_request("GET", f"/requests/{results.test_data['request1_id']}", token=results.tokens["admin"])
            if success and response.get("status") == "accepted" and response.get("assigned_supervisor"):
                results.add_result("Request Assignment Verification", True, "Request is properly assigned after bid acceptance")
                
                # Test chat access for assigned request
                message_data = {
                    "request_id": results.test_data["request1_id"],
                    "receiver_id": results.test_data.get("supervisor1_id", "test_receiver"),
                    "message": "Hello, I have some questions about the research methodology for the Byzantine history paper."
                }
                
                if "student1" in results.tokens:
                    success, response, status = make_request("POST", "/chat/send", message_data, results.tokens["student1"])
                    if success and "id" in response:
                        results.add_result("Chat Access for Assigned Request", True, "Chat works for assigned requests")
                        results.test_data["message_id"] = response["id"]
                    else:
                        results.add_result("Chat Access for Assigned Request", False, "Chat should work for assigned requests", response)
            else:
                results.add_result("Request Assignment Verification", False, "Request should be assigned after bid acceptance", response)
    
    # Test that chat is NOT available for pending requests
    if "request2_id" in results.test_data and "student2" in results.tokens:
        message_data_pending = {
            "request_id": results.test_data["request2_id"],  # This should still be pending
            "receiver_id": results.test_data.get("supervisor1_id", "test_receiver"),
            "message": "This should fail because request is still pending"
        }
        
        success, response, status = make_request("POST", "/chat/send", message_data_pending, results.tokens["student2"])
        if not success and status == 400:
            results.add_result("Chat Restriction for Pending Requests", True, "Chat correctly restricted for pending requests")
        else:
            results.add_result("Chat Restriction for Pending Requests", False, "Chat should be restricted for pending requests", response)
    
    # Test chat permission checks
    if "request1_id" in results.test_data and "student2" in results.tokens:
        # Student 2 trying to access Student 1's chat
        success, response, status = make_request("GET", f"/chat/{results.test_data['request1_id']}", token=results.tokens["student2"])
        if not success and status == 403:
            results.add_result("Chat Permission Check", True, "Chat access correctly restricted to authorized users")
        else:
            results.add_result("Chat Permission Check", False, "Chat access should be restricted to authorized users", response)
    
    # Test that chat notifications are sent to admins
    # This is tested implicitly through the notification system
    if "admin" in results.tokens:
        success, response, status = make_request("GET", "/notifications", token=results.tokens["admin"])
        if success and isinstance(response, list):
            chat_notifications = [notif for notif in response if notif.get("type") == "chat_activity"]
            if len(chat_notifications) > 0:
                results.add_result("Chat Notifications to Admin", True, f"Admin received {len(chat_notifications)} chat notification(s)")
            else:
                results.add_result("Chat Notifications to Admin", False, "Admin should receive chat notifications")
        else:
            results.add_result("Chat Notifications to Admin", False, "Failed to get admin notifications", response)

def test_admin_request_management(results: EnhancedTestResults):
    """Test Admin Request Management features"""
    print("\n=== Testing Admin Request Management ===")
    
    # Test request updates by students and admins
    if "request2_id" in results.test_data and "student2" in results.tokens:
        update_data = {
            "title": "Updated: Modern Greek Poetry Analysis",
            "due_date": (datetime.now() + timedelta(days=25)).isoformat(),
            "word_count": 3500,
            "assignment_type": "essay",
            "field_of_study": "literature",
            "attachments": [],
            "extra_information": "Updated requirements: Focus on Cavafy, Seferis, and Elytis"
        }
        
        success, response, status = make_request("PUT", f"/requests/{results.test_data['request2_id']}", update_data, results.tokens["student2"])
        if success:
            results.add_result("Student Request Update", True, "Student can update their own request")
        else:
            results.add_result("Student Request Update", False, "Student should be able to update their own request", response)
    
    # Test admin request updates
    if "request2_id" in results.test_data and "admin" in results.tokens:
        admin_update_data = {
            "title": "Admin Updated: Modern Greek Poetry Analysis",
            "due_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "word_count": 4000,
            "assignment_type": "essay",
            "field_of_study": "literature",
            "attachments": [],
            "extra_information": "Admin modification: Extended deadline and word count"
        }
        
        success, response, status = make_request("PUT", f"/requests/{results.test_data['request2_id']}", admin_update_data, results.tokens["admin"])
        if success:
            results.add_result("Admin Request Update", True, "Admin can update any request")
        else:
            results.add_result("Admin Request Update", False, "Admin should be able to update any request", response)
    
    # Test request deletion by admins
    if "admin" in results.tokens:
        # Create a test request to delete
        delete_test_request = {
            "title": "Test Request for Deletion",
            "due_date": (datetime.now() + timedelta(days=7)).isoformat(),
            "word_count": 1000,
            "assignment_type": "essay",
            "field_of_study": "test",
            "attachments": [],
            "extra_information": "This request will be deleted"
        }
        
        if "student1" in results.tokens:
            success, response, status = make_request("POST", "/requests", delete_test_request, results.tokens["student1"])
            if success and "id" in response:
                delete_request_id = response["id"]
                
                # Admin deletes the request
                success, response, status = make_request("DELETE", f"/requests/{delete_request_id}", token=results.tokens["admin"])
                if success:
                    results.add_result("Admin Request Deletion", True, "Admin can delete requests")
                    
                    # Verify deletion
                    success, response, status = make_request("GET", f"/requests/{delete_request_id}", token=results.tokens["admin"])
                    if not success and status == 404:
                        results.add_result("Request Deletion Verification", True, "Request successfully deleted")
                    else:
                        results.add_result("Request Deletion Verification", False, "Request should be deleted", response)
                else:
                    results.add_result("Admin Request Deletion", False, "Admin should be able to delete requests", response)
    
    # Test manual supervisor assignment by admins
    if "admin" in results.tokens and "request2_id" in results.test_data and "supervisor2_id" in results.test_data:
        success, response, status = make_request("PUT", f"/requests/{results.test_data['request2_id']}/assign?supervisor_id={results.test_data['supervisor2_id']}", 
                                                token=results.tokens["admin"])
        if success:
            results.add_result("Admin Manual Assignment", True, "Admin can manually assign supervisors")
            
            # Verify assignment
            success, response, status = make_request("GET", f"/requests/{results.test_data['request2_id']}", token=results.tokens["admin"])
            if success and response.get("assigned_supervisor") == results.test_data["supervisor2_id"]:
                results.add_result("Manual Assignment Verification", True, "Manual assignment correctly applied")
            else:
                results.add_result("Manual Assignment Verification", False, "Manual assignment not applied correctly", response)
        else:
            results.add_result("Admin Manual Assignment", False, "Admin should be able to manually assign supervisors", response)

def test_enhanced_user_management(results: EnhancedTestResults):
    """Test Enhanced User Management features"""
    print("\n=== Testing Enhanced User Management ===")
    
    # Test user creation by admins
    if "admin" in results.tokens:
        import time
        timestamp = str(int(time.time()))
        new_user_data = {
            "email": f"new.user.{timestamp}@university.gr",
            "name": "New Test User",
            "password": "NewUserPass123!",
            "role": "supervisor"
        }
        
        success, response, status = make_request("POST", "/admin/users", new_user_data, results.tokens["admin"])
        if success and "id" in response:
            results.test_data["new_user_id"] = response["id"]
            results.add_result("Admin User Creation", True, "Admin can create new users")
        else:
            results.add_result("Admin User Creation", False, "Admin should be able to create new users", response)
    
    # Test user updates by admins
    if "admin" in results.tokens and "new_user_id" in results.test_data:
        update_user_data = {
            "email": f"updated.user.{timestamp}@university.gr",
            "name": "Updated Test User",
            "password": "UpdatedPass123!",
            "role": "supervisor"
        }
        
        success, response, status = make_request("PUT", f"/admin/users/{results.test_data['new_user_id']}", 
                                                update_user_data, token=results.tokens["admin"])
        if success:
            results.add_result("Admin User Update", True, "Admin can update user information")
        else:
            results.add_result("Admin User Update", False, "Admin should be able to update user information", response)
    
    # Test supervisor listing for admins
    if "admin" in results.tokens:
        success, response, status = make_request("GET", "/admin/supervisors", token=results.tokens["admin"])
        if success and isinstance(response, list):
            supervisor_count = len(response)
            if supervisor_count >= 2:  # Should see at least our test supervisors
                results.add_result("Admin Supervisor Listing", True, f"Admin can list {supervisor_count} supervisor(s)")
            else:
                results.add_result("Admin Supervisor Listing", False, f"Admin should see all supervisors, found {supervisor_count}")
        else:
            results.add_result("Admin Supervisor Listing", False, "Failed to get supervisor listing", response)
    
    # Test access restrictions for user management
    if "student1" in results.tokens:
        success, response, status = make_request("GET", "/admin/users", token=results.tokens["student1"])
        if not success and status == 403:
            results.add_result("User Management Access Restriction", True, "Non-admins correctly cannot access user management")
        else:
            results.add_result("User Management Access Restriction", False, "Non-admins should not access user management", response)

def test_complete_integration_flow(results: EnhancedTestResults):
    """Test the complete integration flow"""
    print("\n=== Testing Complete Integration Flow ===")
    
    # Create a new request for complete flow testing
    if "student1" in results.tokens:
        flow_request_data = {
            "title": "Complete Flow Test: Ancient Greek Mathematics",
            "due_date": (datetime.now() + timedelta(days=20)).isoformat(),
            "word_count": 2000,
            "assignment_type": "essay",
            "field_of_study": "mathematics",
            "attachments": [],
            "extra_information": "Test the complete workflow from request to chat"
        }
        
        success, response, status = make_request("POST", "/requests", flow_request_data, results.tokens["student1"])
        if success and "id" in response:
            flow_request_id = response["id"]
            results.add_result("Flow Step 1: Student Creates Request", True, "Student successfully created request")
            
            # Step 2: Supervisor bids
            if "supervisor1" in results.tokens:
                flow_bid_data = {
                    "request_id": flow_request_id,
                    "price": 200.00,
                    "estimated_completion": (datetime.now() + timedelta(days=15)).isoformat(),
                    "proposal": "I have expertise in ancient mathematics and can provide comprehensive analysis."
                }
                
                success, response, status = make_request("POST", "/bids", flow_bid_data, results.tokens["supervisor1"])
                if success and "id" in response:
                    flow_bid_id = response["id"]
                    results.add_result("Flow Step 2: Supervisor Bids", True, "Supervisor successfully submitted bid")
                    
                    # Step 3: Admin accepts bid
                    if "admin" in results.tokens:
                        success, response, status = make_request("PUT", f"/bids/{flow_bid_id}/status", 
                                                                params={"status": "accepted"}, token=results.tokens["admin"])
                        if success:
                            results.add_result("Flow Step 3: Admin Accepts Bid", True, "Admin successfully accepted bid")
                            
                            # Step 4: Request becomes assigned
                            success, response, status = make_request("GET", f"/requests/{flow_request_id}", token=results.tokens["admin"])
                            if success and response.get("status") == "accepted" and response.get("assigned_supervisor"):
                                results.add_result("Flow Step 4: Request Becomes Assigned", True, "Request status updated to assigned")
                                
                                # Step 5: Chat becomes available
                                flow_message_data = {
                                    "request_id": flow_request_id,
                                    "receiver_id": results.test_data.get("supervisor1_id", "test_receiver"),
                                    "message": "Hello! The complete flow test is working. Chat is now available."
                                }
                                
                                success, response, status = make_request("POST", "/chat/send", flow_message_data, results.tokens["student1"])
                                if success and "id" in response:
                                    results.add_result("Flow Step 5: Chat Becomes Available", True, "Chat successfully available for assigned request")
                                    
                                    # Verify complete flow
                                    results.add_result("Complete Integration Flow", True, "✅ COMPLETE FLOW SUCCESS: Request → Bid → Accept → Assign → Chat")
                                else:
                                    results.add_result("Flow Step 5: Chat Becomes Available", False, "Chat should be available for assigned request", response)
                            else:
                                results.add_result("Flow Step 4: Request Becomes Assigned", False, "Request should be assigned after bid acceptance", response)
                        else:
                            results.add_result("Flow Step 3: Admin Accepts Bid", False, "Admin should be able to accept bid", response)
                    else:
                        results.add_result("Flow Step 3: Admin Accepts Bid", False, "No admin token available")
                else:
                    results.add_result("Flow Step 2: Supervisor Bids", False, "Supervisor should be able to submit bid", response)
            else:
                results.add_result("Flow Step 2: Supervisor Bids", False, "No supervisor token available")
        else:
            results.add_result("Flow Step 1: Student Creates Request", False, "Student should be able to create request", response)

def test_notification_creation(results: EnhancedTestResults):
    """Test notification creation for all key events"""
    print("\n=== Testing Notification Creation ===")
    
    # Check notifications for different user types
    for role in ["student1", "supervisor1", "admin"]:
        if role in results.tokens:
            success, response, status = make_request("GET", "/notifications", token=results.tokens[role])
            if success and isinstance(response, list):
                notification_types = [notif.get("type") for notif in response]
                unique_types = set(notification_types)
                
                results.add_result(f"{role.title()} Notification Types", True, 
                                 f"{role.title()} has {len(response)} notifications of types: {list(unique_types)}")
            else:
                results.add_result(f"{role.title()} Notification Types", False, 
                                 f"Failed to get {role} notifications", response)

def print_enhanced_summary(results: EnhancedTestResults):
    """Print enhanced test summary"""
    print("\n" + "="*80)
    print("ENHANCED BACKEND TESTING SUMMARY")
    print("="*80)
    
    total_tests = len(results.results)
    passed_tests = sum(1 for result in results.results.values() if result["success"])
    failed_tests = total_tests - passed_tests
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    # Group results by category
    categories = {
        "User Setup": [],
        "Request Management": [],
        "Bidding System": [],
        "Chat System": [],
        "Admin Management": [],
        "User Management": [],
        "Integration Flow": [],
        "Notifications": []
    }
    
    for test_name, result in results.results.items():
        if any(keyword in test_name.lower() for keyword in ["registration", "setup"]):
            categories["User Setup"].append((test_name, result))
        elif any(keyword in test_name.lower() for keyword in ["request", "assignment"]):
            categories["Request Management"].append((test_name, result))
        elif "bid" in test_name.lower():
            categories["Bidding System"].append((test_name, result))
        elif "chat" in test_name.lower():
            categories["Chat System"].append((test_name, result))
        elif any(keyword in test_name.lower() for keyword in ["admin", "deletion", "manual"]):
            categories["Admin Management"].append((test_name, result))
        elif "user" in test_name.lower():
            categories["User Management"].append((test_name, result))
        elif "flow" in test_name.lower():
            categories["Integration Flow"].append((test_name, result))
        elif "notification" in test_name.lower():
            categories["Notifications"].append((test_name, result))
    
    for category, tests in categories.items():
        if tests:
            print(f"\n--- {category} ---")
            for test_name, result in tests:
                status = "✅" if result["success"] else "❌"
                print(f"  {status} {test_name}: {result['message']}")

def main():
    """Main enhanced test execution"""
    print("Starting Enhanced Backend Testing for Essay Bid Submission System...")
    print(f"Testing against: {BASE_URL}")
    print("Focus: Enhanced features as requested in review")
    
    results = EnhancedTestResults()
    
    # Execute enhanced test suites
    setup_test_users(results)
    test_enhanced_request_management(results)
    test_enhanced_bidding_system(results)
    test_updated_chat_system(results)
    test_admin_request_management(results)
    test_enhanced_user_management(results)
    test_complete_integration_flow(results)
    test_notification_creation(results)
    
    # Print summary
    print_enhanced_summary(results)
    
    return results

if __name__ == "__main__":
    main()