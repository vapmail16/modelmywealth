#!/usr/bin/env python3
import numpy_financial as npf

def test_calculation():
    # Test the calculation logic
    senior_secured = 50000
    additional_loan_senior_secured = 50000
    total_senior_secured = senior_secured + additional_loan_senior_secured

    debt_tranche1 = 10000
    additional_loan_short_term = 10000
    total_short_term = debt_tranche1 + additional_loan_short_term

    total_opening = total_senior_secured + total_short_term

    print(f'Senior Secured: ${senior_secured} + ${additional_loan_senior_secured} = ${total_senior_secured}')
    print(f'Short Term: ${debt_tranche1} + ${additional_loan_short_term} = ${total_short_term}')
    print(f'Total Opening Balance: ${total_opening}')

    # Interest calculation
    interest_rate_senior_secured = (0.05 + 0.01 + 0.01) / 12
    interest_rate_short_term = (0.07 + 0.005 + 0.005) / 12

    interest_senior_secured = total_senior_secured * interest_rate_senior_secured
    interest_short_term = total_short_term * interest_rate_short_term
    total_interest = interest_senior_secured + interest_short_term

    print(f'Interest Senior Secured: ${interest_senior_secured:.2f}')
    print(f'Interest Short Term: ${interest_short_term:.2f}')
    print(f'Total Interest: ${total_interest:.2f}')

    closing_balance = total_opening + total_interest
    print(f'Closing Balance: ${closing_balance:.2f}')

    # Test PMT calculation
    print(f'\nPMT Test:')
    rate = interest_rate_senior_secured
    nper = 72  # 6 years * 12 months
    pv = total_senior_secured
    pmt = npf.pmt(rate, nper, pv)
    print(f'PMT for Senior Secured: ${pmt:.2f}')

if __name__ == "__main__":
    test_calculation()
