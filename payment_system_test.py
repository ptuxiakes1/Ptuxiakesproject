#!/usr/bin/env python3
"""
Payment System Testing for Essay Bid Submission System
Tests the new payment system functionality including:
1. Payment Info Management with Request-based System
2. Updated System Settings with Login Title
3. Essay Request Sorting
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import sys

# Configuration
BASE_URL = "https://9bc8a6f2-9f09-4c20-aa03-681a44fc48ba.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class TestResults:
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

def make_request(method: str, endpoint: str, data: Dict = None, token: str = None) -> tuple:
    """Make HTTP request and return (success, response_data, status_code)"""
    url = f"{BASE_URL}{endpoint}"
    headers = HEADERS.copy()
    
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers)
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

def setup_test_users(results: TestResults):
    """Setup test users for payment system testing"""
    print("\n=== Setting up Test Users ===")
    
    import time
    timestamp = str(int(time.time()))
    
    # Create student
    student_data = {
        "email": f"payment.student.{timestamp}@university.gr",
        "name": "Payment Test Student",
        "password": "StudentPass123!",
        "role": "student"
    }
    
    success, response, status = make_request("POST", "/auth/register", student_data)
    if success and "token" in response:
        results.tokens["student"] = response["token"]
        results.test_data["student_id"] = response["user"]["id"]
        results.add_result("Student Setup", True, "Test student created successfully")
    else:
        results.add_result("Student Setup", False, "Failed to create test student", response)
        return False
    
    # Create admin
    admin_data = {
        "email": f"payment.admin.{timestamp}@university.gr",
        "name": "Payment Test Admin",
        "password": "AdminPass123!",
        "role": "admin"
    }
    
    success, response, status = make_request("POST", "/auth/register", admin_data)
    if success and "token" in response:
        results.tokens["admin"] = response["token"]
        results.test_data["admin_id"] = response["user"]["id"]
        results.add_result("Admin Setup", True, "Test admin created successfully")
    else:
        results.add_result("Admin Setup", False, "Failed to create test admin", response)
        return False
    
    return True

def setup_test_essay_request(results: TestResults):
    """Create a test essay request for payment testing"""
    print("\n=== Setting up Test Essay Request ===")
    
    if "student" not in results.tokens:
        results.add_result("Essay Request Setup", False, "No student token available")
        return False
    
    essay_request_data = {
        "title": "Payment System Test Essay",
        "due_date": (datetime.now() + timedelta(days=14)).isoformat(),
        "word_count": 2000,
        "assignment_type": "essay",
        "field_of_study": "computer_science",
        "attachments": [],
        "extra_information": "Test essay request for payment system testing"
    }
    
    success, response, status = make_request("POST", "/requests", essay_request_data, results.tokens["student"])
    if success and "id" in response:
        results.test_data["essay_request_id"] = response["id"]
        results.add_result("Essay Request Setup", True, "Test essay request created successfully")
        return True
    else:
        results.add_result("Essay Request Setup", False, "Failed to create test essay request", response)
        return False

def test_payment_info_management(results: TestResults):
    """Test Payment Info Management with Request-based System"""
    print("\n=== Testing Payment Info Management ===")
    
    if "admin" not in results.tokens or "essay_request_id" not in results.test_data:
        results.add_result("Payment Info Tests", False, "Missing admin token or essay request for testing")
        return
    
    # Test 1: Create payment info by selecting essay request (not bid)
    payment_data = {
        "student_id": results.test_data["student_id"],
        "request_id": results.test_data["essay_request_id"],
        "payment_method": "IBAN",
        "payment_details": "GR1601101250000000012300695",
        "instructions": "Please use reference number: PAY-2024-001"
    }
    
    success, response, status = make_request("POST", "/admin/payments", payment_data, results.tokens["admin"])
    if success and "id" in response:
        results.test_data["payment_info_id"] = response["id"]
        results.add_result("Create Payment Info with Request ID", True, "Payment info created successfully using request_id")
        
        # Verify the payment info contains correct request_id
        if response.get("request_id") == results.test_data["essay_request_id"]:
            results.add_result("Payment Info Request ID Verification", True, "Payment info correctly linked to request_id")
        else:
            results.add_result("Payment Info Request ID Verification", False, "Payment info not correctly linked to request_id", response)
    else:
        results.add_result("Create Payment Info with Request ID", False, "Failed to create payment info with request_id", response)
    
    # Test 2: Admin can set payment information for any essay request
    # Create another student and request
    import time
    timestamp = str(int(time.time()))
    other_student_data = {
        "email": f"other.payment.student.{timestamp}@university.gr",
        "name": "Other Payment Student",
        "password": "OtherPass123!",
        "role": "student"
    }
    
    success, response, status = make_request("POST", "/auth/register", other_student_data)
    if success and "token" in response:
        other_student_token = response["token"]
        other_student_id = response["user"]["id"]
        
        # Create essay request for other student
        other_essay_data = {
            "title": "Other Student Essay",
            "due_date": (datetime.now() + timedelta(days=10)).isoformat(),
            "word_count": 1500,
            "assignment_type": "essay",
            "field_of_study": "mathematics",
            "attachments": [],
            "extra_information": "Another test essay"
        }
        
        success, response, status = make_request("POST", "/requests", other_essay_data, other_student_token)
        if success and "id" in response:
            other_request_id = response["id"]
            
            # Admin creates payment info for other student's request
            other_payment_data = {
                "student_id": other_student_id,
                "request_id": other_request_id,
                "payment_method": "PayPal",
                "payment_details": "payments@university.gr",
                "instructions": "PayPal payment for essay services"
            }
            
            success, response, status = make_request("POST", "/admin/payments", other_payment_data, results.tokens["admin"])
            if success and "id" in response:
                results.add_result("Admin Set Payment for Any Request", True, "Admin can set payment info for any student's request")
            else:
                results.add_result("Admin Set Payment for Any Request", False, "Admin should be able to set payment info for any request", response)
    
    # Test 3: Retrieve payment info by request_id
    if "essay_request_id" in results.test_data:
        success, response, status = make_request("GET", f"/payments/request/{results.test_data['essay_request_id']}", token=results.tokens["admin"])
        if success and "id" in response:
            results.add_result("Get Payment by Request ID", True, "Successfully retrieved payment info by request_id")
            
            # Verify it's the correct payment info
            if response.get("request_id") == results.test_data["essay_request_id"]:
                results.add_result("Payment Retrieval Accuracy", True, "Retrieved payment info matches request_id")
            else:
                results.add_result("Payment Retrieval Accuracy", False, "Retrieved payment info doesn't match request_id", response)
        else:
            results.add_result("Get Payment by Request ID", False, "Failed to retrieve payment info by request_id", response)
    
    # Test 4: Students can only see their own payment information
    if "student" in results.tokens and "essay_request_id" in results.test_data:
        # Student accessing their own payment info
        success, response, status = make_request("GET", f"/payments/request/{results.test_data['essay_request_id']}", token=results.tokens["student"])
        if success and "id" in response:
            results.add_result("Student Access Own Payment", True, "Student can access their own payment information")
        else:
            results.add_result("Student Access Own Payment", False, "Student should be able to access their own payment info", response)
        
        # Test student accessing payment info by student_id
        success, response, status = make_request("GET", f"/payments/student/{results.test_data['student_id']}", token=results.tokens["student"])
        if success and isinstance(response, list):
            results.add_result("Student List Own Payments", True, f"Student can list their own payments ({len(response)} found)")
        else:
            results.add_result("Student List Own Payments", False, "Student should be able to list their own payments", response)
        
        # Test student trying to access another student's payment (should fail)
        if other_student_id:
            success, response, status = make_request("GET", f"/payments/student/{other_student_id}", token=results.tokens["student"])
            if not success and status == 403:
                results.add_result("Student Payment Access Control", True, "Student correctly prevented from accessing other student's payments")
            else:
                results.add_result("Student Payment Access Control", False, "Student should not access other student's payments", response)
    
    # Test 5: Test duplicate payment prevention
    if "essay_request_id" in results.test_data:
        duplicate_payment_data = {
            "student_id": results.test_data["student_id"],
            "request_id": results.test_data["essay_request_id"],
            "payment_method": "Stripe",
            "payment_details": "https://stripe.com/payment/123",
            "instructions": "Duplicate payment attempt"
        }
        
        success, response, status = make_request("POST", "/admin/payments", duplicate_payment_data, results.tokens["admin"])
        if not success and status == 400:
            results.add_result("Duplicate Payment Prevention", True, "System correctly prevents duplicate payment info for same request")
        else:
            results.add_result("Duplicate Payment Prevention", False, "System should prevent duplicate payment info for same request", response)

def test_system_settings_with_login_title(results: TestResults):
    """Test Updated System Settings with Login Title"""
    print("\n=== Testing System Settings with Login Title ===")
    
    if "admin" not in results.tokens:
        results.add_result("System Settings Tests", False, "No admin token available for testing")
        return
    
    # Test 1: Get system settings and verify login_title field exists
    success, response, status = make_request("GET", "/admin/system-settings", token=results.tokens["admin"])
    if success and "id" in response:
        results.add_result("System Settings Retrieval", True, "System settings retrieved successfully")
        
        # Check if login_title field exists
        if "login_title" in response:
            results.add_result("Login Title Field Exists", True, f"login_title field exists with value: '{response['login_title']}'")
            
            # Verify default value
            if response["login_title"] == "Essay Bid Submission System":
                results.add_result("Login Title Default Value", True, "login_title has correct default value")
            else:
                results.add_result("Login Title Default Value", False, f"login_title default should be 'Essay Bid Submission System', got '{response['login_title']}'")
        else:
            results.add_result("Login Title Field Exists", False, "login_title field missing from system settings", response)
        
        # Check if site_title also exists (should be separate)
        if "site_title" in response:
            results.add_result("Site Title Field Exists", True, f"site_title field exists with value: '{response['site_title']}'")
        else:
            results.add_result("Site Title Field Exists", False, "site_title field missing from system settings", response)
    else:
        results.add_result("System Settings Retrieval", False, "Failed to retrieve system settings", response)
    
    # Test 2: Update system settings including login_title
    settings_update = {
        "site_title": "Academic Essay Platform",
        "login_title": "Welcome to Essay Portal",
        "site_description": "Professional academic writing platform",
        "header_color": "#2563eb",
        "meta_keywords": "essays, academic, writing, students"
    }
    
    success, response, status = make_request("PUT", "/admin/system-settings", settings_update, results.tokens["admin"])
    if success:
        results.add_result("System Settings Update with Login Title", True, "System settings updated successfully including login_title")
        
        # Verify updates were applied
        success, response, status = make_request("GET", "/admin/system-settings", token=results.tokens["admin"])
        if success:
            updates_applied = True
            failed_updates = []
            
            for key, expected_value in settings_update.items():
                if response.get(key) != expected_value:
                    updates_applied = False
                    failed_updates.append(f"{key}: expected '{expected_value}', got '{response.get(key)}'")
            
            if updates_applied:
                results.add_result("System Settings Update Verification", True, "All system settings updates applied correctly")
            else:
                results.add_result("System Settings Update Verification", False, f"Some updates failed: {failed_updates}", response)
        else:
            results.add_result("System Settings Update Verification", False, "Failed to verify system settings updates", response)
    else:
        results.add_result("System Settings Update with Login Title", False, "Failed to update system settings", response)
    
    # Test 3: Verify login_title can be configured separately from site_title
    separate_update = {
        "login_title": "Student Login Portal"
        # Not updating site_title
    }
    
    success, response, status = make_request("PUT", "/admin/system-settings", separate_update, results.tokens["admin"])
    if success:
        # Verify only login_title changed
        success, response, status = make_request("GET", "/admin/system-settings", token=results.tokens["admin"])
        if success:
            if response.get("login_title") == "Student Login Portal" and response.get("site_title") == "Academic Essay Platform":
                results.add_result("Separate Login Title Configuration", True, "login_title can be configured separately from site_title")
            else:
                results.add_result("Separate Login Title Configuration", False, f"login_title: '{response.get('login_title')}', site_title: '{response.get('site_title')}'", response)
        else:
            results.add_result("Separate Login Title Configuration", False, "Failed to verify separate configuration", response)
    else:
        results.add_result("Separate Login Title Configuration", False, "Failed to update login_title separately", response)
    
    # Test 4: Test access control for system settings
    if "student" in results.tokens:
        success, response, status = make_request("GET", "/admin/system-settings", token=results.tokens["student"])
        if not success and status == 403:
            results.add_result("System Settings Access Control", True, "Non-admin correctly denied access to system settings")
        else:
            results.add_result("System Settings Access Control", False, "Should deny non-admin access to system settings", response)

def test_essay_request_sorting(results: TestResults):
    """Test Essay Request Sorting"""
    print("\n=== Testing Essay Request Sorting ===")
    
    if "student" not in results.tokens:
        results.add_result("Essay Request Sorting Tests", False, "No student token available for testing")
        return
    
    # Create multiple essay requests with different timestamps to test sorting
    essay_requests = []
    for i in range(3):
        essay_data = {
            "title": f"Sorting Test Essay {i+1}",
            "due_date": (datetime.now() + timedelta(days=7+i)).isoformat(),
            "word_count": 1000 + (i * 500),
            "assignment_type": "essay",
            "field_of_study": "testing",
            "attachments": [],
            "extra_information": f"Test essay {i+1} for sorting verification"
        }
        
        success, response, status = make_request("POST", "/requests", essay_data, results.tokens["student"])
        if success and "id" in response:
            essay_requests.append({
                "id": response["id"],
                "title": response["title"],
                "created_at": response["created_at"]
            })
        
        # Small delay to ensure different timestamps
        import time
        time.sleep(0.1)
    
    if len(essay_requests) < 3:
        results.add_result("Essay Request Sorting Setup", False, "Failed to create enough test requests for sorting test")
        return
    
    results.add_result("Essay Request Sorting Setup", True, f"Created {len(essay_requests)} test requests for sorting")
    
    # Test 1: Verify requests are returned sorted by created_at (newest first)
    success, response, status = make_request("GET", "/requests", token=results.tokens["student"])
    if success and isinstance(response, list):
        # Filter to only our test requests
        test_requests = [req for req in response if req.get("field_of_study") == "testing"]
        
        if len(test_requests) >= 3:
            # Check if sorted by created_at descending (newest first)
            is_sorted_correctly = True
            for i in range(len(test_requests) - 1):
                current_time = datetime.fromisoformat(test_requests[i]["created_at"].replace('Z', '+00:00'))
                next_time = datetime.fromisoformat(test_requests[i+1]["created_at"].replace('Z', '+00:00'))
                if current_time < next_time:  # Should be newer (greater) than next
                    is_sorted_correctly = False
                    break
            
            if is_sorted_correctly:
                results.add_result("Essay Request Sorting by Date", True, "Essay requests correctly sorted by created_at (newest first)")
            else:
                results.add_result("Essay Request Sorting by Date", False, "Essay requests not sorted correctly by created_at", test_requests)
        else:
            results.add_result("Essay Request Sorting by Date", False, f"Not enough test requests found for sorting verification (found {len(test_requests)})")
    else:
        results.add_result("Essay Request Sorting by Date", False, "Failed to retrieve essay requests for sorting test", response)
    
    # Test 2: Verify search functionality still works with sorting
    success, response, status = make_request("GET", "/requests?search=Sorting", token=results.tokens["student"])
    if success and isinstance(response, list):
        search_results = [req for req in response if "Sorting" in req.get("title", "")]
        if len(search_results) > 0:
            results.add_result("Search with Sorting", True, f"Search functionality works with sorting ({len(search_results)} results found)")
            
            # Verify search results are also sorted
            if len(search_results) > 1:
                is_search_sorted = True
                for i in range(len(search_results) - 1):
                    current_time = datetime.fromisoformat(search_results[i]["created_at"].replace('Z', '+00:00'))
                    next_time = datetime.fromisoformat(search_results[i+1]["created_at"].replace('Z', '+00:00'))
                    if current_time < next_time:
                        is_search_sorted = False
                        break
                
                if is_search_sorted:
                    results.add_result("Search Results Sorting", True, "Search results maintain correct sorting order")
                else:
                    results.add_result("Search Results Sorting", False, "Search results not properly sorted", search_results)
        else:
            results.add_result("Search with Sorting", False, "Search functionality not working properly")
    else:
        results.add_result("Search with Sorting", False, "Failed to test search functionality", response)
    
    # Test 3: Verify filtering functionality still works with sorting
    success, response, status = make_request("GET", "/requests?category=testing", token=results.tokens["student"])
    if success and isinstance(response, list):
        filter_results = [req for req in response if req.get("field_of_study") == "testing"]
        if len(filter_results) > 0:
            results.add_result("Filtering with Sorting", True, f"Filtering functionality works with sorting ({len(filter_results)} results found)")
            
            # Verify filtered results are also sorted
            if len(filter_results) > 1:
                is_filter_sorted = True
                for i in range(len(filter_results) - 1):
                    current_time = datetime.fromisoformat(filter_results[i]["created_at"].replace('Z', '+00:00'))
                    next_time = datetime.fromisoformat(filter_results[i+1]["created_at"].replace('Z', '+00:00'))
                    if current_time < next_time:
                        is_filter_sorted = False
                        break
                
                if is_filter_sorted:
                    results.add_result("Filter Results Sorting", True, "Filter results maintain correct sorting order")
                else:
                    results.add_result("Filter Results Sorting", False, "Filter results not properly sorted", filter_results)
        else:
            results.add_result("Filtering with Sorting", False, "Filtering functionality not working properly")
    else:
        results.add_result("Filtering with Sorting", False, "Failed to test filtering functionality", response)

def test_backward_compatibility(results: TestResults):
    """Test backward compatibility for payment system"""
    print("\n=== Testing Backward Compatibility ===")
    
    if "admin" not in results.tokens:
        results.add_result("Backward Compatibility Tests", False, "No admin token available for testing")
        return
    
    # Test that old bid_id field is still supported (optional)
    if "essay_request_id" in results.test_data:
        payment_with_bid_data = {
            "student_id": results.test_data["student_id"],
            "request_id": results.test_data["essay_request_id"],
            "bid_id": "legacy_bid_123",  # Optional field for backward compatibility
            "payment_method": "Custom",
            "payment_details": "Bank transfer details",
            "instructions": "Legacy payment with bid_id"
        }
        
        success, response, status = make_request("POST", "/admin/payments", payment_with_bid_data, results.tokens["admin"])
        if success and "id" in response:
            results.add_result("Backward Compatibility with bid_id", True, "Payment system accepts optional bid_id for backward compatibility")
            
            # Test retrieval by bid_id (if endpoint exists)
            success, response, status = make_request("GET", f"/payments/bid/legacy_bid_123", token=results.tokens["admin"])
            if success:
                results.add_result("Payment Retrieval by bid_id", True, "Payment can be retrieved by bid_id for backward compatibility")
            else:
                results.add_result("Payment Retrieval by bid_id", False, "Payment retrieval by bid_id not working", response)
        else:
            results.add_result("Backward Compatibility with bid_id", False, "Payment system should accept optional bid_id", response)

def print_summary(results: TestResults):
    """Print test summary"""
    print("\n" + "="*80)
    print("PAYMENT SYSTEM TESTING SUMMARY")
    print("="*80)
    
    total_tests = len(results.results)
    passed_tests = sum(1 for result in results.results.values() if result["success"])
    failed_tests = total_tests - passed_tests
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    if failed_tests > 0:
        print(f"\n❌ FAILED TESTS ({failed_tests}):")
        for test_name, result in results.results.items():
            if not result["success"]:
                print(f"  - {test_name}: {result['message']}")
    
    print(f"\n✅ PASSED TESTS ({passed_tests}):")
    for test_name, result in results.results.items():
        if result["success"]:
            print(f"  - {test_name}: {result['message']}")

def main():
    """Main test execution"""
    print("Starting Payment System Testing...")
    print(f"Testing against: {BASE_URL}")
    
    results = TestResults()
    
    # Setup test environment
    if not setup_test_users(results):
        print("Failed to setup test users. Exiting.")
        return results
    
    if not setup_test_essay_request(results):
        print("Failed to setup test essay request. Exiting.")
        return results
    
    # Execute payment system tests
    test_payment_info_management(results)
    test_system_settings_with_login_title(results)
    test_essay_request_sorting(results)
    test_backward_compatibility(results)
    
    # Print summary
    print_summary(results)
    
    return results

if __name__ == "__main__":
    main()