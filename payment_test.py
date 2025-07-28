#!/usr/bin/env python3
"""
Enhanced Payment System Testing
Tests the payment approval workflow and enhanced payment functionality
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
    """Setup test users for payment testing"""
    print("\n=== Setting up Test Users ===")
    
    import time
    timestamp = str(int(time.time()))
    
    # Create student
    student_data = {
        "email": f"payment.student.{timestamp}@university.gr",
        "name": "Payment Test Student",
        "password": "PaymentTest123!",
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
        "password": "PaymentAdmin123!",
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

def test_enhanced_payment_system(results: TestResults):
    """Test Enhanced Payment System with Approval Workflow"""
    print("\n=== Testing Enhanced Payment System ===")
    
    if "admin" not in results.tokens or "student" not in results.tokens:
        results.add_result("Payment System Tests", False, "Missing admin or student tokens for testing")
        return
    
    # Create a new essay request for payment testing
    payment_essay_request_data = {
        "title": "Byzantine Art and Architecture Analysis",
        "due_date": (datetime.now() + timedelta(days=30)).isoformat(),
        "word_count": 4000,
        "assignment_type": "essay",
        "field_of_study": "art_history",
        "attachments": [],
        "extra_information": "Focus on the influence of Byzantine art on modern Greek architecture"
    }
    
    success, response, status = make_request("POST", "/requests", payment_essay_request_data, results.tokens["student"])
    if not success or "id" not in response:
        results.add_result("Payment Test Request Creation", False, "Failed to create essay request for payment testing", response)
        return
    
    payment_request_id = response["id"]
    results.test_data["payment_request_id"] = payment_request_id
    results.add_result("Payment Test Request Creation", True, "Created essay request for payment testing")
    
    # Test 1: Create payment info with default "pending" status
    payment_data = {
        "student_id": results.test_data["student_id"],
        "request_id": payment_request_id,
        "payment_method": "IBAN",
        "payment_details": "GR16 0110 1250 0000 0001 2345 678",
        "instructions": "Please transfer the amount to the provided IBAN. Include your student ID in the reference."
    }
    
    success, response, status = make_request("POST", "/admin/payments", payment_data, results.tokens["admin"])
    if success and "id" in response:
        payment_id = response["id"]
        results.test_data["payment_id"] = payment_id
        
        # Verify default status is "pending"
        if response.get("status") == "pending":
            results.add_result("Payment Creation with Pending Status", True, "Payment info created with default 'pending' status")
        else:
            results.add_result("Payment Creation with Pending Status", False, f"Expected 'pending' status, got '{response.get('status')}'", response)
        
        # Verify required fields are present
        required_fields = ["id", "student_id", "request_id", "payment_method", "payment_details", "status", "created_by_admin", "created_at"]
        missing_fields = [field for field in required_fields if field not in response]
        
        if not missing_fields:
            results.add_result("Payment Info Model Fields", True, "All required payment info fields present")
        else:
            results.add_result("Payment Info Model Fields", False, f"Missing fields: {missing_fields}", response)
    else:
        results.add_result("Payment Creation with Pending Status", False, "Failed to create payment info", response)
        return
    
    # Test 2: Verify payment info retrieval with new fields
    success, response, status = make_request("GET", f"/payments/request/{payment_request_id}", token=results.tokens["student"])
    if success:
        # Check for enhanced fields
        enhanced_fields = ["status", "approved_by", "approved_at"]
        has_enhanced_fields = all(field in response for field in enhanced_fields)
        
        if has_enhanced_fields:
            results.add_result("Enhanced Payment Model Fields", True, "Payment info includes status, approved_by, and approved_at fields")
        else:
            missing_enhanced = [field for field in enhanced_fields if field not in response]
            results.add_result("Enhanced Payment Model Fields", False, f"Missing enhanced fields: {missing_enhanced}", response)
        
        # Verify initial values
        if response.get("status") == "pending" and response.get("approved_by") is None and response.get("approved_at") is None:
            results.add_result("Initial Payment Field Values", True, "Payment has correct initial field values")
        else:
            results.add_result("Initial Payment Field Values", False, "Payment initial field values incorrect", response)
    else:
        results.add_result("Enhanced Payment Model Fields", False, "Failed to retrieve payment info", response)
    
    # Test 3: Test payment approval endpoint
    success, response, status = make_request("PUT", f"/admin/payments/{payment_id}/approve", token=results.tokens["admin"])
    if success:
        results.add_result("Payment Approval Endpoint", True, "Payment approval endpoint working")
        
        # Test 4: Verify payment status updated to "approved"
        success, response, status = make_request("GET", f"/payments/request/{payment_request_id}", token=results.tokens["admin"])
        if success:
            if response.get("status") == "approved":
                results.add_result("Payment Status Update on Approval", True, "Payment status updated to 'approved'")
            else:
                results.add_result("Payment Status Update on Approval", False, f"Expected 'approved' status, got '{response.get('status')}'", response)
            
            # Test 5: Verify approved_by and approved_at fields are set
            if response.get("approved_by") == results.test_data["admin_id"] and response.get("approved_at") is not None:
                results.add_result("Payment Approval Fields Set", True, "approved_by and approved_at fields set correctly")
            else:
                results.add_result("Payment Approval Fields Set", False, "approved_by and approved_at fields not set correctly", response)
        else:
            results.add_result("Payment Status Update on Approval", False, "Failed to retrieve payment after approval", response)
        
        # Test 6: Verify essay request auto-assignment
        success, response, status = make_request("GET", f"/requests/{payment_request_id}", token=results.tokens["admin"])
        if success:
            if response.get("status") == "accepted":
                results.add_result("Essay Auto-Assignment on Payment Approval", True, "Essay request status changed to 'accepted' after payment approval")
            else:
                results.add_result("Essay Auto-Assignment on Payment Approval", False, f"Expected 'accepted' status, got '{response.get('status')}'", response)
            
            # Test 7: Verify supervisor assignment
            if response.get("assigned_supervisor") == results.test_data["admin_id"]:
                results.add_result("Supervisor Assignment on Payment Approval", True, "Essay assigned to approving admin")
            else:
                results.add_result("Supervisor Assignment on Payment Approval", False, f"Expected admin assignment, got '{response.get('assigned_supervisor')}'", response)
        else:
            results.add_result("Essay Auto-Assignment on Payment Approval", False, "Failed to retrieve essay request after payment approval", response)
        
        # Test 8: Verify notification creation for student
        success, response, status = make_request("GET", "/notifications", token=results.tokens["student"])
        if success and isinstance(response, list):
            # Look for payment approval notification
            payment_notifications = [notif for notif in response if notif.get("type") == "payment_approved"]
            if payment_notifications:
                results.add_result("Payment Approval Notification", True, "Student received payment approval notification")
            else:
                results.add_result("Payment Approval Notification", False, "Student did not receive payment approval notification", response)
        else:
            results.add_result("Payment Approval Notification", False, "Failed to retrieve student notifications", response)
    else:
        results.add_result("Payment Approval Endpoint", False, "Payment approval endpoint failed", response)
    
    # Test 9: Test payment info access control
    # Student should only access their own payment info
    success, response, status = make_request("GET", f"/payments/student/{results.test_data['student_id']}", token=results.tokens["student"])
    if success and isinstance(response, list):
        results.add_result("Student Payment Access Control", True, "Student can access their own payment info")
    else:
        results.add_result("Student Payment Access Control", False, "Student cannot access their own payment info", response)
    
    # Test 10: Test duplicate payment prevention
    duplicate_payment_data = {
        "student_id": results.test_data["student_id"],
        "request_id": payment_request_id,
        "payment_method": "PayPal",
        "payment_details": "student@university.gr",
        "instructions": "PayPal payment"
    }
    
    success, response, status = make_request("POST", "/admin/payments", duplicate_payment_data, results.tokens["admin"])
    if not success and status == 400:
        results.add_result("Duplicate Payment Prevention", True, "Correctly prevented duplicate payment info for same request")
    else:
        results.add_result("Duplicate Payment Prevention", False, "Should prevent duplicate payment info for same request", response)
    
    # Test 11: Test admin-only access to payment creation
    # Create a supervisor to test access control
    import time
    timestamp = str(int(time.time()))
    supervisor_data = {
        "email": f"payment.supervisor.{timestamp}@university.gr",
        "name": "Payment Test Supervisor",
        "password": "PaymentSupervisor123!",
        "role": "supervisor"
    }
    
    success, response, status = make_request("POST", "/auth/register", supervisor_data)
    if success and "token" in response:
        supervisor_token = response["token"]
        
        success, response, status = make_request("POST", "/admin/payments", payment_data, supervisor_token)
        if not success and status == 403:
            results.add_result("Payment Creation Access Control", True, "Correctly restricted payment creation to admins only")
        else:
            results.add_result("Payment Creation Access Control", False, "Should restrict payment creation to admins only", response)
    
    # Test 12: Test payment approval access control
    success, response, status = make_request("PUT", f"/admin/payments/{payment_id}/approve", token=results.tokens["student"])
    if not success and status == 403:
        results.add_result("Payment Approval Access Control", True, "Correctly restricted payment approval to admins only")
    else:
        results.add_result("Payment Approval Access Control", False, "Should restrict payment approval to admins only", response)
    
    # Test 13: Test complete workflow integration
    # Create another request and test the full workflow
    workflow_request_data = {
        "title": "Modern Greek Economic Analysis",
        "due_date": (datetime.now() + timedelta(days=25)).isoformat(),
        "word_count": 3500,
        "assignment_type": "essay",
        "field_of_study": "economics",
        "attachments": [],
        "extra_information": "Analysis of post-2008 economic reforms in Greece"
    }
    
    success, response, status = make_request("POST", "/requests", workflow_request_data, results.tokens["student"])
    if success and "id" in response:
        workflow_request_id = response["id"]
        
        # Create payment info
        workflow_payment_data = {
            "student_id": results.test_data["student_id"],
            "request_id": workflow_request_id,
            "payment_method": "Stripe",
            "payment_details": "https://checkout.stripe.com/pay/cs_test_123456",
            "instructions": "Click the link to complete payment via Stripe"
        }
        
        success, response, status = make_request("POST", "/admin/payments", workflow_payment_data, results.tokens["admin"])
        if success and "id" in response:
            workflow_payment_id = response["id"]
            
            # Approve payment
            success, response, status = make_request("PUT", f"/admin/payments/{workflow_payment_id}/approve", token=results.tokens["admin"])
            if success:
                # Verify complete workflow: payment approved → essay assigned → notification sent
                success, response, status = make_request("GET", f"/requests/{workflow_request_id}", token=results.tokens["admin"])
                if success and response.get("status") == "accepted" and response.get("assigned_supervisor"):
                    results.add_result("Complete Payment Workflow Integration", True, "Full payment approval workflow working correctly")
                else:
                    results.add_result("Complete Payment Workflow Integration", False, "Payment workflow integration incomplete", response)
            else:
                results.add_result("Complete Payment Workflow Integration", False, "Failed to approve payment in workflow test", response)
        else:
            results.add_result("Complete Payment Workflow Integration", False, "Failed to create payment in workflow test", response)
    else:
        results.add_result("Complete Payment Workflow Integration", False, "Failed to create request for workflow test", response)

def print_summary(results: TestResults):
    """Print test summary"""
    print("\n" + "="*80)
    print("ENHANCED PAYMENT SYSTEM TESTING SUMMARY")
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
    print("Starting Enhanced Payment System Testing...")
    print(f"Testing against: {BASE_URL}")
    
    results = TestResults()
    
    # Setup test users
    if not setup_test_users(results):
        print("Failed to setup test users. Exiting.")
        return results
    
    # Execute payment system tests
    test_enhanced_payment_system(results)
    
    # Print summary
    print_summary(results)
    
    return results

if __name__ == "__main__":
    main()