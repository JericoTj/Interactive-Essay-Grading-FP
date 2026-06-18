# Week 11 AI Functionality Testing

## Project
Interactive Essay Grading FP / EasyEssays


## Testing Objective
The goal of this testing was to check whether the AI grading feature could support the essay grading workflow correctly. The test focused on whether the system could accept essay input, send it to the AI grading process, and return useful feedback for the user.

## Testing Scope
The AI feature was partially integrated during Week 11. Therefore, the testing focused on basic functionality and expected behavior, not full production-level evaluation.

The tested areas included:

- Essay input submission
- AI grading response
- Feedback relevance
- Score and comment consistency
- Empty or invalid essay input
- Basic API connection behavior

## Test Environment
- Web application: Interactive Essay Grading system
- Backend API: tested with basic Postman requests
- AI feature: partially integrated
- Repository branch: main

## Test Cases

| No. | Test Case | Input | Expected Result | Result |
|---|---|---|---|---|
| 1 | Submit normal essay | A complete short essay | AI returns score and feedback | Passed / Partially Passed |
| 2 | Submit short essay | Very short paragraph | AI still gives feedback but may mention lack of detail | Passed |
| 3 | Submit empty essay | Empty input | System should reject input or return validation message | Needs improvement |
| 4 | Submit unclear essay | Poor grammar and unclear structure | AI should identify writing issues | Passed / Partially Passed |
| 5 | Re-test same essay | Same essay submitted more than once | Feedback should be generally consistent | Partially Passed |
| 6 | API test | Request sent through Postman | Backend should respond without server error | Passed |

## Observations

The AI grading feature was able to provide basic feedback for essay submissions. The response was useful for identifying general writing problems such as grammar, structure, clarity, and content relevance.

However, the AI result was not always fully consistent when the same essay was tested multiple times. This is normal for AI-generated output, but it means the system may need clearer prompt rules or grading criteria in the future.

The empty input case also needs better handling. The system should not send empty essays directly to the AI. It should first validate the input and show a clear error message to the user.

## Issues Found

1. The AI testing documentation was not fully completed during Week 11.
2. The AI feature was only partially integrated at that stage.
3. Some testing was done manually, but the results were not clearly recorded before.
4. The score and feedback may change slightly for the same essay.
5. Empty or invalid input needs better validation.

## Suggested Improvements

- Add a fixed grading rubric for the AI prompt.
- Add validation before sending essay text to AI.
- Save AI response results for review.
- Add more test cases for different essay quality levels.
- Compare AI feedback with manual grading criteria.
- Record screenshots or sample outputs for final presentation evidence.

## Conclusion

In Week 11, the AI grading feature was tested mainly for basic functionality. The feature was working at a basic level, but it still needed better documentation, input validation, and consistency testing. The test results show that the AI feature could support the main purpose of the project, but further refinement would improve reliability and user trust.
