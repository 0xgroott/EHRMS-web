# Dashboard staff implementation plan

1. Add focused tests for the Branches metric, ten-row dashboard pagination, Active/Archived status, Fitness test labels, Staff navigation copy, optional date of birth, required branch behavior, required asterisks, consent alert, and centered creation dialog.
2. Add shared fitness-test status helpers and update the Staff management page to the two-state employment model.
3. Simplify the dashboard summary cards, metrics, and guidance, then add the flat Staff table and client-side pagination as the first dashboard tab.
4. Replace Records with a certificate status table, reduce Activity to one newest-first event table, remove repeated tab-content headings, and keep the Staff destination in the Staff tab bar.
5. Transition the green certificate action card into a state-aware Health Approval card after both requirements are valid.
6. Update the form and new-record route to use the shadcn Dialog and approved validation behavior.
7. Run focused unit tests, typecheck/lint for affected files, and the relevant saved Playwright specs at desktop and 390px.
