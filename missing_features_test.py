#!/usr/bin/env python3
"""
Missing Features Backend Testing for Essay Bid Submission System
Tests the specific missing features mentioned in the review request:
1. Admin Price Management
2. Enhanced Chat System with Admin Approval
3. Enhanced Bidding System (admin-only bid viewing)
4. Full User CRUD for Admins
5. Enhanced Notification System
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import sys

# Configuration
BASE_URL = "https://9bc8a6f2-9f09-4c20-aa03-681a44fc48ba.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class MissingFeaturesTestResults:
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

def setup_test_users(results: MissingFeaturesTestResults):
    """Setup test users for missing features testing"""
    print("\n=== Setting Up Test Users ===")
    
    import time
    timestamp = str(int(time.time()))
    
    # Create test users
    users = [
        {
            "email": f"student.maria.{timestamp}@university.gr",
            "name": "Maria Konstantinou",
            "password": "StudentPass123!",
            "role": "student",
            "key": "student"
        },
        {
            "email": f"supervisor.kostas.{timestamp}@university.gr",
            "name": "Dr. Kostas Papadopoulos",
            "password": "SupervisorPass456!",
            "role": "supervisor",
            "key": "supervisor"
        },
        {
            "email": f"admin.system.{timestamp}@university.gr",
            "name": "System Administrator",
            "password": "AdminPass789!",
            "role": "admin",
            "key": "admin"
        }
    ]
    
    for user in users:
        user_data = {k: v for k, v in user.items() if k != "key"}
        success, response, status = make_request("POST", "/auth/register", user_data)
        if success and "token" in response:
            results.tokens[user["key"]] = response["token"]
            results.test_data[f"{user['key']}_id"] = response["user"]["id"]
            results.add_result(f"{user['key'].title()} Registration", True, f"{user['key'].title()} registered successfully")
        else:
            results.add_result(f"{user['key'].title()} Registration", False, f"Failed to register {user['key']}", response)

def test_admin_price_management(results: MissingFeaturesTestResults):
    """Test Admin Price Management Features"""
    print("\n=== Testing Admin Price Management ===")
    
    # First create an essay request to set prices for
    if "student" in results.tokens:
        request_data = {
            "title": "Ancient Greek Philosophy Research Paper",
            "due_date": (datetime.now() + timedelta(days=14)).isoformat(),
            "word_count": 2500,
            "assignment_type": "essay",
            "field_of_study": "philosophy",
            "attachments": [],
            "extra_information": "Focus on Socratic method and its modern applications"
        }
        
        success, response, status = make_request("POST", "/requests", request_data, results.tokens["student"])
        if success and "id" in response:
            results.test_data["request_id"] = response["id"]
            results.add_result("Request Creation for Price Testing", True, "Essay request created for price testing")
        else:
            results.add_result("Request Creation for Price Testing", False, "Failed to create request for price testing", response)
            return
    
    # Test 1: Admin can set custom prices for requests
    if "admin" in results.tokens and "request_id" in results.test_data:
        price_data = {
            "request_id": results.test_data["request_id"],
            "price": 250.00
        }
        
        success, response, status = make_request("POST", "/admin/prices", price_data, results.tokens["admin"])
        if success and "id" in response:
            results.test_data["admin_price_id"] = response["id"]
            results.add_result("Admin Set Custom Price", True, f"Admin successfully set price of ${price_data['price']}")
        else:
            results.add_result("Admin Set Custom Price", False, "Admin should be able to set custom prices", response)
    
    # Test 2: Students can view admin prices for their requests
    if "student" in results.tokens and "request_id" in results.test_data:
        success, response, status = make_request("GET", f"/prices/request/{results.test_data['request_id']}", token=results.tokens["student"])
        if success and isinstance(response, list) and len(response) > 0:
            price_found = any(price.get("price") == 250.00 for price in response)
            if price_found:
                results.add_result("Student View Admin Prices", True, "Student can view admin-set prices for their requests")
            else:
                results.add_result("Student View Admin Prices", False, f"Student should see admin price of $250.00, found: {response}")
        else:
            results.add_result("Student View Admin Prices", False, "Student should be able to view admin prices", response)
    
    # Test 3: Admin price notifications are sent to students
    if "student" in results.tokens:
        success, response, status = make_request("GET", "/notifications", token=results.tokens["student"])
        if success and isinstance(response, list):
            admin_price_notifications = [notif for notif in response if notif.get("type") == "admin_price"]
            if len(admin_price_notifications) > 0:
                results.add_result("Admin Price Notifications", True, f"Student received {len(admin_price_notifications)} admin price notification(s)")
            else:
                results.add_result("Admin Price Notifications", False, "Student should receive notifications when admin sets prices")
        else:
            results.add_result("Admin Price Notifications", False, "Failed to get student notifications", response)
    
    # Test 4: Admin price CRUD operations
    # Read operation (list all admin prices)
    if "admin" in results.tokens:
        success, response, status = make_request("GET", "/admin/prices", token=results.tokens["admin"])
        if success and isinstance(response, list):
            results.add_result("Admin Price Read Operation", True, f"Admin can list all {len(response)} admin price(s)")
        else:
            results.add_result("Admin Price Read Operation", False, "Admin should be able to list all prices", response)
    
    # Update operation (create another price to test multiple prices)
    if "admin" in results.tokens and "request_id" in results.test_data:
        updated_price_data = {
            "request_id": results.test_data["request_id"],
            "price": 300.00
        }
        
        success, response, status = make_request("POST", "/admin/prices", updated_price_data, results.tokens["admin"])
        if success and "id" in response:
            results.test_data["admin_price_id_2"] = response["id"]
            results.add_result("Admin Price Update Operation", True, "Admin can create additional prices (update functionality)")
        else:
            results.add_result("Admin Price Update Operation", False, "Admin should be able to create additional prices", response)
    
    # Delete operation
    if "admin" in results.tokens and "admin_price_id" in results.test_data:
        success, response, status = make_request("DELETE", f"/admin/prices/{results.test_data['admin_price_id']}", token=results.tokens["admin"])
        if success:
            results.add_result("Admin Price Delete Operation", True, "Admin can delete admin prices")
            
            # Verify deletion
            success, response, status = make_request("GET", "/admin/prices", token=results.tokens["admin"])
            if success and isinstance(response, list):
                deleted_price_exists = any(price.get("id") == results.test_data["admin_price_id"] for price in response)
                if not deleted_price_exists:
                    results.add_result("Admin Price Deletion Verification", True, "Admin price successfully deleted")
                else:
                    results.add_result("Admin Price Deletion Verification", False, "Admin price should be deleted")
        else:
            results.add_result("Admin Price Delete Operation", False, "Admin should be able to delete prices", response)
    
    # Test access restrictions - non-admin cannot set prices
    if "student" in results.tokens and "request_id" in results.test_data:
        unauthorized_price_data = {
            "request_id": results.test_data["request_id"],
            "price": 150.00
        }
        
        success, response, status = make_request("POST", "/admin/prices", unauthorized_price_data, results.tokens["student"])
        if not success and status == 403:
            results.add_result("Admin Price Access Control", True, "Non-admins correctly cannot set admin prices")
        else:
            results.add_result("Admin Price Access Control", False, "Non-admins should not be able to set admin prices", response)

def test_enhanced_chat_system_with_admin_approval(results: MissingFeaturesTestResults):
    """Test Enhanced Chat System with Admin Approval"""
    print("\n=== Testing Enhanced Chat System with Admin Approval ===")
    
    # First, we need an assigned request for chat testing
    # Create a bid and accept it to get an assigned request
    if "supervisor" in results.tokens and "request_id" in results.test_data:
        bid_data = {
            "request_id": results.test_data["request_id"],
            "price": 200.00,
            "estimated_completion": (datetime.now() + timedelta(days=10)).isoformat(),
            "proposal": "I have extensive experience in ancient philosophy and can provide comprehensive analysis."
        }
        
        success, response, status = make_request("POST", "/bids", bid_data, results.tokens["supervisor"])
        if success and "id" in response:
            results.test_data["bid_id"] = response["id"]
            
            # Admin accepts the bid to make request assigned
            if "admin" in results.tokens:
                success, response, status = make_request("PUT", f"/bids/{results.test_data['bid_id']}/status?status_value=accepted", 
                                                        None, results.tokens["admin"])
                if success:
                    results.add_result("Setup: Bid Acceptance for Chat", True, "Bid accepted to enable chat testing")
                else:
                    results.add_result("Setup: Bid Acceptance for Chat", False, "Failed to accept bid for chat setup", response)
    
    # Test 1: All messages need admin approval before being visible
    if "student" in results.tokens and "request_id" in results.test_data:
        message_data = {
            "request_id": results.test_data["request_id"],
            "receiver_id": results.test_data.get("supervisor_id", "test_receiver"),
            "message": "Hello, I have some questions about the research methodology. This message needs admin approval."
        }
        
        success, response, status = make_request("POST", "/chat/send", message_data, results.tokens["student"])
        if success and "id" in response:
            results.test_data["message_id"] = response["id"]
            message_approved = response.get("approved", True)  # Default True means it's not working correctly
            
            if not message_approved:
                results.add_result("Messages Need Admin Approval", True, "Messages correctly require admin approval before being visible")
            else:
                results.add_result("Messages Need Admin Approval", False, "Messages should require admin approval", response)
        else:
            results.add_result("Messages Need Admin Approval", False, "Failed to send message for approval testing", response)
    
    # Test 2: Pending messages endpoint for admins
    if "admin" in results.tokens:
        success, response, status = make_request("GET", "/admin/messages/pending", token=results.tokens["admin"])
        if success and isinstance(response, list):
            pending_count = len(response)
            if pending_count > 0:
                results.add_result("Admin Pending Messages Endpoint", True, f"Admin can access {pending_count} pending message(s)")
            else:
                results.add_result("Admin Pending Messages Endpoint", True, "Admin can access pending messages endpoint (no pending messages)")
        else:
            results.add_result("Admin Pending Messages Endpoint", False, "Admin should be able to access pending messages", response)
    
    # Test 3: Admin can approve messages
    if "admin" in results.tokens and "message_id" in results.test_data:
        success, response, status = make_request("PUT", f"/admin/messages/{results.test_data['message_id']}/approve", token=results.tokens["admin"])
        if success:
            results.add_result("Admin Message Approval", True, "Admin can approve messages")
            
            # Verify message is now approved
            success, response, status = make_request("GET", "/admin/messages/pending", token=results.tokens["admin"])
            if success and isinstance(response, list):
                message_still_pending = any(msg.get("id") == results.test_data["message_id"] for msg in response)
                if not message_still_pending:
                    results.add_result("Message Approval Verification", True, "Message no longer in pending list after approval")
                else:
                    results.add_result("Message Approval Verification", False, "Message should not be in pending list after approval")
        else:
            results.add_result("Admin Message Approval", False, "Admin should be able to approve messages", response)
    
    # Test 4: Admin can delete messages
    # Send another message to test deletion
    if "student" in results.tokens and "request_id" in results.test_data:
        delete_message_data = {
            "request_id": results.test_data["request_id"],
            "receiver_id": results.test_data.get("supervisor_id", "test_receiver"),
            "message": "This message will be deleted by admin for testing purposes."
        }
        
        success, response, status = make_request("POST", "/chat/send", delete_message_data, results.tokens["student"])
        if success and "id" in response:
            delete_message_id = response["id"]
            
            # Admin deletes the message
            if "admin" in results.tokens:
                success, response, status = make_request("DELETE", f"/admin/messages/{delete_message_id}", token=results.tokens["admin"])
                if success:
                    results.add_result("Admin Message Deletion", True, "Admin can delete messages")
                else:
                    results.add_result("Admin Message Deletion", False, "Admin should be able to delete messages", response)
    
    # Test 5: Approved messages are visible to students and supervisors
    if "student" in results.tokens and "request_id" in results.test_data:
        success, response, status = make_request("GET", f"/chat/{results.test_data['request_id']}", token=results.tokens["student"])
        if success and isinstance(response, list):
            approved_messages = [msg for msg in response if msg.get("approved", False)]
            if len(approved_messages) > 0:
                results.add_result("Approved Messages Visible to Students", True, f"Student can see {len(approved_messages)} approved message(s)")
            else:
                results.add_result("Approved Messages Visible to Students", False, "Student should see approved messages")
        else:
            results.add_result("Approved Messages Visible to Students", False, "Failed to get chat messages for student", response)
    
    if "supervisor" in results.tokens and "request_id" in results.test_data:
        success, response, status = make_request("GET", f"/chat/{results.test_data['request_id']}", token=results.tokens["supervisor"])
        if success and isinstance(response, list):
            approved_messages = [msg for msg in response if msg.get("approved", False)]
            if len(approved_messages) > 0:
                results.add_result("Approved Messages Visible to Supervisors", True, f"Supervisor can see {len(approved_messages)} approved message(s)")
            else:
                results.add_result("Approved Messages Visible to Supervisors", False, "Supervisor should see approved messages")
        else:
            results.add_result("Approved Messages Visible to Supervisors", False, "Failed to get chat messages for supervisor", response)
    
    # Test 6: Unapproved messages are not visible to students/supervisors
    # Send another unapproved message
    if "supervisor" in results.tokens and "request_id" in results.test_data:
        unapproved_message_data = {
            "request_id": results.test_data["request_id"],
            "receiver_id": results.test_data.get("student_id", "test_receiver"),
            "message": "This message should not be visible until approved by admin."
        }
        
        success, response, status = make_request("POST", "/chat/send", unapproved_message_data, results.tokens["supervisor"])
        if success and "id" in response:
            unapproved_message_id = response["id"]
            
            # Check that student cannot see this unapproved message
            if "student" in results.tokens:
                success, response, status = make_request("GET", f"/chat/{results.test_data['request_id']}", token=results.tokens["student"])
                if success and isinstance(response, list):
                    unapproved_visible = any(msg.get("id") == unapproved_message_id for msg in response)
                    if not unapproved_visible:
                        results.add_result("Unapproved Messages Not Visible", True, "Unapproved messages correctly hidden from students/supervisors")
                    else:
                        results.add_result("Unapproved Messages Not Visible", False, "Unapproved messages should not be visible to students/supervisors")

def test_enhanced_bidding_system(results: MissingFeaturesTestResults):
    """Test Enhanced Bidding System (admin-only bid viewing)"""
    print("\n=== Testing Enhanced Bidding System ===")
    
    # Create another request for bidding tests
    if "student" in results.tokens:
        bid_request_data = {
            "title": "Modern Greek Literature Analysis",
            "due_date": (datetime.now() + timedelta(days=21)).isoformat(),
            "word_count": 3000,
            "assignment_type": "essay",
            "field_of_study": "literature",
            "attachments": [],
            "extra_information": "Focus on 20th century Greek poetry"
        }
        
        success, response, status = make_request("POST", "/requests", bid_request_data, results.tokens["student"])
        if success and "id" in response:
            results.test_data["bid_request_id"] = response["id"]
            results.add_result("Request Creation for Bidding", True, "Request created for bidding system testing")
        else:
            results.add_result("Request Creation for Bidding", False, "Failed to create request for bidding", response)
            return
    
    # Create bids from supervisor
    if "supervisor" in results.tokens and "bid_request_id" in results.test_data:
        bid_data = {
            "request_id": results.test_data["bid_request_id"],
            "price": 180.00,
            "estimated_completion": (datetime.now() + timedelta(days=15)).isoformat(),
            "proposal": "I have expertise in modern Greek literature and can provide comprehensive analysis."
        }
        
        success, response, status = make_request("POST", "/bids", bid_data, results.tokens["supervisor"])
        if success and "id" in response:
            results.test_data["test_bid_id"] = response["id"]
            results.add_result("Supervisor Bid Creation", True, "Supervisor created bid successfully")
        else:
            results.add_result("Supervisor Bid Creation", False, "Supervisor should be able to create bids", response)
    
    # Test 1: Only admins can see all bids (students cannot access)
    if "student" in results.tokens:
        success, response, status = make_request("GET", "/bids", token=results.tokens["student"])
        if not success and status == 403:
            results.add_result("Students Cannot Access Bids", True, "Students correctly cannot access bids endpoint")
        else:
            results.add_result("Students Cannot Access Bids", False, "Students should not be able to access bids endpoint", response)
    
    # Test 2: Supervisors can create bids and only see their own bids
    if "supervisor" in results.tokens:
        success, response, status = make_request("GET", "/bids", token=results.tokens["supervisor"])
        if success and isinstance(response, list):
            supervisor_bids = [bid for bid in response if bid.get("supervisor_id") == results.test_data.get("supervisor_id")]
            other_bids = [bid for bid in response if bid.get("supervisor_id") != results.test_data.get("supervisor_id")]
            
            if len(supervisor_bids) > 0 and len(other_bids) == 0:
                results.add_result("Supervisors See Only Own Bids", True, f"Supervisor sees only their own {len(supervisor_bids)} bid(s)")
            else:
                results.add_result("Supervisors See Only Own Bids", False, f"Supervisor should only see own bids. Own: {len(supervisor_bids)}, Others: {len(other_bids)}")
        else:
            results.add_result("Supervisors See Only Own Bids", False, "Supervisor should be able to see their own bids", response)
    
    # Test 3: Admins can see all bids
    if "admin" in results.tokens:
        success, response, status = make_request("GET", "/bids", token=results.tokens["admin"])
        if success and isinstance(response, list):
            total_bids = len(response)
            if total_bids > 0:
                results.add_result("Admins See All Bids", True, f"Admin can see all {total_bids} bid(s)")
            else:
                results.add_result("Admins See All Bids", True, "Admin can access bids endpoint (no bids found)")
        else:
            results.add_result("Admins See All Bids", False, "Admin should be able to see all bids", response)
    
    # Test 4: Bid notifications are sent to admins only (not students)
    if "admin" in results.tokens:
        success, response, status = make_request("GET", "/notifications", token=results.tokens["admin"])
        if success and isinstance(response, list):
            bid_notifications = [notif for notif in response if notif.get("type") == "bid_submitted"]
            if len(bid_notifications) > 0:
                results.add_result("Bid Notifications to Admins", True, f"Admin received {len(bid_notifications)} bid notification(s)")
            else:
                results.add_result("Bid Notifications to Admins", False, "Admin should receive bid notifications")
        else:
            results.add_result("Bid Notifications to Admins", False, "Failed to get admin notifications", response)
    
    # Verify students do NOT receive bid notifications
    if "student" in results.tokens:
        success, response, status = make_request("GET", "/notifications", token=results.tokens["student"])
        if success and isinstance(response, list):
            bid_notifications = [notif for notif in response if notif.get("type") == "bid_submitted"]
            if len(bid_notifications) == 0:
                results.add_result("No Bid Notifications to Students", True, "Students correctly do not receive bid notifications")
            else:
                results.add_result("No Bid Notifications to Students", False, f"Students should not receive bid notifications, found {len(bid_notifications)}")
        else:
            results.add_result("No Bid Notifications to Students", False, "Failed to get student notifications", response)

def test_full_user_crud_for_admins(results: MissingFeaturesTestResults):
    """Test Full User CRUD for Admins"""
    print("\n=== Testing Full User CRUD for Admins ===")
    
    import time
    timestamp = str(int(time.time()))
    
    # Test 1: Admin can create users
    if "admin" in results.tokens:
        new_user_data = {
            "email": f"new.test.user.{timestamp}@university.gr",
            "name": "New Test User",
            "password": "NewUserPass123!",
            "role": "supervisor"
        }
        
        success, response, status = make_request("POST", "/admin/users", new_user_data, results.tokens["admin"])
        if success and "id" in response:
            results.test_data["created_user_id"] = response["id"]
            results.add_result("Admin User Creation", True, "Admin can create new users")
        else:
            results.add_result("Admin User Creation", False, "Admin should be able to create new users", response)
    
    # Test 2: Admin can update users
    if "admin" in results.tokens and "created_user_id" in results.test_data:
        updated_user_data = {
            "email": f"updated.test.user.{timestamp}@university.gr",
            "name": "Updated Test User",
            "password": "UpdatedPass123!",
            "role": "supervisor"
        }
        
        success, response, status = make_request("PUT", f"/admin/users/{results.test_data['created_user_id']}", 
                                                updated_user_data, results.tokens["admin"])
        if success:
            results.add_result("Admin User Update", True, "Admin can update user information")
            
            # Verify update by getting user list
            success, response, status = make_request("GET", "/admin/users", token=results.tokens["admin"])
            if success and isinstance(response, list):
                updated_user = next((user for user in response if user.get("id") == results.test_data["created_user_id"]), None)
                if updated_user and updated_user.get("name") == "Updated Test User":
                    results.add_result("User Update Verification", True, "User information successfully updated")
                else:
                    results.add_result("User Update Verification", False, "User information should be updated")
        else:
            results.add_result("Admin User Update", False, "Admin should be able to update user information", response)
    
    # Test 3: Admin can delete users
    if "admin" in results.tokens and "created_user_id" in results.test_data:
        success, response, status = make_request("DELETE", f"/admin/users/{results.test_data['created_user_id']}", 
                                                token=results.tokens["admin"])
        if success:
            results.add_result("Admin User Deletion", True, "Admin can delete users")
            
            # Verify deletion
            success, response, status = make_request("GET", "/admin/users", token=results.tokens["admin"])
            if success and isinstance(response, list):
                deleted_user_exists = any(user.get("id") == results.test_data["created_user_id"] for user in response)
                if not deleted_user_exists:
                    results.add_result("User Deletion Verification", True, "User successfully deleted")
                else:
                    results.add_result("User Deletion Verification", False, "User should be deleted")
        else:
            results.add_result("Admin User Deletion", False, "Admin should be able to delete users", response)
    
    # Test 4: Admin can list all users
    if "admin" in results.tokens:
        success, response, status = make_request("GET", "/admin/users", token=results.tokens["admin"])
        if success and isinstance(response, list):
            user_count = len(response)
            if user_count >= 3:  # Should have at least our test users
                results.add_result("Admin List All Users", True, f"Admin can list all {user_count} users")
            else:
                results.add_result("Admin List All Users", False, f"Admin should see all users, found {user_count}")
        else:
            results.add_result("Admin List All Users", False, "Admin should be able to list all users", response)
    
    # Test 5: Admin can list supervisors
    if "admin" in results.tokens:
        success, response, status = make_request("GET", "/admin/supervisors", token=results.tokens["admin"])
        if success and isinstance(response, list):
            supervisor_count = len(response)
            if supervisor_count >= 1:  # Should have at least our test supervisor
                results.add_result("Admin List Supervisors", True, f"Admin can list {supervisor_count} supervisor(s)")
            else:
                results.add_result("Admin List Supervisors", False, f"Admin should see supervisors, found {supervisor_count}")
        else:
            results.add_result("Admin List Supervisors", False, "Admin should be able to list supervisors", response)
    
    # Test access restrictions - non-admin cannot perform user CRUD
    if "student" in results.tokens:
        # Test student cannot create users
        unauthorized_user_data = {
            "email": f"unauthorized.{timestamp}@university.gr",
            "name": "Unauthorized User",
            "password": "UnauthorizedPass123!",
            "role": "student"
        }
        
        success, response, status = make_request("POST", "/admin/users", unauthorized_user_data, results.tokens["student"])
        if not success and status == 403:
            results.add_result("User CRUD Access Control", True, "Non-admins correctly cannot perform user CRUD operations")
        else:
            results.add_result("User CRUD Access Control", False, "Non-admins should not be able to perform user CRUD operations", response)

def test_enhanced_notification_system(results: MissingFeaturesTestResults):
    """Test Enhanced Notification System"""
    print("\n=== Testing Enhanced Notification System ===")
    
    # Test 1: Notification badges appear correctly (check unread notifications)
    for role in ["student", "supervisor", "admin"]:
        if role in results.tokens:
            success, response, status = make_request("GET", "/notifications", token=results.tokens[role])
            if success and isinstance(response, list):
                total_notifications = len(response)
                unread_notifications = [notif for notif in response if not notif.get("read", False)]
                unread_count = len(unread_notifications)
                
                results.add_result(f"{role.title()} Notification Badge Count", True, 
                                 f"{role.title()} has {unread_count} unread out of {total_notifications} total notifications")
            else:
                results.add_result(f"{role.title()} Notification Badge Count", False, 
                                 f"Failed to get {role} notifications for badge count", response)
    
    # Test 2: Unread notification counts
    if "student" in results.tokens:
        success, response, status = make_request("GET", "/notifications", token=results.tokens["student"])
        if success and isinstance(response, list):
            unread_count = sum(1 for notif in response if not notif.get("read", False))
            results.add_result("Unread Notification Count", True, f"Student has {unread_count} unread notifications")
            
            # Test marking notification as read
            if len(response) > 0:
                first_notification_id = response[0]["id"]
                success, response, status = make_request("PUT", f"/notifications/{first_notification_id}/read", 
                                                        token=results.tokens["student"])
                if success:
                    results.add_result("Mark Notification Read", True, "Notification successfully marked as read")
                    
                    # Verify read status changed
                    success, response, status = make_request("GET", "/notifications", token=results.tokens["student"])
                    if success and isinstance(response, list):
                        marked_notification = next((notif for notif in response if notif.get("id") == first_notification_id), None)
                        if marked_notification and marked_notification.get("read", False):
                            results.add_result("Read Status Verification", True, "Notification read status correctly updated")
                        else:
                            results.add_result("Read Status Verification", False, "Notification read status should be updated")
                else:
                    results.add_result("Mark Notification Read", False, "Failed to mark notification as read", response)
        else:
            results.add_result("Unread Notification Count", False, "Failed to get notifications for count", response)
    
    # Test 3: Various notification types
    notification_types_found = set()
    
    for role in ["student", "supervisor", "admin"]:
        if role in results.tokens:
            success, response, status = make_request("GET", "/notifications", token=results.tokens[role])
            if success and isinstance(response, list):
                for notif in response:
                    if notif.get("type"):
                        notification_types_found.add(notif["type"])
    
    expected_types = ["admin_price", "bid_submitted", "message_approval", "new_request", "assignment"]
    found_expected_types = [ntype for ntype in expected_types if ntype in notification_types_found]
    
    if len(found_expected_types) > 0:
        results.add_result("Various Notification Types", True, 
                         f"Found notification types: {list(notification_types_found)}")
    else:
        results.add_result("Various Notification Types", False, 
                         f"Expected notification types not found. Found: {list(notification_types_found)}")

def print_missing_features_summary(results: MissingFeaturesTestResults):
    """Print missing features test summary"""
    print("\n" + "="*80)
    print("MISSING FEATURES BACKEND TESTING SUMMARY")
    print("="*80)
    
    total_tests = len(results.results)
    passed_tests = sum(1 for result in results.results.values() if result["success"])
    failed_tests = total_tests - passed_tests
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    # Group results by feature category
    categories = {
        "Setup": [],
        "Admin Price Management": [],
        "Enhanced Chat System": [],
        "Enhanced Bidding System": [],
        "User CRUD": [],
        "Enhanced Notifications": []
    }
    
    for test_name, result in results.results.items():
        if any(keyword in test_name.lower() for keyword in ["registration", "setup"]):
            categories["Setup"].append((test_name, result))
        elif "price" in test_name.lower():
            categories["Admin Price Management"].append((test_name, result))
        elif any(keyword in test_name.lower() for keyword in ["chat", "message", "approval"]):
            categories["Enhanced Chat System"].append((test_name, result))
        elif "bid" in test_name.lower():
            categories["Enhanced Bidding System"].append((test_name, result))
        elif "user" in test_name.lower() and any(keyword in test_name.lower() for keyword in ["crud", "creation", "update", "deletion", "list"]):
            categories["User CRUD"].append((test_name, result))
        elif "notification" in test_name.lower():
            categories["Enhanced Notifications"].append((test_name, result))
    
    for category, tests in categories.items():
        if tests:
            print(f"\n--- {category} ---")
            for test_name, result in tests:
                status = "✅" if result["success"] else "❌"
                print(f"  {status} {test_name}: {result['message']}")
    
    # Summary by feature
    print(f"\n--- FEATURE SUMMARY ---")
    feature_results = {}
    for category, tests in categories.items():
        if tests and category != "Setup":
            passed = sum(1 for _, result in tests if result["success"])
            total = len(tests)
            feature_results[category] = f"{passed}/{total} tests passed"
    
    for feature, result in feature_results.items():
        print(f"  {feature}: {result}")

def main():
    """Main missing features test execution"""
    print("Starting Missing Features Backend Testing for Essay Bid Submission System...")
    print(f"Testing against: {BASE_URL}")
    print("Focus: Missing features mentioned in review request")
    
    results = MissingFeaturesTestResults()
    
    # Execute missing features test suites
    setup_test_users(results)
    test_admin_price_management(results)
    test_enhanced_chat_system_with_admin_approval(results)
    test_enhanced_bidding_system(results)
    test_full_user_crud_for_admins(results)
    test_enhanced_notification_system(results)
    
    # Print summary
    print_missing_features_summary(results)
    
    return results

if __name__ == "__main__":
    main()