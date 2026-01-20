from typing import List
import math


class SplitService:
    """
    Service for calculating bill splits
    Implements paisa-accurate splitting with deterministic rounding
    """
    
    def calculate_equal_split(self, total_amount: float, num_participants: int) -> List[float]:
        """
        Calculate equal split with proper paisa distribution
        
        Algorithm:
        1. Calculate base amount (floor division)
        2. Calculate remainder in paisa
        3. Distribute remainder to first N participants
        
        Example:
        Total: 100, Participants: 3
        Base: 33.33 each
        Result: [33.34, 33.33, 33.33] (total = 100.00)
        """
        if num_participants <= 0:
            raise ValueError("Number of participants must be positive")
        
        if total_amount <= 0:
            raise ValueError("Total amount must be positive")
        
        # Convert to paisa for accurate calculation
        total_paisa = round(total_amount * 100)
        
        # Calculate base amount per person in paisa
        base_paisa = total_paisa // num_participants
        
        # Calculate remainder in paisa
        remainder_paisa = total_paisa - (base_paisa * num_participants)
        
        # Distribute amounts
        amounts = []
        for i in range(num_participants):
            # First 'remainder' participants get 1 extra paisa
            if i < remainder_paisa:
                amount_paisa = base_paisa + 1
            else:
                amount_paisa = base_paisa
            
            # Convert back to rupees
            amounts.append(amount_paisa / 100)
        
        return amounts
    
    def calculate_custom_split(
        self, 
        total_amount: float, 
        participant_amounts: List[float]
    ) -> List[float]:
        """
        Validate and adjust custom split amounts
        Ensures sum equals total with paisa accuracy
        """
        if not participant_amounts:
            raise ValueError("Participant amounts list is empty")
        
        sum_amounts = sum(participant_amounts)
        
        # Check if sum matches total (within 1 paisa tolerance)
        diff = abs(sum_amounts - total_amount)
        if diff > 0.01:
            raise ValueError(
                f"Sum of amounts ({sum_amounts}) doesn't match total ({total_amount})"
            )
        
        # Adjust last amount if there's a small difference
        if diff > 0:
            participant_amounts[-1] += (total_amount - sum_amounts)
        
        return participant_amounts
    
    def calculate_percentage_split(
        self,
        total_amount: float,
        percentages: List[float]
    ) -> List[float]:
        """
        Calculate split based on percentages
        """
        if not percentages:
            raise ValueError("Percentages list is empty")
        
        if abs(sum(percentages) - 100.0) > 0.01:
            raise ValueError("Percentages must sum to 100")
        
        # Calculate amounts
        amounts = [total_amount * (p / 100) for p in percentages]
        
        # Adjust for rounding errors
        total_calculated = sum(amounts)
        diff = total_amount - total_calculated
        if abs(diff) > 0.01:
            amounts[-1] += diff
        
        # Round to 2 decimal places
        amounts = [round(amt, 2) for amt in amounts]
        
        return amounts
