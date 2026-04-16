# TeamFlow PM Test Suite

This directory contains unit and integration tests for the TeamFlow PM application.

## Test Structure

- **`app.test.js`** - Frontend unit tests (Vitest + JSDOM)
- **`api.test.js`** - Backend API tests (Supertest + Express)

## Prerequisites

```bash
npm install --save-dev vitest jsdom @vitest/ui supertest
```

## Running Tests

### All Tests
```bash
npm test
```

### Frontend Tests Only
```bash
npx vitest run tests/app.test.js
```

### Backend API Tests Only
```bash
npx vitest run tests/api.test.js
```

### Watch Mode (Development)
```bash
npx vitest
```

### Coverage Report
```bash
npx vitest run --coverage
```

## Test Coverage

### Frontend Tests (`app.test.js`)
1. **Authentication**
   - Sign up with valid/invalid credentials
   - Sign in and token storage
   - Logout and session clearing

2. **Workspace Management**
   - Fetching user workspaces
   - Creating new workspaces
   - Workspace selection

3. **Task Board Operations**
   - Fetching tasks for a board
   - Creating new tasks
   - Updating task status (drag-and-drop simulation)

4. **Pricing & Payments**
   - Stripe checkout session creation
   - Subscription tier display logic

5. **UI Rendering**
   - Loading state management
   - Error message display
   - Responsive behavior

### Backend API Tests (`api.test.js`)
1. **Health Check**
   - Basic API availability

2. **Authentication**
   - User registration with validation
   - Login with credential verification
   - JWT token generation

3. **Workspace Management**
   - Authentication middleware
   - CRUD operations for workspaces
   - Role-based access control

4. **Task Management**
   - Task creation with column assignment
   - Board access verification
   - Input validation

5. **Stripe Integration**
   - Checkout session creation
   - Authentication requirements
   - Error handling

6. **Error Handling**
   - Database error propagation
   - Input validation errors
   - Authentication failures

## Mocking Strategy

### Frontend Mocks
- `fetch` API - Mocked to simulate server responses
- `localStorage` - Mocked for session management testing
- DOM APIs - Provided by JSDOM for browser-like environment

### Backend Mocks
- Database pool - Mocked PostgreSQL queries
- Stripe SDK - Mocked payment operations
- Bcrypt - Mocked password hashing/verification
- JWT - Mocked token generation/verification

## Writing New Tests

### Frontend Test Example
```javascript
describe('New Feature', () => {
  it('should do something', () => {
    // Setup
    mockAPI.someFunction.mockResolvedValue({ success: true });
    
    // Execution
    const result = await someFunction();
    
    // Assertion
    expect(result.success).toBe(true);
    expect(mockAPI.someFunction).toHaveBeenCalledWith(expectedArgs);
  });
});
```

### Backend Test Example
```javascript
describe('POST /api/new-endpoint', () => {
  it('should handle request correctly', async () => {
    // Setup mocks
    mockPool.query.mockResolvedValue({ rows: [/* data */] });
    
    // Make request
    const response = await request(app)
      .post('/api/new-endpoint')
      .set('Authorization', 'Bearer valid-token')
      .send({ /* request body */ });
    
    // Assertions
    expect(response.status).toBe(201);
    expect(response.body).toEqual(expect.objectContaining({
      /* expected response */
    }));
  });
});
```

## Continuous Integration

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Notes

- Tests are isolated and don't require a running database
- All external services (Stripe, email) are mocked
- JWT tokens are simulated for authentication testing
- The test suite focuses on business logic, not implementation details

## Troubleshooting

### Common Issues

1. **"document is not defined"**
   - Ensure JSDOM is properly configured
   - Check that tests run in the correct environment

2. **Mock not being called**
   - Verify mock setup before test execution
   - Check for async/await issues

3. **CORS errors in API tests**
   - Ensure CORS middleware is properly mocked
   - Check request headers

4. **Database pool errors**
   - Verify pool mock returns proper structure `{ rows: [] }`
   - Check async/await handling in mocks

For more information, refer to:
- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [JSDOM Documentation](https://github.com/jsdom/jsdom)