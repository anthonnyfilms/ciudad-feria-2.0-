#!/usr/bin/env python3
"""
Test script for the complete ticket purchase flow as requested by the user
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend_test import CiudadFeriaAPITester

def main():
    print("🎫 TESTING COMPLETE TICKET PURCHASE FLOW")
    print("=" * 60)
    print("Testing the exact flow requested by the user:")
    print("1. GET /api/eventos - Get available events")
    print("2. POST /api/comprar-entrada - Create purchase")
    print("3. POST /api/admin/login - Admin login")
    print("4. GET /api/admin/compras - View pending purchases")
    print("5. POST /api/admin/aprobar-entrada/{entrada_id} - Approve and send email")
    print("6. Verify email was sent")
    print("=" * 60)
    
    tester = CiudadFeriaAPITester()
    
    # Run the complete ticket purchase flow test
    success = tester.test_complete_ticket_purchase_flow()
    
    # Print final results
    print(f"\n📊 Test Results Summary:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    # Print failed tests
    failed_tests = [r for r in tester.test_results if not r['success']]
    if failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in failed_tests:
            print(f"   - {test['test']}: {test['details']}")
    else:
        print(f"\n✅ ALL TESTS PASSED!")
    
    if success:
        print(f"\n🎉 COMPLETE TICKET PURCHASE FLOW IS WORKING PERFECTLY!")
        return 0
    else:
        print(f"\n❌ COMPLETE TICKET PURCHASE FLOW HAS ISSUES")
        return 1

if __name__ == "__main__":
    sys.exit(main())