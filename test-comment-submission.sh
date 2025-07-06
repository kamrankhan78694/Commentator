#!/bin/bash

# Comment Submission Test Script
# Tests the complete comment submission workflow

echo "🧪 Starting Comment Submission Test"
echo "=================================="

# Check if server is running
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Server not running on localhost:3001"
    echo "Please run: npm run dev"
    exit 1
fi

echo "✅ Server is running"

# Create a test file to verify the submission workflow
cat > test-comment-workflow.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Comment Workflow Test</title>
    <script src="config/environment.js"></script>
    <script src="config/runtime-config.js"></script>
    <script type="module" src="firebase-config.js"></script>
    <script type="module" src="js/firebase-service.js"></script>
</head>
<body>
    <h1>Automated Comment Workflow Test</h1>
    <div id="status">Starting test...</div>
    <div id="results"></div>
    
    <script>
        let testResults = [];
        
        function addResult(test, status, message) {
            testResults.push({ test, status, message, timestamp: Date.now() });
            updateDisplay();
        }
        
        function updateDisplay() {
            const results = document.getElementById('results');
            results.innerHTML = testResults.map(r => 
                `<div style="color: ${r.status === 'success' ? 'green' : r.status === 'error' ? 'red' : 'orange'}">
                    [${new Date(r.timestamp).toLocaleTimeString()}] ${r.test}: ${r.message}
                </div>`
            ).join('');
        }
        
        async function runWorkflowTest() {
            try {
                document.getElementById('status').textContent = 'Running automated test...';
                
                // Wait for Firebase service
                addResult('Setup', 'info', 'Waiting for Firebase service...');
                let attempts = 0;
                while (typeof window.FirebaseService === 'undefined' && attempts < 50) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    attempts++;
                }
                
                if (typeof window.FirebaseService === 'undefined') {
                    addResult('Setup', 'error', 'Firebase service failed to load');
                    return;
                }
                
                addResult('Setup', 'success', 'Firebase service loaded');
                
                // Test authentication
                addResult('Auth', 'info', 'Testing authentication...');
                const user = await window.FirebaseService.initAuth();
                
                if (!user) {
                    addResult('Auth', 'error', 'Authentication failed');
                    return;
                }
                
                addResult('Auth', 'success', `Authenticated as ${user.uid.substring(0, 8)}...`);
                
                // Verify auth state
                const isAuth = window.FirebaseService.isUserAuthenticated();
                addResult('Auth Verify', isAuth ? 'success' : 'error', `Auth state: ${isAuth}`);
                
                if (!isAuth) return;
                
                // Test comment submission
                addResult('Comment', 'info', 'Testing comment submission...');
                
                const testUrl = 'https://automated-test.example.com';
                const testComment = {
                    text: `Automated test comment ${Date.now()}`,
                    author: 'Automated Test',
                    votes: 0,
                    timestamp: new Date().toISOString()
                };
                
                const commentId = await window.FirebaseService.saveComment(testUrl, testComment);
                addResult('Comment', 'success', `Comment saved with ID: ${commentId}`);
                
                // Verify comment was saved
                addResult('Verify', 'info', 'Verifying comment was saved...');
                const comments = await window.FirebaseService.loadComments(testUrl);
                
                const savedComment = comments.find(c => c.id === commentId);
                if (savedComment) {
                    addResult('Verify', 'success', 'Comment verified in database');
                    addResult('Complete', 'success', '🎉 All tests passed! Comment submission is working.');
                    document.getElementById('status').textContent = '✅ Test completed successfully';
                } else {
                    addResult('Verify', 'error', 'Comment not found in database');
                    document.getElementById('status').textContent = '❌ Test failed';
                }
                
            } catch (error) {
                addResult('Error', 'error', `Test failed: ${error.message}`);
                document.getElementById('status').textContent = '❌ Test failed with error';
                console.error('Test error:', error);
            }
        }
        
        // Start test after page loads
        window.addEventListener('load', () => {
            setTimeout(runWorkflowTest, 2000);
        });
    </script>
</body>
</html>
EOF

echo "📝 Created test file: test-comment-workflow.html"

# Open test in browser (this will be platform-specific)
if command -v open > /dev/null; then
    # macOS
    open "http://localhost:3001/test-comment-workflow.html"
elif command -v xdg-open > /dev/null; then
    # Linux
    xdg-open "http://localhost:3001/test-comment-workflow.html"
elif command -v start > /dev/null; then
    # Windows
    start "http://localhost:3001/test-comment-workflow.html"
else
    echo "📖 Please open: http://localhost:3001/test-comment-workflow.html"
fi

echo "🔍 Test page opened. Check the results in your browser."
echo "✅ If the test passes, comment submission is working!"
echo "❌ If the test fails, check the browser console for errors."
