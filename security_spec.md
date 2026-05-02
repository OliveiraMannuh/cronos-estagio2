# Security Specification for Cronos Estágio

## Data Invariants
1. An internship entry must have a valid `userId` matching the authenticated user.
2. An internship entry must have a non-empty date, startTime, and endTime.
3. `durationMinutes` must be a positive integer.
4. Users can only read and write their own documents.

## The Dirty Dozen Payloads
1. **Unauthorized Create**: authenticated user trying to create a doc for another user's `userId`.
2. **Unauthorized Read**: authenticated user trying to read another user's entry.
3. **Invalid ID Poisoning**: Document ID with 2KB junk.
4. **Missing Required Field**: Creating entry without `date`.
5. **Wrong Type**: `durationMinutes` as a string.
6. **Negative Duration**: `durationMinutes` = -10.
7. **Shadow Field injection**: Adding `isVerified: true` to the entry.
8. **Spoofed Identity**: `userId` set to admin's UID.
9. **Update Hijack**: Changing `userId` on an existing document.
10. **Huge Date**: `date` string of 1MB.
11. **Huge Report**: `reportText` string of 2MB (Firestore limit is 1MB per doc anyway).
12. **Public Access Attempt**: Unauthenticated user trying to read entries.

## The Test Runner (Plan)
- Verify `PERMISSION_DENIED` for all above.
- Verify `ALLOW` for valid user operations.
